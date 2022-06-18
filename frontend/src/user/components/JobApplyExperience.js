import {Button, Card, Col, Row, Select, message, Modal, Form, Input, DatePicker, Tag} from "antd";
import {PlusOutlined, DeleteFilled} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";
import moment from "moment";

export default function JobApplyExperience({data, onChange}) {
    const [addModel, setAddModel] = useState(false)
    const [experiences, setExperiences] = useState([])
    const [allSkills, setAllSkills] = useState([])
    const [form] = Form.useForm()

    async function addExperience(data) {
        data._id = Math.random()

        setExperiences([...experiences, data])
        setAddModel(false)
        form.resetFields()
    }

    async function removeExperience(xp) {
        if (!xp) return

        setExperiences(experiences.filter(v => v._id !== xp._id))
    }

    useEffect(() => {
        api.get('/skills').then(res => setAllSkills(res.data.data))
    }, [])

    useEffect(() => {
        setExperiences([...data])
    }, [data])

    useEffect(() => {
        onChange(experiences)
    }, [onChange, experiences])



    function renderExperience(xp) {
        const from = moment(xp.from).format('MMM-YYYY')
        const to = xp.to ? moment(xp.to).format('MMM-YYYY') : null

        return <Card key={xp._id} style={{marginBottom: '16px'}}>
            { <Button style={{
                position: "absolute",
                top: "5px",
                right: "0px"
            }} type="link" danger onClick={() => removeExperience(xp)}><DeleteFilled /></Button> }

            <b>{xp.jobTitle}</b>
            <div className="text-grey">{xp.company}</div>
            <div>{from}{to && <span> - {to}</span>}</div>
            <div>
                {xp.skills.map(v => <Tag>{v.name ?? v.label}</Tag>)}
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
        <Card title="Experience">
            <Row gutter={16}>
                <Col span={24}>
                    { experiences?.map(v => renderExperience(v)) ?? null }

                    <Button type="dashed" style={{width: '100%'}} onClick={() => setAddModel(true)}>
                        <PlusOutlined /> Add Experience
                    </Button>
                </Col>
            </Row>

            <Modal
                title="Add Experience"
                visible={addModel}
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
