import React, { useState, useMemo } from 'react'
import { usePage, Head, router } from '@inertiajs/react'
import {
    TableOutlined,
    UserOutlined,
    LogoutOutlined,
    FundProjectionScreenOutlined,
    ApartmentOutlined,
    BarChartOutlined,
    HomeOutlined,
    AreaChartOutlined,
} from '@ant-design/icons'
import { Layout, Menu, theme, Button, Space, Typography, ConfigProvider, App as AntApp, Tag, Dropdown, Avatar} from 'antd'

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
    // Empresas como principal con "Tipos de Empresa" como subitem
    getItem('Gestión', '2', <ApartmentOutlined />, [
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
        ...getItem('Análisis Ratios', '3', <BarChartOutlined />),
        onClick: () => router.visit('/analisis-ratios'),
    },
    {
        ...getItem('Analisis Horizontal', '4', <TableOutlined />),
        onClick: () => router.visit('/analisis-horizontal'),
    },

    {
        ...getItem('Proyección Ventas', '5', <FundProjectionScreenOutlined />),
        onClick: () => router.visit('/proyecciones'),
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

    // Toma la URL actual de forma segura (Inertia v1 / v0.x / fallback)
    const page = usePage()
    const currentPath = (
        page?.url ??
        router?.page?.url ??                // para adaptadores más viejos
        (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
    ).split('?')[0] || '/'

    const { selectedKey, defaultOpenKeys } = useMemo(() => {
        const path = currentPath
        if (path.startsWith('/proyecciones')) return { selectedKey: '5', defaultOpenKeys: [] }
        if (path.startsWith('/analisis-hv') || path.startsWith('/analisis-horizontal')) return { selectedKey: '4', defaultOpenKeys: [] }
        if (path.startsWith('/analisis-ratios')) return { selectedKey: '3', defaultOpenKeys: [] }
        if (path.startsWith('/tipos-empresa')) return { selectedKey: '2', defaultOpenKeys: ['2'] }
        if (path.startsWith('/empresas')) return { selectedKey: '2', defaultOpenKeys: ['2'] }
        if (path.startsWith('/dashboard') || path === '/') return { selectedKey: '1', defaultOpenKeys: [] }
        return { selectedKey: '1', defaultOpenKeys: [] }
    }, [currentPath])

    // Función para cerrar sesión usando Inertia
    const doLogout = () => router.post('/logout')

    return (
        <>
            <Head title={title} />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                    <div
                        onClick={() => router.visit('/dashboard')}
                        style={{
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        ANF
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={[selectedKey]} defaultOpenKeys={defaultOpenKeys} mode="inline" items={items} />
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
                            flexWrap: 'wrap',
                            gap: 12,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        {/* Título o logo del sistema */}
                        <div style={{ minWidth: 200 }}>
                        <Space align="center" style={{ minWidth: 200 }}>
                            <AreaChartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                            <Text strong style={{ fontSize: 18 }}>Sistema de Analisis Financiero</Text>
                        </Space>
                        </div>

                        <Dropdown
                            menu={{
                                items: [
                                  /* por si se quiere agregar más opciones{
                                        key: 'profile',
                                        label: <span>Perfil</span>,
                                        icon: <UserOutlined />
                                    },
                                    {
                                        type: 'divider'
                                    }, */
                                    {
                                        key: 'logout',
                                        label: <span style={{ color: 'red' }}>Cerrar Sesión</span>,
                                        icon: <LogoutOutlined />,
                                        onClick: doLogout,
                                    }
                                ]
                            }}
                            trigger={['click']}
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar style={{ backgroundColor: '#1677ff' }}>
                                    {userName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Text strong>{userName}</Text>
                            </Space>
                        </Dropdown>

                    </Header>

                    {/* Contenido principal de la página */}
                    <Content style={{ margin: '16px 15px 0 15px' }}>
                        {/* Contenedor del contenido */}
                        <div
                            /* Estilos para el contenedor del contenido */
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
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
                    <Footer style={{ textAlign: 'center', marginTop: '24px' }}>
                        Sistema de Analisis Financiero ©{new Date().getFullYear()} Created by Equipo #
                    </Footer>
                </Layout>
            </Layout>
        </>
    )
}
