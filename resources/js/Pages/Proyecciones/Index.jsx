import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, Tabs, Form, Select, Button, Row, Col, Divider, App as AntApp } from 'antd';
import TablaMeses from '@/Components/proyecciones/TablaMeses';
import SubidaExcel from '@/Components/proyecciones/SubidaExcel';
import ResultadoProyeccion from '@/Components/proyecciones/ResultadoProyeccion';
import AppLayout from '@/Layouts/AppLayout';
import { EditOutlined, EllipsisOutlined, FileTextTwoTone, FileExcelTwoTone, SettingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Meta } = Card;

// Página principal para gestionar proyecciones de ventas
export default function Index() {
    // Estado para los valores de los 12 meses, método seleccionado, resultado y cargando
    const [valores, setValores] = useState(Array(12).fill(null)); // 12 slots
    const [metodo, setMetodo] = useState('minimos_cuadrados');
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);

    const resultadosRef = useRef(null);  // Usamos useRef para la referencia del card de resultados

    const { message } = AntApp.useApp(); // Hook para mensajes globales de Ant Design

    // Función para calcular la proyección llamando al backend
    const onCalcular = async () => {
        try {
            const compactos = valores.filter(v => v !== null);
            if (compactos.length < 11) {
                message.error('Ingresa al menos 11 meses para calcular la proyección.');
                return;
            }

            if (metodo === 'minimos_cuadrados' && compactos.length < 5) {
                message.warning('Recomendado: Al menos 5 datos para que la tendencia sea más confiable.');
            } else if (metodo === 'incremento_porcentual' && compactos.length < 3) {
                message.warning('Recomendado: Al menos 3 o más datos para obtener un promedio más representativo de los cambios.');
            } else if (metodo === 'incremento_absoluto' && compactos.length < 3) {
                message.warning('Recomendado: 3 o más datos para calcular un promedio más estable.');
            }

            setLoading(true);

            const resp = await fetch('/proyecciones/calcular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ metodo, valores: compactos }),
            });
            // Hacer scroll hacia el card de resultados
            scrollToResultados();

            const data = await resp.json();

            setResultado(data);

        } catch (e) {
            message.error('Ocurrió un error al calcular la proyección.');
        } finally {
            setLoading(false);
        }
    };


    // Función para mover al card de resultados
    const scrollToResultados = () => {
        resultadosRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Función para manejar los datos leídos desde el Excel
    const onExcelLeido = (vals) => {
        // Prellenar desde el Excel; si trae 11, dejamos el 12 vacío (backend lo completará)
        const base = Array(12).fill(null);
        for (let i = 0; i < Math.min(vals.length, 12); i++) base[i] = vals[i];
        setValores(base);
        setResultado(null);
        message.success(`Datos cargados (${vals.length} meses).`);
    };


    // Hacer scroll hacia el card de resultados solo cuando el resultado esté disponible
    useEffect(() => {
        if (resultado) {
            resultadosRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [resultado]);  // Solo se ejecuta cuando 'resultado' cambia

    return (
        <>
            <Head title="Proyecciones de Ventas" /> {/* Título de la página */}
            <Card title="Proyección de ventas (12 meses)" actions={[<SettingOutlined key="setting" />, <EditOutlined key="edit" />, <EllipsisOutlined key="ellipsis" />]}>
                {/* Descripción debajo del título */}
                <Card type="inner" style={{ border: 'none' }}>
                    <Meta
                        title="Entrada de datos"
                    />
                    <p>Ingresa los datos de ventas históricos para calcular la proyección.</p>
                    {/* Pestañas para ingreso manual o subir Excel */}
                    <Tabs
                        items={[
                            // Pestaña para ingreso manual
                            {
                                key: 'manual',
                                label: 'Ingreso manual',
                                icon: <FileTextTwoTone />,
                                // Contenido de la pestaña
                                children: (
                                    <>
                                        {/* Formulario con tabla y opciones (3 columnas): 6 meses | 6 meses | método */}
                                        <Row gutter={16}>
                                            {/* Primera columna: meses 1-6 */}
                                            <Col xs={24} md={8}>
                                                <TablaMeses valores={valores} onChange={setValores} start={0} count={6} />
                                            </Col>

                                            {/* Segunda columna: meses 7-12 */}
                                            <Col xs={24} md={8}>
                                                <TablaMeses valores={valores} onChange={setValores} start={6} count={6} />
                                            </Col>

                                            {/* Tercera columna: selección de método y botón */}
                                            <Col xs={24} md={8}>
                                                <Form layout="vertical">
                                                    <Form.Item label="Método">
                                                        <Select value={metodo} onChange={setMetodo}>
                                                            <Option value="minimos_cuadrados">Mínimos cuadrados</Option>
                                                            <Option value="incremento_porcentual">Incremento porcentual</Option>
                                                            <Option value="incremento_absoluto">Incremento absoluto</Option>
                                                        </Select>
                                                    </Form.Item>
                                                    <Button type="primary" onClick={onCalcular} loading={loading}>
                                                        Calcular proyección
                                                    </Button>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </>
                                )
                            },
                            // Pestaña para subir Excel
                            {
                                key: 'excel',
                                label: 'Subir Excel',
                                icon: <FileExcelTwoTone twoToneColor="#16a322ff" />,
                                children: <SubidaExcel onLeido={onExcelLeido} />
                            }
                        ]}
                    />
                </Card>

                {resultado && (
                    <div ref={resultadosRef}>  {/* Aquí se coloca la referencia */}
                        <ResultadoProyeccion resultado={resultado} />
                    </div>
                )}

            </Card>
        </>
    );
}

// Attach shared layout so the Proyecciones page uses the app template
Index.layout = page => <AppLayout>{page}</AppLayout>
