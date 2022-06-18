import {Badge, Col, Row} from "antd";

export default function JobPosting({job}) {
    return (
        <>
            <h2><b>{ job.title }</b><Badge count={job.isOpen ? 'Open' : 'Closed' } style={{ backgroundColor: job.isOpen ? 'green' : 'red', marginLeft: "15px" }} /></h2>

            <Row>
                <Col span={12}>
                    <b>Level</b>
                    <p>{ job.level }</p>
                </Col>
                <Col span={12}>
                    <b>Type</b>
                    <p>{ job.type }</p>
                </Col>
                <Col span={12}>
                    <b>Experience</b>
                    <p>{ job.experience }</p>
                </Col>
                <Col span={12}>
                    <b>Salary</b>
                    <p>{ job.salary.from?.toLocaleString() } - { job.salary.to?.toLocaleString() }</p>
                </Col>
                <Col span={12}>
                    <b>Education</b>
                    <p>{ job.education.map(v => v.name).join(', ') }</p>
                </Col>
                <Col span={12}>
                    <b>Skills</b>
                    <p>{ job.skills.map(v => v.name).join(', ') }</p>
                </Col>
                <Col span={24}>
                    <b>Overview</b>
                    <p>{ job.overview }</p>
                </Col>
                <Col span={24}>
                    <b>Job Description</b>
                    <p>{ job.description }</p>
                </Col>
            </Row>
        </>
    )
}
