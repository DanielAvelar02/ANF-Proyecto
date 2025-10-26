// resources/js/Pages/Dashboard/Index.jsx

// --- Importaciones ---
import React, { useState } from 'react'; // Añadimos useState para el selector
// Añadimos 'router' para la navegación desde el Select
import { Head, Link, router } from '@inertiajs/react'; 
import { Row, Col, Card, Typography, List, Button, Select, Space } from 'antd';
// Importamos los íconos necesarios
import { 
    LineChartOutlined, 
    CalculatorOutlined, 
    BarChartOutlined,        // Icono que faltaba
    AreaChartOutlined,       // Icono que faltaba
    FundProjectionScreenOutlined, 
    FileExcelOutlined, 
    PercentageOutlined, 
    ExperimentOutlined, 
    ArrowRightOutlined,
    BankOutlined,
    AppstoreOutlined 
} from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// --- Componente Principal del Dashboard ---
export default function DashboardIndex() {
  
  // --- Listas de Funcionalidades (con viñetas) ---
  const analisisFuncionalidades = [
    '• Configuración de catálogos contables por empresa',
    '• Comparación con promedios del sector',
    '• Análisis de múltiples periodos',
    '• Ranking y visualización gráfica (Futuro)',
  ];

  const proyeccionMetodos = [
    '• Método de mínimos cuadrados',
    '• Incremento porcentual',
    '• Incremento absoluto',
    '• Generación automática mes faltante',
  ];

  const empresasFuncionalidades = [
    '• Crear y editar empresas.',
    '• Asociar empresas a un tipo/sector.',
    '• Gestionar tipos/sectores.',
    '• Definir benchmarks por sector (Futuro).',
  ];

  // Colores para los bordes e íconos
  const azul = '#1890ff';
  const verde = '#52c41a';
  const naranja = '#fa8c16';

  // MODIFICADO: Estilo para los botones oscuros de "Acceder al Módulo"
  const darkButtonStyle = {
      backgroundColor: '#262626', // Color de fondo oscuro
      color: '#ffffff', // Color de texto blanco
      borderColor: '#262626' // Borde del mismo color
  };

  // MODIFICADO: Estado para guardar la ruta seleccionada en la tarjeta de Empresas
  const [selectedEmpresaRoute, setSelectedEmpresaRoute] = useState('/empresas');

  return (
    <>
      <Head title="Dashboard" />

      {/* --- Encabezado --- */}
      <Title level={2}>Bienvenido al Sistema</Title>
      <Paragraph type="secondary">
        Selecciona el módulo con el que deseas trabajar. Este sistema está especializado en el análisis
        financiero y proyecciones de ventas basadas en datos históricos.
      </Paragraph>

      {/* --- Fila Principal de Tarjetas (Ahora 2 columnas) --- */}
      <Row gutter={24} style={{ marginTop: '24px' }}>
        
        {/* --- Tarjeta de Análisis Financiero --- */}
        <Col xs={24} lg={12} style={{ marginBottom: '24px' }}> {/* Ocupa la mitad en pantallas grandes */}
          <Card
            style={{ borderLeft: `5px solid ${azul}`, height: '100%' }} 
            bordered={false}
            // MODIFICADO: Nos aseguramos que el color se aplique al icono
            title={<Space style={{ color: azul }}><CalculatorOutlined /> Análisis Financiero</Space>}
            actions={[
              <Link href="/analisis-ratios">
                {/* MODIFICADO: Aplicamos el estilo oscuro al botón */}
                <Button style={darkButtonStyle} icon={<ArrowRightOutlined />}>Acceder al Módulo</Button>
              </Link>
            ]}
          >
            <Paragraph>
              Genera informes de análisis financieros comparativos.
            </Paragraph>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              {/* Iconos restaurados */}
              <Col span={12}><Text><AreaChartOutlined /> Del Sector</Text></Col>
              <Col span={12}><Text><LineChartOutlined /> Ratios Financieros</Text></Col>
              <Col span={12}><Text><FundProjectionScreenOutlined /> Gráficos Comparativos</Text></Col>
            </Row>
            <List
              header={<Text strong>Funcionalidades:</Text>}
              dataSource={analisisFuncionalidades}
              renderItem={(item) => <List.Item style={{padding: '6px 0', borderBlockEnd: 'none'}}>{item}</List.Item>}
              size="small"
            />
          </Card>
        </Col>

        {/* --- Tarjeta de Proyección de Ventas --- */}
        <Col xs={24} lg={12} style={{ marginBottom: '24px' }}> {/* Ocupa la otra mitad */}
          <Card
            style={{ borderLeft: `5px solid ${verde}`, height: '100%' }}
            bordered={false}
             // MODIFICADO: Nos aseguramos que el color se aplique al icono
            title={<Space style={{ color: verde }}><FundProjectionScreenOutlined /> Proyección de Ventas</Space>}
            actions={[
              <Link href="/proyecciones">
                {/* MODIFICADO: Aplicamos el estilo oscuro al botón */}
                <Button style={darkButtonStyle} icon={<ArrowRightOutlined />}>Acceder al Módulo</Button>
              </Link>
            ]}
          >
            <Paragraph>
              Realiza proyecciones de ventas a 12 meses.
            </Paragraph>
             <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}><Text><LineChartOutlined /> Proyección 12 meses</Text></Col>
                <Col span={12}><Text><FileExcelOutlined /> Importar Excel</Text></Col>
                <Col span={12}><Text><ExperimentOutlined /> Mínimos Cuadrados</Text></Col>
                <Col span={12}><Text><PercentageOutlined /> Incrementos %</Text></Col>
            </Row>
            <List
              header={<Text strong>Métodos disponibles:</Text>}
              dataSource={proyeccionMetodos}
              renderItem={(item) => <List.Item style={{padding: '6px 0', borderBlockEnd: 'none'}}>{item}</List.Item>}
              size="small"
            />
          </Card>
        </Col>

      </Row> 

      {/* --- Segunda Fila para la Tarjeta de Empresas --- */}
      <Row gutter={24}>
          {/* --- Tarjeta de Empresas --- */}
         <Col xs={24} lg={12}> {/* Ocupa la mitad o todo el ancho si quieres */}
          <Card
            style={{ borderLeft: `5px solid ${naranja}`, height: '100%' }}
            bordered={false}
             // MODIFICADO: Nos aseguramos que el color se aplique al icono
            title={<Space style={{ color: naranja }}><BankOutlined /> Gestión de Empresas</Space>}
            actions={[
              // MODIFICADO: El Link ahora usa el estado 'selectedEmpresaRoute'.
              <Link href={selectedEmpresaRoute}> 
                {/* MODIFICADO: Aplicamos el estilo oscuro al botón */}
                <Button style={darkButtonStyle} icon={<ArrowRightOutlined />}>Acceder al Módulo</Button>
              </Link>
            ]}
          >
            <Paragraph>
              Administra las empresas y sus tipos/sectores.
            </Paragraph>
            <Space direction="vertical" style={{width: '100%', marginBottom: '16px'}}>
                <Text>Seleccionar vista para acceder:</Text>
                {/* MODIFICADO: onChange ahora actualiza el estado, no navega directamente. */}
                <Select 
                    defaultValue={selectedEmpresaRoute} 
                    style={{ width: '100%' }} 
                    onChange={(value) => setSelectedEmpresaRoute(value)}
                >
                    <Option value="/empresas"><BankOutlined /> Empresas Individuales</Option>
                    <Option value="/tipos-empresa"><AppstoreOutlined /> Tipos de Empresa</Option>
                </Select>
            </Space>
             <List
              header={<Text strong>Funcionalidades:</Text>}
              dataSource={empresasFuncionalidades}
              renderItem={(item) => <List.Item style={{padding: '6px 0', borderBlockEnd: 'none'}}>{item}</List.Item>}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

// Esto es para aplicar el layout principal.
DashboardIndex.layout = page => <AppLayout>{page}</AppLayout>;