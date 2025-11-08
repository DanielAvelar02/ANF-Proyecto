// resources/js/Components/Estados Financieros/SubidaExcel.jsx

import React, { useState } from 'react';
// Importamos los componentes de Ant Design que ya usabas
import { Upload, Button, message, Space, Typography } from 'antd';
import { UploadOutlined, FileExcelTwoTone } from '@ant-design/icons';

const { Dragger } = Upload;

// MODIFICADO: El componente ahora recibe 'empresaId' en lugar de 'uploadRoute'
export default function SubidaExcel({ onLeido, empresaId, año }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const props = {
        name: 'file',
        multiple: false,
        accept: '.xlsx, .xls, .csv',
        beforeUpload: (file) => {
            setFile(file);
            return false; // Evita la subida automática de Ant Design
        },
        onRemove: () => {
            setFile(null);
        },
    };

    // Esta es la lógica adaptada de tu componente 'proyecciones'
    const handleUpload = async () => {
        if (!file) {
            message.warning('Por favor, selecciona un archivo primero.');
            return;
        }

        if (!año || año < 1900 || año > 2100) {
        message.error('Por favor, ingresa un año válido en el formulario.');
        return;
        }

        setLoading(true);
        
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
        formData.append('año', año);
        // MODIFICADO: Construimos la URL manualmente, igual que la lógica de 'proyecciones'
        // pero usando el 'empresaId' que recibimos por props.
        const url = `/empresas/${empresaId}/estados-financieros/importar`;

        try {
            // Usamos 'fetch' para enviar el formulario
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Si la respuesta no es OK, intentamos leer el JSON para un mensaje de error
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error en la respuesta del servidor.');
            }
            
            const data = await response.json();
            
            // Verificamos si la data es válida (similar a tu lógica de proyecciones)
            if (!data || data.status !== 'success') {
                 message.error(data.message || 'Hubo un problema al procesar el archivo.');
                 return;
            }

            // ¡Éxito! Llamamos a la función onLeido (de Index.jsx)
            onLeido(data);

        } catch (error) {
            console.error('Error al subir el archivo:', error);
            message.error(error.message || 'Hubo un problema al procesar el archivo. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };
    
    // Mantenemos la misma UI de 'Dragger' que ya tenías
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <FileExcelTwoTone twoToneColor="#16a322ff" />
                </p>
                <p className="ant-upload-text">Haz clic o arrastra un archivo Excel a esta área</p>
                <p className="ant-upload-hint">
                    Asegúrate de que el archivo tenga el formato correcto para ser procesado.
                </p>
            </Dragger>
            <Button
                type="primary"
                onClick={handleUpload} // El botón ahora llama a nuestra función 'handleUpload'
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