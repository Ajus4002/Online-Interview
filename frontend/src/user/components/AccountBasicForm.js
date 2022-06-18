import {Button, Card, Col, DatePicker, Form, Input, notification, Row} from "antd";
import {EditFilled, SaveOutlined, CloseOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";
import moment from "moment";

export default function AccountBasicDetails({data, onChange}) {
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    async function onSubmit(data) {
        if (data['dateOfBirth']) {
            data['dateOfBirth'] = data['dateOfBirth'].format('YYYY-MM-DD')
        }

        try {
            setLoading(true)
            await api.put('/users/account/basic', data)
            setIsEdit(false)
            onChange()

            notification['success']({
                message: 'Updated',
                description: 'Details updated successfully',
            });
        } catch (e) {
            notification['error']({
                message: 'Error',
                description: e.response?.data.message,
            });
        } finally {
            setLoading(false)
        }
    }

    function onReset() {
        setIsEdit(false)
        form.resetFields()
    }

    useEffect(() => {
        if (data['dateOfBirth']) {
            data['dateOfBirth'] = moment(data['dateOfBirth'])
        }

        form.setFieldsValue(data)
    }, [form, data])


    function renderEditButton() {
        return !isEdit
            ? <Button type="link" htmlType="button" icon={<EditFilled />} onClick={() => setIsEdit(true)}/>
            : <Button type="link" htmlType="reset" icon={<CloseOutlined />} onClick={onReset}/>
    }

    return (
        <Card title="Basic Details" extra={renderEditButton()}>
            <Form form={form} onFinish={onSubmit} initialValues={data} layout="vertical" id="accountBasicForm">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
                            <Input placeholder="Name" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Mobile" name="mobile">
                            <Input placeholder="Mobile" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Date of Birth" name="dateOfBirth">
                            <DatePicker format={"YYYY-MM-DD"} placeholder="Date of Birth" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Location" name="location">
                            <Input placeholder="Location" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Address" name="address">
                            <Input.TextArea placeholder="Address" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    {isEdit && <Col span={24} style={{textAlign: "center"}}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                                    Update
                                </Button>
                            </Form.Item>
                        </Col>}
                </Row>
            </Form>
        </Card>
    )
}
