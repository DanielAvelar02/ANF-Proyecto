// resources/js/Pages/Dashboard/Index.jsx
import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout' // Layout compartido
import { Button, Typography } from 'antd'

const { Text } = Typography

// Página principal del dashboard
export default function Index() {
    return (
        <>
            {/* Inicio del título de la página */}
            <title>ANF - Dashboard</title>
            <Head title="Dashboard" />
            <div>
                <Text strong style={{ fontSize: 18 }}>Bienvenido al Dashboard</Text>
                <div style={{ marginTop: 12 }}>
                    <p>Habemus Dashboard!</p>
                    <Button type="default">Acción</Button>
                </div>
            </div>
        </>
    )
}

// Aqui se llama al layout compartido para esta página
Index.layout = page => <AppLayout>{page}</AppLayout>
