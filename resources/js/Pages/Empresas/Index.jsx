import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Button, Space, Table, Typography, Modal, Form, Input,
    Select, App as AntApp, Dropdown, Tag, Card, Grid
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import BotonEditable from "@/components/proyecciones/BotonEditable";

const { useApp } = AntApp;

export default function EmpresasIndex({ empresas, tiposDeEmpresa }) {
    const { message } = useApp();
    const [form] = Form.useForm();
    const screens = Grid.useBreakpoint();
    const [modalVisible, setModalVisible] = useState(false);
    const [registroActual, setRegistroActual] = useState(null);

    // Modal context-aware (evita warning de Modal estático)
    const [modal, modalContextHolder] = Modal.useModal();

    // Select options v5
    const tipoOptions = (tiposDeEmpresa || []).map(t => ({ label: t.nombre, value: t.id }));

    const abrirModalParaCrear = () => {
        setRegistroActual(null);
        form.resetFields();
        setModalVisible(true);
    };

    const abrirModalParaEditar = (registro) => {
        setRegistroActual(registro);
        form.setFieldsValue({ nombre: registro.nombre, idTipo: registro.idTipo });
        setModalVisible(true);
    };

    const handleCancelar = () => {
        setModalVisible(false);
        form.resetFields();
    };

    const handleGuardar = () => {
        form.validateFields().then(values => {
            const payload = { nombre: values.nombre, idTipo: values.idTipo };

            if (registroActual) {
                // PUT /empresas/{id}
                router.put(`/empresas/${registroActual.id}`, payload, {
                    onSuccess: () => {
                        message.success('Empresa actualizada con éxito.');
                        setModalVisible(false);
                    },
                    onError: (errors) => {
                        console.error(errors);
                        message.error('No se pudo actualizar. Revisa los campos.');
                    },
                    preserveScroll: true,
                });
            } else {
                // POST /empresas
                router.post('/empresas', payload, {
                    onSuccess: () => {
                        message.success('Empresa creada con éxito.');
                        setModalVisible(false);
                        form.resetFields();
                    },
                    onError: (errors) => {
                        console.error(errors);
                        message.error('Error al guardar. Revisa los campos.');
                    },
                    preserveScroll: true,
                });
            }
        });
    };

    const handleEliminar = (registro) => {
        modal.confirm({
            title: `¿Eliminar "${registro.nombre}"?`,
            content: 'Esta acción es permanente. Si la empresa tiene dependencias (estados financieros, catálogo), puede fallar.',
            okText: 'Sí, eliminar',
            okButtonProps: { danger: true },
            cancelText: 'Cancelar',
            onOk: () => {
                router.delete(`/empresas/${registro.id}`, {
                    onSuccess: () => message.success(`"${registro.nombre}" fue eliminada.`),
                    onError: () => message.error(`No se pudo eliminar "${registro.nombre}". Verifica dependencias.`),
                    preserveScroll: true,
                });
            }
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Nombre de la Empresa', dataIndex: 'nombre', key: 'nombre' },
        {
            title: 'Tipo de Empresa',
            dataIndex: 'tipo',
            key: 'tipo',
            render: (tipo) => <Tag color="blue">{(tipo?.nombre || 'N/A').toUpperCase()}</Tag>
        },
        {
            title: 'Acciones',
            key: 'acciones',
            align: 'right',
            render: (_, record) => {
                const itemsMenu = [
                    {
                        key: 'gestionar',
                        icon: <UploadOutlined />,
                        label: <Link href={`/empresas/${record.id}/estados-financieros`}>Gestionar Estados Financieros</Link>,
                    },
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
                        <Space size="small">
                            <Link href={`/empresas/${record.id}/estados-financieros`}>
                                <BotonEditable color='green' icon={<UploadOutlined />}>Gestionar Estados Financieros</BotonEditable>
                            </Link>
                            <BotonEditable icon={<EditOutlined />} color="#d89614" onClick={() => abrirModalParaEditar(record)}>Editar</BotonEditable>
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminar(record)}>Eliminar</Button>
                        </Space>
                    );
                }

                return (
                    <Dropdown menu={{ items: itemsMenu, onClick: onMenuClick }}>
                        <Button>Más <DownOutlined /></Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Gestión de Empresas" />
            {modalContextHolder}

            <Card
                title="Gestión de Empresas"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nueva Empresa</Button>}
            >
                <Table columns={columns} dataSource={empresas} rowKey="id" />

                <Modal
                    title={registroActual ? 'Editar Empresa' : 'Crear Nueva Empresa'}
                    open={modalVisible}
                    onOk={handleGuardar}
                    onCancel={handleCancelar}
                    okText="Guardar"
                    cancelText="Cancelar"
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                        <Form.Item
                            name="nombre"
                            label="Nombre de la Empresa"
                            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="idTipo"
                            label="Tipo de Empresa"
                            rules={[{ required: true, message: 'Seleccione un tipo' }]}
                        >
                            <Select placeholder="Seleccione un tipo" options={tipoOptions} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </>
    );
}

EmpresasIndex.layout = page => <AppLayout>{page}</AppLayout>;
