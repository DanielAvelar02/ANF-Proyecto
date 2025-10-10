import React, { useState } from 'react'
import { usePage, Head, router } from '@inertiajs/react'
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    FundProjectionScreenOutlined,
    HomeOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu, theme, Button, Space, Typography } from 'antd'

// Extraer componentes de Layout y Typography de Ant Design
const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

// Función para crear items del menú lateral
function getItem(label, key, icon, children) {
    return { key, icon, children, label }
}

const items = [
    // Estas son las opciones del menú lateral
    // Cada item puede tener un onClick para navegar usando Inertia
    // Entonces en lugar de usar 'a' o 'Link', usamos router.visit('/ruta')
    {
        ...getItem('Inicio', '1', <HomeOutlined />),
        onClick: () => router.visit('/dashboard'),
    },
    getItem('Analisis Financiero', '2', <DesktopOutlined />),
    {
        ...getItem('Proyeccion Ventas', '3', <FundProjectionScreenOutlined />),
        onClick: () => router.visit('/proyecciones'),
    },
    getItem('Opciones', 'sub1', <UserOutlined />, [
        getItem('Tom', '4'),
        getItem('Bill', '5'),
        getItem('Alex', '6'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '7'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined />),
]

// Componente principal del layout, que envuelve las páginas
export default function AppLayout({ children, title = 'ANF' }) {
    // Estado para colapsar el menú lateral
    const [collapsed, setCollapsed] = useState(true)
    
    // Extraer datos del tema de Ant Design
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // Datos del usuario autenticado desde Inertia
    const { auth } = usePage().props || {}
    const userName = auth?.user?.nom || 'Perfil'

    // Función para cerrar sesión usando Inertia
    const doLogout = () => router.post('/logout')

    return (
        <>
            <Head title={title} />
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
                            <Text><UserOutlined /> {userName}</Text>
                            <Button icon={<LogoutOutlined />} onClick={doLogout} danger>
                                Cerrar Sesión
                            </Button>
                        </Space>
                    </Header>

                    <Content style={{ margin: '0 16px' }}>
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {children}
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
