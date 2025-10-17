import React, { useState } from 'react';
// BACKEND: Importamos 'router' de Inertia para hacer peticiones al backend.
import { Head, router } from '@inertiajs/react';
import { Breadcrumb, Button, Space, Table, Typography, Modal, Form, Input, App as AntApp, InputNumber, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useApp } = AntApp;

// --- Datos de Prueba ---
// BACKEND: Esta lista estática desaparecerá. Los datos vendrán del controlador.
const datosIniciales = [
  { id: 1, nombre: 'Minería', descripcion: 'Empresas dedicadas a la extracción de minerales.' },
  { id: 2, nombre: 'Venta de Equipo', descripcion: 'Comercialización de maquinaria y equipo.' },
  { id: 3, nombre: 'Servicios', descripcion: 'Prestación de servicios profesionales o técnicos.' },
];

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
// BACKEND: El componente recibirá los datos como una 'prop'.
// La línea cambiará a: export default function TiposEmpresaIndex({ tiposDeEmpresa }) {
export default function TiposEmpresaIndex() {
  const { message } = useApp();
  const [form] = Form.useForm();
  const [benchmarkForm] = Form.useForm();

  // --- Estados de React ---
  // BACKEND: Este estado se inicializará con la 'prop' del controlador, no con 'datosIniciales'.
  // La línea cambiará a: const [listaDeTipos, setListaDeTipos] = useState(tiposDeEmpresa);
  const [listaDeTipos, setListaDeTipos] = useState(datosIniciales);
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
    form.setFieldsValue(registro);
    setModalVisible(true);
  };

  const handleCancelar = () => {
    setModalVisible(false);
  };

  const handleGuardar = () => {
    form.validateFields().then(values => {
      if (registroActual) {
        // BACKEND: Aquí haremos una petición 'PUT' para actualizar en la base de datos.
        // router.put(`/tipos-empresa/${registroActual.id}`, values, { onSuccess: () => message.success(...) });
        const listaActualizada = listaDeTipos.map(item => 
          item.id === registroActual.id ? { ...item, ...values } : item
        );
        setListaDeTipos(listaActualizada);
        message.success('Tipo de empresa actualizado.');
      } else {
        // BACKEND: Aquí haremos una petición 'POST' para crear en la base de datos.
        // router.post('/tipos-empresa', values, { onSuccess: () => message.success(...) });
        const nuevoTipo = { id: Date.now(), ...values };
        setListaDeTipos([...listaDeTipos, nuevoTipo]);
        message.success('Tipo de empresa creado.');
      }
      setModalVisible(false);
    });
  };
  
  // --- Funciones para Eliminar y Benchmarks ---
  const handleEliminar = (registro) => {
    Modal.confirm({
        title: `¿Eliminar "${registro.nombre}"?`,
        okText: 'Sí, eliminar', okType: 'danger', cancelText: 'No, cancelar',
        onOk: () => {
            // BACKEND: Aquí haremos una petición 'DELETE' para eliminar de la base de datos.
            // router.delete(`/tipos-empresa/${registro.id}`, { onSuccess: () => message.success(...) });
            const listaActualizada = listaDeTipos.filter(item => item.id !== registro.id);
            setListaDeTipos(listaActualizada);
            message.success(`"${registro.nombre}" fue eliminado.`);
        }
    });
  };

  const abrirModalBenchmarks = (registro) => {
    setRegistroActual(registro);
    // BACKEND: Aquí haremos una petición 'GET' para cargar los benchmarks guardados para este sector.
    benchmarkForm.resetFields(); 
    setBenchmarkModalVisible(true);
  };

  const handleGuardarBenchmarks = () => {
    const values = benchmarkForm.getFieldsValue();
    // BACKEND: Aquí haremos una petición 'POST' para guardar los valores de los benchmarks.
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
      render: (_, record) => (
        <Space>
          <Button onClick={() => abrirModalBenchmarks(record)}>Definir Benchmarks</Button>
          <Button onClick={() => abrirModalParaEditar(record)}>Editar</Button>
          <Button danger onClick={() => handleEliminar(record)}>Borrar</Button>
        </Space>
      ),
    },
  ];

  // --- Renderizado del Componente ---
  return (
    <>
      <Head title="Gestionar Tipos de Empresa" />
         
      {/* Esto es para el encabezado de la página. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Gestionar Tipos de Empresa</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalParaCrear}>Crear Nuevo Tipo</Button>
      </div>

      {/* Esto renderiza la tabla. */}
      <Table columns={columns} dataSource={listaDeTipos} rowKey="id" />

      {/* --- Modal para Crear/Editar --- */}
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
                <Form.Item key={ratio} label={ratio} name={ratio}>
                    <InputNumber style={{ width: '100%' }} placeholder="Ej: 0.55" />
                </Form.Item>
            ))}
        </Form>
      </Modal>
    </>
  );
}

// Esto es para aplicar el layout principal.
TiposEmpresaIndex.layout = page => <AppLayout>{page}</AppLayout>;