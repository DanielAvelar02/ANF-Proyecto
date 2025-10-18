import React, { useState } from 'react';
// BACKEND: Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, Link } from '@inertiajs/react';
import { Button, Space, Table, Typography, Modal, Form, Input, Select, App as AntApp, Dropdown, Menu, Tag, Card, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import BotonEditable from "@/components/proyecciones/BotonEditable";

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
  const screens = Grid.useBreakpoint();

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
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
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

        // En pantallas medianas y grandes mostramos los botones separados en una sola columna (alineados a la derecha).
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
      {/* Inicio del título de la página */}
      <title>ANF - Empresas</title>

      <Head title="Gestión de Empresas" />
      <Card
        title="Gestión de Empresas"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nueva Empresa</Button>}
      >
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
      </Card>
    </>
  );
}

// Esto es para aplicar el layout principal.
EmpresasIndex.layout = page => <AppLayout>{page};</AppLayout>;