import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, Space, Form, Select, Button, Row, Col, App as AntApp, DatePicker, Table, Typography } from 'antd';
import AppLayout from '@/Layouts/AppLayout';
import dayjs from 'dayjs';
import { ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function Index({ empresas = [], cuentas = [], anios = [] }) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [cuentasOpts, setCuentasOpts] = useState(cuentas);

  useEffect(() => {
    setCuentasOpts(cuentas); // por si vienen precargadas
  }, [cuentas]);

  const onEmpresaChange = async (empresa_id) => {
    form.setFieldsValue({ cuenta_id: undefined });
    if (!empresa_id) { setCuentasOpts([]); return; }
    try {
      const res = await fetch(`/analisis-horizontal/cuentas?empresa_id=${empresa_id}`);
      const json = await res.json();
      setCuentasOpts(json.options || []);
    } catch {
      message.error('No se pudieron cargar las cuentas de la empresa.');
      setCuentasOpts([]);
    }
  };

  const fmt = (n) =>
    typeof n === 'number'
      ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

  const fetchDatos = async () => {
    try {
      const { empresa_id, cuenta_id, periodo } = await form.validateFields();
      const desde = periodo?.[0]?.year();
      const hasta = periodo?.[1]?.year();
      setLoading(true);
      const qs = new URLSearchParams({ empresa_id, cuenta_id, desde, hasta }).toString();
      const res = await fetch(`/analisis-horizontal/datos?${qs}`);
      const json = await res.json();

      // calcula variaciones si el backend aún no las envía
      const serie = (json.data || []).map(d => ({ anio: +d.anio, valor: +d.valor })).sort((a,b)=>a.anio-b.anio);
      const out = [];
      let prev = null;
      for (const d of serie) {
        const varAbs = prev !== null ? d.valor - prev : null;
        const varPct = prev !== null ? (varAbs / (Math.abs(prev) || 1)) * 100 : null;
        out.push({ key: String(d.anio), anio: d.anio, valor: d.valor, variacion_abs: varAbs, variacion_pct: varPct });
        prev = d.valor;
      }
      setRows(out);
    } catch (e) {
      if (!e?.errorFields) message.error('Ocurrió un error al calcular.');
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => { form.resetFields(); setRows([]); };

  const columns = [
    { title: 'Año', dataIndex: 'anio', key: 'anio', width: 100 },
    { title: 'Valor', dataIndex: 'valor', key: 'valor', align: 'right', render: v => fmt(v) },
    {
      title: 'Variación',
      children: [
        { title: 'Absoluta', dataIndex: 'variacion_abs', key: 'variacion_abs', align: 'right', render: v => (v===null?'—':fmt(v)) },
        { title: '%', dataIndex: 'variacion_pct', key: 'variacion_pct', align: 'right',
          render: v => v===null ? '—' : <Text type={v>0?'success':v<0?'danger':undefined}>{v.toFixed(2)} %</Text> },
      ],
    },
  ];

  const y = dayjs(); const defaultRange = [y.clone().year(y.year()-4), y.clone()];

  return (
    <>
      <title>ANF - Análisis Horizontal</title>
      <Head title="Análisis Horizontal" />
      <Card title="Análisis Horizontal">
        <Card type="inner" style={{ border: 'none' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                empresa_id: empresas?.[0]?.value,
                cuenta_id: undefined,
                periodo: defaultRange,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Empresa" name="empresa_id">
                    <Select
                      allowClear
                      showSearch
                      options={empresas}
                      placeholder="(opcional)"
                      onChange={onEmpresaChange}
                      filterOption={(i,o)=> (o?.label??'').toLowerCase().includes(i.toLowerCase())}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Cuenta"
                    name="cuenta_id"
                    rules={[{ required: true, message: 'Seleccione la cuenta' }]}
                  >
                    <Select
                      showSearch
                      options={cuentasOpts}
                      placeholder="Ej. 1101 - Activo circulante"
                      disabled={!cuentasOpts.length}
                      filterOption={(i,o)=> (o?.label??'').toLowerCase().includes(i.toLowerCase())}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Periodo (años)"
                    name="periodo"
                    rules={[{ required: true, message: 'Seleccione el periodo' }]}
                  >
                    <RangePicker picker="year" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Space>
                <Button type="primary" onClick={fetchDatos} loading={loading}>Calcular</Button>
                <Button onClick={limpiar} icon={<ClearOutlined />}>Limpiar</Button>
              </Space>
            </Form>

            <Table
              bordered
              size="small"
              columns={columns}
              dataSource={rows}
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'Sin datos — seleccione filtros y presione Calcular' }}
            />
          </Space>
        </Card>
      </Card>
    </>
  );
}

Index.layout = page => <AppLayout>{page}</AppLayout>;
