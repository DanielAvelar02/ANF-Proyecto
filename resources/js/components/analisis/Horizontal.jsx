// resources/js/components/analisis/Horizontal.jsx
import React, { useMemo } from 'react';
import { Table, Typography } from 'antd';

const { Text } = Typography;

export default function TablaHorizontal({ rows = [], periodo, loading, fmt, fmtPct }) {
  const start = periodo?.desde;
  const end   = periodo?.hasta;

  // 1) Agrupar por primer dígito del código (1,2,3) y generar filas de totales + P&P
  const dataSource = useMemo(() => {
    if (!rows?.length || start == null || end == null) return rows || [];

    const getGrupoId = (codigo) => {
      const digits = String(codigo ?? '').replace(/\D/g, '');
      const f = digits.charAt(0);
      return ['1', '2', '3'].includes(f) ? f : 'X';
    };
    const grupoLabel = { '1': 'Activo', '2': 'Pasivo', '3': 'Patrimonio' };

    const conGrupo = rows
      .map(r => ({ ...r, __grupo: getGrupoId(r.codigo) }))
      .filter(r => ['1', '2', '3'].includes(r.__grupo)); // solo Activo/Pasivo/Patrimonio

    const salida = [];
    const sumStartByGroup = { '2': 0, '3': 0 }; // para P&P
    for (const gid of ['1', '2', '3']) {
      const filasG = conGrupo
        .filter(r => r.__grupo === gid)
        .sort((a, b) => String(a.codigo).localeCompare(String(b.codigo)));

      let sStart = 0;
      let sEnd   = 0;

      for (const r of filasG) {
        const vStart = Number(r[`y${start}`] ?? 0);
        const vEnd   = Number(r[`y${end}`] ?? 0);
        sStart += vStart;
        sEnd   += vEnd;
        salida.push(r); // filas normales
      }

      // Fila TOTAL del grupo
      const totalRow = {
        key: `H-TOTAL-${gid}`,
        codigo: '',
        nombre: `${grupoLabel[gid]} Total`,
        __isTotal: true,
        [`y${start}`]: sStart,
        [`y${end}`]: sEnd,
      };
      salida.push(totalRow);

      if (gid === '2' || gid === '3') {
        sumStartByGroup[gid] += sStart;
      }
    }

    // Fila final P&P (Pasivo + Patrimonio)
    const ppRow = {
      key: 'H-PP',
      codigo: '',
      nombre: 'P&P',
      __isTotal: true,
      [`y${start}`]: sumStartByGroup['2'] + sumStartByGroup['3'],
      [`y${end}`]:   null, // opcional: si quieres también fin: suma de fin de 2 y 3
    };
    // Si también quieres el valor del fin para P&P:
    ppRow[`y${end}`] = (rows
      .map(r => ({ ...r, __grupo: getGrupoId(r.codigo) }))
      .filter(r => r.__grupo === '2' || r.__grupo === '3')
      .reduce((acc, r) => acc + Number(r[`y${end}`] ?? 0), 0));

    salida.push(ppRow);

    return salida;
  }, [rows, start, end]);

  // 2) Columnas (idénticas a las que tenías), con negrita en totales
  const columns = useMemo(() => {
    const boldIfTotal = (node, record) => (record?.__isTotal ? <strong>{node}</strong> : node);

    return [
      {
        title: 'Código',
        dataIndex: 'codigo',
        key: 'h_codigo',
        width: 120,
        fixed: 'left',
        render: (val, rec) => boldIfTotal(val || '', rec),
      },
      {
        title: 'Cuenta',
        dataIndex: 'nombre',
        key: 'h_nombre',
        fixed: 'left',
        render: (val, rec) => boldIfTotal(val, rec),
      },
      {
        title: `Periodo inicio${start ? ` (${start})` : ''}`,
        key: 'h_inicio',
        align: 'right',
        render: (_, r) => {
          const v = start != null ? r[`y${start}`] : null;
          return boldIfTotal(v == null ? '—' : fmt(v), r);
        },
      },
      {
        title: `Periodo fin${end ? ` (${end})` : ''}`,
        key: 'h_fin',
        align: 'right',
        render: (_, r) => {
          const v = end != null ? r[`y${end}`] : null;
          return boldIfTotal(v == null ? '—' : fmt(v), r);
        },
      },
      {
        title: 'Variación absoluta',
        key: 'h_var_abs',
        align: 'right',
        render: (_, r) => {
          if (start == null || end == null) return boldIfTotal('—', r);
          const s = r[`y${start}`];
          const e = r[`y${end}`];
          if (s == null || e == null) return boldIfTotal('—', r);
          return boldIfTotal(fmt(e - s), r);
        },
      },
      {
        title: 'Variación relativa',
        key: 'h_var_rel',
        align: 'right',
        render: (_, r) => {
          if (start == null || end == null) return boldIfTotal('—', r);
          const s = r[`y${start}`];
          const e = r[`y${end}`];
          if (s == null || e == null || s === 0) return boldIfTotal('—', r);
          const pct = ((e - s) / s) * 100;
          const node = (
            <Text type={pct > 0 ? 'success' : pct < 0 ? 'danger' : undefined}>
              {fmtPct(pct)}
            </Text>
          );
          return boldIfTotal(node, r);
        },
      },
    ];
  }, [start, end, fmt, fmtPct]);

  return (
    <Table
      bordered
      size="small"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Sin datos — seleccione empresa y periodo y presione Calcular' }}
    />
  );
}
