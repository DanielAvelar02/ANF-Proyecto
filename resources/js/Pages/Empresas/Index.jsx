import React, { useState } from 'react';
// Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, Link, router } from '@inertiajs/react'; 
import { Button, Space, Table, Typography, Modal, Form, Input, Select, App as AntApp, Dropdown, Menu, Tag, Card, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import BotonEditable from "@/components/proyecciones/BotonEditable";

const { Option } = Select;
const { useApp } = AntApp;

// --- Componente Principal de la Página ---
// Recibe 'empresas' y 'tiposDeEmpresa' como props de Laravel/Inertia
export default function EmpresasIndex({ empresas, tiposDeEmpresa }) {
    const { message } = useApp();
    const [form] = Form.useForm();
    const screens = Grid.useBreakpoint();

    // --- Estados de React ---
    const [modalVisible, setModalVisible] = useState(false);
    const [registroActual, setRegistroActual] = useState(null);

    // --- Funciones para el Modal ---
    const abrirModalParaCrear = () => {
        setRegistroActual(null);
        form.resetFields();
        setModalVisible(true);
    };

    const abrirModalParaEditar = (registro) => {
        setRegistroActual(registro);
        // Usamos registro.idTipo porque es la FK que recibimos y la que necesita el Select.
        form.setFieldsValue({ nombre: registro.nombre, idTipo: registro.idTipo }); 
        setModalVisible(true);
    };

    const handleCancelar = () => {
        setModalVisible(false);
    };

    // FUNCIÓN DE GUARDAR INTEGRADA CON INERTIA
    const handleGuardar = () => {
        form.validateFields().then(values => {
            const datosParaGuardar = { 
                nombre: values.nombre, 
                idTipo: values.idTipo // El backend lo mapea a tipo_empresa_id
            };

            if (registroActual) {
                // Lógica de Edición: Implementar router.put/patch cuando el backend esté listo
                // router.put(`/empresas/${registroActual.id}`, datosParaGuardar, { ... });
                message.warning('La función de edición aún no está conectada al backend (usaría PUT/PATCH).');
                setModalVisible(false);
            } else {
                // Lógica de Creación: Usamos router.post para enviar datos al método store de Laravel
                router.post('/empresas', datosParaGuardar, {
                    onSuccess: () => {
                        // Inertia recarga automáticamente la página y actualiza las props (empresas)
                        message.success('Empresa creada con éxito.');
                        setModalVisible(false); // Cierra el modal
                        form.resetFields();
                    },
                    onError: (errors) => {
                        // Manejo de errores de validación del backend
                        console.error("Errores:", errors);
                        message.error('Error al guardar. Revisa los campos.');
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    const handleEliminar = (registro) => {
        // Lógica de Eliminación: Implementar router.delete cuando el backend esté listo
        Modal.confirm({
            title: `¿Eliminar "${registro.nombre}"?`,
            okText: 'Sí, eliminar', okType: 'danger', cancelText: 'No, cancelar',
            onOk: () => {
                // router.delete(`/empresas/${registro.id}`, { ... });
                message.warning('La función de eliminación aún no está conectada al backend (usaría DELETE).');
            }
        });
    };

    // --- Definición de la Tabla ---
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Nombre de la Empresa', dataIndex: 'nombre', key: 'nombre' },
        // Accedemos a la propiedad 'tipo.nombre' que formateamos en el controlador de Laravel
        { title: 'Tipo de Empresa', dataIndex: 'tipo', key: 'tipo', render: (tipo) => <Tag color="blue">{tipo.nombre.toUpperCase()}</Tag> },
        {
            title: 'Acciones',
            key: 'acciones',
            align: 'right',
            render: (_, record) => {
                const actionsMenu = (
                    <Menu>
                        <Menu.Item key="gestionar" icon={<UploadOutlined />}>
                            <Link href={`/empresas/${record.id}/estados-financieros`}>Gestionar Estados Financieros</Link>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="editar" icon={<EditOutlined />} onClick={() => abrirModalParaEditar(record)}>
                            Editar Empresa
                        </Menu.Item>
                        <Menu.Item key="eliminar" icon={<DeleteOutlined />} danger onClick={() => handleEliminar(record)}>
                            Eliminar Empresa
                        </Menu.Item>
                    </Menu>
                );

                // Mostrar botones individuales en pantallas medianas y grandes
                if (screens && screens.md) {
                    return (
                        <Space size="small">
                            <Link href={`/empresas/${record.id}/estados-financieros`}>
                                <BotonEditable color='green' icon={<UploadOutlined />}>Gestionar Estados Financieros</BotonEditable>
                            </Link>
                            <BotonEditable icon={<EditOutlined />} color="#d89614" onClick={() => abrirModalParaEditar(record)}>Editar</BotonEditable>
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminar(record)}>Eliminar</Button>
                        </Space>
                    );
                }

                // Mostrar Dropdown en pantallas pequeñas
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
            <title>ANF - Empresas</title>
            <Head title="Gestión de Empresas" />
            <Card
                title="Gestión de Empresas"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nueva Empresa</Button>}
            >
                {/* Usamos la prop 'empresas' que viene de Laravel */}
                <Table columns={columns} dataSource={empresas} rowKey="id" />

                {/* --- Modal para Crear/Editar --- */}
                <Modal
                    title={registroActual ? 'Editar Empresa' : 'Crear Nueva Empresa'}
                    open={modalVisible}
                    onOk={handleGuardar}
                    onCancel={handleCancelar}
                    okText="Guardar"
                    cancelText="Cancelar"
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                        <Form.Item name="nombre" label="Nombre de la Empresa" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="idTipo" label="Tipo de Empresa" rules={[{ required: true, message: 'Seleccione un tipo' }]}>
                            <Select placeholder="Seleccione un tipo">
                                {/* Usamos la prop 'tiposDeEmpresa' que viene de Laravel */}
                                {tiposDeEmpresa.map(tipo => (
                                    <Option key={tipo.id} value={tipo.id}>{tipo.nombre}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </>
    );
}

// CORREGIDO: Sintaxis JSX correcta para aplicar el layout principal.
EmpresasIndex.layout = page => <AppLayout>{page}</AppLayout>;