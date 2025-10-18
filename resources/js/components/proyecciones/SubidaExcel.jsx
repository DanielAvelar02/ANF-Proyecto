// useState permite agregar estado local a un componente funcional
// forwardRef hace que el componente pueda recibir una ref desde el padre
// useImperativeHandle permite exponer métodos al padre a través de la ref
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, Button, App as AntApp } from 'antd'; // Componente de subida de archivos
import { UploadOutlined } from '@ant-design/icons';

/**
 * TODO:Componente para subir un archivo Excel y leer sus datos
 */

// función callback que recibe los datos leídos del Excel
const SubidaExcel = forwardRef(function SubidaExcel({ onLeido }, ref) {
    const { message } = AntApp.useApp(); // Hook para mensajes globales de Ant Design

    // Estado para almacenar el archivo seleccionado
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    // Función para enviar el archivo al servidor y procesarlo
    // acepta opcionalmente el archivo como parámetro para subir inmediatamente
    const enviar = async (fileParam) => {
        const fileToSend = fileParam || file; // usar el archivo pasado o el del estado
        if (!fileToSend) { message.warning('Selecciona un archivo Excel.'); return; } // No hay archivo

        setLoading(true); // Indicar que está cargando
        const form = new FormData(); // Crear un formulario para enviar el archivo
        form.append('archivo', fileToSend); // Agregar el archivo al formulario

        // recuperar el token CSRF del meta tag para seguridad
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');
        if (tokenMeta) form.append('_token', tokenMeta.content);
        try {
            // Enviar el archivo al endpoint del backend que procesa el Excel
            const resp = await fetch('/proyecciones/importar-excel', {
                method: 'POST',
                body: form,
            });

            const data = await resp.json().catch(() => ({})); // Intentar parsear JSON, si falla usar objeto vacío

            // Si la respuesta no es OK, mostrar error y salir
            if (!resp.ok) {
                message.error(data?.message || 'No se pudo cargar el Excel.');
                return;
            }

            // Normalizar valores y detectar respuesta vacía
            const valores = data?.valores;
            if (!Array.isArray(valores) || valores.length === 0) {
                // manejar casos: 204 No Content o respuesta sin array de valores
                message.error('No se encontraron valores en el Excel.');
                setFile(null); // limpiar el archivo seleccionado
                setFileList([]); // limpiar la lista de archivos
                return;
            }

            // Si se recibieron valores, pasarlos al callback
            onLeido(valores);
            
        } catch (e) {
            message.error('Error de red al subir el archivo.');
        } finally {
            setLoading(false);
        }
    };

    // Configuración del componente Upload de Ant Design
    const props = {
        beforeUpload: (f) => {
            setFile(f); // Guardar el archivo en el estado
            setFileList([f]); // Guardar el archivo en la lista
            enviar(f); // subir automáticamente usando el archivo recién seleccionado
            return false;
        },
        showUploadList: {
            extra: ({ size = 0 }) => (
                <span style={{ color: 'green' }}> ({(size / 1024 / 1024).toFixed(2)}MB)</span>
            ),
        },
        onRemove: () => { setFile(null); setFileList([]); },
        fileList,
        accept: '.xlsx,.xls' // Aceptar solo archivos Excel
    };
    // Exponer método clear al padre a través de la ref
    useImperativeHandle(ref, () => ({
        clear: () => {
            setFile(null);
            setFileList([]);
        }
    }));

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Upload
                maxCount={1}
                {...props}
                fileList={fileList}
                onRemove={() => {
                    setFile(null); 
                    setFileList([]);
                }}
            >
                <Button icon={<UploadOutlined style={{ color: 'green' }} />} loading={loading} style={{ color: 'green', borderColor: 'green' }} disabled={loading}>
                    {loading ? 'Cargando...' : ' Subir Excel (Max: 1)'}
                </Button>
            </Upload>
        </div>
    );

});

export default SubidaExcel;
