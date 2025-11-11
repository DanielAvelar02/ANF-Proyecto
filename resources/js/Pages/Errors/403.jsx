import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Result, Button } from 'antd';
import AppLayout from '@/Layouts/AppLayout';

export default function Error403({ title = 'Acceso restringido', message = 'Necesitas permisos de administrador para ver esta sección.' }) {
  return (
    <AppLayout>
      <Head title="403 | Acceso restringido" />
      <div style={{ padding: 24 }}>
        <Result
          status="403"
          title="403"
          subTitle={<div><b>{title}</b></div>}
          extra={[
            <Link key="home" href="/dashboard">
              <Button type="primary">Ir al dashboard</Button>
            </Link>,
          ]}
        />
      </div>
    </AppLayout>
  );
}
