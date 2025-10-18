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
import { LineChartOutlined } from '@ant-design/icons';
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
    { key: '4', nombre: 'ROA', formula: 'Utilidad Neta / Activos Totales' },
    { key: '5', nombre: 'Endeudamiento Patrimonial', formula: 'Pasivo Total / Patrimonio' },
];

// MODIFICADO: 'benchmarkSector' ahora es 'ratioSector'.
const mockRatiosCalculados = {
    1: [{ key: '1', valorCalculado: 2.5, ratioSector: 2.0 }, { key: '2', valorCalculado: 1.2, ratioSector: 1.0 }, { key: '3', valorCalculado: 0.15, ratioSector: 0.18 }],
    2: [{ key: '1', valorCalculado: 3.1, ratioSector: 2.8 }, { key: '2', valorCalculado: 1.8, ratioSector: 1.5 }, { key: '3', valorCalculado: 0.22, ratioSector: 0.20 }]
};

const mockAllCompanyRatioValues = {
    '2': [{ empresaId: 1, nombre: 'Empresa Minera S.A.', valor: 1.2 }, { empresaId: 2, nombre: 'Venta de Equipos Corp.', valor: 1.8 }, { empresaId: 3, nombre: 'Consultores Tech', valor: 1.4 },],
};

const mockGraficosEvolucion = {
    'Razón Circulante': [{ anio: 2023, valor: 1.8 }, { anio: 2024, valor: 2.1 }, { anio: 2025, valor: 2.5 }],
    'ROE (%)': [{ anio: 2023, valor: 12 }, { anio: 2024, valor: 14 }, { anio: 2025, valor: 15 }],
    'ROA (%)': [{ anio: 2023, valor: 6 }, { anio: 2024, valor: 7.5 }, { anio: 2025, valor: 8 }],
    'Endeudamiento': [{ anio: 2023, valor: 0.55 }, { anio: 2024, valor: 0.5 }, { anio: 2025, valor: 0.45 }],
    'Rotación de Activos': [{ anio: 2023, valor: 1.1 }, { anio: 2024, valor: 1.3 }, { anio: 2025, valor: 1.4 }],
};

// --- Componente Principal de la Página ---
// BACKEND: El componente recibirá todos los datos de prueba como props desde el controlador.
export default function AnalisisRatiosIndex() {

    // --- Pestaña 1: Componente para el Análisis Individual ---
    const AnalisisIndividualTab = () => {
        const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
        const datosCalculados = mockRatiosCalculados[selectedEmpresaId] || [];
        const tablaDataSource = mockRatioDefinitions.map(def => ({ ...def, ...(datosCalculados.find(calc => calc.key === def.key) || {}) }));
        const columns = [
            { title: 'Nombre del Ratio', dataIndex: 'nombre', key: 'nombre' },
            { title: 'Fórmula', dataIndex: 'formula', key: 'formula' },
            { title: 'Valor Calculado', dataIndex: 'valorCalculado', render: (val) => val ? <Text strong>{val}</Text> : '-' },
            { title: 'Ratio Sector', dataIndex: 'ratioSector', render: (val) => val || '-' },
            { title: 'Evaluación', key: 'evaluacion', render: (_, record) => { if (!record.valorCalculado) return '-'; const favorable = record.valorCalculado >= record.ratioSector; return <Tag color={favorable ? 'success' : 'error'}>{favorable ? 'Favorable' : 'Desfavorable'}</Tag> } }
        ];

        return (
            <div>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Text>Seleccione una empresa y periodo:</Text>
                    <Select placeholder="Empresa" style={{ width: 250 }} onChange={value => setSelectedEmpresaId(value)} allowClear>{mockEmpresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}</Select>
                    <Select defaultValue="2024" style={{ width: 120 }}><Option value="2024">2024</Option></Select>
                </Space>
                <Table columns={columns} dataSource={tablaDataSource} rowKey="key" pagination={false} />
            </div>
        );
    };

    // --- Pestaña 2: Componente para el Análisis Comparativo ---
    const AnalisisComparativoTab = () => {
        const [selectedRatioId, setSelectedRatioId] = useState(null);
        const { promedio, empresas } = useMemo(() => { if (!selectedRatioId) return { promedio: 0, empresas: [] }; const valores = mockAllCompanyRatioValues[selectedRatioId] || []; if (valores.length === 0) return { promedio: 0, empresas: [] }; const sum = valores.reduce((acc, item) => acc + item.valor, 0); return { promedio: sum / valores.length, empresas: valores }; }, [selectedRatioId]);
        const columns = [{ title: 'Empresa', dataIndex: 'nombre', key: 'nombre' }, { title: 'Valor Obtenido', dataIndex: 'valor', key: 'valor' }, { title: 'Resultado vs Promedio', key: 'resultado', render: (_, record) => { const cumple = record.valor >= promedio; return <Tag color={cumple ? 'success' : 'error'}>{cumple ? 'Cumple' : 'No Cumple'}</Tag> } }];

        return (
            <div>
                <Space style={{ marginBottom: 16 }}><Text>Seleccione un ratio para analizar:</Text><Select placeholder="Ratio" style={{ width: 250 }} onChange={value => setSelectedRatioId(value)} allowClear>{mockRatioDefinitions.map(r => <Option key={r.key} value={r.key}>{r.nombre}</Option>)}</Select></Space>
                {selectedRatioId && (<Card><Statistic title="Promedio del Sistema" value={promedio.toFixed(3)} /><Table columns={columns} dataSource={empresas} rowKey="empresaId" pagination={false} style={{ marginTop: 16 }} /></Card>)}
            </div>
        );
    };

    // --- Pestaña 3: Componente para los Gráficos ---
    const GraficosTab = () => {
        const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);

        // BACKEND: INSTRUCCIONES PARA EL DESARROLLADOR DE BACKEND
        // 1. Crear una nueva ruta, por ejemplo: GET /api/empresas/{empresa}/evolucion-ratios
        // 2. Esta ruta debe llamar a un nuevo método en `AnalisisRatiosController`.
        // 3. Este método debe buscar en la base de datos los valores de los ratios para la empresa indicada
        //    durante los últimos 3 a 5 años.
        // 4. El método debe devolver un JSON con una estructura similar a `mockGraficosEvolucion`.
        //    Ejemplo de JSON esperado:
        //    {
        //      "Razón Circulante": [ { "anio": 2023, "valor": 1.8 }, { "anio": 2024, "valor": 2.1 } ],
        //      "ROE (%)": [ { "anio": 2023, "valor": 12 }, { "anio": 2024, "valor": 14 } ],
        //      ...etc
        //    }
        //
        // Cuando se seleccione una empresa, el frontend hará una petición `fetch` a esa ruta
        // y usará los datos devueltos para renderizar los gráficos reales.

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

    // --- Definición de las Pestañas ---
    const tabItems = [
        { key: '1', label: 'Análisis Individual', children: <AnalisisIndividualTab /> },
        { key: '2', label: 'Análisis Comparativo', children: <AnalisisComparativoTab /> },
        { key: '3', label: 'Gráficos de Evolución', children: <GraficosTab /> }
    ];

    // --- Renderizado del Componente ---
    return (
        <>
            {/* Inicio del título de la página */}
            <title>ANF - Análisis Ratios</title>
            <Head title="Análisis de Ratios" />
            <Card title="Análisis de Ratios">
                {/* Esto renderiza el contenedor de las pestañas. */}
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Card>



        </>
    );
};

// Esto es para aplicar el layout principal.
AnalisisRatiosIndex.layout = page => <AppLayout>{page}</AppLayout>;