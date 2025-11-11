import React from 'react'
import { Card, Row, Col, Typography, Tag, Button } from 'antd'
import { Link } from '@inertiajs/react'
import { ArrowRightOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

export default function DashboardCard({ title, description, icon, color, route, tag, chart }) {
  return (
    <Card
      hoverable
      style={{
        borderLeft: `8px solid ${color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRadius: 12
      }}
    >
      <Row align="middle" gutter={24}>
        <Col xs={24} md={4} style={{ textAlign: 'center' }}>
          {React.cloneElement(icon, { style: { color, fontSize: 64 } })}
        </Col>

        <Col xs={24} md={14}>
          <Title level={3} style={{ marginBottom: 0 }}>{title}</Title>
          <Paragraph type="secondary">{description}</Paragraph>
          {tag && <Tag color={color}>{tag}</Tag>}
          {chart && <div style={{ height: 60, marginTop: 8 }}>{chart}</div>}
        </Col>

        <Col xs={24} md={6} style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href={route}>
            <Button
              type="primary"
              size="large"
              style={{ backgroundColor: color, borderColor: color }}
              icon={<ArrowRightOutlined />}
            >
              Entrar
            </Button>
          </Link>
        </Col>
      </Row>
    </Card>
  )
}
