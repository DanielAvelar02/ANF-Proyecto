// resources/js/Pages/EstadosFinancieros/Index.jsx

// --- Importaciones ---
import React, { useState } from 'react';
// BACKEND: Importamos 'Link' para navegar entre páginas de Inertia.
import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, Button, Space, Table, Typography, Modal, Form, Input, InputNumber, Row, Col, Card, Tooltip, App as AntApp } from 'antd';
import { PlusOutlined, SettingOutlined, EyeOutlined, FileExcelTwoTone } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';
import SubidaExcel from '@/Components/Estados Financieros/SubidaExcel';

const { Title } = Typography;
const { useApp } = AntApp;

// --- Datos de Prueba ---
// BACKEND: Estas listas estáticas desaparecerán. Los datos vendrán del controlador.
const datosInicialesEstados = [
  { id: 1, periodo: '2024', origen: 'Importado', fecha_carga: '2025-10-15' },
  { id: 2, periodo: '2023', origen: 'Manual', fecha_carga: '2025-09-10' },
];
const datosInicialesCatalogo = [ {id: 1, codigo: '1.1', nombre: 'Activos Corrientes'}, {id: 2, codigo: '2.1', nombre: 'Pasivos Corrientes'},];

// --- Componente Principal de la Página ---
// BACKEND: El componente recibe la 'empresa' como una 'prop' desde el controlador de Laravel.
export default function EstadosFinancierosIndex({ empresa }) {
  const { message } = useApp();

  // --- Estados de React ---
  // Estos estados controlan la visibilidad de los diferentes modales.
  const [modalCatalogoVisible, setModalCatalogoVisible] = useState(false);
  const [modalManualVisible, setModalManualVisible] = useState(false);
  const [modalExcelVisible, setModalExcelVisible] = useState(false);
  
  // BACKEND: Esta variable será dinámica, vendrá del controlador para saber si la empresa ya tiene un catálogo.
  const catalogoDefinido = true;

  // --- Funciones de Manejo de Eventos ---
  const handleExcelLeido = (respuestaDelBackend) => {
    // BACKEND: Aquí procesaremos la respuesta después de subir un Excel para actualizar la tabla.
    console.log("Respuesta del backend:", respuestaDelBackend);
    message.success('Archivo procesado correctamente.');
    setModalExcelVisible(false);
  };

  // --- Definición de las Tablas ---
  const estadosColumns = [ 
    { title: 'Periodo (Año)', dataIndex: 'periodo', key: 'periodo' }, 
    { title: 'Origen', dataIndex: 'origen', key: 'origen' }, 
    { title: 'Fecha de Carga', dataIndex: 'fecha_carga', key: 'fecha_carga' }, 
    { 
      title: 'Acciones', 
      key: 'acciones', 
      align: 'right', 
      render: (text, record) => (
        // BACKEND: Este enlace nos llevará a la página de detalle del estado financiero.
        <Link href={`/estados-financieros/${record.id}`}>
          <Button icon={<EyeOutlined />}>Ver Detalles</Button>
        </Link>
      )
    }, 
  ];
  const catalogoColumns = [ { title: 'Código', dataIndex: 'codigo', key: 'codigo' }, { title: 'Nombre de la Cuenta', dataIndex: 'nombre', key: 'nombre' }, ];

  // --- Renderizado del Componente ---
  return (
    <>
      <Head title={`Estados Financieros de ${empresa.nombre}`} />
      
      {/* Esto es para la "miga de pan" de navegación. */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item><Link href="/dashboard">Inicio</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link href="/empresas">Gestionar Empresas</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{empresa.nombre}</Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Esto es para el encabezado de la página. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}>Estados Financieros de {empresa.nombre}</Title>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setModalCatalogoVisible(true)}>{catalogoDefinido ? 'Ver Catálogo' : 'Crear Catálogo'}</Button>
          <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}><Button icon={<PlusOutlined />} onClick={() => setModalManualVisible(true)} disabled={!catalogoDefinido}>Añadir Manualmente</Button></Tooltip>
          <Tooltip title={!catalogoDefinido ? 'Debe crear el catálogo primero' : ''}>
            <Button type="primary" icon={<FileExcelTwoTone twoToneColor="#09b626" />} onClick={() => setModalExcelVisible(true)} disabled={!catalogoDefinido}>
              Importar Excel
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Esto renderiza la tabla principal. */}
      <Table columns={estadosColumns} dataSource={datosInicialesEstados} rowKey="id" />

      {/* --- Modal para el Catálogo de Cuentas --- */}
      <Modal title="Catálogo de Cuentas" open={modalCatalogoVisible} onCancel={() => setModalCatalogoVisible(false)} footer={null} width={800}>
        {/* BACKEND: El formulario de "Añadir Cuenta" enviará una petición POST para guardar la nueva cuenta. */}
        <Row gutter={16} style={{marginTop: 24}}>
          <Col span={14}><Table columns={catalogoColumns} dataSource={datosInicialesCatalogo} size="small" /></Col>
          <Col span={10}><Card title="Añadir Cuenta"><Form layout="vertical"><Form.Item label="Código"><Input/></Form.Item><Form.Item label="Nombre"><Input/></Form.Item><Button type="primary">Añadir</Button></Form></Card></Col>
        </Row>
      </Modal>

      {/* --- Modal para Añadir Manualmente --- */}
      <Modal title="Añadir Estado Financiero Manualmente" open={modalManualVisible} onCancel={() => setModalManualVisible(false)} okText="Guardar">
        {/* BACKEND: Este formulario enviará una petición POST para guardar el nuevo estado financiero y sus detalles. */}
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
            // BACKEND: Esta es la ruta de Laravel a la que se enviará el archivo.
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