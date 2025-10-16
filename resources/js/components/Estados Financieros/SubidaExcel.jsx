import React, { useState } from 'react';
import { Upload, Button, message, Space, Typography } from 'antd';
import { UploadOutlined, FileExcelTwoTone } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text } = Typography;

export default function SubidaExcel({ onLeido, uploadRoute }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const props = {
        name: 'file',
        multiple: false,
        accept: '.xlsx, .xls, .csv',
        beforeUpload: (file) => {
            setFile(file);
            return false;
        },
        onRemove: () => {
            setFile(null);
        },
    };

    const handleUpload = async () => {
        if (!file) {
            message.warning('Por favor, selecciona un archivo primero.');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
        try {
            const response = await fetch(route(uploadRoute), {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor.');
            }
            const data = await response.json();
            onLeido(data);
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            message.error('Hubo un problema al procesar el archivo. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    {/* MODIFICADO: Usamos el nuevo ícono con su color específico */}
                    <FileExcelTwoTone twoToneColor="#16a322ff" />
                </p>
                <p className="ant-upload-text">Haz clic o arrastra un archivo Excel a esta área</p>
                <p className="ant-upload-hint">
                    Asegúrate de que el archivo tenga el formato correcto para ser procesado.
                </p>
            </Dragger>
            <Button
                type="primary"
                onClick={handleUpload}
                disabled={!file}
                loading={loading}
                style={{ width: '100%', marginTop: 16 }}
                icon={<UploadOutlined />}
            >
                {loading ? 'Procesando...' : 'Cargar y Procesar Archivo'}
            </Button>
        </Space>
    );
}