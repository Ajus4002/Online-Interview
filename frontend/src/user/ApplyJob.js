import {Button, Card, Col, DatePicker, Form, Input, message, notification, Row, Select, Tag} from "antd";
import {useEffect, useState} from "react";
import api from "../api";
import {useNavigate, useParams} from "react-router-dom";
import moment from "moment";
import {PlusOutlined} from "@ant-design/icons";
import JobApplySkills from "./components/JobApplySkills";
import JobApplyEducation from "./components/JobApplyEducation";
import JobApplyExperience from "./components/JobApplyExperience";


export default function ApplyJob() {
    const [data, setData] = useState({})
    const [job, setJob] = useState({})
    const [loading, setLoading] = useState(false)
    const [skills, setSkills] = useState([])
    const [education, setEducation] = useState([])
    const [experience, setExperience] = useState([])


    const [applyingJob, setApplyingJob] = useState(false)

    const params = useParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()

    async function load() {
        try {
            setLoading(true)
            const res = await api.get('/users/job/' + params.id)
            const res2 = await api.get('/users/account')

            setJob(res.data.data)
            setData(res2.data.data)
        } catch (e) {
            message.error("Something went wrong")
        }
        setLoading(false)
    }


    useEffect(() => {
        load()
    }, [params.id])

    useEffect(() => {
        if (data && data['dateOfBirth']) {
            data['dateOfBirth'] = moment(data['dateOfBirth'])
        }

        form.setFieldsValue(data)
    }, [form, data])

    async function onSubmit(data) {
        data.skills = skills.map(v => v._id)
        data.education = JSON.parse(JSON.stringify(education))
        data.experience = JSON.parse(JSON.stringify(experience))

        data.experience.forEach(v => {
            v.skills = v.skills.map(v => v.value ?? (v._id ?? v))
        })

        data.education.forEach(v => {
            v.course = v.course._id
        })

        if (data['dateOfBirth']) {
            data['dateOfBirth'] = data['dateOfBirth'].format('YYYY-MM-DD')
        }

        try {
            await api.post(`/users/jobs/${params.id}/apply`, data)
            notification['success']({
                message: 'Success',
                description: 'Application posted successfully',
            });
            navigate('/')
        } catch (e) {
            notification['error']({
                message: 'Sorry',
                description: e.response?.data.message,
            });
        }
    }

    return (
        <Card title={"Application for " + job?.title}>
            <Form form={form} onFinish={onSubmit} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Name" name="name" rules={[
                            { required: true, message: 'Please input your Name!' }]
                        }>
                            <Input placeholder="Name"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Email" name="email" rules={[
                            { type: 'email', message: 'The input is not valid E-mail!' },
                            { required: true, message: 'Please input your E-mail!' }]
                        }>
                            <Input placeholder="Email"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Mobile" name="mobile" rules={[
                            { required: true, message: 'Please input your mobile no!' }]
                        }>
                            <Input placeholder="Mobile"/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Date of Birth" name="dateOfBirth" rules={[
                            { required: true, message: 'Required' }]
                        }>
                            <DatePicker format={"YYYY-MM-DD"} placeholder="Date of Birth" style={{width: '100%'}}/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Location" name="location" rules={[
                            { required: true, message: 'Required' }]
                        }>
                            <Input placeholder="Location" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Address" name="address" rules={[
                            { required: true, message: 'Required' }]
                        }>
                            <Input.TextArea placeholder="Address"/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <JobApplySkills data={data?.skills ?? []} onChange={(data) => setSkills(data)}/>
                    </Col>

                    <Col span={8}>
                        <JobApplyEducation data={data?.education ?? []} onChange={(data) => setEducation(data)}/>
                    </Col>

                    <Col span={8}>
                        <JobApplyExperience data={data?.experience ?? []} onChange={(data) => setExperience(data)}/>
                    </Col>

                    <Col span={24} style={{textAlign: "center"}} className="mt-10">
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Apply Job
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>

    )
}
