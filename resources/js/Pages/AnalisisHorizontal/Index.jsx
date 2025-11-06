import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Card, Space, Form, Select, Button, Row, Col,
  App as AntApp, DatePicker, Typography, Divider
} from 'antd';
import AppLayout from '@/Layouts/AppLayout';
import dayjs from 'dayjs';
import { ClearOutlined } from '@ant-design/icons';
import BotonEditable from "@/components/proyecciones/BotonEditable";
import TablaHorizontal from '@/components/analisis/Horizontal';
import TablaVertical from '@/components/analisis/Vertical';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export default function Index({ empresas = [] }) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [rowsH, setRowsH] = useState([]);
  const [rowsV, setRowsV] = useState([]);
  const [periodoSel, setPeriodoSel] = useState({ desde: null, hasta: null });

  // ---- formateadores (coma miles, punto decimales)
  const nf = useMemo(
    () => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  );
  const fmt = (n) => (typeof n === 'number' ? nf.format(n) : '—');
  const fmtPct = (n) => (typeof n === 'number' ? `${nf.format(n)} %` : '—');

  // Detecta grupo por el primer dígito del código
  const getGrupoByCodigo = (codigo) => {
    const digits = String(codigo ?? '').replace(/\D/g, '');
    const first = digits.charAt(0);
    switch (first) {
      case '1': return { id: '1', label: 'Activo' };
      case '2': return { id: '2', label: 'Pasivo' };
      case '3': return { id: '3', label: 'Patrimonio' };
      case '4': return { id: '4', label: 'Ingresos' };
      case '5': return { id: '5', label: 'Gastos' };
      default: return { id: 'X', label: 'Otros' };
    }
  };

  const onEmpresaChange = async (empresa_id) => {
    form.setFieldsValue({ periodo: undefined });
    setYears([]); setRowsH([]); setRowsV([]); setPeriodoSel({ desde: null, hasta: null });
    if (!empresa_id) return;

    try {
      const res = await fetch(`/analisis-horizontal/anios?empresa_id=${empresa_id}`);
      const json = await res.json();
      const ys = (json?.anios || []).map((n) => Number(n));
      setYears(ys);
      if (!ys.length) {
        message.info('La empresa no tiene años cargados.');
      } else {
        const tail = ys.slice(-5);
        const from = tail[0] ?? ys[0];
        const to = tail[tail.length - 1] ?? ys[ys.length - 1];
        form.setFieldsValue({ periodo: [dayjs().year(from), dayjs().year(to)] });
      }
    } catch {
      message.error('No se pudieron cargar los años de la empresa.');
    }
  };

  const disabledDate = (current) => {
    if (!current || !years.length) return true;
    return !years.includes(current.year());
  };

  // Obtener datos y calcular ambos análisis
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

      // Horizontal: filas tal cual (yYYYY) del backend
      const rs = (json.rows || []).map((r) => ({ ...r, key: String(r.cuenta_id) }));
      setRowsH(rs);
      setPeriodoSel({ desde, hasta });

      // Vertical: % dentro de su grupo por año (1 Activo, 2 Pasivo, 3 Patrimonio)
      const conGrupo = rs.map((r) => {
        const g = getGrupoByCodigo(r.codigo);
        return { ...r, __grupo: g.id, __grupoNombre: g.label };
      }).filter((r) => ['1', '2', '3'].includes(r.__grupo));

      const yearsSel = (json.years || []).map((n) => Number(n));
      const totales = {}; // {grupo:{año:total}}
      for (const r of conGrupo) {
        for (const y of yearsSel) {
          const v = Number(r[`y${y}`] ?? 0);
          totales[r.__grupo] ??= {};
          totales[r.__grupo][y] = (totales[r.__grupo][y] ?? 0) + v;
        }
      }

      const salida = [];
      const gruposOrden = ['1', '2', '3'];
      for (const gid of gruposOrden) {
        const filasGrupo = conGrupo
          .filter((r) => r.__grupo === gid)
          .sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));

        for (const r of filasGrupo) {
          const row = { key: `V-${r.key}`, codigo: r.codigo, nombre: r.nombre, __isTotal: false, __grupo: gid };
          for (const y of yearsSel) {
            const val = Number(r[`y${y}`] ?? 0);
            const totalGrupo = Number(totales[gid]?.[y] ?? 0);
            row[`y${y}`] = val;
            row[`p${y}`] = totalGrupo ? (val / totalGrupo) * 100 : null;
          }
          salida.push(row);
        }

        const totalRow = { key: `V-TOTAL-${gid}`, codigo: '', nombre: `${{ '1': 'Activo', '2': 'Pasivo', '3': 'Patrimonio' }[gid]} Total`, __isTotal: true, __grupo: gid };
        for (const y of yearsSel) {
          totalRow[`y${y}`] = Number(totales[gid]?.[y] ?? 0);
          totalRow[`p${y}`] = 100;
        }
        salida.push(totalRow);
      }

      const ppRow = { key: 'V-PP', codigo: '', nombre: 'P&P', __isTotal: true, __grupo: 'PP' };
      for (const y of yearsSel) {
        const t = Number(totales['2']?.[y] ?? 0) + Number(totales['3']?.[y] ?? 0);
        ppRow[`y${y}`] = t;
        ppRow[`p${y}`] = 100;
      }
      salida.push(ppRow);

      setRowsV(salida);
    } catch (e) {
      if (!e?.errorFields) message.error(e?.message || 'Ocurrió un error al calcular.');
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    form.resetFields();
    setYears([]); setRowsH([]); setRowsV([]);
    setPeriodoSel({ desde: null, hasta: null });
  };

  return (
    <>
      <title>ANF - Análisis Horizontal y Vertical</title>
      <Head title="Análisis Horizontal y Vertical" />
      <Card title="Análisis Horizontal y Vertical">
        <Card type="inner" style={{ border: 'none' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Filtros */}
            <Form form={form} layout="vertical" initialValues={{ empresa_id: undefined, periodo: undefined }}>
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

            {/* Tablas */}
            <Title level={5} style={{ marginTop: 4 }}>Análisis Horizontal</Title>
            <TablaHorizontal
              rows={rowsH}
              periodo={periodoSel}
              loading={loading}
              fmt={fmt}
              fmtPct={fmtPct}
            />

            <Title level={5}>Análisis Vertical</Title>
            <TablaVertical
              rows={rowsV}
              periodo={periodoSel}
              loading={loading}
              fmt={fmt}
              fmtPct={fmtPct}
            />
          </Space>
        </Card>
      </Card>
    </>
  );
}

Index.layout = (page) => <AppLayout>{page}</AppLayout>;
