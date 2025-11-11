import React, { useState } from 'react';
// BACKEND: Importamos 'Link' para navegar entre páginas de Inertia.
import { Head, Link, router } from '@inertiajs/react';
// MODIFICADO: Importamos 'Tag' que ya lo tenías, solo me aseguro que esté.
import { Button, Space, Table, Typography, Modal, Form, Input, InputNumber, Row, Col, Card, Tooltip, App as AntApp, Tag, Empty } from 'antd';
// Importamos todos los íconos que usaremos en la página.
import { PlusOutlined, SettingOutlined, EyeOutlined, FileExcelTwoTone, DeleteOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import SubidaExcel from '@/Components/Estados Financieros/SubidaExcel';
import SugerenciasCatalogo from '@/Components/Estados Financieros/SugerenciasCatalogo'; 

const { Title, Text: AntText } = Typography;
// Tu importación de AntText es correcta
const { useApp } = AntApp;

export default function EstadosFinancierosIndex({ empresa, estadosFinancieros, catalogoDeCuentas }) {
    const { message, modal } = useApp();
    const [catalogoForm] = Form.useForm();
    const [manualForm] = Form.useForm();
    const [modalCatalogoVisible, setModalCatalogoVisible] = useState(false);
    const [modalManualVisible, setModalManualVisible] = useState(false);
    const [modalExcelVisible, setModalExcelVisible] = useState(false);
    const [editingCuenta, setEditingCuenta] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [excelAño, setExcelAño] = useState(new Date().getFullYear());
    
    const catalogoDefinido = catalogoDeCuentas && catalogoDeCuentas.length > 0;

    // --- Lógica del Catálogo de Cuentas ---
    const handleEditarCuenta = (cuenta) => {
        setEditingCuenta(cuenta);
        catalogoForm.setFieldsValue(cuenta);
    };

    const handleCancelarEdicionCuenta = () => {
        setEditingCuenta(null);
        catalogoForm.resetFields();
    };

    // MODIFICADO: Nueva función para cerrar el modal del catálogo de forma segura.
    const handleCerrarModalCatalogo = () => {
        setModalCatalogoVisible(false);
        handleCancelarEdicionCuenta();
        // Esto soluciona el bug del modal "trabado".
    };

    const handleGuardarCuenta = (values) => {
        if (editingCuenta) {
            router.put(`/catalogo-cuentas/${editingCuenta.id}`, values, {
                onSuccess: () => {
                    message.success('Cuenta actualizada.');
                    handleCancelarEdicionCuenta();
                },
                onError: (errors) => message.error(errors.codigo_cuenta || errors.nombre_cuenta || 'Error al actualizar.'),
                preserveScroll: true,
            });
        } else {
            router.post(`/empresas/${empresa.id}/catalogo-cuentas`, values, {
                onSuccess: () => {
                    message.success('Cuenta añadida al catálogo.');
                    catalogoForm.resetFields();
                },
                onError: (errors) => message.error(errors.codigo_cuenta || errors.nombre_cuenta || 'Error al crear la cuenta.'),
                preserveScroll: true,
            });
        }
    };

    const handleEliminarCuenta = (cuenta) => {
        modal.confirm({
            title: `¿Eliminar la cuenta "${cuenta.nombre_cuenta}"?`,
            content: 'Esta acción es irreversible.',
            okText: 'Sí, eliminar', okType: 'danger',
            onOk: () => {
                router.delete(`/catalogo-cuentas/${cuenta.id}`, {
                    onSuccess: () => message.success('Cuenta eliminada.'),
                    preserveScroll: true,
                });
            }
        });
    };

    const handleExcelLeido = () => {
        message.success('Archivo procesado y estado financiero creado.');
        setModalExcelVisible(false);
        router.reload({ only: ['estadosFinancieros'] });
    };

    const handleEliminarEstado = (registro) => {
        modal.confirm({
            title: `¿Eliminar el estado financiero del periodo ${registro.periodo}?`,
            content: 'Esta acción no se puede deshacer.',
            okText: 'Sí, eliminar', okType: 'danger',
            onOk: () => {
                router.delete(`/estados-financieros/${registro.id}`, {
                    onSuccess: () => message.success(`Estado del periodo ${registro.periodo} eliminado.`),
                    preserveScroll: true,
                });
            },
        });
    };
    
    const handleGuardarManual = () => {
        manualForm.validateFields().then(values => {
            const montosParaEnviar = catalogoDeCuentas.map(cuenta => ({
                catalogo_cuenta_id: cuenta.id,
                monto: values[`monto_${cuenta.id}`] || 0,
            }));
            const datosParaEnviar = {
                año: values.año,
                montos: montosParaEnviar,
            };
            
            router.post(`/empresas/${empresa.id}/estados-financieros`, datosParaEnviar, {
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    setModalManualVisible(false);
                    manualForm.resetFields();
                    message.success('Estado financiero guardado.');
                },
                onError: (errors) => {
                    console.error(errors);
                    message.error('Error de validación. Revisa los campos.');
                },
                onFinish: () => setIsSubmitting(false),
            });
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    // --- Columnas de las Tablas ---
    const estadosColumns = [
        // MODIFICADO: Añadido el render con <Tag>
        { 
            title: 'Periodo (Año)', 
            dataIndex: 'periodo', 
            key: 'periodo', 
            render: (p) => <Tag color="blue">{p}</Tag> 
        },
        { 
            title: 'Origen', 
            dataIndex: 'origen', 
            key: 'origen', 
            render: (origen) => {
                // Si el origen es null o undefined, usa 'Manual' como default
                const textoOrigen = origen || 'Manual'; 
                const color = textoOrigen === 'Importado' ? 'green' : 'purple';
                
                return <Tag color={color}>{textoOrigen.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Acciones', key: 'acciones', align: 'right',
            render: (_, record) => (
                <Space>
                    <Link href={`/estados-financieros/${record.id}`}>
                        <Button icon={<EyeOutlined />}>Ver</Button>
                    </Link>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminarEstado(record)}>Eliminar</Button>
                </Space>
            )
        },
    ];

    const catalogoColumns = [
        { title: 'Código', dataIndex: 'codigo_cuenta', key: 'codigo_cuenta' },
        { title: 'Nombre', dataIndex: 'nombre_cuenta', key: 'nombre_cuenta' },
        {
            title: 'Acciones', key: 'acciones', align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Editar cuenta"><Button type="link" icon={<EditOutlined />} onClick={() => handleEditarCuenta(record)} /></Tooltip>
                    <Tooltip title="Eliminar cuenta"><Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleEliminarCuenta(record)} /></Tooltip>
                </Space>
            )
        }
    ];
    
    return (
        <>
            {/* Título de la página y breadcrumb */}
            <title>ANF - Estados Financieros</title>
            <Head title={`Estados Financieros de ${empresa.nombre}`} />
            
            <Card title={`Estados Financieros de ${empresa.nombre}`} extra={
                <Space>
                    <Button icon={<SettingOutlined />} onClick={() => setModalCatalogoVisible(true)}>{catalogoDefinido ? 'Ver / Editar Catálogo' : 'Crear Catálogo'}</Button>
                    <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}><Button icon={<PlusOutlined />} onClick={() => setModalManualVisible(true)} disabled={!catalogoDefinido}>Añadir Manualmente</Button></Tooltip>
                    <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}><Button type="primary" icon={<FileExcelTwoTone twoToneColor="#09b626" />} onClick={() => setModalExcelVisible(true)} disabled={!catalogoDefinido}>Importar Excel</Button></Tooltip>
                </Space>
            }>
                {estadosFinancieros && estadosFinancieros.length > 0 ? (
                    <Table columns={estadosColumns} dataSource={estadosFinancieros} rowKey="id" />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>Aún no hay estados financieros para esta empresa.</span>}>
                        <Button type="primary" icon={<FileExcelTwoTone twoToneColor="#09b626" />} onClick={() => setModalExcelVisible(true)} disabled={!catalogoDefinido}>Importar el primero desde Excel</Button>
                    </Empty>
                )}
            </Card>

            {/* --- Modal para el Catálogo de Cuentas --- */}
            {/* MODIFICADO: Añadimos el componente de sugerencias junto al título */}
            <Modal 
                title={
                    <Space size={4} align="center">
                        <Title level={4} style={{ margin: 0 }}>Catálogo de Cuentas</Title>
                        <SugerenciasCatalogo /> 
                    </Space>
                } 
                open={modalCatalogoVisible} 
                onCancel={handleCerrarModalCatalogo} 
                footer={null} 
                width={800}
            >
                <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col span={14}><Table columns={catalogoColumns} dataSource={catalogoDeCuentas} size="small" rowKey="id" /></Col>
                    <Col span={10}>
                        <Card title={editingCuenta ? 'Editar Cuenta' : 'Añadir Nueva Cuenta'}>
                            <Form form={catalogoForm} layout="vertical" onFinish={handleGuardarCuenta}>
                                <Form.Item label="Código" name="codigo_cuenta" rules={[{ required: true }]}><Input /></Form.Item>
                                <Form.Item label="Nombre" name="nombre_cuenta" rules={[{ required: true }]}><Input /></Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">{editingCuenta ? 'Actualizar' : 'Añadir'}</Button>
                                    {editingCuenta && <Button onClick={handleCancelarEdicionCuenta}>Cancelar</Button>}
                                </Space>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Modal>

            {/* --- Modal para Añadir Manualmente --- */}
            <Modal
                title="Añadir Estado Financiero Manualmente"
                open={modalManualVisible}
                onCancel={() => setModalManualVisible(false)}
                onOk={handleGuardarManual}
                okText="Guardar"
                confirmLoading={isSubmitting} 
            >
                <Form form={manualForm} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        label="Año del Periodo"
                        name="año"
                        rules={[{ required: true, message: 'El año es obligatorio.' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="Ej: 2025" />
                    </Form.Item>
                    
                    <Title level={5}>Montos</Title>
                    {catalogoDeCuentas.map(c => (
                        <Form.Item
                            key={c.id}
                            label={`${c.codigo_cuenta} - ${c.nombre_cuenta}`}
                            name={`monto_${c.id}`}
                            rules={[{ required: true, message: 'El monto es obligatorio.' }]}
                        >
                            <InputNumber style={{ width: '100%' }} prefix="$" />
                        </Form.Item>
                    ))}
                </Form>
            </Modal>

            {/* --- Modal para Importar Excel --- */}
            <Modal 
                title={`Importar Estado Financiero para ${empresa.nombre}`} 
                open={modalExcelVisible} 
                onCancel={() => setModalExcelVisible(false)} 
                footer={null}
            >
                <div style={{marginTop: 24, marginBottom: 24}}>
                    <Card size="small" style={{ marginBottom: 24 }}>
                        <Space>
                            <DownloadOutlined style={{ color: '#09b626', fontSize: '24px' }} />
                            <div>
                                <AntText strong>Paso 1: Descargar Plantilla</AntText>
                                <br />
                                <AntText type="secondary">Rellene la columna "Monto" y guarde el archivo.</AntText>
                            </div>
                            <a href={`/empresas/${empresa.id}/plantilla-excel`}>
                                <Button type="primary">Descargar Plantilla</Button>
                            </a>
                        </Space>
                    </Card>

                    <Form layout="vertical">
                    <Form.Item 
                            label="Año del Periodo a Importar" 
                            required 
                            style={{marginBottom: 16}}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="Ej: 2025"
                                value={excelAño}
                                onChange={(val) => setExcelAño(val)}
                            />
                        </Form.Item>
                    </Form>

                    <AntText strong>Paso 2: Subir archivo completado</AntText>
                    <SubidaExcel 
                        empresaId={empresa.id}
                        onLeido={handleExcelLeido} 
                        año={excelAño}
                    />
                </div>
            </Modal>
        </>
    );
}

// Esto es para aplicar el layout principal.
EstadosFinancierosIndex.layout = page => <AppLayout>{page}</AppLayout>;