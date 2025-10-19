import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Table, Typography, Card, Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;

export default function Show({ estadoFinanciero, detalles }) {
    
    // Verificación de seguridad por si el estado financiero no se encuentra
    if (!estadoFinanciero) {
        return (
            <>
                <Head title="Error: No Encontrado" />
                <Result
                    status="404"
                    title="Estado Financiero no encontrado"
                    subTitle="Lo sentimos, el registro que buscas no existe o fue eliminado."
                    extra={<Link href="/empresas"><Button type="primary" icon={<HomeOutlined />}>Volver a Empresas</Button></Link>}
                />
            </>
        );
    }
    
    // Usamos los datos reales que vienen en las props
    const periodo = new Date(estadoFinanciero.periodo).getFullYear() + 1; // Ajuste por zona horaria de JS
    const empresa = estadoFinanciero.empresa;

    const columns = [
        { title: 'Código', dataIndex: 'codigo_cuenta', key: 'codigo_cuenta' },
        { title: 'Nombre de la Cuenta', dataIndex: 'nombre_cuenta', key: 'nombre_cuenta' },
        { 
            title: 'Monto', 
            dataIndex: 'monto', 
            key: 'monto', 
            align: 'right',
            // Formateo de moneda
            render: (monto) => `$${parseFloat(monto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        },
    ];

    return (
        <>
            <Head title={`Detalle del Periodo ${periodo}`} />


            <Card>
                <Title level={2}>Detalle del Estado Financiero</Title>
                <p>Mostrando los montos para cada cuenta en el periodo {periodo} de la empresa <strong>{empresa.nombre}</strong>.</p>
                
                
                <Table columns={columns} dataSource={detalles} rowKey="id" pagination={false} />
            </Card>
        </>
    );
}

Show.layout = page => <AppLayout>{page}</AppLayout>;