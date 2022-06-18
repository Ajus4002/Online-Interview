import api from "../../api";
import moment from "moment";
import {Badge, Button, Card, Col, message, Row, Tag} from "antd";
import {useEffect, useState} from "react";
import app from "../../App";
import {useParams} from "react-router-dom";
import StatusColors from "../../StatusColors";
import InterviewTable from "./InterviewTable";
import interviewLevelColors from "../../InterviewLevelColors";
import InterviewLevelColors from "../../InterviewLevelColors";
import InterviewDetails from "./InterviewDetails";
import Verification from "./Verification";


export default function JobApplicationDetails() {
    const [loading, setLoading] = useState(false)
    const [application, setApplication] = useState(null)
    const [interviewStats, setInterviewStats] = useState(null)

    const params = useParams()

    async function loadData() {
        try {
            setLoading(true)
            const res = await api.get('/application/' + params.id)
            res.data.data.xp = res.data.data.experience?.reduce((acc, v) => {
                const from = moment(v.from).startOf('month')
                const to = moment(v.to ?? undefined).endOf('month')

                return acc + to.diff(from, 'month', true)
            }, 0) / 12

            setApplication(res.data.data)
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    useEffect(() => { loadData();  }, [])


    const interviews = Object.keys(InterviewLevelColors)
    useEffect(() => {
        if (!application) {
            return
        }

        const int = interviews.map(v => (application.interviewStats ?? []).find(i => i.level === v) ?? {
            isEmpty: true,
            level: v,
            scheduledOn: '',
            assignedTo: '',
            attendedOn: '',
            interviewedBy: '',
            score: null,
            status: '',
        })

        const isEditable = application.status === 'Ongoing'
        if (isEditable) {
            let found = [int.length - 1];

            for (let i = 0; i < int.length; i++) {
                if (i === 0 && int[i].isEmpty) {
                    found = [0]
                    break;
                }

                if (!int[i].isEmpty) {
                    if (!int[i].status) {
                        found = [i]
                        break;
                    } else {
                        if (int[i].status === 'Fail') {
                            found = [];
                            break;
                        }

                        if (int[i + 1] && int[i + 1].isEmpty) {
                            found = [i, i + 1]
                            break;
                        }
                    }
                }
            }

            found.forEach(f => {
                int[f].isFullEditable = !!(int[f].scheduledOn && moment(int[f].scheduledOn).startOf('date').diff(moment().startOf('date'), 'day') <= 0);
                int[f].isEditable = true
            })
        }

        setInterviewStats(int)
    }, [application])

    async function changeStatus(status) {
        setLoading(true)
        try {
            await api.patch('/application/' + params.id + '/status', {status})
            message.success("Status changed")
            await loadData()
        } catch (e) {
            console.log(e)
            message.error(e.response?.data.message)
        }
        setLoading(false)
    }

    if (!application) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <Card title={application.job.title} extra={<Badge count={application.status} style={{backgroundColor: StatusColors[application.status]}}/> }>
                <Row gutter={16}>
                    <Col span={6}>
                        <b>Name</b>
                        <p>{ application.name }</p>
                    </Col>
                    <Col span={6}>
                        <b>DOB</b>
                        <p>{ application.dateOfBirth.split('T')[0] }</p>
                    </Col>
                    <Col span={6}>
                        <b>Email</b>
                        <p>{ application.email }</p>
                    </Col>
                    <Col span={6}>
                        <b>Mobile</b>
                        <p>{ application.mobile }</p>
                    </Col>
                    <Col span={6}>
                        <b>Location</b>
                        <p>{ application.location }</p>
                    </Col>
                    <Col span={6}>
                        <b>Address</b>
                        <p>{ application.address }</p>
                    </Col>
                    <Col span={6}>
                        <b>Total Experience</b>
                        <p>{ Math.floor(application.xp) }+</p>
                    </Col>
                    <Col span={6}>
                        <b>Skills</b>
                        <p>{ application.skills.map(v => v.name).join(', ') }</p>
                    </Col>
                    <Col span={8}>
                        <b>Education</b>
                        <div>{ application.education.map(edu => <Card key={edu._id} style={{marginBottom: '16px'}}>
                            <b>{edu.course.name}</b>
                            <div className="text-grey">{edu.college}</div>
                            <div>{moment(edu.from).format('MMM-YYYY')}{edu.to && <span> - {moment(edu.to).format('MMM-YYYY')}</span>}</div>
                        </Card>) }</div>
                    </Col>
                    <Col span={8}>
                        <b>Experience</b>
                        <div>{ application.experience.map(xp => <Card key={xp._id} style={{marginBottom: '16px'}}>
                            <b>{xp.jobTitle}</b>
                            <div className="text-grey">{xp.company}</div>
                            <div>{moment(xp.from).format('MMM-YYYY')}{xp.to && <span> - {moment(xp.to).format('MMM-YYYY')}</span>}</div>
                            <div>{xp.skills.map(v => <Tag>{v.name ?? v.label}</Tag>)}</div>
                        </Card>) }</div>
                    </Col>
                </Row>
            </Card>

            <Card title="Status" className="mt-10">
                <div className="text-center">
                    { application.status === 'Pending' && <Button type="primary" onClick={_ => changeStatus('Ongoing')}>Accept Application</Button> }
                    { application.status !== 'Pending' &&
                        <Button type="primary"  onClick={_ => changeStatus('Selected')}>Select Candidate</Button>
                    }
                    { application.status !== 'Rejected' && <Button danger className="ml-10" onClick={_ => changeStatus('Rejected')}>Reject Application</Button> }
                </div>
            </Card>

            <Card title="Interview Level" className="mt-10">
                <InterviewTable application={application} interviewStats={interviewStats} onChange={_ => loadData()}/>
            </Card>

            <Row gutter={16} className="mt-10">
                <Col span={18}>
                    <Card title="Interview Details">
                        <InterviewDetails application={application} interviewStats={interviewStats} onChange={_ => loadData()}/>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card title="Verification">
                        <Verification application={application} onChange={_ => loadData()}/>
                    </Card>
                </Col>
            </Row>

        </div>
    )
}
