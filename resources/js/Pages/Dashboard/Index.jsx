import { router, Head } from '@inertiajs/react'
export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div style={{ padding: 24, fontFamily: 'system-ui' }}>
                <h1>Dashboard ANF</h1>
                <p>Habemus proyecto</p>
                <form onSubmit={(e) => { e.preventDefault(); router.post('/logout') }}>
                    <button>Salir</button>
                </form>
            </div>
        </>
    )
}
