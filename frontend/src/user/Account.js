import {Col, Row, notification} from "antd";
import api from "../api";
import {useEffect, useState} from "react";
import AccountBasicDetails from "./components/AccountBasicForm";
import AccountEmail from "./components/AccountEmail";
import AccountPassword from "./components/AccountPassword";
import AccountSkills from "./components/AccountSkills";
import AccountExperience from "./components/AccountExperience";
import AccountEducation from "./components/AccountEducation";

export default function Account() {
    const [account, setAccount] = useState({})
    function onChange() {
        api.get("/users/account")
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
            <Col span={12}>
                <AccountSkills onChange={onChange} data={account}/>
            </Col>
            <Col span={12}>
                <AccountExperience onChange={onChange} data={account}/>
            </Col>
            <Col span={12}>
                <AccountEducation onChange={onChange} data={account}/>
            </Col>
        </Row>
    )
}
