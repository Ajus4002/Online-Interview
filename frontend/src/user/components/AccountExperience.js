import {Button, Card, Col, Row, Select, Tag, message, Empty, Modal, Form, Input, DatePicker} from "antd";
import {EditFilled, CloseOutlined, PlusOutlined, DeleteFilled} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";
import moment from "moment";

export default function AccountExperience({data, onChange}) {
    const [isEdit, setIsEdit] = useState(false)
    const [addModel, setAddModel] = useState(false)
    const [loading, setLoading] = useState(false)
    const [allSkills, setAllSkills] = useState([])
    const [form] = Form.useForm()

    async function addExperience(data) {
        try {
            setLoading(true)

            data.skills = data.skills.map(v => v.value ?? (v._id ?? v))
            
            await api.post('/users/experience', data)
            onChange()
            setAddModel(false)

            message.success("Experience added successfully")
        } catch (e) {
            message.error(e.response?.data.message ?? e.message);
        } finally {
            setLoading(false)
        }
    }

    async function removeExperience(xp) {
        if (!xp) return

        try {
            setLoading(true)
            await api.delete('/users/experience/' + xp._id)
            onChange()

            message.success("Experience deleted successfully")
        } catch (e) {
            message.error(e.response?.data.message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        api.get('/skills').then(res => setAllSkills(res.data.data))
    }, [])

    function renderEditButton() {
        return !isEdit
            ? <Button type="link" htmlType="button" icon={<EditFilled />} onClick={() => setIsEdit(true)}/>
            : <Button type="link" htmlType="reset" icon={<CloseOutlined />} onClick={() => setIsEdit(false)}/>
    }

    function renderExperience(xp) {
        const from = moment(xp.from).format('MMM-YYYY')
        const to = xp.to ? moment(xp.to).format('MMM-YYYY') : null

        return <Card key={xp._id} style={{marginBottom: '16px'}}>
            { isEdit && <Button style={{
                position: "absolute",
                top: "5px",
                right: "0px"
            }} type="link" danger onClick={() => removeExperience(xp)}><DeleteFilled /></Button> }

            <b>{xp.jobTitle}</b>
            <div className="text-grey">{xp.company}</div>
            <div>{from}{to && <span> - {to}</span>}</div>
            <div>
                {xp.skills.map(v => <Tag>{v.name}</Tag>)}
            </div>
        </Card>
    }

    function onModelCancel() {
        setAddModel(false)
    }

    function onModelOk() {
        form.submit()
    }

    return (
        <Card title="Experience" extra={renderEditButton()}>
            <Row gutter={16}>
                <Col span={24}>
                    { !data.experience?.length && !isEdit && <Empty />}

                    { data.experience?.map(v => renderExperience(v)) ?? null }

                    {isEdit && (
                        <Button type="dashed" style={{width: '100%'}} onClick={() => setAddModel(true)}>
                            <PlusOutlined /> Add Experience
                        </Button>
                    )}
                </Col>
            </Row>

            <Modal
                title="Add Experience"
                visible={addModel}
                confirmLoading={loading}
                onOk={onModelOk}
                onCancel={onModelCancel}
            >
                <Form form={form} onFinish={addExperience} layout="vertical">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Job Title" name="jobTitle" rules={[{ required: true, message: 'Required!' }]}>
                                <Input placeholder="Job Title"/>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Company" name="company" rules={[{ required: true, message: 'Required!' }]}>
                                <Input placeholder="Company"/>
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

                        <Col span={24}>
                            <Form.Item label="Skills" name="skills" rules={[{ required: true, message: 'Please select atleast one skill!' }]}>
                                <Select className="w-100" mode="multiple" placeholder="Skills" labelInValue={true}>
                                    { allSkills.map(v => <Select.Option key={v._id} value={v._id}>{v.name}</Select.Option>) }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    )
}
