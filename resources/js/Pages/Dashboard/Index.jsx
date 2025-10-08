// resources/js/Pages/Dashboard/Index.jsx
import React, { useState } from 'react'
import { usePage, Head, router } from '@inertiajs/react' // para manejar rutas y datos de Inertia
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu, theme, Button, Avatar, Space, Typography } from 'antd'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

function getItem(label, key, icon, children) {
    return { key, icon, children, label }
}

const items = [
    getItem('Inicio', '1', <PieChartOutlined />),
    getItem('Analisis Financiero', '2', <DesktopOutlined />),
    getItem('Proyeccion de ventas', 'sub1', <UserOutlined />, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined />),
]

export default function Index() {
    const [collapsed, setCollapsed] = useState(true)
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // 👇 toma el usuario que compartimos desde el middleware
    const { auth } = usePage().props || {}
    const userName = auth?.user?.nom || 'PEpe'

    const doLogout = () => router.post('/logout')

    // iniciales para el avatar (opcional)
    const initials =
        userName
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U'

    return (
        <>
            <Head title="Dashboard" />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                    <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        ANF
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                </Sider>

                <Layout>
                    <Header
                        style={{
                            padding: '0 16px',
                            background: colorBgContainer,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                        }}
                    >
                        <Text strong style={{ fontSize: 18 }}>Sistema de Analisis Financiero</Text>

                        <Space size={12} align="center">
                            <Avatar>{initials}</Avatar>
                            <Text>{userName}</Text>
                            <Button icon={<LogoutOutlined />} onClick={doLogout} danger>
                                Cerrar Sesión
                            </Button>
                        </Space>
                    </Header>

                    <Content style={{ margin: '0 16px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'Inicio' }, { title: 'Dashboard' }]} />
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            Dashboard ANF
                        </div>
                    </Content>

                    <Footer style={{ textAlign: 'center' }}>
                        Sistema de Analisis Financiero ©{new Date().getFullYear()} Created by Equipo #
                    </Footer>
                </Layout>
            </Layout>
        </>
    )
}
