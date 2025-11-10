// resources/js/Pages/AnalisisRatios/Index.jsx

// --- Importaciones ---
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
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
    Row,
    Col,
    Spin, 
} from 'antd';
import { LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// 🛑🛑 CAMBIO 1: Importamos el componente de gráfico real 🛑🛑
import { Line } from '@ant-design/charts'; 
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios'; 

const { Title, Text } = Typography;
const { Option } = Select;

// Funciones auxiliares (renderVariacion sin cambios)
const renderVariacion = (val) => {
    if (val === null) return <Tag color="default">N/A</Tag>;
    const color = val >= 0 ? 'success' : 'error';
    const icon = val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    return <Tag color={color}>{val.toFixed(2)}% {icon}</Tag>;
};


// 🛑🛑 CAMBIO 2: Componente 'GraficoCard' reemplazado 🛑🛑
/**
 * Este componente ahora SÍ renderiza un gráfico de líneas.
 */
const GraficoCard = ({ title, data = [] }) => {
    
    // Convertimos 'anio' a string para que el eje X lo trate como categoría
    const chartData = data.map(item => ({
        ...item,
        anio: String(item.anio), 
    }));

    // Configuración para el gráfico de Ant Design
    const config = {
        data: chartData,
        xField: 'anio',
        yField: 'valor',
        point: {
            shape: 'diamond',
            size: 4,
        },
        tooltip: {
            title: (value) => `Año ${value}`, // Título del tooltip
            formatter: (datum) => ({ name: 'Valor', value: datum.valor.toFixed(3) }), // Contenido
        },
        height: 250, // Altura fija para el gráfico
        padding: 'auto',
    };

    return (
        <Card title={title} variant="outlined" className="h-full">
            {/* Validamos si hay datos para graficar */}
            {chartData.length > 0 ? (
                <Line {...config} />
            ) : (
                // Mantenemos el placeholder si no hay datos
                <div style={{ textAlign: 'center', padding: '20px', background: '#f0f2f5', borderRadius: '8px', height: '250px' }}>
                    <LineChartOutlined style={{ fontSize: '48px', color: '#999' }} />
                    <Title level={5} style={{ marginTop: '10px' }}>Evolución a 3 Años</Title>
                    <Text type="secondary">No hay datos suficientes</Text>
                </div>
            )}
        </Card>
    );
};


// --- Componente Principal de la Página (Sin cambios) ---
export default function AnalisisRatiosIndex({ 
    empresas = [], 
    periodosDisponibles = [], 
    ratioDefinitions = [], 
    initialRatiosHorizontal = {},
    initialRatiosSectorial = {},
    initialGraficos = {},
}) {
    
    if (empresas.length === 0 || periodosDisponibles.length === 0 || ratioDefinitions.length === 0) {
        return (
            <AppLayout>
                <Alert 
                    message="Error de Configuración/Datos" 
                    description="No se pudo cargar la lista de empresas, periodos o definiciones de ratios. Verifique que haya empresas registradas y que el controlador esté enviando los datos iniciales correctamente." 
                    type="error" 
                    showIcon 
                />
            </AppLayout>
        );
    }

    const [selectedEmpresaId, setSelectedEmpresaId] = useState(empresas[0]?.id || null);
    const [periodoA, setPeriodoA] = useState(periodosDisponibles[0] || new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    
    const [ratiosHorizontal, setRatiosHorizontal] = useState(initialRatiosHorizontal);
    const [ratiosSectorial, setRatiosSectorial] = useState(initialRatiosSectorial);
    const [graficosEvolucion, setGraficosEvolucion] = useState(initialGraficos);

    // Lógica para cargar datos del backend
    const fetchData = useCallback(async (empresaId, periodo) => {
        if (!empresaId || !periodo) return;
        
        setIsLoading(true);
        try {
            
            // 🚨 SOLUCIÓN DEFINITIVA PARA ERROR DE ZIGGY: 
            // Usamos la URL hardcodeada en lugar de la función route().
            const response = await axios.get('/api/analisis-ratios/data', {
                params: { 
                    empresa_id: empresaId, 
                    periodo: periodo 
                }
            });
            
            const data = response.data;
            
            setRatiosHorizontal(data.ratiosHorizontal);
            setRatiosSectorial(data.ratiosSectorial);
            setGraficosEvolucion(data.graficosEvolucion);

        } catch (error) {
            console.error("Error al cargar datos de ratios:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Efecto para cargar datos al cambiar filtros
    useEffect(() => {
        if (!selectedEmpresaId) return; 
        fetchData(selectedEmpresaId, periodoA);
    }, [selectedEmpresaId, periodoA, fetchData]);


    // --- Pestaña 1: Análisis de Empresa (Horizontal y vs. Sector) ---
    const AnalisisEmpresaTab = () => {
        const periodoB = periodoA - 1; 
        
        const dataForTable = useMemo(() => {
            const currentRatios = ratiosHorizontal?.[selectedEmpresaId]?.[periodoA];
            return currentRatios || []; 
        }, [ratiosHorizontal, selectedEmpresaId, periodoA]);

        const columns = [
            { title: 'Ratio', dataIndex: 'nombre', key: 'nombre', width: 250 },
            { title: 'Fórmula', dataIndex: 'formula', key: 'formula', width: 200 },
            { title: `Valor (${periodoA})`, dataIndex: 'valor_A', render: (val) => <Text strong>{val?.toFixed(3) || 0.00}</Text> },
            { title: `Valor (${periodoB})`, dataIndex: 'valor_B', render: (val) => val?.toFixed(3) || 0.00 },
            { title: 'Variación % (YoY)', dataIndex: 'variacion', render: renderVariacion },
            { title: 'Ratio Sector (Benchmark)', dataIndex: 'ratioSector', render: (val) => val?.toFixed(3) || 'N/D'},
        ];
        
        return (
            <Spin spinning={isLoading} tip="Cargando análisis...">
                <Space wrap style={{ marginBottom: 16 }}>
                    <Text>Empresa:</Text>
                    <Select value={selectedEmpresaId} style={{ width: 250 }} onChange={setSelectedEmpresaId}>
                        {empresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
                    </Select>
                    <Text>Periodo de Análisis:</Text>
                    <Select value={periodoA} style={{ width: 120 }} onChange={setPeriodoA}>
                        {periodosDisponibles.map(p => <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                </Space>
                <Table 
                    columns={columns} 
                    dataSource={dataForTable} 
                    rowKey="key" 
                    pagination={false} 
                    size="small" 
                    locale={{ emptyText: 'No hay datos disponibles. Verifique los estados financieros y el catálogo de cuentas.' }}
                />
            </Spin>
        );
    };

    // --- Pestaña 2: Análisis Comparativo (vs. Promedio de Empresas) ---
    const AnalisisComparativoTab = () => {
        const [selectedRatioId, setSelectedRatioId] = useState(ratioDefinitions[0]?.key || null);
        
        const { promedio, empresasData } = useMemo(() => { 
            let datosRatio = ratiosSectorial?.[selectedRatioId];
            if (!Array.isArray(datosRatio)) {
                datosRatio = [];
            }
            if (datosRatio.length === 0) return { promedio: 0, empresasData: [] };
            
            const sum = datosRatio.reduce((acc, item) => acc + item.valor, 0);
            return { 
                promedio: sum / datosRatio.length, 
                empresasData: datosRatio 
            }; 
        }, [selectedRatioId, ratiosSectorial]);
        
        const columns = [ 
            { title: 'Empresa', dataIndex: 'nombre', key: 'nombre' }, 
            { title: 'Valor Obtenido', dataIndex: 'valor', key: 'valor', render: (val) => val.toFixed(3) }, 
            { title: 'Resultado vs Promedio', key: 'resultado', render: (_, record) => { 
                const cumple = record.valor >= promedio; 
                return <Tag color={cumple ? 'success' : 'error'}>{cumple ? 'Cumple' : 'No Cumple'}</Tag>
            }}
        ];
        
        const showNoDataAlert = !selectedRatioId || empresasData.length === 0;

        return (
            <Spin spinning={isLoading} tip="Cargando comparativas...">
                <Space style={{ marginBottom: 16 }}>
                    <Text>Seleccione un ratio para analizar:</Text>
                    <Select placeholder="Ratio" style={{ width: 250 }} 
                            value={selectedRatioId} onChange={setSelectedRatioId}>
                        {ratioDefinitions.map(r => <Option key={r.key} value={r.key}>{r.nombre}</Option>)}
                    </Select>
                </Space>
                
                {showNoDataAlert ? (
                    <Alert 
                        message="Datos no disponibles" 
                        description="No se encontraron datos comparativos (benchmark) o empresas para el ratio seleccionado en el sistema. Verifique su controlador." 
                        type="warning" 
                        showIcon 
                        style={{ marginTop: 16 }}
                    />
                ) : (
                    <Card variant="outlined"> 
                        <Statistic title="Promedio del Sistema" value={promedio.toFixed(3)} />
                        <Table 
                            columns={columns} 
                            dataSource={empresasData} 
                            rowKey="empresaId" 
                            pagination={false} 
                            style={{ marginTop: 16 }}
                            size="small"
                        />
                    </Card>
                )}
            </Spin>
        );
    };

    // --- Pestaña 3: Componente para los Gráficos ---
    const GraficosTab = () => {
        const graficosData = graficosEvolucion;
        
        return (
            <Spin spinning={isLoading} tip="Generando gráficos de evolución...">
                <Alert 
                    message="Gráficos de Evolución" 
                    description="Se muestra la evolución de 5 ratios clave en los últimos 3 años." 
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 16 }}
                />
                
                <Row gutter={[16, 16]}>
                    {Object.entries(graficosData).map(([title, data]) => (
                        <Col xs={24} md={12} key={title}>
                            <GraficoCard title={title} data={data} />
                        </Col>
                    ))}
                    {Object.keys(graficosData).length === 0 && selectedEmpresaId && (
                         <Alert message="No hay datos de evolución disponibles para la empresa seleccionada." type="warning" showIcon style={{ width: '100%', margin: '16px' }} />
                    )}
                </Row>
            </Spin>
        );
    };
    
    // --- Definición de las Pestañas ---
    const tabItems = [ 
        { key: '1', label: 'Análisis de Empresa (Horizontal y Sector)', children: <AnalisisEmpresaTab /> }, 
        { key: '2', label: 'Análisis Comparativo (vs. Promedio)', children: <AnalisisComparativoTab /> }, 
        { key: '3', label: 'Gráficos de Evolución', children: <GraficosTab /> }
    ];
    
    // --- Renderizado del Componente ---
    return (
        <>
            <Head title="Análisis de Ratios" />
            
            <Breadcrumb items={[{ title: 'Inicio' }, { title: 'Análisis de Ratios' }]} style={{ marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0, marginBottom: 16 }}>Análisis de Ratios Financieros</Title>
            
            <Tabs defaultActiveKey="1" items={tabItems} />
        </>
    );
};

// Aplicar el layout principal
AnalisisRatiosIndex.layout = page => <AppLayout children={page} />;