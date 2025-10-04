import { useForm, Head } from '@inertiajs/react'

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ nom: '', clave: '' })
    const submit = e => { e.preventDefault(); post('/login') }

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#f6f8fb,#ffffff)'
    }

    const cardStyle = {
        width: '100%',
        maxWidth: 480,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(20,24,40,0.08)',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }

    const titleStyle = { margin: 0, marginBottom: 10, fontSize: 20, letterSpacing: '-0.01em' }
    const subtitleStyle = { marginTop: 0, marginBottom: 18, color: '#6b7280', fontSize: 13 }

    const labelStyle = { display: 'block', fontSize: 13, marginBottom: 6, color: '#374151' }

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid #e6e9ee',
        marginBottom: 12,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box'
    }

    const buttonStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: 'none',
        background: '#111827',
        color: '#fff',
        fontSize: 15,
        cursor: 'pointer'
    }

    const errorStyle = { color: '#b91c1c', fontSize: 13, marginTop: 6, marginBottom: 6 }

    return (
        <>
            <Head title="Login" />

            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>ANF</div>
                        <div>
                            <h2 style={titleStyle}>ANF — Iniciar sesión</h2>
                            <p style={subtitleStyle}>Accede con tu usuario y clave (5 caracteres)</p>
                        </div>
                    </div>

                    <form onSubmit={submit} aria-label="formulario de inicio de sesión">
                        <label htmlFor="nom" style={labelStyle}>Usuario</label>
                        <input
                            id="nom"
                            name="nom"
                            autoComplete="username"
                            style={inputStyle}
                            value={data.nom}
                            onChange={e => setData('nom', e.target.value)}
                            required
                            placeholder="Tu usuario"
                        />
                        {errors.nom && <div style={errorStyle}>{errors.nom}</div>}

                        <label htmlFor="clave" style={labelStyle}>Clave</label>
                        <input
                            id="clave"
                            name="clave"
                            type="password"
                            maxLength={5}
                            autoComplete="current-password"
                            style={inputStyle}
                            value={data.clave}
                            onChange={e => setData('clave', e.target.value)}
                            required
                            placeholder="•••••"
                        />
                        {errors.clave && <div style={errorStyle}>{errors.clave}</div>}

                        {errors.nom && !errors.nom.includes('Usuario') && <div style={errorStyle}>{errors.nom}</div>}

                        <button disabled={processing} type="submit" style={{ ...buttonStyle, marginTop: 8 }}>
                            {processing ? 'Verificando...' : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
