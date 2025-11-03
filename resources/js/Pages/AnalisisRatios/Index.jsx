// resources/js/Pages/AnalisisRatios/Index.jsx

// --- Importaciones ---
import React, { useState, useMemo } from 'react';
// BACKEND: Importamos 'Head' para el título de la página.
import { Head } from '@inertiajs/react';
import {
    Breadcrumb,
    Typography,
    Tabs,
    Select,
    Space,
    Table,
    Tag,
    Card,
    Statistic,
    Alert,
    Row, // Para la grilla de gráficos
    Col, // Para la grilla de gráficos
} from 'antd';
// MODIFICADO: Corregido el error de tipeo de @ant-D/icons a @ant-design/icons
import { LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import AppLayout from '@/Layouts/AppLayout';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Datos de Prueba para la Página de Análisis ---
// BACKEND: Todas estas listas de 'mock' datos vendrán como props desde el controlador de Laravel.
const mockEmpresas = [
  { id: 1, nombre: 'Empresa Minera S.A.' },
  { id: 2, nombre: 'Venta de Equipos Corp.' },
  { id: 3, nombre: 'Consultores Tech' },
];

const mockRatioDefinitions = [
    { key: '1', nombre: 'Razón Circulante', formula: 'Activos Corrientes / Pasivos Corrientes' },
    { key: '2', nombre: 'Prueba Ácida', formula: 'Activo Cte. - Inventario / Pasivo Cte.' },
    { key: '3', nombre: 'ROE', formula: 'Utilidad Neta / Patrimonio' },
];

// NUEVOS DATOS: Simulan los ratios de una empresa en dos periodos distintos Y el ratio estático del sector.
const mockRatiosParaHorizontal = {
    1: { // Datos para Empresa Minera S.A.
        '2024': [
            { key: '1', nombre: 'Razón Circulante', valor: 2.5, ratioSector: 2.2 },
            { key: '2', nombre: 'Prueba Ácida', valor: 1.2, ratioSector: 1.1 },
            { key: '3', nombre: 'ROE', valor: 0.15, ratioSector: 0.14 },
        ],
        '2023': [
            { key: '1', nombre: 'Razón Circulante', valor: 2.1, ratioSector: 2.2 },
            { key: '2', nombre: 'Prueba Ácida', valor: 1.0, ratioSector: 1.1 },
            { key: '3', nombre: 'ROE', valor: 0.18, ratioSector: 0.14 },
        ]
    }
};

// NUEVOS DATOS: Simulan el ratio de una empresa vs. el promedio de su sector.
const mockRatiosParaSectorial = {
    1: { // Datos para Empresa Minera S.A. en 2024
        '2024': [
            { key: '1', nombre: 'Razón Circulante', valorEmpresa: 2.5, promedioSector: 2.2 },
            { key: '2', nombre: 'Prueba Ácida', valorEmpresa: 1.2, promedioSector: 1.1 },
            { key: '3', nombre: 'ROE', valorEmpresa: 0.15, promedioSector: 0.14 },
        ]
    }
};

// MODIFICADO: Añadimos los datos de prueba que faltaban para las keys '1' y '3'.
const mockAllCompanyRatioValues = {
    '1': [ // NUEVOS DATOS para Razón Circulante
        { empresaId: 1, nombre: 'Empresa Minera S.A.', valor: 2.5 },
        { empresaId: 2, nombre: 'Venta de Equipos Corp.', valor: 3.1 },
        { empresaId: 3, nombre: 'Consultores Tech', valor: 2.8 },
    ],
    '2': [ { empresaId: 1, nombre: 'Empresa Minera S.A.', valor: 1.2 }, { empresaId: 2, nombre: 'Venta de Equipos Corp.', valor: 1.8 }, { empresaId: 3, nombre: 'Consultores Tech', valor: 1.4 },],
    '3': [ // NUEVOS DATOS para ROE
        { empresaId: 1, nombre: 'Empresa Minera S.A.', valor: 0.15 },
        { empresaId: 2, nombre: 'Venta de Equipos Corp.', valor: 0.22 },
        { empresaId: 3, nombre: 'Consultores Tech', valor: 0.19 },
    ]
};

// BACKEND: Esta será la estructura de datos para la pestaña de gráficos.
const mockGraficosEvolucion = {
    'Razón Circulante': [ { anio: 2023, valor: 1.8 }, { anio: 2024, valor: 2.1 }, { anio: 2025, valor: 2.5 } ],
    'ROE (%)': [ { anio: 2023, valor: 12 }, { anio: 2024, valor: 14 }, { anio: 2025, valor: 15 } ],
    'ROA (%)': [ { anio: 2023, valor: 6 }, { anio: 2024, valor: 7.5 }, { anio: 2025, valor: 8 } ],
    'Endeudamiento': [ { anio: 2023, valor: 0.55 }, { anio: 2024, valor: 0.5 }, { anio: 2025, valor: 0.45 } ],
    'Rotación de Activos': [ { anio: 2023, valor: 1.1 }, { anio: 2024, valor: 1.3 }, { anio: 2025, valor: 1.4 } ],
};


// --- Componente Principal de la Página ---
// BACKEND: El componente recibirá todos los datos de prueba como props desde el controlador.
export default function AnalisisRatiosIndex() {
    
    // --- Pestaña 1: Análisis de Empresa (vs. Periodo y Sector) ---
    const AnalisisEmpresaTab = () => {
        const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
        const [periodoA, setPeriodoA] = useState('2024');
        const [periodoB, setPeriodoB] = useState('2023');

        // Combina los datos de los dos periodos seleccionados para la tabla.
        const tablaDataSource = useMemo(() => {
            const datosA = mockRatiosParaHorizontal[selectedEmpresaId]?.[periodoA] || [];
            const datosB = mockRatiosParaHorizontal[selectedEmpresaId]?.[periodoB] || [];
            
            return mockRatioDefinitions.map(def => {
                const valorA = datosA.find(r => r.key === def.key)?.valor || 0;
                const valorB = datosB.find(r => r.key === def.key)?.valor || 0;
                const ratioSector = datosA.find(r => r.key === def.key)?.ratioSector || 0; // Obtenemos el ratio estático.
                const variacionAbs = valorA - valorB;
                const variacionPct = valorB !== 0 ? (variacionAbs / valorB) * 100 : 0;
                
                return { ...def, valorA, valorB, variacionAbs, variacionPct, ratioSector };
            });
        }, [selectedEmpresaId, periodoA, periodoB]);

        const columns = [
            { title: 'Nombre del Ratio', dataIndex: 'nombre', key: 'nombre', width: 250 },
            { title: `Valor (${periodoA})`, dataIndex: 'valorA', render: (val) => <Text strong>{val.toFixed(2)}</Text> },
            { title: `Valor (${periodoB})`, dataIndex: 'valorB', render: (val) => val.toFixed(2) },
            { title: 'Variación %', dataIndex: 'variacionPct', render: (val) => <Tag color={val >= 0 ? 'green' : 'red'}>{val.toFixed(2)}%</Tag> },
            { title: 'Ratio Sector (Estático)', dataIndex: 'ratioSector', render: (val) => val.toFixed(2) },
            { title: 'Evaluación (vs. Sector)', key: 'evaluacion', render: (_, record) => {
                if (!record.valorA) return '-';
                const favorable = record.valorA >= record.ratioSector;
                return <Tag color={favorable ? 'success' : 'error'}>{favorable ? 'Cumple' : 'No Cumple'}</Tag>
            }}
        ];
        
        return (
            <div>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Text>Empresa:</Text>
                    <Select placeholder="Empresa" style={{ width: 250 }} onChange={value => setSelectedEmpresaId(value)} allowClear>{mockEmpresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}</Select>
                    <Text>Comparar Periodo:</Text>
                    <Select defaultValue={periodoA} style={{ width: 120 }} onChange={setPeriodoA}><Option value="2024">2024</Option><Option value="2023">2023</Option></Select>
                    <Text>Contra:</Text>
                    <Select defaultValue={periodoB} style={{ width: 120 }} onChange={setPeriodoB}><Option value="2024">2024</Option><Option value="2023">2023</Option></Select>
                </Space>
                <Table columns={columns} dataSource={tablaDataSource} rowKey="key" pagination={false} size="small" />
            </div>
        );
    };

    // --- Pestaña 2: Análisis Comparativo (vs. Promedio de Empresas) ---
    const AnalisisComparativoTab = () => {
        const [selectedRatioId, setSelectedRatioId] = useState(null);
        // BACKEND: Esta lógica 'useMemo' se reemplazará por una petición al backend
        // que devuelva los datos ya calculados (promedio y lista de empresas).
        const { promedio, empresas } = useMemo(() => { if (!selectedRatioId) return { promedio: 0, empresas: [] }; const valores = mockAllCompanyRatioValues[selectedRatioId] || []; if (valores.length === 0) return { promedio: 0, empresas: [] }; const sum = valores.reduce((acc, item) => acc + item.valor, 0); return { promedio: sum / valores.length, empresas: valores }; }, [selectedRatioId]);
        const columns = [ { title: 'Empresa', dataIndex: 'nombre', key: 'nombre' }, { title: 'Valor Obtenido', dataIndex: 'valor', key: 'valor' }, { title: 'Resultado vs Promedio', key: 'resultado', render: (_, record) => { const cumple = record.valor >= promedio; return <Tag color={cumple ? 'success' : 'error'}>{cumple ? 'Cumple' : 'No Cumple'}</Tag>}}];
        
        return (
            <div>
                <Space style={{ marginBottom: 16 }}><Text>Seleccione un ratio para analizar:</Text><Select placeholder="Ratio" style={{ width: 250 }} onChange={value => setSelectedRatioId(value)} allowClear>{mockRatioDefinitions.map(r => <Option key={r.key} value={r.key}>{r.nombre}</Option>)}</Select></Space>
                {selectedRatioId && (<Card><Statistic title="Promedio del Sistema" value={promedio.toFixed(3)} /><Table columns={columns} dataSource={empresas} rowKey="empresaId" pagination={false} style={{ marginTop: 16 }}/></Card>)}
            </div>
        );
    };

    // --- Pestaña 3: Componente para los Gráficos ---
    const GraficosTab = () => {
        const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);

        // BACKEND: INSTRUCCIONES PARA EL DESARROLLADOR DE BACKEND
        // ... (tus instrucciones de backend sin cambios)

        const GraficoCard = ({ title, data }) => (
            <Card title={title}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f0f2f5', borderRadius: '8px' }}>
                    <LineChartOutlined style={{ fontSize: '48px', color: '#999' }} />
                    <Title level={5} style={{ marginTop: '10px' }}>Evolución (Simulada)</Title>
                    <Text type="secondary">{data.map(d => `${d.anio}: ${d.valor}`).join(' | ')}</Text>
                </div>
            </Card>
        );

        return (
            <div>
                <Space style={{ marginBottom: 16 }}>
                    <Text>Seleccione una empresa para ver sus gráficos:</Text>
                    <Select placeholder="Seleccione una empresa" style={{ width: 250 }} onChange={value => setSelectedEmpresaId(value)} allowClear>
                        {mockEmpresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
                    </Select>
                </Space>
                {!selectedEmpresaId ? (
                    <Alert message="Por favor, seleccione una empresa para visualizar los gráficos." type="info" showIcon />
                ) : (
                    <Row gutter={[16, 16]}>
                        {Object.entries(mockGraficosEvolucion).map(([title, data]) => (
                            <Col xs={24} md={12} key={title}>
                                <GraficoCard title={title} data={data} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        );
    };
    
    // --- Definición de las Pestañas (con nuevas etiquetas) ---
    const tabItems = [ 
        { key: '1', label: 'Análisis de Empresa (vs. Periodo y Sector)', children: <AnalisisEmpresaTab /> }, 
        { key: '2', label: 'Análisis Comparativo (vs. Promedio)', children: <AnalisisComparativoTab /> }, 
        { key: '3', label: 'Gráficos de Evolución', children: <GraficosTab /> }
    ];
    
    // --- Renderizado del Componente ---
    return (
        <>
            <Head title="Análisis de Ratios" />
            
            {/* Esto es para la "miga de pan" y el encabezado. */}
            <Breadcrumb items={[{ title: 'Inicio' }, { title: 'Análisis de Ratios' }]} style={{ marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0, marginBottom: 16 }}>Análisis de Ratios Financieros</Title>
            
            {/* Esto renderiza el contenedor de las pestañas. */}
            <Tabs defaultActiveKey="1" items={tabItems} />
        </>
    );
};

// Esto es para aplicar el layout principal.
AnalisisRatiosIndex.layout = page => <AppLayout>{page}</AppLayout>;