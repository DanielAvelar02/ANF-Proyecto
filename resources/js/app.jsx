import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

// (opcional) ver barra de progreso al navegar
import { InertiaProgress } from '@inertiajs/progress'
InertiaProgress.init()

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
})
