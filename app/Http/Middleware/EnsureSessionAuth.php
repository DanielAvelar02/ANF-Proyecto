<?php

namespace App\Http\Middleware;

use Closure;

// Middleware personalizado para asegurar que el usuario esté autenticado mediante la sesión
class EnsureSessionAuth
{
    // Asegura que el usuario esté autenticado mediante la sesión
    public function handle($request, Closure $next)
    {
        // Si no hay 'uid' en la sesión, redirige al login
        if (! session()->has('uid')) {
            return redirect('/login');
        }

        // Si está autenticado, continúa con la solicitud
        return $next($request);
    }
}
