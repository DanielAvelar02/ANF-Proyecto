import React from 'react';
import { Card, Table, Typography } from 'antd';
import { Line } from '@ant-design/plots';

// Componente para mostrar el resultado de la proyección
export default function ResultadoProyeccion({ resultado }) {
    const { base, pronostico, metodo } = resultado;

    const rowsBase = base.map((v, i) => ({ key: `b${i}`, tipo: 'Histórico', mes: i + 1, ventas: v }));
    const rowsFor = pronostico.map((v, i) => ({ key: `p${i}`, tipo: 'Proyección', mes: i + 1, ventas: v }));
    const dataTabla = [...rowsBase, ...rowsFor];

    const dataGraf = [
        ...base.map((v, i) => ({ serie: 'Histórico', x: i + 1, y: v })),
        ...pronostico.map((v, i) => ({ serie: 'Proyección', x: base.length + i + 1, y: v })),
    ];

    const columns = [
        { title: 'Tipo', dataIndex: 'tipo' },
        { title: 'Mes', dataIndex: 'mes' },
        { title: 'Ventas', dataIndex: 'ventas' }
    ];

    return (
        <Card title="Resultado">
            <Typography.Paragraph strong>
                Método: {metodo.replace('_', ' ')}
            </Typography.Paragraph>

            <Table size="small" pagination={false} columns={columns} dataSource={dataTabla} style={{ marginBottom: 16 }} />

            <Line
                data={dataGraf}
                xField="x"
                yField="y"
                seriesField="serie"
                smooth
                point={{ size: 3 }}
                xAxis={{ title: { text: 'Mes' } }}
                yAxis={{ title: { text: 'Ventas' } }}
            />
        </Card>
    );
}
