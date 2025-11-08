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
        })
    }

    return (
        <>
            <Head title="Iniciar sesión" />

            <style>
                {`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }

                @media (max-width: 860px) {
                    .login-container {
                        flex-direction: column !important;
                    }
                    .login-image {
                        display: none !important;
                    }
                    .login-form-area {
                        width: 100% !important;
                        padding: 32px !important;
                    }
                }
                `}
            </style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                background: 'linear-gradient(135deg, #eef3fb 0%, #ffffff 100%)'
            }}>

                <div className="login-container" style={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: 980,
                    background: '#fff',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 12px 32px rgba(0,0,0,.08)',
                }}>

                    {/* IMAGEN A LA IZQUIERDA */}
                    <div className="login-image" style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #d9e6ff 0%, #edf2ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 40
                    }}>
                        <img
                            src="/images/analytic-setup.svg"
                            alt="Analítica financiera"
                            style={{
                                width: '90%',
                                maxWidth: 520,
                                animation: 'float 6s ease-in-out infinite'
                            }}
                        />
                    </div>

                    {/* FORMULARIO A LA DERECHA */}
                    <div className="login-form-area" style={{
                        flex: 1,
                        padding: '48px 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <Space direction="vertical" size={6} style={{ width: '100%', marginBottom: 12 }}>
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                Sistema de Análisis Financiero
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Ingresa tus credenciales para continuar
                            </Typography.Text>

                            {flash?.warning && <Alert type="warning" showIcon message={flash.warning} />}
                            {errors?.auth && <Alert type="error" showIcon message={errors.auth} />}
                        </Space>

                        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                            <Form.Item label="Usuario" validateStatus={errors?.usuario ? 'error' : ''} help={errors?.usuario}>
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="Tu usuario"
                                    value={data.usuario}
                                    onChange={handleUsuario}
                                    autoComplete="username"
                                    allowClear
                                />
                            </Form.Item>

                            <Form.Item label="Clave (5 dígitos)" validateStatus={errors?.contrasena ? 'error' : ''} help={errors?.contrasena}>
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined />}
                                    placeholder="•••••"
                                    value={data.contrasena}
                                    onChange={handlePin}
                                    maxLength={5}
                                    inputMode="numeric"
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={processing}
                                style={{ marginTop: 8 }}
                            >
                                {processing ? 'Verificando…' : 'Entrar'}
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    )
}
