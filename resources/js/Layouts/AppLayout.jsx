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
    ApartmentOutlined,
    BarChartOutlined,
    HomeOutlined,
} from '@ant-design/icons'
import { Layout, Menu, theme, Button, Space, Typography, ConfigProvider, App as AntApp } from 'antd'

// Extraer componentes de Layout y Typography de Ant Design
const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

// Función para crear items del menú lateral
function getItem(label, key, icon, children) {
    return { key, icon, children, label }
}

const items = [
    // Estas son las opciones del menú lateral
    {
        ...getItem('Inicio', '1', <HomeOutlined />),
        onClick: () => router.visit('/dashboard'),
    },
    getItem('Analisis Financiero', 'analisis', <DesktopOutlined />),
    {
        ...getItem('Proyeccion Ventas', 'proyecciones', <FundProjectionScreenOutlined />),
        onClick: () => router.visit('/proyecciones'),
    },

    // Empresas como principal con "Tipos de Empresa" como subitem
    getItem('Empresas', 'empresas', <ApartmentOutlined />, [
        {
            ...getItem('Empresas', 'empresas:listado'),
            onClick: () => router.visit('/empresas'),
        },
        {
            ...getItem('Tipos de Empresa', 'empresas:tipos'),
            onClick: () => router.visit('/tipos-empresa'),
        },
    ]),
    
    {
        ...getItem('Análisis Ratios', 'Ratios', <BarChartOutlined />),
        onClick: () => router.visit('/analisis-ratios'),
    },
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
                    {/* Header con título y botón de logout */}
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
                        {/* Título o logo del sistema */}
                        <Text strong style={{ fontSize: 18 }}>Sistema de Analisis Financiero</Text>

                        <Space size={12} align="center">
                            {/* Mostrar el nombre del usuario y botón de logout */}
                            <Text><UserOutlined /> {userName}</Text>
                            <Button icon={<LogoutOutlined />} onClick={doLogout} danger>
                                Cerrar Sesión
                            </Button>
                        </Space>
                    </Header>

                    {/* Contenido principal de la página */}
                    <Content style={{ margin: '0 15px' }}>
                        {/* Contenedor del contenido */}
                        <div
                            /* Estilos para el contenedor del contenido */
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {/* Proveer el tema de Ant Design a toda la aplicación */}
                            <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
                                {/* Usar el contexto de la aplicación para mensajes, modales, etc. */}
                                <AntApp>
                                    {/* Renderizar el contenido de la página aquí */}
                                    {children}
                                </AntApp>
                            </ConfigProvider>
                        </div>
                    </Content>

                    {/* Pie de página */}
                    <Footer style={{ textAlign: 'center' }}>
                        Sistema de Analisis Financiero ©{new Date().getFullYear()} Created by Equipo #
                    </Footer>
                </Layout>
            </Layout>
        </>
    )
}
