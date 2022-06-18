import {Button, Card, Col, Row, Select, message, Modal, Form, Input, DatePicker} from "antd";
import {PlusOutlined, DeleteFilled} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";
import moment from "moment";

export default function JobApplyEducation({data, onChange}) {
    const [addModel, setAddModel] = useState(false)
    const [educations, setEducations] = useState([])
    const [allCourses, setAllCourses] = useState([])
    const [form] = Form.useForm()

    async function addEducation(data) {
        data._id = Math.random()

        data.course = { _id: data.course.value, name: data.course.label ?? data.course.value }
        setEducations([...educations, data])
        setAddModel(false)
        form.resetFields()
    }

    async function removeEducation(edu) {
        if (!edu) return

        setEducations(educations.filter(v => v._id !== edu._id))
    }

    useEffect(() => {
        api.get('/courses').then(res => setAllCourses(res.data.data))
    }, [])

    useEffect(() => {
        setEducations([...data])
    }, [data])

    useEffect(() => {
        onChange(educations)
    }, [onChange, educations])



    function renderEducation(edu) {
        const from = moment(edu.from).format('MMM-YYYY')
        const to = edu.to ? moment(edu.to).format('MMM-YYYY') : null

        return <Card key={edu._id} style={{marginBottom: '16px'}}>
            { <Button style={{
                position: "absolute",
                top: "5px",
                right: "0px"
            }} type="link" danger onClick={() => removeEducation(edu)}><DeleteFilled /></Button> }

            <b>{edu.course.name}</b>
            <div className="text-grey">{edu.college}</div>
            <div>{from}{to && <span> - {to}</span>}</div>
        </Card>
    }

    function onModelCancel() {
        setAddModel(false)
    }

    function onModelOk() {
        form.submit()
    }

    return (
        <Card title="Education">
            <Row gutter={16}>
                <Col span={24}>
                    { educations?.map(v => renderEducation(v)) ?? null }

                    <Button type="dashed" style={{width: '100%'}} onClick={() => setAddModel(true)}>
                        <PlusOutlined /> Add Education
                    </Button>
                </Col>
            </Row>

            <Modal
                title="Add Education"
                visible={addModel}
                onOk={onModelOk}
                onCancel={onModelCancel}
            >
                <Form form={form} onFinish={addEducation} layout="vertical">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Course" name="course" rules={[{ required: true, message: 'Required!' }]}>
                                <Select className="w-100" placeholder="Courses" labelInValue={true}>
                                    { allCourses.map(v => <Select.Option key={v._id} value={v._id}>{v.name}</Select.Option>) }
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="College" name="college" rules={[{ required: true, message: 'Required!' }]}>
                                <Input placeholder="College"/>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="From" name="from" rules={[{ required: true, message: 'Required!' }]}>
                                <DatePicker className="w-100" placeholder="From" picker="month"/>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="To" name="to">
                                <DatePicker className="w-100" placeholder="To" picker="month"/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    )
}
