import {Button, Col, Layout, Menu, Row} from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined, CreditCardOutlined, TeamOutlined, DotChartOutlined,
} from '@ant-design/icons';
import React, {useState} from "react";
import api from "../api";
import {Navigate, useLocation, useNavigate} from "react-router-dom";
import {Footer} from "antd/es/layout/layout";
const logo = require('./../logo.png')
const logoSm = require('./../logo-sm.png')

const { Header, Sider, Content } = Layout;

function AdminLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false)

    const [menu, setMenu] = useState([
        {
            key: '/admin/jobs',
            icon: <CreditCardOutlined />,
            label: 'Jobs',
        },
        {
            key: '/admin/applications',
            icon: <DotChartOutlined />,
            label: 'Applications',
        },
        {
            key: '/admin/interview',
            icon: <VideoCameraOutlined />,
            label: 'Interview',
        },
        {
            key: '/admin/accounts',
            icon: <TeamOutlined />,
            label: 'Accounts',
        },
        {
            key: '/admin/my/account',
            icon: <UserOutlined />,
            label: 'My Account',
        },
    ])

    const defaultSelectedKeys = '/' + location.pathname.split('/').slice(1, 3).join('/')

    function toggle() {
        setCollapsed(!collapsed)
    }

    function handleMenuSelect(item) {
        navigate(item.key)
    }

    function handleLogout() {
        localStorage.removeItem('admin')
        localStorage.removeItem('admin.token')
        window.location.reload()
    }

    const token = localStorage.getItem('admin.token')
    if (!token) {
        return <Navigate to="/admin/login"/>
    }

    api.defaults.headers['Authorization'] = 'Bearer ' + token

    return (
        <Layout id="admin-layout">
            <Sider theme={'light'} trigger={null} collapsible collapsed={collapsed}>
                <div className="admin-logo">
                    {collapsed
                        ? <img className="logo" src={logoSm} alt="logo"/>
                        : <img className="logo" src={logo} alt="logo"/>
                    }
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={[defaultSelectedKeys]}
                    items={menu}
                    onSelect={handleMenuSelect}
                />
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    <Row style={{justifyContent: "space-between"}}>
                        <Col>
                            {collapsed ? <MenuUnfoldOutlined className="trigger" onClick={toggle}/> : <MenuFoldOutlined className="trigger" onClick={toggle}/>}
                        </Col>

                        <Col style={{justifyContent: "right", paddingRight: "15px"}}>
                            <Button onClick={handleLogout}>Logout</Button>
                        </Col>
                    </Row>
                </Header>
                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 'calc(100vh - (64px + 24px + 24px + 22px))', // header + content_top_margin + content_bottom_margin + footer
                    }}
                >
                    { children }
                </Content>
                <Footer style={{ textAlign: 'center', padding: 0 }}>Interview ©2022 Created by Aju</Footer>
            </Layout>
        </Layout>
    );
}

const withUserLayout = (component) => {
    return <AdminLayout>{component}</AdminLayout>
};

export default withUserLayout;
