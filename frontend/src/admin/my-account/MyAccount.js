import {Col, Row, notification} from "antd";
import api from "../../api";
import {useEffect, useState} from "react";
import AccountBasicDetails from "./AccountBasicForm";
import AccountEmail from "./AccountEmail";
import AccountPassword from "./AccountPassword";

export default function MyAccount() {
    const [account, setAccount] = useState({})
    function onChange() {
        api.get("/account/me")
            .then(res => {
                setAccount(res.data.data)
            })
            .catch(e => {
                notification['error']({
                    message: 'Error',
                    description: e.response?.data.message ?? " Something went wrong",
                });
            })
    }

    useEffect(() => onChange, [])

    return (
        <Row gutter={8}>
            <Col span={8}>
                <AccountBasicDetails onChange={onChange} data={account}/>
            </Col>
            <Col span={8}>
                <AccountEmail onChange={onChange} data={account}/>
            </Col>
            <Col span={8}>
                <AccountPassword onChange={onChange} data={{}}/>
            </Col>
        </Row>
    )
}
