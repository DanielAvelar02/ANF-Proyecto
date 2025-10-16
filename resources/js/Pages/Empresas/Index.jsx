// resources/js/Pages/Empresas/Index.jsx

import React, { useState } from 'react';
// BACKEND: Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Button, Space, Table, Typography, Modal, Form, Input, Select, App as AntApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title } = Typography;
const { Option } = Select;
const { useApp } = AntApp;

// --- Datos de Prueba (Simplificados) ---
// BACKEND: Esta lista estática desaparecerá. Los datos vendrán del controlador.
const datosInicialesEmpresas = [
  { id: 1, nombre: 'Empresa Minera S.A.', tipo: 'Minería', idTipo: 1 },
  { id: 2, nombre: 'Venta de Equipos Corp.', tipo: 'Venta de Equipo', idTipo: 2 },
  { id: 3, nombre: 'Consultores Tech', tipo: 'Servicios', idTipo: 3 },
];

// BACKEND: Esta lista también vendrá del controlador para llenar el <Select>.
const tiposDeEmpresa = [
    { id: 1, nombre: 'Minería' },
    { id: 2, nombre: 'Venta de Equipo' },
    { id: 3, nombre: 'Servicios' },
];

// --- Componente Principal de la Página ---
// BACKEND: El componente recibirá los datos como 'props' desde Laravel.
// La definición cambiará a: export default function EmpresasIndex({ empresas, tiposDeEmpresa }) {
export default function EmpresasIndex() {
  const { message } = useApp();
  const [form] = Form.useForm();

  // --- Estados de React ---
  // BACKEND: Este estado se inicializará con la 'prop' del controlador, no con 'datosInicialesEmpresas'.
  // La línea cambiará a: const [listaDeEmpresas, setListaDeEmpresas] = useState(empresas);
  const [listaDeEmpresas, setListaDeEmpresas] = useState(datosInicialesEmpresas);
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
    form.setFieldsValue({ nombre: registro.nombre, idTipo: registro.idTipo });
    setModalVisible(true);
  };

  const handleCancelar = () => {
    setModalVisible(false);
  };

  const handleGuardar = () => {
    form.validateFields().then(values => {
      // BACKEND: Esta lógica para encontrar el nombre del tipo se hará en el backend.
      const tipoSeleccionado = tiposDeEmpresa.find(t => t.id === values.idTipo);
      const datosParaGuardar = { ...values, tipo: tipoSeleccionado.nombre };

      if (registroActual) {
        // BACKEND: Aquí haremos una petición 'PUT' para actualizar en la base de datos.
        // router.put(`/empresas/${registroActual.id}`, values, { onSuccess: () => ... });
        const listaActualizada = listaDeEmpresas.map(item => 
          item.id === registroActual.id ? { ...item, ...datosParaGuardar } : item
        );
        setListaDeEmpresas(listaActualizada);
        message.success('Empresa actualizada.');
      } else {
        // BACKEND: Aquí haremos una petición 'POST' para crear en la base de datos.
        // router.post('/empresas', values, { onSuccess: () => ... });
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
            // BACKEND: Aquí haremos una petición 'DELETE' para eliminar de la base de datos.
            // router.delete(`/empresas/${registro.id}`, { onSuccess: () => ... });
            const listaActualizada = listaDeEmpresas.filter(item => item.id !== registro.id);
            setListaDeEmpresas(listaActualizada);
            message.success(`"${registro.nombre}" fue eliminada.`);
        }
    });
  };

  // --- Definición de la Tabla ---
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Nombre de la Empresa', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'right',
      render: (_, record) => (
        <Space>
            <Link href={`/empresas/${record.id}/estados-financieros`}>
                <Button>Gestionar Estados Financieros</Button>
            </Link>
            <Button onClick={() => abrirModalParaEditar(record)}>Editar</Button>
            <Button danger onClick={() => handleEliminar(record)}>Borrar</Button>
        </Space>
      ),
    },
  ];

  // --- Renderizado del Componente ---
  return (
    <>
      <Head title="Gestionar Empresas" />
      
      {/* Esto es para la "miga de pan" y el encabezado. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Gestionar Empresas</Title>
        <Button type="primary" onClick={abrirModalParaCrear}>Crear Nueva Empresa</Button>
      </div>

      {/* Esto renderiza la tabla. */}
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
EmpresasIndex.layout = page => <AppLayout>{page}</AppLayout>;

