import {Card, Col, Input, Row, Form, Button, notification} from "antd";
import api from "../api";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

export default function Register() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    async function onSubmit(data) {
        try {
            setLoading(true)
            await api.post('/users/register', data)
            navigate('/login')
        } catch (e) {
            notification['error']({
                message: 'Error',
                description: e.response?.data.message,
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <Row type="flex" align="middle" justify="center" className="h-100" style={{marginTop:"50px", height:"50px"}}>
            <Col>
                <Card title="Register" className="logincard">
                    <Form onFinish={onSubmit} layout="vertical">
                        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
                            <Input placeholder="Name"/>
                        </Form.Item>

                        <Form.Item label="Email" name="email" rules={[
                            { type: 'email', message: 'The input is not valid E-mail!' },
                            { required: true, message: 'Please input your E-mail!' }]
                        }>
                            <Input placeholder="Email"/>
                        </Form.Item>

                        <Form.Item label="Mobile" name="mobile" rules={[{ required: true, message: 'Please input your Mobile Number!' }]}>
                            <Input placeholder="Mobile"/>
                        </Form.Item>

                        <Form.Item label="Password" name="password" rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be 6 chars long!' },
                        ]}>
                            <Input.Password placeholder="Password"/>
                        </Form.Item>

                        <Form.Item label="Confirm Password" name="confirmPassword" rules={[
                            { required: true, message: 'Please input your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}>
                            <Input placeholder="Confirm Password"/>
                        </Form.Item>

                        <Form.Item>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Register
                            </Button>
                            
                            <Button onClick={()=>navigate('/login')} type="link" htmlType="submit" >
                            Login
                        </Button>
                        </div>
                        </Form.Item>

                       

                        
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}
