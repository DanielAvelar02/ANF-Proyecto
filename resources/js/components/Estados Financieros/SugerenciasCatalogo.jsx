import React, { useState } from 'react';
import { Button, Drawer, Typography, List, Table, Divider, Badge, Space, Avatar } from 'antd';
import { InfoCircleOutlined, CheckCircleTwoTone } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * Componente que muestra las sugerencias de cuentas requeridas y codificación.
 * Usa un Drawer (panel lateral) para una animación fluida.
 */
export default function SugerenciasCatalogo() {
    // Estado para controlar si el Drawer (panel lateral) está visible
    const [visible, setVisible] = useState(false);

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    // --- Datos para las listas y tablas ---
    const cuentasRatios = [
        'Activo Corriente', 'Pasivo Corriente', 'Activo Total', 'Pasivo Total',
        'Patrimonio', 'Ventas Netas', 'Cuentas Por Cobrar', 'Cuentas Por Pagar',
        'Compras', 'Activo Fijo Neto', 'Inventario'
    ];

    const estructuraColumnas = [
        { title: 'Grupo', dataIndex: 'grupo', key: 'grupo', width: 80 },
        { title: 'Naturaleza', dataIndex: 'naturaleza', key: 'naturaleza' },
        { title: 'Ejemplos de códigos comunes', dataIndex: 'ejemplos', key: 'ejemplos' },
    ];

    const estructuraDatos = [
        { key: '1', grupo: 1, naturaleza: 'Activo', ejemplos: '100 (Caja), 110 (Bancos), 120 (Clientes), 130 (Inventarios)' },
        { key: '2', grupo: 2, naturaleza: 'Pasivo', ejemplos: '200 (Proveedores), 210 (Acreedores), 220 (Obligaciones bancarias)' },
        { key: '3', grupo: 3, naturaleza: 'Patrimonio', ejemplos: '300 (Capital social), 310 (Reservas), 320 (Resultados acumulados)' },
        { key: '4', grupo: 4, naturaleza: 'Ingresos', ejemplos: '400 (Ventas), 410 (Ingresos financieros)' },
        { key: '5', grupo: 5, naturaleza: 'Gastos', ejemplos: '500 (Compras), 510 (Sueldos), 520 (Servicios), 530 (Depreciaciones)' },
    ];

    return (
        <>
            {/* Botón de Información/Sugerencia */}
            <Button
                type="text"
                shape="circle"
                icon={<InfoCircleOutlined style={{ color: '#1677ff', fontSize: '1.2rem' }} />}
                onClick={showDrawer}
                title="Ver sugerencias del catálogo"
                style={{ marginLeft: 8, marginTop: -4 }} // Ajuste visual para alinear con el título del modal
            />

            {/* Panel Lateral (Drawer) */}
            <Drawer
                title={<Title level={4} style={{ margin: 0 }}>Sugerencias para tu Catálogo</Title>}
                placement="right"
                onClose={onClose}
                open={visible}
                width={600}
            >
                <Paragraph>
                    Para el correcto funcionamiento de los <Badge count="Ratios Financieros" color="blue" />, 
                    es crucial que tu catálogo de cuentas incluya (como mínimo) las siguientes cuentas totalizadoras:
                </Paragraph>

                {/* Lista de Cuentas Requeridas */}
                <List
                    size="small"
                    itemLayout="horizontal"
                    dataSource={cuentasRatios}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar size="small" style={{ background: 'transparent' }} icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} />}
                                title={<Text>{item}</Text>}
                            />
                        </List.Item>
                    )}
                />

                <Divider />

                {/* Tabla de Estructura Recomendada */}
                <Title level={4}>Estructura de Códigos Recomendada</Title>
                <Paragraph>
                    Te sugerimos esta estructura (basada en la codificación estándar) para mantener un orden claro:
                </Paragraph>
                
                <Table
                    columns={estructuraColumnas}
                    dataSource={estructuraDatos}
                    pagination={false}
                    size="small"
                    bordered
                />
            </Drawer>
        </>
    );
}