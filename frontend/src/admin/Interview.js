import {Badge, Button, Card, Col, Form, Input, notification, Row} from "antd";
import {useEffect, useRef, useState} from "react";
import StatusColors from "../StatusColors";
import {useNavigate, useParams} from "react-router-dom";
import api from "../api";

export default function Interview() {
    const navigate = useNavigate()
    const params = useParams()

    const [application, setApplication] = useState(null)
    const [interview, setInterview] = useState(null)
    const [isInterviewOn, setIsInterviewOn] = useState(false)
    const [questions, setQuestions] = useState([])
    const [from, setFrom] = useState(null)
    const [to, setTo] = useState(null);
    const me = useRef(null)

    const [form] = Form.useForm();

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const remoteScreen = useRef(null);

    const cameraStream = useRef(null);

    const peerConnection = useRef(null)

    const socket = useRef(null);
    const gotVideo = useRef(false);

    async function loadData() {
        try {
            const res = await api.get('/application/' + params.id + '/interview/check')
            setApplication(res.data.data.application)
            setInterview(res.data.data.interview)
            setTo(res.data.data.application.user._id)
            setQuestions(res.data.data.application.questions)
        } catch (e) {
            endSession(e.response?.data.message)
        }
    }

    useEffect(() => {
        me.current = JSON.parse(localStorage.getItem('admin'))
        setFrom(me.current._id)
        loadData()
        return () => {
            endSession()
        }
    }, [])

    useEffect(() => {
        if (!to || !from) {
            return
        }

        createPeerConnection()
    }, [from, to])

    async function startInterview() {
        try {
            await connectSocket();

            const camera = await navigator.mediaDevices.getUserMedia({ video: true });
            localVideo.current.srcObject = camera;
            camera.getTracks().forEach(track => peerConnection.current.addTrack(track, camera));

            cameraStream.current = camera
            await offerConnection()
        } catch (e) {
            console.log(e)
            alertError("Error Occurred. Please reload the page and try again.");
            endSession();
        }
    }

    function connectSocket() {
        return new Promise((resolve, reject) => {
            if (socket.current) {
                resolve();
                return;
            }

            const webSocket = new WebSocket(encodeURI('ws://localhost:4000/socket?type=admin&token=' + localStorage.getItem('admin.token')));
            webSocket.onmessage = e => processMessage(JSON.parse(e.data));
            webSocket.onopen = () => resolve();
            webSocket.onclose = (e) => socket.current = null;
            webSocket.onerror = () => reject();

            socket.current = webSocket
        })
    }

    const [finishing, setFinishing] = useState(false)
    async function stopInterview() {
        setFinishing(true)
        try {
            await api.post('/application/' + params.id + '/interview/finish')

            send({ from, to, subject: 'end-session' });
            endSession(true);
        } catch (e) {
            alertError(e.response?.data.message)
        }

        setFinishing(false)
    }

    function alertError(data) {
        notification.info({
            message: 'Interview',
            description: data,
        });
    }

    function endSession(reload = false) {
        if (socket.current)
            socket.current.close();

        if (peerConnection.current) {
            peerConnection.current.close()
        }

        if (cameraStream.current) {
            cameraStream.current.getTracks().forEach(track => track.stop())
            cameraStream.current = null
        }

        setIsInterviewOn(false)
        if (reload)
            navigate('/admin/interview')
    }

    async function processMessage(message) {
        switch (message['subject']) {
            case 'answer':
                await setRemoteDescription(message['answer']);
                setIsInterviewOn(true);
                break;

            /*case 'offer':
                await setRemoteDescription(message['offer']);
                await answerConnection();
                break;*/

            case 'ice-candidate':
                await setIceCandidate(message['candidate'])
                break;

            case 'offer-rejected':
            case 'answer-rejected':
            case 'ice-candidate-rejected':
                alertError(message['reason']);
                endSession();
                break;

            case 'end-session':
                alertError('Connection closed by remote end');
                endSession();
                break;

            case 'question-answer':
                addAnswer(message['question'])
                break;
        }
    }

    async function setRemoteDescription(desc) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(desc));
    }

    async function setIceCandidate(candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
    }

    async function offerConnection() {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(new RTCSessionDescription(offer));

        send({ from, to, subject: 'offer', offer: offer });
    }

    async function answerConnection() {
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(new RTCSessionDescription(answer));

        send({ from, to, subject: 'answer', answer: answer });
    }

    function send(data) {
        if (!socket.current) return
        socket.current.send(JSON.stringify(data))
    }

    const { RTCPeerConnection, RTCSessionDescription } = window;

    function createPeerConnection() {
        if (peerConnection.current) {
            return
        }

        const connection =  new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:openrelay.metered.ca:80",
                },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443?transport=tcp",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
            ],
        });

        connection.ontrack = ({ streams: [stream] }) => {
            if (!gotVideo.current) {
                gotVideo.current = true;
                remoteVideo.current.srcObject = stream;
            }
            else {
                remoteScreen.current.srcObject = stream;
            }
        }

        connection.onicecandidate = e => {
            if (e.candidate) {
                send({ from, to, subject: 'ice-candidate', candidate: e.candidate });
            }
        }

        connection.onconnectionstatechange = _ => {
            switch(connection.iceConnectionState) {
                case "closed":
                case "failed":
                    endSession();
                    break;
            }
        }

        connection.onsignalingstatechange = _ => {
            switch(connection.signalingState) {
                case "closed":
                    endSession();
                    break;
            }
        }

        peerConnection.current = connection
    }

    const [sendingQuestion, setSendingQuestion] = useState()
    async function handleAskQuestion(data) {
        setSendingQuestion(true)
        try {
            const res = await api.post('/application/' + params.id + '/interview/question', data)
            questions.push(res.data.data)
            setQuestions(questions)
            form.resetFields()
        } catch (e) {
            alertError(e.response?.data.message);
        }
        setSendingQuestion(false)
    }

    function addAnswer(question) {
        const q = questions.find(v => v._id === question._id)
        if (q) {
            q.answer = question.answer
            setQuestions([...questions])
        }
    }

    if (!application) {
        return <p>Loading...</p>
    }

    return (
        <>
            <Card
                title={<span>{ application.job.title } <Badge count={application.status} style={{ backgroundColor: StatusColors[application.status] }} /></span>}
                extra={isInterviewOn
                    ? <Button danger onClick={stopInterview} loading={finishing}>Stop Interview</Button>
                    : <Button onClick={startInterview}>Start Interview</Button>}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <div className="video-container">
                            <video autoPlay className="remote-video" id="remote-video" ref={remoteVideo}></video>
                            <video autoPlay muted className="local-video" id="local-video" ref={localVideo}></video>
                        </div>
                    </Col>
                    <Col span={12}>
                        { isInterviewOn && <div id="ask-question-pane">
                            <Card title="Ask Interview Questions">
                                <Form form={form} onFinish={handleAskQuestion}>
                                    <Form.Item label="Question" name="question" rules={[{required: true}]}>
                                        <Input.TextArea placeholder={"Enter question here..."}></Input.TextArea>
                                    </Form.Item>
                                    <div className="flex-center">
                                        <Button htmlType="submit" loading={sendingQuestion}>Send</Button>
                                    </div>
                                </Form>
                            </Card>

                            <Card title="Questions History" className="mt-10">
                                { [...questions].reverse().map(v => <div key={v._id} className="question-item">
                                    <p className="question text-bold">{ v.question }</p>
                                    <p className="answer">{ v.answer }</p>
                                </div>) }
                            </Card>
                        </div> }
                    </Col>
                    <Col span={24}>
                        <video autoPlay muted className="remote-screen" id="remote-screen" ref={remoteScreen}></video>
                    </Col>
                </Row>
            </Card>
        </>

    )
}
