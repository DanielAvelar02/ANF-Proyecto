//Para mostrar el detalle de un estado financiero específico
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Table, Typography, Card } from 'antd';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;

// --- Datos de Prueba ---
// BACKEND: Esta lista estática desaparecerá. Los datos vendrán del controlador.
const mockDetalles = [
    { id: 1, codigo_cuenta: '1.1', nombre_cuenta: 'Activos Corrientes', monto: 150000.75 },
    { id: 2, codigo_cuenta: '1.2', nombre_cuenta: 'Activos Fijos', monto: 350000.00 },
    { id: 3, codigo_cuenta: '2.1', nombre_cuenta: 'Pasivos Corrientes', monto: 80000.50 },
    { id: 4, codigo_cuenta: '3.1', nombre_cuenta: 'Patrimonio', monto: 420000.25 },
];

// --- Componente Principal de la Página ---
// BACKEND: El componente recibirá el 'estadoFinanciero' y sus 'detalles' como props.
// La definición cambiará a: export default function Show({ estadoFinanciero, detalles }) {
export default function Show({ estadoFinanciero }) {
    
    // BACKEND: Esta variable usará los datos reales de las props.
    const periodo = new Date(estadoFinanciero.periodo).getFullYear();
    const empresa = estadoFinanciero.empresa; // Asumimos que el backend nos enviará la info de la empresa.

    // --- Definición de la Tabla ---
    const columns = [
        { title: 'Código', dataIndex: 'codigo_cuenta', key: 'codigo_cuenta' },
        { title: 'Nombre de la Cuenta', dataIndex: 'nombre_cuenta', key: 'nombre_cuenta' },
        { 
            title: 'Monto', 
            dataIndex: 'monto', 
            key: 'monto', 
            align: 'right',
            render: (monto) => `$${parseFloat(monto).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
        },
    ];

    // --- Renderizado del Componente ---
    return (
        <>
            <Head title={`Detalle del Periodo ${periodo}`} />

            {/* Esto es para la "miga de pan" de navegación. */}
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><Link href="/empresas">Empresas</Link></Breadcrumb.Item>
                {/* BACKEND: El 'empresa.id' y 'empresa.nombre' vendrán en las props. */}
                <Breadcrumb.Item><Link href={`/empresas/${empresa?.id}/estados-financieros`}>{empresa?.nombre}</Link></Breadcrumb.Item>
                <Breadcrumb.Item>Detalle del Periodo {periodo}</Breadcrumb.Item>
            </Breadcrumb>

            <Card>
                <Title level={2}>Detalle del Estado Financiero</Title>
                <p>Mostrando los montos para cada cuenta en el periodo {periodo} de la empresa <strong>{empresa?.nombre}</strong>.</p>
                {/* Esto renderiza la tabla. */}
                {/* BACKEND: 'dataSource' usará la prop 'detalles' en lugar de 'mockDetalles'. */}
                <Table columns={columns} dataSource={mockDetalles} rowKey="id" pagination={false} />
            </Card>
        </>
    );
}

// Esto es para aplicar el layout principal.
Show.layout = page => <AppLayout>{page}</AppLayout>;
