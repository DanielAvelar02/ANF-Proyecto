import React from 'react';
// CORREGIDO: Importamos 'useForm' de Inertia.
import { Head, Link, useForm } from '@inertiajs/react';
import { Breadcrumb, Button, Card, Form, InputNumber, Space, Typography, notification } from 'antd';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;

export default function Edit({ estadoFinanciero, detalles }) {
    
    const initialValues = {
        montos: detalles.map(d => ({
            id: d.id,
            monto: parseFloat(d.monto)
        }))
    };

    const { data, setData, put, processing, errors } = useForm(initialValues);

    const handleMontoChange = (index, value) => {
        const nuevosMontos = [...data.montos];
        nuevosMontos[index].monto = value;
        setData('montos', nuevosMontos);
    };

    const submit = (e) => {
        e.preventDefault();
        // CORREGIDO: Usamos la URL manual en lugar de 'route()'.
        put(`/estados-financieros/${estadoFinanciero.id}`, {
            onSuccess: () => {
                notification.success({
                    message: 'Actualizado',
                    description: 'Estado financiero actualizado con éxito.',
                });
            }
        });
    };

    const periodo = new Date(estadoFinanciero.periodo).getFullYear() + 1;
    const empresa = estadoFinanciero.empresa;

    return (
        <>
            <Head title={`Editar Periodo ${periodo}`} />

            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><Link href="/empresas">Gestionar Empresas</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link href={`/empresas/${empresa.id}/estados-financieros`}>{empresa.nombre}</Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link href={`/estados-financieros/${estadoFinanciero.id}`}>Detalle del Periodo {periodo}</Link></Breadcrumb.Item>
                <Breadcrumb.Item>Editar</Breadcrumb.Item>
            </Breadcrumb>

            <Card title={`Editar Estado Financiero - Periodo ${periodo} (${empresa.nombre})`}>
                <Form onSubmit={submit}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={5}>Actualice los montos para cada cuenta:</Title>
                        
                        {detalles.map((detalle, index) => (
                            <Form.Item
                                key={detalle.id}
                                label={`${detalle.codigo_cuenta} - ${detalle.nombre_cuenta}`}
                                validateStatus={errors[`montos.${index}.monto`] ? 'error' : ''}
                                help={errors[`montos.${index}.monto`]}
                            >
                                <InputNumber
                                    prefix="$"
                                    style={{ width: '100%' }}
                                    value={data.montos[index].monto}
                                    onChange={(value) => handleMontoChange(index, value)}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        ))}

                        <Space>
                            <Button type="primary" onClick={submit} loading={processing}>
                                Guardar Cambios
                            </Button>
                            <Link href={`/estados-financieros/${estadoFinanciero.id}`}>
                                <Button>Cancelar</Button>
                            </Link>
                        </Space>
                    </Space>
                </Form>
            </Card>
        </>
    );
}

Edit.layout = page => <AppLayout>{page}</AppLayout>;