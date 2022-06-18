import {Col, Row, message, Form, Input, Select, Card, Button, Tag, Modal, Badge, notification} from "antd";
import api from "../api";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function JobList() {
    const [loading, setLoading] = useState(false)
    const [skills, setSkills] = useState([])
    const [course, setCourses] = useState([])
    const [addModel, setAddModel] = useState(false)
    const [selectedJob, setSelectedJob] = useState({})
    const [jobs, setJobs] = useState([])
    const [filteredJobs, setFilteredJobs] = useState([])

    const navigate = useNavigate()

    async function loadData() {
        try {
            setLoading(true)
            const res = await api.get('users/jobs')
            setJobs(res.data.data.filter(v => v.isOpen))
            setFilteredJobs([...res.data.data.filter(v => v.isOpen)])
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    async function loadOtherData() {
        try {
            const res1 = await api.get('/skills')
            const res2 = await api.get('/courses')

            setSkills(res1.data.data)
            setCourses(res2.data.data)
        } catch (e) {
            message.error("Something went wrong")
        }
    }

    useEffect(() => {
        loadData()
        loadOtherData()
    }, [])

    function openJob(job) {
        setSelectedJob(job)
        setAddModel(true)
    }

    async function quickApply(job) {
        try {
            await api.post(`/users/jobs/${job}/apply/quick`)
            notification['success']({
                message: 'Success',
                description: 'Application posted successfully',
            });
        } catch (e) {
            notification['error']({
                message: 'Sorry',
                description: e.response?.data.message,
            });
        }
    }

    function onFilterChange(value, filter) {
        let data = [...jobs];

        if (filter.search) {
            data = data.filter(v => v.title.toLowerCase().includes(filter.search.toLowerCase()))
        }

        if (filter.skills && filter.skills.length) {
            data = data.filter(v => v.skills.find(v => filter.skills.includes(v._id)))
        }

        if (filter.education && filter.education.length) {
            data = data.filter(v => v.education.find(v => filter.education.includes(v._id)))
        }

        if (filter.salaryFrom) {
            data = data.filter(v => v.salary.from >= parseInt(filter.salaryFrom))
        }

        if (filter.salaryTo) {
            data = data.filter(v => v.salary.to <= parseInt(filter.salaryTo))
        }

        setFilteredJobs(data)
    }

    function renderJobs(job) {
        return <Card
            key={job._id}
            style={{marginBottom: '16px', width: '100%'}}
            actions={[
                <Button type="primary" onClick={() => quickApply(job._id)}>Quick Apply</Button>,
                <Button type="link" onClick={() => navigate('/job/' + job._id + '/apply')}>Apply</Button>,
            ]}
        >
            <div className="cursor-pointer" onClick={_ => openJob(job)}>
                <h2>
                    <b>{job.title}</b>
                    <Badge count={job.type} style={{ backgroundColor: '#dc143c', marginLeft: "10px" }}/>
                    <Badge count={job.level} style={{ backgroundColor: '#9acd32', marginLeft: "10px" }}/>
                </h2>

                <div>{job.experience}+ years</div>
                <div>Salary {job.salary.from && <span>{job.salary.from}{job.salary.to && <span> - {job.salary.to}</span>}</span>}</div>
                <div>{job.skills.map(v => <Tag key={v._id}>{v.name}</Tag>)}</div>
            </div>
        </Card>
    }

    return (
        <Row gutter={16}>
            <Col span={7} xs={24} sm={24} md={7}>
                <Card>
                    <Form onValuesChange={onFilterChange} layout="vertical">
                        <Form.Item label="Search" name="search">
                            <Input placeholder="Search" />
                        </Form.Item>

                        <Form.Item label="Skills" name="skills">
                            <Select mode="multiple" placeholder="Skills">
                                { skills.map(v => <Select.Option value={v._id} key={v._id}>{v.name}</Select.Option>) }
                            </Select>
                        </Form.Item>

                        <Form.Item label="Education" name="education">
                            <Select mode="multiple" placeholder="Education">
                                { course.map(v => <Select.Option value={v._id} key={v._id}>{v.name}</Select.Option>) }
                            </Select>
                        </Form.Item>

                        <Form.Item label="Salary (From)" name="salaryFrom">
                            <Input placeholder="From" />
                        </Form.Item>

                        <Form.Item label="Salary (To)" name="salaryTo">
                            <Input placeholder="To" />
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col span={17} xs={24} sm={24} md={17}>
                { filteredJobs.map(v => renderJobs(v)) }
                { !filteredJobs.length && <p style={{textAlign: "center"}}>No Jobs Found!</p>}
            </Col>

            <Modal
                title={selectedJob?.title}
                visible={addModel}
                footer={null}
                onCancel={() => setAddModel(false)}
            >
                {selectedJob && <div>
                    <Row>
                        <Col span={8}>
                            <b>Job Type</b>
                            <div>{ selectedJob.type }</div>
                        </Col>

                        <Col span={8}>
                            <b>Job Level</b>
                            <div>{ selectedJob.level }</div>
                        </Col>

                        { selectedJob.experience && <Col span={8}>
                            <b>Experience</b>
                            <div>{selectedJob.experience}+ years</div>
                        </Col> }
                    </Row>

                    <Row className="mt-10">
                        { selectedJob.education?.length && <Col span={8}>
                            <b>Education</b>
                            <div>{selectedJob.education.map(v => v.name).join(', ')}</div>
                        </Col> }

                        <Col span={8}>
                            <b>Salary</b>
                            <div>{selectedJob.salary?.from && <span>{selectedJob.salary.from}{selectedJob.salary?.to && <span> - {selectedJob.salary.to}</span>}</span>}</div>
                        </Col>

                        { selectedJob.skills?.length && <Col span={8}>
                            <b>Skills</b>
                            <div>{selectedJob.skills?.map(v => <Tag key={v._id}>{v.name}</Tag>)}</div>
                        </Col> }
                    </Row>

                    <Row className="mt-10">
                        <Col span={24}>
                            <b>Overview</b>
                            <div>{selectedJob.overview}</div>
                        </Col>
                    </Row>

                    <Row className="mt-10">
                        <Col span={24}>
                            <b>Job Description</b>
                            <div>{selectedJob.description}</div>
                        </Col>
                    </Row>
                </div>}
            </Modal>
        </Row>
    )
}
