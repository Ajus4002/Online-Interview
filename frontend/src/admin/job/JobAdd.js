import {Button, Card, Drawer, Form, Input, InputNumber, message, Select, Table} from "antd";
import {useEffect, useState} from "react";
import api from "../../api";


export default function JobAdd(props) {
    const [loading, setLoading] = useState(false)
    const [skills, setSkills] = useState([])
    const [course, setCourse] = useState([])

    async function onSubmit(data) {
        try {
            setLoading(true)
            await api.post('/job', data)
            message.success("Job posted")

            props.onClose && props.onClose()
        } catch (e) {
            message.error("Unexpected error")
        }

        setLoading(false)
    }

    async function load() {
        try {
            const res1 = await api.get('/skills')
            const res2 = await api.get('/courses')

            setSkills(res1.data.data)
            setCourse(res2.data.data)
        } catch (e) {
            message.error("Something went wrong")
        }
    }

    useEffect(() => { load() }, [])

    return (
        <Card title="Add Job">
            <Form onFinish={onSubmit} layout="vertical">
                <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input your job title!' }]}>
                    <Input placeholder="Title"/>
                </Form.Item>

                <Form.Item label="Experience" name="experience" rules={[{ required: true, message: 'Please select experience!' }]}>
                    <InputNumber  placeholder="Experience"/>
                </Form.Item>

                <Form.Item label="Skills" name="skills" rules={[{ required: true, message: 'Please select skills!' }]}>
                    <Select mode="tags" placeholder="Skills">
                        {skills.map(v => <Select.Option value={v._id}>{v.name}</Select.Option>)}
                    </Select>
                </Form.Item>

                <Form.Item label="Education" name="education" rules={[{ required: true, message: 'Please select education!' }]}>
                    <Select mode="tags" placeholder="Education">
                        {course.map(v => <Select.Option value={v._id}>{v.name}</Select.Option>)}
                    </Select>
                </Form.Item>

                <Form.Item label="Level" name="level" rules={[{ required: true, message: 'Please select level!' }]}>
                    <Select placeholder="Level">
                        <Select.Option value="Junior">Junior</Select.Option>
                        <Select.Option value="Mid-Level">Mid-Level</Select.Option>
                        <Select.Option value="Senior">Senior</Select.Option>
                        <Select.Option value="Intern">Intern</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select job type!' }]}>
                    <Select placeholder="Type">
                        <Select.Option value="Full Time">Full Time</Select.Option>
                        <Select.Option value="Part Time">Part Time</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Salary" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Required!' }]}>
                    <Form.Item name={['salary', 'from']} style={{ display: 'inline-block', width: 'calc(50% - 12px)' }} rules={[{ required: true, message: 'Required!' }]}>
                        <InputNumber placeholder="From"/>
                    </Form.Item>
                    <span style={{ display: 'inline-block', width: '24px', lineHeight: '32px', textAlign: 'center' }}>-</span>
                    <Form.Item name={['salary', 'to']} style={{ display: 'inline-block', width: 'calc(50% - 12px)' }} rules={[{ required: true, message: 'Required!' }]}>
                        <InputNumber placeholder="To"/>
                    </Form.Item>
                </Form.Item>

                <Form.Item label="Overview" name="overview" rules={[{ required: true, message: 'Required!' }]}>
                    <Input.TextArea />
                </Form.Item>

                <Form.Item label="Job Description" name="description" rules={[{ required: true, message: 'Required!' }]}>
                    <Input.TextArea />
                </Form.Item>


                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Add Job
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}
