import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Button, Space, Table, Typography, Modal, Form, Input,
    App as AntApp, InputNumber, Divider, Card, Dropdown, Grid
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, DashboardOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import BotonEditable from "@/components/proyecciones/BotonEditable";

const { Text } = Typography;
const { TextArea } = Input;
const { useApp } = AntApp;

const listaDeRatios = [
    'Razón de Liquidez corriente o Razón de Circulante',
    'Razón de Capital de Trabajo a activos totales',
    'Razón de Rotación de cuentas por cobrar', 'Razón de periodo medio de cobranza',
    'Razón de Rotación de cuentas por pagar',
    'Razón periodo medio de pago',
    'Índice de Rotación de Activos totales',
    'Índice de Rotación de Activos fijos', 'Razón de Endeudamiento Patrimonial',
    'Grado de Propiedad', 'Razón de Cobertura de Gastos Financieros',
    'Rentabilidad del Patrimonio (ROE)', 'Rentabilidad del Activo (ROA)',
    'Rentabilidad sobre Ventas',
];

export default function TiposEmpresaIndex({ tiposDeEmpresa }) {
    const { message } = useApp();
    const [form] = Form.useForm();
    const [benchmarkForm] = Form.useForm();
    const screens = Grid.useBreakpoint();

    const [modalVisible, setModalVisible] = useState(false);
    const [registroActual, setRegistroActual] = useState(null);
    const [benchmarkModalVisible, setBenchmarkModalVisible] = useState(false);
    
    // 👈 CAMBIO: Estado de carga para el modal de benchmarks
    const [benchmarkLoading, setBenchmarkLoading] = useState(false);

    // 👇 modal context-aware (elimina warning de Modal estático)
    const [modal, modalContextHolder] = Modal.useModal();

    const abrirModalParaCrear = () => {
        setRegistroActual(null);
        form.resetFields();
        setModalVisible(true);
    };

    const abrirModalParaEditar = (registro) => {
        setRegistroActual(registro);
        form.setFieldsValue(registro);
        setModalVisible(true);
    };

    const handleCancelar = () => {
        setModalVisible(false);
        form.resetFields();
    };

    const handleGuardar = () => {
        form.validateFields().then(values => {
            if (registroActual) {
                router.put(`/tipos-empresa/${registroActual.id}`, values, {
                    onSuccess: () => {
                        message.success('Tipo de empresa actualizado con éxito.');
                        setModalVisible(false);
                    },
                    onError: (errors) => {
                        console.error("Errores:", errors);
                        message.error('Error al actualizar. Revisa el nombre duplicado.');
                    },
                    preserveScroll: true,
                });
            } else {
                router.post('/tipos-empresa', values, {
                    onSuccess: () => {
                        message.success('Tipo de empresa creado con éxito.');
                        setModalVisible(false);
                        form.resetFields();
                    },
                    onError: (errors) => {
                        console.error("Errores:", errors);
                        message.error('Error al guardar. Revisa el nombre duplicado.');
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    const mkDeleteContent = (n) => {
        if (Number(n) > 0) {
            const plural = n === 1 ? 'empresa asociada' : 'empresas asociadas';
            return `Este tipo tiene ${n} ${plural}. Estas empresas se eliminaran definitivamente.`;
        }
        return 'No hay empresas asociadas. Esta acción es permanente.';
    };

    const handleEliminar = (registro) => {
        const n = registro?.empresas_count ?? 0;

        modal.confirm({
            title: `¿Eliminar "${registro.nombre}"?`,
            content: mkDeleteContent(n),
            okText: Number(n) > 0 ? 'Eliminar' : 'Sí, eliminar',
            okButtonProps: { danger: true },
            cancelText: 'Cancelar',
            onOk: () => {
                router.delete(`/tipos-empresa/${registro.id}`, {
                    onSuccess: () => {
                        message.success(`"${registro.nombre}" fue eliminado.`);
                    },
                    onError: () => {
                        message.error(`No se pudo eliminar "${registro.nombre}". Verifica empresas asociadas.`);
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    
    const abrirModalBenchmarks = (registro) => {
        setRegistroActual(registro);
        benchmarkForm.resetFields(); // Limpia campos anteriores
        setBenchmarkModalVisible(true);
        
    };

    const handleGuardarBenchmarks = () => {
        benchmarkForm.validateFields().then(values => {
            // 'values' ya tendrá el formato: {"Razón de Liquidez...": 0.55, ...}
            
            setBenchmarkLoading(true); // Inicia el guardado

            router.post(`/tipos-empresa/${registroActual.id}/benchmarks`, values, {
                onSuccess: () => {
                    message.success(`Benchmarks para "${registroActual?.nombre}" guardados.`);
                    setBenchmarkModalVisible(false);
                    setBenchmarkLoading(false); // Termina el guardado
                },
                onError: (errors) => {
                    console.error("Errores al guardar:", errors);
                    // Muestra el error de DB si el controlador lo envía
                    const errorMsg = errors.db || 'Error al guardar. Revise los datos.';
                    message.error(errorMsg);
                    setBenchmarkLoading(false); // Termina el guardado (en error)
                },
                preserveScroll: true,
            });
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
        {
            title: 'Acciones',
            key: 'acciones',
            align: 'right',
            render: (_, record) => {
                const itemsMenu = [
                    { key: 'gestionar', icon: <DashboardOutlined />, label: 'Definir Benchmarks' },
                    { type: 'divider' },
                    { key: 'editar', icon: <EditOutlined />, label: 'Editar' },
                    { key: 'eliminar', icon: <DeleteOutlined />, label: 'Eliminar', danger: true },
                ];

                const onMenuClick = ({ key }) => {
                    if (key === 'editar') return abrirModalParaEditar(record);
                    if (key === 'eliminar') return handleEliminar(record);
                };

                if (screens && screens.md) {
                    return (
                        <Space>
                            <BotonEditable icon={<DashboardOutlined />} color='green' onClick={() => abrirModalBenchmarks(record)}>
                                Definir Benchmarks
                            </BotonEditable>
                            <BotonEditable icon={<EditOutlined />} color="#d89614" onClick={() => abrirModalParaEditar(record)}>
                                Editar
                            </BotonEditable>
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminar(record)}>
                                Borrar
                            </Button>
                        </Space>
                    );
                }

                return (
                    <Dropdown menu={{ items: itemsMenu, onClick: onMenuClick }}>
                        <Button>
                            Más <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            
            <title>ANF - Tipos empresas</title>
            <Head title="Gestión de Tipos de Empresa" />

            {/* 👇 necesario para los modals context-aware */}
            {modalContextHolder}

            <Card
                title="Gestión de Tipos de Empresa"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nuevo Tipo</Button>}
            >
                <Table columns={columns} dataSource={tiposDeEmpresa} rowKey="id" />

                <Modal
                    title={registroActual ? 'Editar Tipo de Empresa' : 'Crear Nuevo Tipo de Empresa'}
                    open={modalVisible}
                    onOk={handleGuardar}
                    onCancel={handleCancelar}
                    okText="Guardar"
                    cancelText="Cancelar"
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                        <Form.Item name="nombre" label="Nombre del Tipo / Sector" rules={[{ required: true, message: 'Este campo es obligatorio.' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="descripcion" label="Descripción">
                            <TextArea rows={3} />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={<>Definir Benchmarks para <Text type="success">{registroActual?.nombre}</Text></>}
                    open={benchmarkModalVisible}
                    
                    onCancel={() => {
                        if (!benchmarkLoading) {
                            setBenchmarkModalVisible(false);
                        }
                    }}
                    onOk={handleGuardarBenchmarks}
                    width={800}
                    okText="Guardar Benchmarks"
                    cancelText="Cancelar"
                  
                    confirmLoading={benchmarkLoading}
                >
                    <Form
                        form={benchmarkForm}
                        layout="vertical"
                        style={{ marginTop: 24, maxHeight: '60vh', overflowY: 'auto', paddingRight: '16px' }}
                    >
                        <Text>Asigne el valor de benchmark para cada ratio en este sector.</Text>
                        <Divider />
                        
                    
                        {listaDeRatios.map((ratio, idx) => (
                            <Form.Item key={idx} label={ratio} name={ratio}>
                                <InputNumber style={{ width: '100%' }} placeholder="Ej: 0.55" />
                            </Form.Item>
                        ))}
                    </Form>
                </Modal>
            </Card>
        </>
    );
}

TiposEmpresaIndex.layout = page => <AppLayout>{page}</AppLayout>;