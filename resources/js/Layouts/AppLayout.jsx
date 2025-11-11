import React, { useState, useMemo, useEffect } from 'react'
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
import {
  Layout,
  Menu,
  theme,
  Typography,
  ConfigProvider,
  App as AntApp,
  Space,
  Dropdown,
  Avatar,
} from 'antd'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

function getItem(label, key, icon, children) {
  return { key, icon, children, label }
}

const items = [
  {
    ...getItem('Inicio', '1', <HomeOutlined />),
    onClick: () => router.visit('/dashboard'),
  },
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
    ...getItem('Análisis Horizontal', '4', <TableOutlined />),
    onClick: () => router.visit('/analisis-horizontal'),
  },
  {
    ...getItem('Proyección Ventas', '5', <FundProjectionScreenOutlined />),
    onClick: () => router.visit('/proyecciones'),
  },
]

export default function AppLayout({ children, title = 'ANF' }) {
  const [collapsed, setCollapsed] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const { auth } = usePage().props || {}
  const userName = auth?.user?.nom || 'Perfil'

  const page = usePage()
  const currentPath =
    (page?.url ??
      router?.page?.url ??
      (typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/')) || '/'

  const { selectedKey, defaultOpenKeys } = useMemo(() => {
    const path = currentPath
    if (path.startsWith('/proyecciones')) return { selectedKey: '5', defaultOpenKeys: [] }
    if (path.startsWith('/analisis-hv') || path.startsWith('/analisis-horizontal'))
      return { selectedKey: '4', defaultOpenKeys: [] }
    if (path.startsWith('/analisis-ratios')) return { selectedKey: '3', defaultOpenKeys: [] }
    if (path.startsWith('/tipos-empresa')) return { selectedKey: '2', defaultOpenKeys: ['2'] }
    if (path.startsWith('/empresas')) return { selectedKey: '2', defaultOpenKeys: ['2'] }
    if (path.startsWith('/dashboard') || path === '/') return { selectedKey: '1', defaultOpenKeys: [] }
    return { selectedKey: '1', defaultOpenKeys: [] }
  }, [currentPath])

  const doLogout = () => router.post('/logout')

  // Detectar scroll para el header blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title={title} />
      <style>
        {`
        /* Fijar el header con blur */
        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s ease;
          backdrop-filter: blur(0px);
        }
        .app-header.scrolled {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        /* Fijar el sidebar */
        .ant-layout-sider {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: auto;
        }

        /* Evitar overflow de tablas */
        .content-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}
      </style>

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
              cursor: 'pointer',
            }}
          >
            ANF
          </div>
          <Menu
            theme="dark"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={defaultOpenKeys}
            mode="inline"
            items={items}
          />
        </Sider>

        <Layout>
          {/* HEADER */}
          <Header
            className={`app-header ${isScrolled ? 'scrolled' : ''}`}
            style={{
              padding: '0 16px',
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Space align="center" style={{ minWidth: 200 }}>
              <AreaChartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <Text strong style={{ fontSize: 18 }}>
                Sistema de Análisis Financiero
              </Text>
            </Space>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    label: <span style={{ color: 'red' }}>Cerrar Sesión</span>,
                    icon: <LogoutOutlined />,
                    onClick: doLogout,
                  },
                ],
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

          {/* CONTENIDO */}
          <Content style={{ margin: '16px 15px 0 15px' }}>
            <div
              className="content-wrapper"
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              }}
            >
              <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
                <AntApp>{children}</AntApp>
              </ConfigProvider>
            </div>
          </Content>

          <Footer style={{ textAlign: 'center', marginTop: '24px' }}>
            Sistema de Análisis Financiero ©{new Date().getFullYear()} — Equipo #
          </Footer>
        </Layout>
      </Layout>
    </>
  )
}
