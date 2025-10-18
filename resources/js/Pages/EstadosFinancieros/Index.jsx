import React, { useState } from 'react';
// BACKEND: Importamos 'Link' para navegar entre páginas de Inertia.
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Button, Space, Table, Typography, Modal, Form, Input, InputNumber, Row, Col, Card, Tooltip, App as AntApp, Tag} from 'antd';
// Importamos todos los íconos que usaremos en la página.
import { PlusOutlined, SettingOutlined, EyeOutlined, FileExcelTwoTone, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import SubidaExcel from '@/Components/Estados Financieros/SubidaExcel';

const { Title } = Typography;
const { useApp } = AntApp;

// --- Datos de Prueba ---
// BACKEND: Todas estas listas estáticas desaparecerán. Los datos vendrán como 'props' desde el controlador.
const datosInicialesEstados = [
  { id: 1, periodo: '2024', origen: 'Importado' },
  { id: 2, periodo: '2023', origen: 'Manual' },
];
const datosInicialesCatalogo = [ 
    {id: 1, codigo: '1.1', nombre: 'Activos Corrientes'}, 
    {id: 2, codigo: '2.1', nombre: 'Pasivos Corrientes'},
];

// --- Componente Principal de la Página ---
// BACKEND: El componente recibirá la 'empresa' y sus datos relacionados como 'props'.
export default function EstadosFinancierosIndex({ empresa }) {
  const { message } = useApp();
  const [catalogoForm] = Form.useForm(); // Un formulario para el modal del catálogo.

  // --- Estados de React ---
  const [listaDeEstados, setListaDeEstados] = useState(datosInicialesEstados);
  const [modalCatalogoVisible, setModalCatalogoVisible] = useState(false);
  const [modalManualVisible, setModalManualVisible] = useState(false);
  const [modalExcelVisible, setModalExcelVisible] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  
  // BACKEND: Esta variable será dinámica, indicará si la empresa ya tiene un catálogo en la BD.
  const catalogoDefinido = true;

  // --- Funciones de Manejo de Eventos ---
  const handleExcelLeido = (respuestaDelBackend) => {
    // BACKEND: Aquí se procesará la respuesta del backend para actualizar la tabla de estados.
    console.log("Respuesta del backend:", respuestaDelBackend);
    message.success('Archivo procesado correctamente.');
    setModalExcelVisible(false);
  };
  
  const handleEliminarEstado = (registro) => {
    Modal.confirm({
      title: `¿Eliminar el estado financiero del periodo ${registro.periodo}?`,
      okText: 'Sí, eliminar', okType: 'danger', cancelText: 'Cancelar',
      onOk() {
        // BACKEND: Aquí se ejecutará una petición DELETE a la ruta de 'estados-financieros.destroy'.
        // router.delete(`/estados-financieros/${registro.id}`, { onSuccess: () => ... });
        setListaDeEstados(prev => prev.filter(item => item.id !== registro.id));
        message.success(`Estado del periodo ${registro.periodo} eliminado (simulado).`);
      },
    });
  };

  const handleEditarCuenta = (cuenta) => {
    setEditingCuenta(cuenta);
    catalogoForm.setFieldsValue(cuenta);
  };

  const handleCancelarEdicionCuenta = () => {
    setEditingCuenta(null);
    catalogoForm.resetFields();
  }
  
  const handleGuardarCuenta = () => {
    // Lógica para guardar/actualizar una cuenta del catálogo (simulada).
    catalogoForm.validateFields().then(values => {
        if (editingCuenta) {
            // BACKEND: Aquí se haría una petición PUT para actualizar la cuenta.
            console.log('Actualizando cuenta', editingCuenta.id, 'con', values);
            message.success('Cuenta actualizada (simulado).');
        } else {
            // BACKEND: Aquí se haría una petición POST para crear una nueva cuenta.
            console.log('Añadiendo nueva cuenta', values);
            message.success('Cuenta añadida (simulado).');
        }
        handleCancelarEdicionCuenta();
    });
  };

  // --- Definición de las Tablas ---
  // MODIFICADO: Se eliminó la columna 'Fecha de Carga'.
  const estadosColumns = [ 
    { 
      title: 'Periodo (Año)', 
      dataIndex: 'periodo', 
      key: 'periodo',
      render: (periodo) => <Tag color="blue">{periodo}</Tag>
    }, 
    { 
      title: 'Origen', 
      dataIndex: 'origen', 
      key: 'origen',
      render: (origen) => {
        const color = origen === 'Importado' ? 'green' : 'purple';
        return <Tag color={color}>{origen.toUpperCase()}</Tag>;
      }
    }, 
    {
      title: 'Acciones', key: 'acciones', align: 'right', 
      render: (_, record) => (
        <Space>
          <Link href={`/estados-financieros/${record.id}`}>
            <Button icon={<EyeOutlined />}>Ver</Button>
          </Link>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleEliminarEstado(record)}>
            Eliminar
          </Button>
        </Space>
      )
    }, 
  ];
  
  const catalogoColumns = [ 
      { title: 'Código', dataIndex: 'codigo', key: 'codigo' }, 
      { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
      {
        title: 'Acciones', key: 'acciones', align: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Editar cuenta">
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEditarCuenta(record)} />
            </Tooltip>
            <Tooltip title="Eliminar cuenta">
               {/* BACKEND: El botón de eliminar llamará a una función que haga una petición DELETE. */}
              <Button type="link" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminando cuenta', record.id)} />
            </Tooltip>
          </Space>
        )
      }
  ];

  // --- Renderizado del Componente ---
  return (
    <>
      <Head title={`Estados Financieros de ${empresa.nombre}`} />
      
      {/* Esto es para la "miga de pan" de navegación. */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item><Link href="/empresas">Gestionar Empresas</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{empresa.nombre}</Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Esto es para el encabezado de la página. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Estados Financieros de {empresa.nombre}</Title>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setModalCatalogoVisible(true)}>{catalogoDefinido ? 'Ver / Editar Catálogo' : 'Crear Catálogo'}</Button>
          <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}><Button icon={<PlusOutlined />} onClick={() => setModalManualVisible(true)} disabled={!catalogoDefinido}>Añadir Manualmente</Button></Tooltip>
          <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}>
            <Button type="primary" icon={<FileExcelTwoTone twoToneColor="#09b626" />} onClick={() => setModalExcelVisible(true)} disabled={!catalogoDefinido}>
              Importar Excel
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Esto renderiza la tabla principal. */}
      <Table columns={estadosColumns} dataSource={listaDeEstados} rowKey="id" />

      {/* --- Modal para el Catálogo de Cuentas --- */}
      <Modal title="Catálogo de Cuentas" open={modalCatalogoVisible} onCancel={() => setModalCatalogoVisible(false)} footer={null} width={800}>
        <Row gutter={16} style={{marginTop: 24}}>
          <Col span={14}><Table columns={catalogoColumns} dataSource={datosInicialesCatalogo} size="small" /></Col>
          <Col span={10}>
            <Card title={editingCuenta ? 'Editar Cuenta' : 'Añadir Nueva Cuenta'}>
              <Form form={catalogoForm} layout="vertical" onFinish={handleGuardarCuenta}>
                <Form.Item label="Código" name="codigo"><Input/></Form.Item>
                <Form.Item label="Nombre" name="nombre"><Input/></Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">{editingCuenta ? 'Actualizar' : 'Añadir'}</Button>
                    {editingCuenta && <Button onClick={handleCancelarEdicionCuenta}>Cancelar Edición</Button>}
                </Space>
              </Form>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* --- Modal para Añadir Manualmente --- */}
      <Modal title="Añadir Estado Financiero Manualmente" open={modalManualVisible} onCancel={() => setModalManualVisible(false)} okText="Guardar">
        <Form layout="vertical" style={{marginTop: 24}}><Form.Item label="Año del Periodo"><InputNumber style={{width: '100%'}} /></Form.Item><Title level={5}>Montos</Title>{datosInicialesCatalogo.map(c => <Form.Item key={c.id} label={c.nombre}><InputNumber style={{width: '100%'}} prefix="$" /></Form.Item>)}</Form>
      </Modal>

      {/* --- Modal para Importar Excel --- */}
      <Modal 
        title={`Importar Estado Financiero para ${empresa.nombre}`} 
        open={modalExcelVisible} 
        onCancel={() => setModalExcelVisible(false)} 
        footer={null}
      >
        <div style={{marginTop: 24, marginBottom: 24}}>
          <SubidaExcel 
            uploadRoute="empresas.estados-financieros.importar"
            onLeido={handleExcelLeido} 
          />
        </div>
      </Modal>
    </>
  );
}

// Esto es para aplicar el layout principal.
EstadosFinancierosIndex.layout = page => <AppLayout>{page}</AppLayout>;