import {Button, Card, Col, Row, Select, message, Empty, Modal, Form, Input, DatePicker} from "antd";
import {EditFilled, CloseOutlined, PlusOutlined, DeleteFilled} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";
import moment from "moment";

export default function AccountEducation({data, onChange}) {
    const [isEdit, setIsEdit] = useState(false)
    const [addModel, setAddModel] = useState(false)
    const [loading, setLoading] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [form] = Form.useForm()

    async function addEducation(data) {
        try {
            setLoading(true)
            await api.post('/users/education', data)
            onChange()
            setAddModel(false)

            message.success("Education added successfully")
        } catch (e) {
            message.error(e.response?.data.message);
        } finally {
            setLoading(false)
        }
    }

    async function removeEducation(edu) {
        if (!edu) return

        try {
            setLoading(true)
            await api.delete('/users/education/' + edu._id)
            onChange()

            message.success("Education deleted successfully")
        } catch (e) {
            message.error(e.response?.data.message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        api.get('/courses').then(res => setAllCourses(res.data.data))
    }, [])

    function renderEditButton() {
        return !isEdit
            ? <Button type="link" htmlType="button" icon={<EditFilled />} onClick={() => setIsEdit(true)}/>
            : <Button type="link" htmlType="reset" icon={<CloseOutlined />} onClick={() => setIsEdit(false)}/>
    }

    function renderEducation(edu) {
        const from = moment(edu.from).format('MMM-YYYY')
        const to = edu.to ? moment(edu.to).format('MMM-YYYY') : null

        return <Card key={edu._id} style={{marginBottom: '16px'}}>
            { isEdit && <Button style={{
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
        <Card title="Education" extra={renderEditButton()}>
            <Row gutter={16}>
                <Col span={24}>
                    { !data.education?.length && !isEdit && <Empty />}

                    { data.education?.map(v => renderEducation(v)) ?? null }

                    {isEdit && (
                        <Button type="dashed" style={{width: '100%'}} onClick={() => setAddModel(true)}>
                            <PlusOutlined /> Add Education
                        </Button>
                    )}
                </Col>
            </Row>

            <Modal
                title="Add Education"
                visible={addModel}
                confirmLoading={loading}
                onOk={onModelOk}
                onCancel={onModelCancel}
            >
                <Form form={form} onFinish={addEducation} layout="vertical">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Course" name="course" rules={[{ required: true, message: 'Required!' }]}>
                                <Select className="w-100" placeholder="Courses">
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
