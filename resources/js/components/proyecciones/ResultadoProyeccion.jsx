import React, { useState } from 'react';
import { Card, Row, Col, Table, Typography, Button, Modal } from 'antd';
import { Line } from '@ant-design/plots';

/**
 * TODO: Componente para mostrar el resultado de la proyección
 */

// Desestructurar Typography para usar Title
const { Title } = Typography;

const { Meta } = Card;

export default function ResultadoProyeccion({ resultado }) {
    const { base, pronostico, metodo } = resultado;
    const [isModalVisible, setIsModalVisible] = useState(false); // Estado para el modal

    const rowsBase = base.map((v, i) => ({ key: `b${i}`, tipo: 'Histórico', mes: i + 1, ventas: v }));
    const rowsFor = pronostico.map((v, i) => ({ key: `p${i}`, tipo: 'Proyección', mes: i + 1, ventas: v }));
    const dataTabla = [...rowsBase, ...rowsFor];

    // Crear los datos para el gráfico en la estructura de dataGraf
    const dataGraf = [
        ...base.map((v, i) => ({
            serie: 'Histórico',
            x: i + 1,
            y: v,

        })),
        ...pronostico.map((v, i) => ({
            serie: 'Proyección',
            x: base.length + i + 1,
            y: v,
        })),
    ];

    // Definir las columnas de la tabla
    const columns = [
        { title: 'Mes', dataIndex: 'mes', key: 'mes' },
        { title: 'Ventas', dataIndex: 'ventas', key: 'ventas' }
    ];

    // Crear los datos para la tabla histórica y proyección
    const dataHistoricos = base.map((valor, index) => ({
        key: index + 1,
        mes: `Mes ${index + 1}`,
        ventas: valor
    }));

    const dataProyeccion = pronostico.map((valor, index) => ({
        key: index + 1 + base.length,
        mes: `Mes ${index + 1 + base.length}`,
        ventas: valor
    }));

    // Función para interpretar la tendencia del gráfico
    const interpretarTendencia = () => {
        const start = base[base.length - 1]; // Último valor histórico
        const end = pronostico[pronostico.length - 1]; // Último valor proyectado

        if (end > start) {
            return 'La tendencia muestra un crecimiento en las ventas proyectadas.';
        } else if (end < start) {
            return 'La tendencia muestra una disminución en las ventas proyectadas.';
        } else {
            return 'La tendencia muestra una estabilidad en las ventas proyectadas.';
        }
    };

    // Función para abrir el modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Función para cerrar el modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (

        <Card type='inner' style={{ border: 'none' }}>
            <Meta title="Resultado" />
            <p>
                El resultado de la proyección usando <b>{metodo.replace('_', ' ')}</b> es el siguiente:
            </p>
            <Row gutter={16}>
                {/* Columna 1: Datos Históricos */}
                <Col xs={24} md={8}>
                    <Title level={5}>Datos Históricos</Title>
                    <Table
                        size='small'
                        columns={columns}
                        dataSource={dataHistoricos}
                        style={{ tableLayout: 'fixed' }}
                        pagination={false}
                    />
                </Col>

                {/* Columna 2: Datos de Proyección */}
                <Col xs={24} md={8}>
                    <Title level={5}>Proyección</Title>
                    <Table
                        size='small'
                        columns={columns}
                        dataSource={dataProyeccion}
                        style={{ tableLayout: 'fixed' }}
                        pagination={false}

                    />
                </Col>

                {/* Columna 3: Gráfico */}
                <Col xs={24} md={8}>
                    <Title level={5}>Gráfico de Proyección</Title>
                    <Line
                        data={dataGraf}
                        xField="x"
                        yField="y"
                        seriesField="serie"
                        point={{ size: 3 }}
                        height={200}
                    />
                    <Button type="primary" onClick={showModal} style={{ marginTop: 16 }}>
                        Ampliar Gráfico
                    </Button>
                    <Typography.Paragraph style={{ marginTop: 16 }}>
                        {interpretarTendencia()}
                    </Typography.Paragraph>

                </Col>


            </Row>
            {/* Modal para el gráfico en grande */}
            <Modal
                title="Gráfico de Proyección"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Line
                    data={dataGraf} // Usamos dataGraf aquí también
                    xField="x"
                    yField="y"
                    seriesField="serie"
                    smooth
                    point={{ size: 3 }}
                    height={400} // Ajuste del tamaño en el modal
                />
            </Modal>
        </Card>
    );
}
