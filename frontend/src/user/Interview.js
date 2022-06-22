import {Badge, Button, Card, Col, Form, Input, notification, Row} from "antd";
import {useEffect, useRef, useState} from "react";
import StatusColors from "../StatusColors";
import {useNavigate, useParams} from "react-router-dom";
import api, {SOCKET_URL} from "../api";

export default function Interview() {
    const navigate = useNavigate()
    const params = useParams()

    const [application, setApplication] = useState(null)
    const [interview, setInterview] = useState(null)
    const [isInterviewOn, setIsInterviewOn] = useState(false)
    const [questions, setQuestions] = useState([])

    const [form] = Form.useForm();

    const from = useRef(null)
    const to = useRef(null);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const cameraStream = useRef(null);
    const screenStream = useRef(null);

    const peerConnection = useRef(null)

    const socket = useRef(null);

    async function loadData() {
        try {
            const res = await api.get('/users/application/' + params.id + '/interview/online')
            setApplication(res.data.data.application)
            setInterview(res.data.data.interview)
            from.current = res.data.data.application._id
            setQuestions(res.data.data.application.questions)
        } catch (e) {
            endSession(e.response?.data.message)
        }
    }

    useEffect(() => {
        loadData().then(r => createPearConnection())
    }, [])

    useEffect(() => {
        return () => {
            endSession()
        }
    }, [])

    async function startInterview() {
        try {
            await connectSocket();

            const camera = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.getTracks().forEach(track => peerConnection.current.addTrack(track, camera));
            localVideo.current.srcObject = camera;

            const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screen.getTracks().forEach(track => peerConnection.current.addTrack(track, screen));

            cameraStream.current = camera
            screenStream.current = screen
            requestInterview();
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

            const webSocket = new WebSocket(encodeURI(SOCKET_URL + '?type=user&token=' + localStorage.getItem('user.token')));
            webSocket.onmessage = e => processMessage(JSON.parse(e.data));
            webSocket.onopen = () => resolve();
            webSocket.onclose = (e) => socket.current = null;
            webSocket.onerror = () => reject();

            socket.current = webSocket
        })
    }

    function requestInterview() {
        send({ from: from.current, to: to.current, subject: 'request-session', info: {
                id: application._id,
                user: { id: application.user._id, name: application.user.name },
                post: { id: application.job._id, title: application.job.title },
                assignedTo: { id: interview.assignedTo._id, name: interview.assignedTo.name}
            }
        });
        setIsInterviewOn(true);
    }

    function stopInterview() {
        send({ from: from.current, to: to.current, subject: 'end-session' });
        endSession(true);
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

        if (screenStream.current) {
            screenStream.current.getTracks().forEach(track => track.stop())
            screenStream.current = null
        }

        setIsInterviewOn(false)
        if (reload)
            navigate('/my/jobs')
    }

    async function processMessage(message) {
        switch (message['subject']) {
            /* case 'answer':
                 await setRemoteDescription(message['answer']);
                 break;*/

            case 'offer':
                to.current = message['from'];
                await setRemoteDescription(message['offer']);
                await answerConnection();
                break;

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
                endSession(true);
                break;

            case 'question':
                askQuestion(message['question']);
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

        send({ from: from.current,to: to.current,subject: 'offer', offer: offer });
    }

    async function answerConnection() {
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(new RTCSessionDescription(answer));

        send({ from: from.current,to: to.current,subject: 'answer', answer: answer });
    }

    function send(data) {
        if (!socket.current) return
        socket.current.send(JSON.stringify(data))
    }

    const { RTCPeerConnection, RTCSessionDescription } = window;


    function createPearConnection() {
        if (peerConnection.current) {
            return
        }

        peerConnection.current = new RTCPeerConnection({
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

        peerConnection.current.ontrack = ({ streams: [stream] }) => {
            setIsInterviewOn(true)
            remoteVideo.current.srcObject = stream;
        }

        peerConnection.current.onicecandidate = function(e) {
            if (e.candidate) {
                send({ from: from.current,to: to.current,subject: 'ice-candidate', candidate: e.candidate });
            }
        }

        peerConnection.current.onconnectionstatechange = _ => {
            switch(peerConnection.current.iceConnectionState) {
                case "closed":
                case "failed":
                    endSession();
                    break;
            }
        }

        peerConnection.current.onsignalingstatechange = _ => {
            switch(peerConnection.current.signalingState) {
                case "closed":
                    endSession();
                    break;
            }
        }
    }

    // QUESTION PART
    const [sendingAnswer, setSendingAnswer] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(null)
    async function handleAnswerQuestion(data) {
        setSendingAnswer(true)
        try {
            const res = await api.post('/users/application/' + params.id + '/interview/question/' + currentQuestion._id + '/answer', data)
            setQuestions([...questions, res.data.data])
            setCurrentQuestion(null)
            form.resetFields()
        } catch (e) {
            alertError(e.response?.data.message);
        }
        setSendingAnswer(false)
    }

    function askQuestion(question) {
        setCurrentQuestion(question)
    }

    if (!application) {
        return <p>Loading...</p>
    }

    return (
        <>
            <Card
                title={<span>{ application.job.title } <Badge count={application.status} style={{ backgroundColor: StatusColors[application.status] }} /></span>}
                extra={isInterviewOn
                    ? <Button danger onClick={stopInterview}>Stop Interview</Button>
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
                        { isInterviewOn && <div id="question-pane">
                            { currentQuestion && <Card title="Question">
                                <p><b>{ currentQuestion.question }</b></p>

                                <Form form={form} onFinish={handleAnswerQuestion}>
                                    <Form.Item label="Answer" name="answer" rules={[{required: true}]}>
                                        <Input.TextArea placeholder={"Enter answer here..."}></Input.TextArea>
                                    </Form.Item>
                                    <div className="flex-center">
                                        <Button htmlType="submit" loading={sendingAnswer}>Send</Button>
                                    </div>
                                </Form>
                            </Card> }

                            <Card title="Previous Questions" className="mt-10">
                                { [...questions].reverse().map(v => <div key={v._id} className="question-item">
                                    <p className="question text-bold">{ v.question }</p>
                                    <p className="answer">{ v.answer }</p>
                                </div>) }
                            </Card>
                        </div> }
                    </Col>
                </Row>
            </Card>
        </>

    )
}
