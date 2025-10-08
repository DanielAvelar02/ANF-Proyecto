<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

// Middleware de Inertia.js para compartir datos comunes con las vistas
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app'; // tu layout Blade: resources/views/app.blade.php

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // Comparte errores de validación (Inertia lo hace aquí)
            'errors' => function () use ($request) {
                return $request->session()->get('errors')
                    ? $request->session()->get('errors')->getBag('default')->toArray()
                    : (object) [];
            },

            // Mensajes flash (si los usas)
            'flash' => [
                'warning' => fn () => $request->session()->get('warning'),
                'success' => fn () => $request->session()->get('success'),
            ],
            // Datos del usuario autenticado para usar en las vistas
            'auth' => [
                'user' => fn () => $request->user() ? [
                    'id' => $request->user()->getAttribute('IdUsuario'),
                    'nombre' => $request->user()->getAttribute('NomUsuario'),
                ] : null,
            ],
        ]);
    }
}
