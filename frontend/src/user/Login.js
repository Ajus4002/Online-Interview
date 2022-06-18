import {Card, Col, Input, Row, Form, Button, notification} from "antd";
import api from "../api";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import image from "../../src/userlogin.jpg";




export default function Login() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    async function onSubmit(data) {
        setLoading(true)
        try {
            const res = await api.post('/users/login', data)
            localStorage.setItem("user.token", res.data.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.data.user))
            api.defaults.headers['Authorization'] = 'Bearer ' + res.data.data.token

            navigate('/')
        } catch (e) {
            notification['error']({
                message: 'Error',
                description: e.response?.data.message ?? " Something went wrong",
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <Row type="flex" align="middle" justify="center" className="h-100" style={{marginTop:"50px", height:"50px"}}>
            <Col>
                <Card title="Login" className="logincard">
                <div className="loginimage12">
                <img src={image} alt="Logo" className="Logoimage" />
                </div>
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
                            <Input.Password placeholder="Password"/>
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