import React from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';
import 'antd/dist/reset.css';
import { createInertiaApp } from '@inertiajs/react';

// 1. ⬇️ IMPORTAR LA FUNCIÓN 'route' DE ZIGGY
import { route as ziggyRoute } from 'ziggy-js';

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        
        // 2. ⬇️ DEFINIR LA FUNCIÓN 'route' GLOBALMENTE
        //    Esto hace que 'route()' esté disponible en todos los componentes (como Index.jsx)
        globalThis.route = (name, params, absolute) =>
            ziggyRoute(name, params, absolute, {
                // 3. ⬇️ OBTENER LAS RUTAS CARGADAS POR @routes EN BLADE
                ...props.initialPage.props.ziggy,
            });

        // Tu código de Ant Design se mantiene intacto
        createRoot(el).render(
            <ConfigProvider locale={esES} theme={{ algorithm: theme.defaultAlgorithm }}>
                <AntdApp>
                    <App {...props} />
                </AntdApp>
            </ConfigProvider>
        );
    },
});