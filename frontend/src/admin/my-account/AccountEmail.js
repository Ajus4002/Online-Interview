import {Button, Card, Col, Form, Input, notification, Row} from "antd";
import {EditFilled, SaveFilled, CloseOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";

export default function AccountEmail({data, onChange}) {
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    async function onSubmit(data) {
        try {
            setLoading(true)
            await api.patch('/account/me/email', data)
            setIsEdit(false)
            onChange()

            notification['success']({
                message: 'Updated',
                description: 'Email Id updated successfully',
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
        form.setFieldsValue(data)
    }, [form, data])


    function renderEditButton() {
        return !isEdit
            ? <Button type="link" htmlType="button" icon={<EditFilled />} onClick={() => setIsEdit(true)}/>
            : <Button type="link" htmlType="reset" icon={<CloseOutlined />} onClick={onReset}/>
    }

    return (
        <Card title="Email" extra={renderEditButton()}>
            <Form form={form} onFinish={onSubmit} initialValues={data} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required!' }]}>
                            <Input placeholder="Email" disabled={!isEdit}/>
                        </Form.Item>
                    </Col>

                    {isEdit && <Col span={24} style={{textAlign: "center"}}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveFilled />}>
                                Update
                            </Button>
                        </Form.Item>
                    </Col>}
                </Row>
            </Form>
        </Card>
    )
}
