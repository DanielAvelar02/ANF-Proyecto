import React, { useState } from 'react';
// Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, router } from '@inertiajs/react';
import { Menu, Button, Space, Table, Typography, Modal, Form, Input, App as AntApp, InputNumber, Divider, Card, Dropdown, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, DashboardOutlined  } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import BotonEditable from "@/components/proyecciones/BotonEditable";

const { Text } = Typography;
const { TextArea } = Input;
const { useApp } = AntApp;

// Lista de ratios se mantiene estática por ahora (para el modal de Benchmarks)
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

// --- Componente Principal de la Página ---
// Recibe 'tiposDeEmpresa' como prop del controlador de Laravel
export default function TiposEmpresaIndex({ tiposDeEmpresa }) {
    const { message } = useApp();
    const [form] = Form.useForm();
    const [benchmarkForm] = Form.useForm();
    const screens = Grid.useBreakpoint();

    // --- Estados de React ---
    const [modalVisible, setModalVisible] = useState(false);
    const [registroActual, setRegistroActual] = useState(null);
    const [benchmarkModalVisible, setBenchmarkModalVisible] = useState(false);

    // --- Funciones para el Modal de Crear/Editar ---
    const abrirModalParaCrear = () => {
        setRegistroActual(null);
        form.resetFields();
        setModalVisible(true);
    };

    const abrirModalParaEditar = (registro) => {
        setRegistroActual(registro);
        // Carga los valores de 'nombre' y 'descripcion' al formulario
        form.setFieldsValue(registro); 
        setModalVisible(true);
    };

    const handleCancelar = () => {
        setModalVisible(false);
    };

    // FUNCIÓN DE GUARDAR INTEGRADA CON INERTIA (POST/PUT)
    const handleGuardar = () => {
        form.validateFields().then(values => {
            if (registroActual) {
                // Petición PUT para actualizar
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
                // Petición POST para crear
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

    // --- FUNCIÓN DE ELIMINAR INTEGRADA CON INERTIA (DELETE) ---
    const handleEliminar = (registro) => {
        Modal.confirm({
            title: `¿Eliminar "${registro.nombre}"?`,
            content: 'ADVERTENCIA: Esto eliminará permanentemente todas las empresas asociadas.',
            okText: 'Sí, eliminar', 
            okType: 'danger', 
            cancelText: 'No, cancelar',
            onOk: () => {
                // Petición DELETE para eliminar
                router.delete(`/tipos-empresa/${registro.id}`, { 
                    onSuccess: () => {
                        message.success(`"${registro.nombre}" fue eliminado.`);
                    },
                    onError: () => {
                         message.error(`No se pudo eliminar "${registro.nombre}".`);
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    // --- Funciones para Benchmarks ---
    const abrirModalBenchmarks = (registro) => {
        setRegistroActual(registro);
        // Lógica para cargar los benchmarks aquí (GET)
        benchmarkForm.resetFields();
        setBenchmarkModalVisible(true);
    };

    const handleGuardarBenchmarks = () => {
        // Lógica para guardar los benchmarks aquí (POST/PUT)
        const values = benchmarkForm.getFieldsValue();
        console.log('Guardando benchmarks:', values);
        message.success(`Benchmarks para "${registroActual.nombre}" guardados (simulado).`);
        setBenchmarkModalVisible(false);
    };

    // --- Definición de la Tabla ---
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
        {
            title: 'Acciones',
            key: 'acciones',
            align: 'right',
            render: (_, record) => {
                const actionsMenu = (
                    <Menu>
                        <Menu.Item key="gestionar" icon={<DashboardOutlined />} onClick={() => abrirModalBenchmarks(record)}>
                            Definir Benchmarks
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="editar" icon={<EditOutlined />} onClick={() => abrirModalParaEditar(record)}>
                            Editar
                        </Menu.Item>
                        <Menu.Item key="eliminar" icon={<DeleteOutlined />} danger onClick={() => handleEliminar(record)}>
                            Eliminar
                        </Menu.Item>
                    </Menu>
                );

                // En pantallas medianas y grandes
                if (screens && screens.md) {
                    return (
                        <Space>
                            <BotonEditable icon={<DashboardOutlined />} color='green' onClick={() => abrirModalBenchmarks(record)}>Definir Benchmarks</BotonEditable>
                            <BotonEditable icon={<EditOutlined />} color="#d89614" onClick={() => abrirModalParaEditar(record)}>Editar</BotonEditable>
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminar(record)}>Borrar</Button>
                        </Space >
                    );
                }

                // En pantallas pequeñas
                return (
                    <Dropdown overlay={actionsMenu}>
                        <Button>Más <DownOutlined /></Button>
                    </Dropdown>
                );
            },
        },
    ];

    // --- Renderizado del Componente ---
    return (
        <>
            <title>ANF - Tipos Empresas</title>
            <Head title="Gestión de Tipos de Empresa" />
            
            <Card
                title="Gestión de Tipos de Empresa"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nuevo Tipo</Button>}
            >
                {/* Usamos directamente la prop 'tiposDeEmpresa' */}
                <Table columns={columns} dataSource={tiposDeEmpresa} rowKey="id" />

                {/* --- Modal para Crear/Editar --- */}
                <Modal
                    title={registroActual ? 'Editar Tipo de Empresa' : 'Crear Nuevo Tipo de Empresa'}
                    open={modalVisible}
                    onOk={handleGuardar} // Llama a la función Inertia
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

                {/* --- Modal para Benchmarks --- */}
                <Modal
                    title={<>Definir Benchmarks para <Text type="success">{registroActual?.nombre}</Text></>}
                    open={benchmarkModalVisible}
                    onCancel={() => setBenchmarkModalVisible(false)}
                    onOk={handleGuardarBenchmarks}
                    width={800}
                    okText="Guardar Benchmarks"
                    cancelText="Cancelar"
                >
                    <Form form={benchmarkForm} layout="vertical" style={{ marginTop: 24, maxHeight: '60vh', overflowY: 'auto', paddingRight: '16px' }}>
                        <Text>Asigne el valor de benchmark para cada ratio en este sector.</Text>
                        <Divider />
                        {listaDeRatios.map(ratio => (
                            <Form.Item key={ratio} label={ratio} name={ratio.replace(/[^a-zA-Z0-9]/g, '')}>
                                <InputNumber style={{ width: '100%' }} placeholder="Ej: 0.55" />
                            </Form.Item>
                        ))}
                    </Form>
                </Modal>
            </Card>
        </>
    );
}

// Esto es para aplicar el layout principal.
TiposEmpresaIndex.layout = page => <AppLayout>{page}</AppLayout>;