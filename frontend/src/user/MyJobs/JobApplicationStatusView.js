import api from "../../api";
import {Badge, Button, Card, Col, message, Modal, Popconfirm, Row, Table, Tag} from "antd";
import {useEffect, useState} from "react";
import StatusColors from "../../StatusColors";
import {CreditCardOutlined, DeleteFilled, DotChartOutlined} from "@ant-design/icons";
import moment from "moment";
import JobPosting from "../../components/JobPosting";
import JobApplication from "../../components/JobApplication";
import InterviewLevelColors from "../../InterviewLevelColors";
import {useNavigate} from "react-router-dom";


export default function JobApplicationView({ application }) {
    const [data, setData] = useState(null)
    const [job, setJob] = useState(null)
    const [interviewStats, setInterviewStats] = useState(null)

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    const [showJobPosting, setShowJobPosting] = useState(false);
    const [showJobApplication, setShowJobApplication] = useState(false);

    function closeModel() {
        setShowJobPosting(false)
        setShowJobApplication(false)
    }

    function hasScheduledInterview() {
        return !!(application.interviewStats ?? []).find(v =>
            v.level === 'Online Interview'
            && !v.status
            && v.scheduledOn
            && moment(v.scheduledOn).startOf('date').diff(moment().startOf('date'), 'day') === 0
            && !v.attendedOn)
    }

    const interviews = Object.keys(InterviewLevelColors)

    useEffect(() => {
        setData(application)
        setJob(application.job)
        setInterviewStats(interviews.map(v => (application.interviewStats ?? []).find(i => i.level === v) ?? {
            isEmpty: true,
            level: v,
            scheduledOn: '',
            assignedTo: '',
            attendedOn: '',
            interviewedBy: '',
            score: null,
            status: '',
        }))

    }, [application])

    function loadInterview() {
        navigate('/application/' + application._id + '/interview')
    }

    const columns = [
        {
            title: 'Level',
            dataIndex: 'level',
            render: (text, record) => (<span style={{color: record.isEmpty ? '#ccc' : '#000'}}>{text}</span>)
        },
        {
            title: 'Scheduled On',
            dataIndex: 'scheduledOn',
            render: text => text ? moment(text).calendar() : ''
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            render: text => text ? text.name : ''
        },
        {
            title: 'Attended On',
            dataIndex: 'attendedOn',
            render: text => text ? moment(text).calendar() : ''
        },
        {
            title: 'Interviewed By',
            dataIndex: 'interviewedBy',
            render: text => text ? text.name : ''
        },
        {
            title: 'Score',
            dataIndex: 'score',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (a) => <Badge count={a} style={{backgroundColor: a === 'Pass' ? "green" : 'red'}}/>
        },
    ];

    if (!data || !job) {
        return (<p>Loading...</p>)
    }

    return (
        <div>
            {hasScheduledInterview() && <Card>
                <div>
                    <Button onClick={loadInterview}>Attend Interview</Button>
                </div>
            </Card>}

            <h2><b>{ data.job.title }</b><Badge count={data.status} style={{ backgroundColor: StatusColors[data.status], marginLeft: "15px" }} /></h2>

            <div style={{display: "flex", justifyContent: "end", marginBottom: "10px"}}>
                <Button onClick={() => setShowJobPosting(true)}><CreditCardOutlined /> Job Posting</Button>
                <Button onClick={() => setShowJobApplication(true)} style={{marginLeft: "10px"}}><DotChartOutlined /> Application</Button>
            </div>

            <Table bordered columns={columns} dataSource={interviewStats} summary={(pageData) => {
                if (!pageData.length) {
                    return null
                }

                return (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}/>
                            <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>{ interviewStats.reduce((acc, v) => acc + parseInt(v.score ?? 0), 0) }</Table.Summary.Cell>
                            <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </>
                );
            }}/>

            <Modal title="Job Posting" onOk={closeModel} onCancel={closeModel} cancelButtonProps={{ hidden: true }} visible={showJobPosting}>
                <JobPosting job={job}/>
            </Modal>

            <Modal title="Job Application" onOk={closeModel} onCancel={closeModel} cancelButtonProps={{ hidden: true }} visible={showJobApplication}>
                <JobApplication application={application}/>
            </Modal>
        </div>
    )
}
