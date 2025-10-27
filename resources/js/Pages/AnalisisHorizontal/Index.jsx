import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Card, Space, Form, Select, Button, Row, Col,
  App as AntApp, DatePicker, Table, Typography
} from 'antd';
import AppLayout from '@/Layouts/AppLayout';
import dayjs from 'dayjs';
import { ClearOutlined } from '@ant-design/icons';
import BotonEditable from "@/components/proyecciones/BotonEditable";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function Index({ empresas = [], anios = [] }) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);         // años disponibles para la empresa
  const [rows, setRows] = useState([]);           // filas de cuentas
  const [periodoSel, setPeriodoSel] = useState({ desde: null, hasta: null }); // <-- periodo seleccionado

  // Cargar años al cambiar empresa
  const onEmpresaChange = async (empresa_id) => {
    form.setFieldsValue({ periodo: undefined });
    setYears([]);
    setRows([]);
    setPeriodoSel({ desde: null, hasta: null });

    if (!empresa_id) return;

    try {
      const res = await fetch(`/analisis-horizontal/anios?empresa_id=${empresa_id}`);
      const json = await res.json();
      const ys = (json?.anios || []).map(Number);
      setYears(ys);
      if (!ys.length) {
        message.info('La empresa no tiene años cargados.');
      } else {
        // por defecto: últimos hasta 5 años disponibles
        const tail = ys.slice(-5);
        const from = tail[0] ?? ys[0];
        const to = tail[tail.length - 1] ?? ys[ys.length - 1];
        form.setFieldsValue({
          periodo: [dayjs().year(from), dayjs().year(to)],
        });
      }
    } catch {
      message.error('No se pudieron cargar los años de la empresa.');
    }
  };

  // Deshabilitar años fuera de los disponibles
  const disabledDate = (current) => {
    if (!current || !years.length) return true;
    return !years.includes(current.year());
  };

  const fmt = (n) =>
    typeof n === 'number'
      ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

  const fetchDatos = async () => {
    try {
      const { empresa_id, periodo } = await form.validateFields();
      const desde = periodo?.[0]?.year();
      const hasta = periodo?.[1]?.year();

      setLoading(true);
      const qs = new URLSearchParams({ empresa_id, desde, hasta }).toString();
      const res = await fetch(`/analisis-horizontal/datos?${qs}`);
      if (!res.ok) throw new Error('No se pudo obtener datos.');
      const json = await res.json();

      const rs = (json.rows || []).map(r => ({ ...r, key: String(r.cuenta_id) }));
      setRows(rs);
      setPeriodoSel({ desde, hasta }); // <-- guardamos el periodo elegido para las columnas
    } catch (e) {
      if (!e?.errorFields) message.error(e?.message || 'Ocurrió un error al calcular.');
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    form.resetFields();
    setYears([]);
    setRows([]);
    setPeriodoSel({ desde: null, hasta: null });
  };

  // Columnas requeridas
  const columns = useMemo(() => {
    const start = periodoSel.desde;
    const end = periodoSel.hasta;

    return [
      { title: 'Código', dataIndex: 'codigo', key: 'codigo', width: 120, fixed: 'left' },
      { title: 'Cuenta', dataIndex: 'nombre', key: 'nombre', fixed: 'left' },

      {
        title: `Periodo inicio${start ? ` (${start})` : ''}`,
        key: 'periodo_inicio',
        align: 'right',
        render: (_, r) => {
          const v = start != null ? r[`y${start}`] : null;
          return (v == null) ? '—' : fmt(v);
        },
      },
      {
        title: `Periodo fin${end ? ` (${end})` : ''}`,
        key: 'periodo_fin',
        align: 'right',
        render: (_, r) => {
          const v = end != null ? r[`y${end}`] : null;
          return (v == null) ? '—' : fmt(v);
        },
      },
      {
        title: 'Variación absoluta',
        key: 'variacion_abs_total',
        align: 'right',
        render: (_, r) => {
          if (start == null || end == null) return '—';
          const s = r[`y${start}`];
          const e = r[`y${end}`];
          if (s == null || e == null) return '—';
          return fmt(e - s);
        },
      },
      {
        title: 'Variación relativa',
        key: 'variacion_rel_total',
        align: 'right',
        render: (_, r) => {
          if (start == null || end == null) return '—';
          const s = r[`y${start}`];
          const e = r[`y${end}`];
          if (s == null || e == null || s === 0) return '—';
          const pct = ((e - s) / s) * 100;
          return (
            <Text type={pct > 0 ? 'success' : pct < 0 ? 'danger' : undefined}>
              {pct.toFixed(2)} %
            </Text>
          );
        },
      },
    ];
  }, [periodoSel]);

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
              initialValues={{ empresa_id: undefined, periodo: undefined }}
            >
              <Row gutter={30}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Empresa"
                    name="empresa_id"
                    rules={[{ required: true, message: 'Seleccione la empresa' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Seleccione una empresa"
                      options={empresas}
                      onChange={onEmpresaChange}
                      filterOption={(i, o) => (o?.label ?? '').toLowerCase().includes(i.toLowerCase())}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Periodo (años)"
                    name="periodo"
                    rules={[{ required: true, message: 'Seleccione el periodo' }]}
                  >
                    <RangePicker
                      picker="year"
                      style={{ width: '100%' }}
                      disabled={!years.length}
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text>Acciones</Text>
                    </div>
                    <Space>
                      <Button type="primary" onClick={fetchDatos} loading={loading} disabled={!years.length}>
                        Calcular
                      </Button>
                      <BotonEditable color="#d89614" onClick={limpiar} icon={<ClearOutlined />}>
                        Limpiar
                      </BotonEditable>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Form>

            <Table
              bordered
              size="small"
              columns={columns}
              dataSource={rows}
              loading={loading}
              pagination={{ pageSize: 6 }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'Sin datos — seleccione empresa y periodo y presione Calcular' }}
            />
          </Space>
        </Card>
      </Card>
    </>
  );
}

Index.layout = (page) => <AppLayout>{page}</AppLayout>;
