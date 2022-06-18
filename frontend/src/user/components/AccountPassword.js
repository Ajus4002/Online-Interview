import {Button, Card, Col, Form, Input, notification, Row} from "antd";
import {SaveOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";

export default function AccountPassword({data, onChange}) {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    async function onSubmit(data) {
        try {
            setLoading(true)
            await api.patch('/users/password', data)
            onChange()
            onReset()

            notification['success']({
                message: 'Updated',
                description: 'Password updated successfully',
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
        form.resetFields()
    }

    useEffect(() => {
        form.setFieldsValue(data)
    }, [form, data])

    return (
        <Card title="Change Password">
            <Form form={form} onFinish={onSubmit} initialValues={data} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Old Password" name="oldPassword" rules={[{ required: true, message: 'Required!' }]}>
                            <Input type="password" placeholder="Old Password" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="New Password" name="newPassword" rules={[
                            { required: true, message: 'Required!' },
                            { min: 6, message: 'Password must be 6 chars long!' },
                        ]}>
                            <Input type="password" placeholder="New Password" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Confirm New Password" name="password" rules={[
                            { required: true, message: 'Required!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}>
                            <Input type="password" placeholder="Confirm New Password" />
                        </Form.Item>
                    </Col>

                    <Col span={24} style={{textAlign: "center"}}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                                Update
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}
