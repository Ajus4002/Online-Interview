import {Layout, Menu, Breadcrumb, Row, Col} from 'antd';
import {Route, Navigate, useNavigate, useLocation} from "react-router-dom";
import React from "react";
import api from "../api";
import './User.css'
import {useState} from "react";
import {CreditCardOutlined, DotChartOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined} from "@ant-design/icons";

const logo = require('./../logo.png')

const { Header, Content, Footer } = Layout;

const UserLayout = ({ children, auth }) => {
    const navigate = useNavigate()
    const location = useLocation();

    const token = localStorage.getItem('user.token')
    if (token) {
        api.defaults.headers['Authorization'] = 'Bearer ' + token
    }

    const menuM = [
        { key: '/', label: 'Home', },
    ];

    if (token) {
        menuM.push(
            { key: '/my/jobs', label: 'My Jobs', },
            { key: '/my/account', label: 'My Account', },
        )
    }

    const menuM2 = [];
    if (token) {
        menuM2.push(
            { key: '/logout', label: 'Logout', },
        )
    } else {
        menuM2.push(
            { key: '/login', label: 'Login', },
            { key: '/register', label: 'Register', },
        )
    }

    const [menu, setMenu] = useState(menuM)
    const [menu2, setMenu2] = useState(menuM2)

    const defaultSelectedKeys = '/' + location.pathname.split('/').slice(1, 3).join('/')

    if (auth && !token) {
        return <Navigate to="/login"/>
    }

    function handleMenuSelect(item) {
        if (item.key === '/logout') {
            localStorage.removeItem('user.token')
            localStorage.removeItem('user')
            window.location.reload()
            return
        }

        navigate(item.key)
    }

    return (
        <Layout className="site-layout" id="user-layout">
            <Header className="site-layout-background" style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                <img className="logo" src={logo} alt="logo"/>

                <Row style={{justifyContent: "space-between"}}>
                    <Col>
                        <Menu
                            theme="light"
                            mode="horizontal"
                            defaultSelectedKeys={[defaultSelectedKeys]}
                            items={menu}
                            onSelect={handleMenuSelect}
                        />
                    </Col>

                    <Col span={6}>
                        <Menu
                            style={{justifyContent: "end"}}
                            theme="light"
                            mode="horizontal"
                            defaultSelectedKeys={[defaultSelectedKeys]}
                            items={menu2}
                            onSelect={handleMenuSelect}
                        />
                    </Col>
                </Row>
            </Header>
            <Content
                className="site-layout-background"
                style={{
                    margin: '80px 16px 24px 16px',
                    padding: 24,
                    minHeight: 'calc(100vh - (64px + 16px + 24px + 22px))', // header + header_bottom_margin + content_bottom_margin + footer
                }}
            >
                { children }
            </Content>
            <Footer style={{ textAlign: 'center', padding: 0 }}>Interview ©2022 Created by Aju</Footer>
        </Layout>
    )
};

const withUserLayout = (component, auth = false) => {
    return <UserLayout auth={auth}>{component}</UserLayout>
};

export default withUserLayout;
