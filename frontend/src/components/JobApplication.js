import {Card, Col, Row, Tag} from "antd";
import moment from "moment";

export default function ({ application }) {
    return (
        <>
            <h2><b>{ application.job.title }</b></h2>

            <Row>
                <Col span={12}>
                    <b>Name</b>
                    <p>{ application.name }</p>
                </Col>
                <Col span={12}>
                    <b>DOB</b>
                    <p>{ application.dateOfBirth.split('T')[0] }</p>
                </Col>
                <Col span={12}>
                    <b>Email</b>
                    <p>{ application.email }</p>
                </Col>
                <Col span={12}>
                    <b>Mobile</b>
                    <p>{ application.mobile }</p>
                </Col>
                <Col span={12}>
                    <b>Location</b>
                    <p>{ application.location }</p>
                </Col>
                <Col span={12}>
                    <b>Address</b>
                    <p>{ application.address }</p>
                </Col>
                <Col span={24}>
                    <b>Skills</b>
                    <p>{ application.skills.map(v => v.name).join(', ') }</p>
                </Col>
                <Col span={24}>
                    <b>Education</b>
                    <div>{ application.education.map(edu => <Card key={edu._id} style={{marginBottom: '16px'}}>
                        <b>{edu.course.name}</b>
                        <div className="text-grey">{edu.college}</div>
                        <div>{moment(edu.from).format('MMM-YYYY')}{edu.to && <span> - {moment(edu.to).format('MMM-YYYY')}</span>}</div>
                    </Card>) }</div>
                </Col>
                <Col span={24}>
                    <b>Experience</b>
                    <div>{ application.experience.map(xp => <Card key={xp._id} style={{marginBottom: '16px'}}>
                        <b>{xp.jobTitle}</b>
                        <div className="text-grey">{xp.company}</div>
                        <div>{moment(xp.from).format('MMM-YYYY')}{xp.to && <span> - {moment(xp.to).format('MMM-YYYY')}</span>}</div>
                        <div>{xp.skills.map(v => <Tag>{v.name ?? v.label}</Tag>)}</div>
                    </Card>) }</div>
                </Col>
            </Row>
        </>
    )
}
