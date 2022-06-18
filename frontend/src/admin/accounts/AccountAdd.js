import React from 'react';


    import {Button, Card, Drawer, Form, Input, InputNumber, message, Select, Table} from "antd";
    import {useEffect, useState} from "react";
    import api from "../../api";
    
    
    function AccountAdd(props) {
        const [loading, setLoading] = useState(false)
        const [data, setData] = useState(null);
        const [action, setAction] = useState('Add')

        const [form] = Form.useForm()
    
        async function onSubmit(data) {
            try {
                setLoading(true)

                if (props.id) {
                    await api.put('/accounts/' + props.id, data)
                    message.success("Account updated")
                } else {
                    await api.post('/accounts', data)
                    message.success("Account added")
                }
                
                props.onClose && props.onClose()
            } catch (e) {
                message.error("Unexpected error")
            }
    
            setLoading(false)
        }

        async function loadData() {
            if (!props.id) {
                return
            }

            setAction('Update')
            setLoading(true)
            const res = await api.get('/accounts/' + props.id)
            setData(res.data.data)
            
            setLoading(false)
        }

        useEffect(() => {
            loadData()
        }, []);

        useEffect(() => {   
            if (data) {
                form.setFieldsValue(data)
            } 
            
        }, [form, data])

    
        return (
            <Card title={action +  " Account"}>
                <Form form={form} onFinish={onSubmit} layout="vertical">
                    <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
                        <Input placeholder="Name"/>
                    </Form.Item>
    
            
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please Enter the Email!' }]}>
                    <Input placeholder="Email"/>
                </Form.Item>

    
                {!props. id && <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please Enter the Email!' }]}>
                <Input.Password placeholder="Password"/>
            </Form.Item>}


              
                <Form.Item label="Mobile" name="mobile"  rules={[{ required: true, message: 'Please Enter the mobile no!' }]}>
                <Input placeholder="Mobile"/>
            </Form.Item>


            <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select job type!' }]}>
                    <Select placeholder="Type">
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Staff">Staff</Select.Option>
                    </Select>
                </Form.Item>

    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          { action } Account
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        )
    }
    

export default AccountAdd;