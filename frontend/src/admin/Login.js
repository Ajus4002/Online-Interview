import {Card, Col, Input, Row, Form, Button, message} from "antd";
import api from "../api";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

export default function Login() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    async function onSubmit(data) {
        setLoading(true)
        try {
            const res = await api.post('/login', data)
            localStorage.setItem("admin.token", res.data.data.token)
            localStorage.setItem("admin", JSON.stringify(res.data.data.admin))
            api.defaults.headers['Authorization'] = 'Bearer ' + res.data.data.token

            navigate('/admin')
        } catch (e) {
            message.error(e.response?.data.message ?? " Something went wrong");
        } finally {
            setLoading(false)
        }
    }

    return (
        <Row type="flex" align="middle" justify="center" className="h-100">
            <Col>
                <Card title="Login">
                    <Form onFinish={onSubmit} layout="vertical">
                        <Form.Item label="Email" name="email" rules={[
                            { type: 'email', message: 'The input is not valid E-mail!' },
                            { required: true, message: 'Please input your E-mail!' }]
                        }>
                            <Input placeholder="Email"/>
                        </Form.Item>

                        <Form.Item label="Password" name="password" rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be 6 chars long!' },

                        ]}>
                            <Input placeholder="Password"/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}
