import React from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import esES from 'antd/locale/es_ES'
import 'antd/dist/reset.css'
import { createInertiaApp } from '@inertiajs/react'

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ConfigProvider locale={esES} theme={{ algorithm: theme.defaultAlgorithm }}>
                <AntdApp>
                    <App {...props} />
                </AntdApp>
            </ConfigProvider>
        )
    },
})
