import api from "../../api";
import {Badge, Button, Col, message, Popconfirm, Row, Table} from "antd";
import {useEffect, useState} from "react";


export default function JobView({ id, onChange }) {
    const [data, setData] = useState(null)
    const [closingJob, setClosingJob] = useState(false)
    const [loading, setLoading] = useState(false)

    async function load() {
        try {
            setLoading(true)
            const res = await api.get('/job/' + id)
            setData(res.data.data)
        } catch (e) {
            message.error("Something went wrong")
        }
        setLoading(false)
    }

    useEffect(() => { load() }, [id])

    async function closeJob() {
        setClosingJob(true)

        try {
            await api.patch('/job/' + id + '/close')
            onChange && onChange()
            message.success("Job Post Closed")
            await load()
        } catch (e) {
            message.error("Unknown Error")
        }

        setClosingJob(false)
    }

    if (loading || !data) {
        return (<p>Loading...</p>)
    }

    return (
        <div>
            <h2><b>{ data.title }</b><Badge count={data.isOpen ? 'Open' : 'Closed' } style={{ backgroundColor: data.isOpen ? 'green' : 'red', marginLeft: "15px" }} /></h2>

            <Row>
                <Col span={12}>
                    <b>Level</b>
                    <p>{ data.level }</p>
                </Col>
                <Col span={12}>
                    <b>Type</b>
                    <p>{ data.type }</p>
                </Col>
                <Col span={12}>
                    <b>Experience</b>
                    <p>{ data.experience }</p>
                </Col>
                <Col span={12}>
                    <b>Salary</b>
                    <p>{ data.salary.from?.toLocaleString() } - { data.salary.to?.toLocaleString() }</p>
                </Col>
                <Col span={24}>
                    <b>Education</b>
                    <p>{ data.education.map(v => v.name).join(', ') }</p>
                </Col>
                <Col span={24}>
                    <b>Skills</b>
                    <p>{ data.skills.map(v => v.name).join(', ') }</p>
                </Col>
                <Col span={24}>
                    <b>Overview</b>
                    <p>{ data.overview }</p>
                </Col>
                <Col span={24}>
                    <b>Job Description</b>
                    <p>{ data.description }</p>
                </Col>
                { data.isOpen &&
                    <Col span={24} style={{textAlign: "center"}}>
                        <Popconfirm
                            title="Are you sure to delete this task?"
                            onConfirm={closeJob}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger loading={closingJob}>
                                Close Job
                            </Button>
                        </Popconfirm>
                    </Col>
                }
            </Row>
        </div>
    )
}
