import React, { useMemo } from 'react';
import { Table } from 'antd';

export default function TablaVertical({ rows = [], periodo, loading, fmt, fmtPct }) {
  const columns = useMemo(() => {
    const yearsSel = [];
    if (periodo?.desde != null && periodo?.hasta != null) {
      for (let y = periodo.desde; y <= periodo.hasta; y++) yearsSel.push(y);
    }
    const boldIfTotal = (node, record) => (record?.__isTotal ? <strong>{node}</strong> : node);

    const valorCols = yearsSel.map(y => ({
      title: String(y),
      dataIndex: `y${y}`,
      key: `v_y${y}`,
      align: 'right',
      render: (v, r) => boldIfTotal(fmt(v), r),
    }));

    const pctCols = yearsSel.map(y => ({
      title: String(y),
      dataIndex: `p${y}`,
      key: `v_p${y}`,
      align: 'right',
      render: (v, r) => boldIfTotal(v == null ? '—' : fmtPct(v), r),
    }));

    return [
      { title: 'Código', dataIndex: 'codigo', key: 'v_codigo', width: 120, fixed: 'left',
        render: (val, rec) => boldIfTotal(val || '', rec)
      },
      { title: 'Cuenta', dataIndex: 'nombre', key: 'v_nombre', fixed: 'left',
        render: (val, rec) => boldIfTotal(val, rec)
      },
      { title: 'Valores', children: valorCols },
      { title: 'Análisis vertical', children: pctCols },
    ];
  }, [periodo, fmt, fmtPct]);

  return (
    <Table
      bordered
      size="small"
      columns={columns}
      dataSource={rows}
      loading={loading}
      pagination={{ pageSize: 8 }}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Sin datos — seleccione empresa y periodo y presione Calcular' }}
    />
  );
}
