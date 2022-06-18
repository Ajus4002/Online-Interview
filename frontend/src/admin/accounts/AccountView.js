import api from "../../api";
import {Badge, Button, Col, message, Popconfirm, Row, Table} from "antd";
import {useEffect, useState} from "react";


export default function AccountView({ id, onChange, onEdit }) {
    const [data, setData] = useState(null)
    const [deletingAccount, setDeletingAccount] = useState(false)
    const [loading, setLoading] = useState(false)

    async function load() {
        try {
            setLoading(true)
            const res = await api.get('/accounts/' + id)
            setData(res.data.data)
        } catch (e) {
            message.error("Something went wrong")
        }
        setLoading(false)
    }

    useEffect(() => { load() }, [id])

    async function deleteAccount() {
        try {
            setDeletingAccount(true)
            const res = await api.delete('/accounts/' + id)
            onChange()
        } catch (e) {
            message.error("Something went wrong")
        }
        setDeletingAccount(false)
    }

    if (loading || !data) {
        return (<p>Loading...</p>)
    }

    return (
        <div>
            <h2><b>{ data.name }</b><Badge count={data.isDeleted ? 'Deleted' : 'Active' } style={{ backgroundColor: data.isDeleted ? 'red' : 'green', marginLeft: "15px" }} /></h2>

            <Row>
                <Col span={12}>
                    <b>Name</b>
                    <p>{ data.name }</p>
                </Col>
                <Col span={12}>
                <b>Type</b>
                <p>{ data.type }</p>
            </Col>
                <Col span={12}>
                    <b>Email</b>
                    <p>{ data.email }</p>
                </Col>
                <Col span={12}>
                    <b>Mobile</b>
                    <p>{ data.mobile }</p>
                </Col>
                
                
            { !data.isDeleted && <Col span={12} style={{textAlign: "center"}}>
            <Popconfirm
                title="Are you sure to delete this account?"
                onConfirm={deleteAccount}
                okText="Yes"
                cancelText="No"
            >
                <Button type="primary" danger loading={deletingAccount}>
                    Delete Account
                </Button>
            </Popconfirm>
        </Col> }

        <Col span={12} style={{textAlign: "center"}}>
            <Button type="primary" onClick={onEdit}>
                Edit
            </Button>
        </Col>
                
            </Row>
        </div>
    )
}
