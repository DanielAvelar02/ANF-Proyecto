// resources/js/Pages/Auth/Login.jsx
import React from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Form, Input, Button, Typography, Card, Alert, Space } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

export default function Login() {
    const { errors, flash } = usePage().props || {}

    const { data, setData, post, processing, reset, clearErrors } = useForm({
        usuario: '',
        contrasena: '',
    })

    const handlePin = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 5)
        setData('contrasena', value)
        if (errors?.contrasena) clearErrors('contrasena')
    }

    const handleUsuario = (e) => {
        setData('usuario', e.target.value)
        if (errors?.usuario) clearErrors('usuario')
    }

    const onFinish = () => {
        post('/login', {
            onFinish: () => reset('contrasena'),
            onError: () => {
                // Forzar re-render de errores si algo los oculta
                // (AntD ya los muestra en help de Form.Item con errors.*)
            },
            onSuccess: () => {
                // Inertia sigue el redirect del backend automáticamente
            }
        })
    }

    return (
        <>
            <Head title="Iniciar sesión" />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f6f8fb,#ffffff)', padding: 16 }}>
                <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,.06)' }}>
                    <Space direction="vertical" size={6} style={{ width: '100%', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>ANF</div>
                            <div>
                                <Typography.Title level={4} style={{ margin: 0 }}>Sistema de Análisis Financiero</Typography.Title>
                                <Typography.Text type="secondary">Accede con tu usuario y clave (5 dígitos)</Typography.Text>
                            </div>
                        </div>
                        {flash?.warning && <Alert type="warning" showIcon message={flash.warning} />}
                        {errors?.auth && <Alert type="error" showIcon message={errors.auth} />}
                    </Space>

                    <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                        <Form.Item label="Usuario" validateStatus={errors?.usuario ? 'error' : ''} help={errors?.usuario}>
                            <Input size="large" prefix={<UserOutlined />} placeholder="Tu usuario" value={data.usuario} onChange={handleUsuario} autoComplete="username" allowClear />
                        </Form.Item>

                        <Form.Item label="Clave (5 dígitos)" validateStatus={errors?.contrasena ? 'error' : ''} help={errors?.contrasena}>
                            <Input.Password size="large" prefix={<LockOutlined />} placeholder="•••••" value={data.contrasena} onChange={handlePin} autoComplete="current-password" maxLength={5} inputMode="numeric" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" size="large" block loading={processing}>
                            {processing ? 'Verificando…' : 'Entrar'}
                        </Button>
                    </Form>
                </Card>
            </div>
        </>
    )
}
