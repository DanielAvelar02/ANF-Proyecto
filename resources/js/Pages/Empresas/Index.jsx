import React, { useState } from 'react';
// BACKEND: Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Button, Space, Table, Typography, Modal, Form, Input, Select, App as AntApp, Dropdown, Menu, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;
const { Option } = Select;
const { useApp } = AntApp;

// --- Datos de Prueba (Simplificados) ---
// BACKEND: Esta lista estática desaparecerá.
const datosInicialesEmpresas = [
  { id: 1, nombre: 'Empresa Minera S.A.', tipo: { nombre: 'Minería' }, idTipo: 1 },
  { id: 2, nombre: 'Venta de Equipos Corp.', tipo: { nombre: 'Venta de Equipo' }, idTipo: 2 },
  { id: 3, nombre: 'Consultores Tech', tipo: { nombre: 'Servicios' }, idTipo: 3 },
];

// BACKEND: Esta lista también vendrá del controlador.
const tiposDeEmpresa = [
    { id: 1, nombre: 'Minería' },
    { id: 2, nombre: 'Venta de Equipo' },
    { id: 3, nombre: 'Servicios' },
];

// --- Componente Principal de la Página ---
export default function EmpresasIndex() {
  const { message } = useApp();
  const [form] = Form.useForm();

  // --- Estados de React ---
  const [listaDeEmpresas, setListaDeEmpresas] = useState(datosInicialesEmpresas);
  const [modalVisible, setModalVisible] = useState(false);
  const [registroActual, setRegistroActual] = useState(null);

  // --- Funciones para el Modal (Tu código original, que funciona) ---
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
  };

  const handleGuardar = () => {
    form.validateFields().then(values => {
      const tipoSeleccionado = tiposDeEmpresa.find(t => t.id === values.idTipo);
      const datosParaGuardar = { ...values, tipo: { nombre: tipoSeleccionado.nombre } };

      if (registroActual) {
        const listaActualizada = listaDeEmpresas.map(item => 
          item.id === registroActual.id ? { ...item, ...datosParaGuardar } : item
        );
        setListaDeEmpresas(listaActualizada);
        message.success('Empresa actualizada.');
      } else {
        const nuevaEmpresa = { id: Date.now(), ...datosParaGuardar };
        setListaDeEmpresas([...listaDeEmpresas, nuevaEmpresa]);
        message.success('Empresa creada.');
      }
      setModalVisible(false);
    });
  };
  
  const handleEliminar = (registro) => {
    Modal.confirm({
        title: `¿Eliminar "${registro.nombre}"?`,
        okText: 'Sí, eliminar', okType: 'danger', cancelText: 'No, cancelar',
        onOk: () => {
            const listaActualizada = listaDeEmpresas.filter(item => item.id !== registro.id);
            setListaDeEmpresas(listaActualizada);
            message.success(`"${registro.nombre}" fue eliminada.`);
        }
    });
  };

  // --- Definición de la Tabla ---
  // MODIFICADO: Columnas finales sin 'Fecha de Creación'.
  const columns = [
    { title: 'Nombre de la Empresa', dataIndex: 'nombre', key: 'nombre' },
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
      <Head title="Gestionar Empresas" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Gestionar Empresas</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nueva Empresa</Button>
      </div>

      <Table columns={columns} dataSource={listaDeEmpresas} rowKey="id" />

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
          <Form.Item name="nombre" label="Nombre de la Empresa" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="idTipo" label="Tipo de Empresa" rules={[{ required: true }]}>
            <Select placeholder="Seleccione un tipo">
                {tiposDeEmpresa.map(tipo => (
                    <Option key={tipo.id} value={tipo.id}>{tipo.nombre}</Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// Esto es para aplicar el layout principal.
EmpresasIndex.layout = page => <AppLayout>{page};</AppLayout>;