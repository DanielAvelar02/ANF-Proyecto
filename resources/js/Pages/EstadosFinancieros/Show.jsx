import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Table, Typography, Card, Result, Button } from 'antd';
import { HomeOutlined, EditOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;

export default function Show({ estadoFinanciero, detalles }) {

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

    const periodo = new Date(estadoFinanciero.periodo).getFullYear() + 1;
    const empresa = estadoFinanciero.empresa;

    const columns = [
        { title: 'Código', dataIndex: 'codigo_cuenta', key: 'codigo_cuenta' },
        { title: 'Nombre de la Cuenta', dataIndex: 'nombre_cuenta', key: 'nombre_cuenta' },
        {
            title: 'Monto',
            dataIndex: 'monto',
            key: 'monto',
            align: 'right',
            render: (monto) => `$${parseFloat(monto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        },
    ];

    return (
        <>
            <Head title={`Detalle del Periodo ${periodo}`} />
            <Card 
                title={`Detalle del Periodo ${periodo}`}
                // CORREGIDO: 'extra' es una propiedad del Card, lo que lo alinea a la derecha.
                extra={
                    // CORREGIDO: Usamos la URL manual en lugar de 'route()'.
                    <Link href={`/estados-financieros/${estadoFinanciero.id}/edit`}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Editar Montos
                        </Button>
                    </Link>
                }
            >
                <p>Mostrando los montos para cada cuenta en el periodo {periodo} de la empresa <strong>{empresa.nombre}</strong>.</p>
                <Table columns={columns} dataSource={detalles} rowKey="id" pagination={false} />
            </Card>
        </>
    );
}

Show.layout = page => <AppLayout>{page}</AppLayout>;