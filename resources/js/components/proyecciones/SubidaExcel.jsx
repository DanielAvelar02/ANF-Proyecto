import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// Componente para subir un archivo Excel y leer sus datos
export default function SubidaExcel({ onLeido }) {
    const [file, setFile] = useState(null);
    const props = {
        beforeUpload: (f) => { setFile(f); return false; },
        accept: '.xlsx,.xls'
    };

    const enviar = async () => {
        if (!file) { message.warning('Selecciona un archivo Excel.'); return; }
        const form = new FormData();
        form.append('archivo', file);
        form.append('_token', document.querySelector('meta[name="csrf-token"]').content);

        const resp = await fetch(route('proyecciones.importar'), { method: 'POST', body: form });
        const data = await resp.json();
        if (data?.valores?.length) onLeido(data.valores);
        else message.error('No se pudieron leer valores del Excel.');
    };

    return (
        <>
            <Upload {...props}>
                <Button icon={<UploadOutlined />}>Seleccionar Excel</Button>
            </Upload>
            <Button type="primary" onClick={enviar} style={{ marginTop: 8 }}>
                Cargar
            </Button>
        </>
    );
}
