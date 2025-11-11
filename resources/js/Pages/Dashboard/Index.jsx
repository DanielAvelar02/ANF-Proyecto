import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Row, Col, Typography, Card, Statistic, List, Tag, Empty } from 'antd'
import { Line } from '@ant-design/plots'
import {
  ShopOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  PieChartOutlined,
  SettingOutlined,
  TagsOutlined,
  FileExcelOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import DashboardCard from '@/Components/Dashboard/DashboardCard'

const { Title, Paragraph, Text } = Typography
const cardShadow = { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }

const StatsZone = ({ stats }) => (
  <Row gutter={[24, 24]} style={{ marginBottom: '2rem' }}>
    <Col xs={24} sm={12} lg={6}>
      <Card style={cardShadow}>
        <Statistic title="Total de Empresas" value={stats.totalEmpresas} prefix={<ShopOutlined />} />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card style={cardShadow}>
        <Statistic title="Análisis Guardados" value={stats.totalAnalisis} prefix={<CalculatorOutlined />} />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card style={cardShadow}>
        <Statistic title="Sectores Definidos" value={stats.totalSectores} prefix={<AppstoreOutlined />} />
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card style={cardShadow}>
        <Statistic title="Último Periodo" value={stats.ultimoPeriodo} prefix={<CalendarOutlined />} />
      </Card>
    </Col>
  </Row>
)

const ActivityZone = ({ actividad }) => (
  <Card title="Actividad Reciente" style={cardShadow}>
    {actividad && actividad.length > 0 ? (
      <List
        dataSource={actividad}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<FileExcelOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
              title={<>{item.descripcion} <Text strong>{item.empresa_nombre}</Text></>}
              description={item.fecha}
            />
          </List.Item>
        )}
      />
    ) : (
      <Empty description="No hay actividad reciente." />
    )}
  </Card>
)

export default function DashboardIndex({ auth, stats, ultimoAnalisis, actividadReciente }) {
  const proyeccionData = [
    { mes: '1', ventas: 0 }, { mes: '2', ventas: 110 }, { mes: '3', ventas: 105 },
    { mes: '4', ventas: 200 }, { mes: '5', ventas: 1000 }, { mes: '6', ventas: 5000 },
  ]

  return (
    <>
      <Head title="Dashboard" />
      <Title level={2}>Bienvenido de vuelta, {auth.user.nombre}</Title>
      <Paragraph type="secondary" style={{ marginBottom: '2rem' }}>
        Este es tu panel de control financiero. Revisa tus estadísticas y accede a los módulos.
      </Paragraph>

      <StatsZone stats={stats} />

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <DashboardCard
            title="Análisis Financiero"
            description="Calcula Ratios, Análisis Horizontal y compara con Benchmarks."
            icon={<PieChartOutlined />}
            color="#1890ff"
            route="/analisis-ratios"
            tag={ultimoAnalisis
              ? `Última actividad: ${ultimoAnalisis.empresa_nombre} (Periodo ${ultimoAnalisis.periodo})`
              : 'No hay análisis recientes.'}
          />

          <DashboardCard
            title="Proyecciones"
            description="Pronostica tus ventas futuras usando métodos estadísticos."
            icon={<CalculatorOutlined />}
            color="#52c41a"
            route="/proyecciones"
            chart={<Line
              data={proyeccionData}
              xField="mes"
              yField="ventas"
              height={60}
              smooth
              xAxis={false}
              yAxis={false}
              lineStyle={{ stroke: '#52c41a' }}
            />}
          />

          <DashboardCard
            title="Gestionar Empresas"
            description="Administra las empresas, catálogos y estados financieros."
            icon={<SettingOutlined />}
            color="#fa8c16"
            route="/empresas"
            tag="Módulo de Administración"
          />

          <DashboardCard
            title="Gestionar Tipos de Sector"
            description="Define los sectores y benchmarks para comparaciones."
            icon={<TagsOutlined />}
            color="#eb2f96"
            route="/tipos-empresa"
            tag="Módulo de Administración"
          />
        </Col>

        <Col xs={24} lg={8}>
          <ActivityZone actividad={actividadReciente} />
        </Col>
      </Row>
    </>
  )
}

DashboardIndex.layout = (page) => <AppLayout>{page}</AppLayout>
