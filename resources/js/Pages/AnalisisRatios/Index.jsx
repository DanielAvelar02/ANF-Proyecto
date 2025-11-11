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
    Button,
} from 'antd';
import { LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts'; 
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios'; 

const { Title, Text } = Typography;
const { Option } = Select;

// ... (Funciones renderVariacion y GraficoCard no cambian) ...
const renderVariacion = (val) => {
    if (val === null) return <Tag color="default">N/A</Tag>;
    const color = val >= 0 ? 'success' : 'error';
    const icon = val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    return <Tag color={color}>{val.toFixed(2)}% {icon}</Tag>;
};
const GraficoCard = ({ title, data = [] }) => {
    const chartData = data.map(item => ({...item, anio: String(item.anio)}));
    const config = {
        data: chartData,
        xField: 'anio',
        yField: 'valor',
        point: { shape: 'diamond', size: 4 },
        tooltip: {
            title: (value) => `Año ${value}`,
            formatter: (datum) => ({ name: 'Valor', value: datum.valor.toFixed(3) }),
        },
        height: 250,
        padding: 'auto',
    };
    return (
        <Card title={title} variant="outlined" className="h-full">
            {chartData.length > 0 ? (
                <Line {...config} />
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: '#f0f2f5', borderRadius: '8px', height: '250px' }}>
                    <LineChartOutlined style={{ fontSize: '48px', color: '#999' }} />
                    <Title level={5} style={{ marginTop: '10px' }}>Evolución a 3 Años</Title>
                    <Text type="secondary">No hay datos suficientes</Text>
                </div>
            )}
        </Card>
    );
};


// --- Componente Principal de la Página ---
export default function AnalisisRatiosIndex({ 
    empresas = [], 
    periodosDisponibles = [], // Esta es la lista INICIAL de periodos
    ratioDefinitions = [], 
    tiposEmpresa = [], // Recibimos los tipos de empresa
    initialRatiosHorizontal = {},
    initialGraficos = {},
}) {
    
    if (empresas.length === 0 || ratioDefinitions.length === 0) {
        return (
           
                <Alert message="Error de Configuración" description="No se encontraron empresas o definiciones de ratios." type="error" showIcon />
            
        );
    }

    const [selectedEmpresaId, setSelectedEmpresaId] = useState(empresas[0]?.id || null);
    
    const [availableYears, setAvailableYears] = useState(periodosDisponibles);
    
    const [periodoA, setPeriodoA] = useState(availableYears[0] || new Date().getFullYear());
    const [periodoB, setPeriodoB] = useState(availableYears[1] || new Date().getFullYear() - 1); 

    const [isLoading, setIsLoading] = useState(false);
    
    const [ratiosHorizontal, setRatiosHorizontal] = useState(initialRatiosHorizontal);
    const [graficosEvolucion, setGraficosEvolucion] = useState(initialGraficos);

    // Opciones de dropdown para Pestaña 1
    const periodosAOptions = useMemo(() => 
        availableYears.filter(p => p !== periodoB), 
    [availableYears, periodoB]);
    
    const periodosBOptions = useMemo(() => 
        availableYears.filter(p => p !== periodoA), 
    [availableYears, periodoA]);


    // 'fetchData' (para Pestaña 1 y 3)
    const fetchData = useCallback(async (empresaId, pA, pB) => {
        if (!empresaId || !pA || !pB) return;
        
        setIsLoading(true);
        try {
            const response = await axios.get('/api/analisis-ratios/data', {
                params: { 
                    empresa_id: empresaId, 
                    periodo_a: pA, 
                    periodo_b: pB, 
                }
            });
            
            const data = response.data;
            setRatiosHorizontal(data.ratiosHorizontal);
            setGraficosEvolucion(data.graficosEvolucion);

        } catch (error) {
            console.error("Error al cargar datos de ratios:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Efecto para Pestaña 1 (cuando cambia empresa)
    useEffect(() => {
        if (!selectedEmpresaId) return;

        setIsLoading(true);
        axios.get(`/api/empresas/${selectedEmpresaId}/periodos`)
            .then(response => {
                const newYears = response.data;
                setAvailableYears(newYears); 

                const newPeriodoA = newYears.includes(periodoA) ? periodoA : (newYears[0] || null);
                let newPeriodoB = newYears.includes(periodoB) ? periodoB : (newYears[1] || null);
                
                if (newYears.length > 0 && newPeriodoA === newPeriodoB) {
                    newPeriodoB = newYears[1] || newPeriodoA; 
                }

                setPeriodoA(newPeriodoA);
                setPeriodoB(newPeriodoB);

                if (newPeriodoA && newPeriodoB && newPeriodoA !== newPeriodoB) {
                    fetchData(selectedEmpresaId, newPeriodoA, newPeriodoB);
                } else if (newPeriodoA) {
                     fetchData(selectedEmpresaId, newPeriodoA, newPeriodoA);
                }
                else {
                    setRatiosHorizontal({});
                    setGraficosEvolucion({});
                    setIsLoading(false);
                }
            })
            .catch(error => {
                console.error("Error al cargar periodos:", error);
                setIsLoading(false);
            });

    }, [selectedEmpresaId]); 

    // Efecto para Pestaña 1 (cuando cambian años A o B)
    useEffect(() => {
        if (!selectedEmpresaId || !periodoA || !periodoB) return; 
        fetchData(selectedEmpresaId, periodoA, periodoB);
    }, [periodoA, periodoB]);


    // --- Pestaña 1: Análisis de Empresa (Sin cambios) ---
    const AnalisisEmpresaTab = () => {
        
        const dataForTable = useMemo(() => {
            const currentRatios = ratiosHorizontal?.[selectedEmpresaId]?.[periodoA];
            return currentRatios || []; 
        }, [ratiosHorizontal, selectedEmpresaId, periodoA]);

        const columns = [
            { title: 'Ratio', dataIndex: 'nombre', key: 'nombre', width: 250, fixed: 'left' },
            { title: 'Fórmula', dataIndex: 'formula', key: 'formula', width: 200 },
            { title: `Valor (${periodoA})`, dataIndex: 'valor_A', render: (val) => <Text strong>{val?.toFixed(3) || 0.00}</Text> },
            { title: `Valor (${periodoB})`, dataIndex: 'valor_B', render: (val) => val?.toFixed(3) || 0.00 },
            { title: 'Variación %', dataIndex: 'variacion', render: renderVariacion },
            { title: 'Ratio Sector', dataIndex: 'ratioSector', render: (val) => val?.toFixed(3) || 'N/D'},
            {
                title: `Benchmark (${periodoA})`,
                dataIndex: 'benchmarkResultado', 
                key: 'benchmark',
                fixed: 'right',
                width: 120,
                render: (resultado) => {
                    if (resultado === 'N/A') return <Tag color="default">N/D</Tag>;
                    const cumple = (resultado === 'Cumple');
                    return <Tag color={cumple ? 'success' : 'error'}>{resultado}</Tag>;
                }
            }
        ];
        
        return (
            <Spin spinning={isLoading} tip="Cargando análisis...">
                <Space wrap style={{ marginBottom: 16 }}>
                    <Text>Empresa:</Text>
                    <Select value={selectedEmpresaId} style={{ width: 250 }} onChange={setSelectedEmpresaId}>
                        {empresas.map(e => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
                    </Select>
                    <Text>Comparar Año:</Text>
                    <Select value={periodoA} style={{ width: 120 }} onChange={setPeriodoA} disabled={availableYears.length === 0}>
                        {periodosAOptions.map(p => <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                    <Text>Contra Año:</Text>
                    <Select value={periodoB} style={{ width: 120 }} onChange={setPeriodoB} disabled={availableYears.length === 0}>
                        {periodosBOptions.map(p => <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                    <Button danger type="primary" onClick={() => {
                        if (confirm('Esto borrará los ratios guardados para esta empresa y los recalculará. ¿Continuar?')) {
                            router.post('/analisis-ratios/recalcular', { empresa_id: selectedEmpresaId });
                        }
                    }} disabled={isLoading}>
                        Forzar Recálculo
                    </Button>
                </Space>
                <Table 
                    columns={columns} 
                    dataSource={dataForTable} 
                    rowKey="key" 
                    pagination={false} 
                    size="small" 
                    scroll={{ x: 1000 }} 
                    locale={{ emptyText: 'No hay datos disponibles.' }}
                />
            </Spin>
        );
    };

    // --- PESTAÑA 2: Análisis Comparativo ---
    const AnalisisComparativoTab = () => {
        const [sectorLoading, setSectorLoading] = useState(false);
        const [selectedSectorId, setSelectedSectorId] = useState(tiposEmpresa[0]?.id || null);
        const [selectedSectorPeriodo, setSelectedSectorPeriodo] = useState(availableYears[0] || null);
        const [sectorData, setSectorData] = useState({}); 
        const [selectedRatioId, setSelectedRatioId] = useState(ratioDefinitions[0]?.key || null);

        const sectorPeriodosOptions = useMemo(() => 
            availableYears.length > 0 ? availableYears : periodosDisponibles,
        [availableYears, periodosDisponibles]);

        // Efecto que carga datos para la Pestaña 2
        useEffect(() => {
            if (!selectedSectorId || !selectedSectorPeriodo) {
                setSectorData({});
                return;
            }

            setSectorLoading(true);
            axios.get('/api/analisis-ratios/comparativo-sectorial', {
                params: {
                    tipo_empresa_id: selectedSectorId,
                    periodo: selectedSectorPeriodo
                }
            })
            .then(response => {
                setSectorData(response.data);
            })
            .catch(error => {
                console.error("Error al cargar datos sectoriales:", error);
                setSectorData({});
            })
            .finally(() => {
                setSectorLoading(false);
            });

        }, [selectedSectorId, selectedSectorPeriodo]); 

        
        const { promedio, empresasData } = useMemo(() => { 
            let datosRatio = sectorData?.[selectedRatioId];
            if (!Array.isArray(datosRatio)) {
                datosRatio = [];
            }
            if (datosRatio.length === 0) return { promedio: 0, empresasData: [] };
            
            const sum = datosRatio.reduce((acc, item) => acc + item.valor, 0);
            return { 
                promedio: (sum / datosRatio.length) || 0, 
                empresasData: datosRatio 
            }; 
        }, [selectedRatioId, sectorData]);
        
        const columns = [ 
            { title: 'Empresa', dataIndex: 'nombre', key: 'nombre' }, 
            { title: 'Valor Obtenido', dataIndex: 'valor', key: 'valor', render: (val) => val.toFixed(3) }, 
            { 
                title: 'Resultado vs Promedio', 
                key: 'resultado', 
                render: (_, record) => { 
                    const menorEsMejorKeys = ['4', '6', '9']; 
                    let cumple;
                    if (promedio === 0) {
                         return <Tag color="default">N/A</Tag>;
                    }
                    if (menorEsMejorKeys.includes(selectedRatioId)) {
                        cumple = record.valor <= promedio;
                    } else {
                        cumple = record.valor >= promedio;
                    }
                    return <Tag color={cumple ? 'success' : 'error'}>{cumple ? 'Cumple' : 'No Cumple'}</Tag>
                }
            }
        ];
        
        const showNoDataAlert = !selectedRatioId || empresasData.length === 0;

        return (
            <Spin spinning={sectorLoading} tip="Cargando comparativa sectorial...">
                <Space wrap style={{ marginBottom: 16 }}>
                    <Text>Seleccione Sector:</Text>
                    <Select 
                        placeholder="Tipo de Empresa" 
                        style={{ width: 250 }} 
                        value={selectedSectorId} 
                        onChange={setSelectedSectorId}
                    >
                        {tiposEmpresa.map(t => <Option key={t.id} value={t.id}>{t.nombre}</Option>)}
                    </Select>
                    
                    <Text>Seleccione Período:</Text>
                    <Select 
                        placeholder="Año" 
                        style={{ width: 120 }} 
                        value={selectedSectorPeriodo} 
                        onChange={setSelectedSectorPeriodo}
                    >
                        {sectorPeriodosOptions.map(p => <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                </Space>
                
                <Space style={{ marginBottom: 16, display: 'block' }}>
                    <Text>Seleccione un ratio para analizar:</Text>
                    
                    {/* 🛑🛑🛑 ESTA ES LA LÍNEA CORREGIDA 🛑🛑🛑 */}
                    <Select placeholder="Ratio" style={{ width: 300 }} 
                            value={selectedRatioId} onChange={setSelectedRatioId}>
                        {ratioDefinitions.map(r => <Option key={r.key} value={r.key}>{r.nombre}</Option>)}
                    </Select>
                    
                </Space>
                
                {showNoDataAlert ? (
                    <Alert 
                        message="Datos no disponibles" 
                        description={`No se encontraron datos de ratios para este sector y período. Asegúrese de que las empresas de este sector tengan estados financieros y que sus ratios hayan sido calculados (visitando la Pestaña 1 con esas empresas).`} 
                        type="warning" 
                        showIcon 
                        style={{ marginTop: 16 }}
                    />
                ) : (
                    <Card variant="outlined"> 
                        <Statistic title={`Promedio del Sector (${selectedSectorPeriodo})`} value={promedio.toFixed(3)} />
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

    // --- Pestaña 3: Gráficos (sin cambios) ---
    const GraficosTab = () => {
        const graficosData = graficosEvolucion;
        
        return (
            <Spin spinning={isLoading} tip="Generando gráficos de evolución...">
                <Alert 
                    message="Gráficos de Evolución" 
                    description={`Se muestra la evolución de 5 ratios clave en los últimos 3 años (relativo al año ${periodoA}).`} 
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
                         <Alert message="No hay datos de evolución disponibles." type="warning" showIcon style={{ width: '100%', margin: '16px' }} />
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