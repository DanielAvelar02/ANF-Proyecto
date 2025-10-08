<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Auth\UsuarioUserProvider;

// Proveedor de servicios de autenticación personalizado
class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // ...
    ];

    public function boot(): void
    {
        // Registra el proveedor de usuarios personalizado
        Auth::provider('usuarios', function ($app, array $config) {
            return new UsuarioUserProvider();
        });
    }
}
