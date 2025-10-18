import React from 'react';
import { Table, InputNumber } from 'antd';

/**
 * TODO: Componente para mostrar y editar las ventas por mes
 */

// Nombres de los meses
const meses = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6', 'Mes 7', 'Mes 8', 'Mes 9', 'Mes 10', 'Mes 11', 'Mes 12'];

export default function TablaMeses({ valores, onChange, start = 0, count = 12 }) {
    // Limitar rango
    const end = Math.min(start + count, meses.length);
    // Extraer solo los meses que corresponden
    const slice = Array.from({ length: end - start }, (_, idx) => {
        const i = start + idx;
        return { key: i, mes: meses[i], valor: valores[i] };
    });

    const columns = [
        // Igualamos anchos: con tableLayout: 'fixed' podemos usar porcentajes
        { title: 'Mes', dataIndex: 'mes', width: '50%' },
        {
            title: 'Ventas',
            dataIndex: 'valor',
            width: '50%',
            render: (_, record) => (
                <InputNumber
                    size='small'
                    min={0}
                    value={record.valor}
                    onChange={(val) => {
                        const next = [...valores];
                        next[record.key] = val;
                        onChange(next);
                    }}
                />
            ),
        },
    ];

    // Usamos tableLayout fixed para que los anchos en porcentajes se respeten
    return <Table size="small" pagination={false} columns={columns} dataSource={slice} style={{ tableLayout: 'fixed' }} />;
}
