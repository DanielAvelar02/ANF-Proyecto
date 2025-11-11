<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use App\Auth\UsuarioUserProvider;
use App\Models\Usuario;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // ...
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Gate: solo si el NomUsuario contiene "admin" (admin, administrador, administrator, superadmin, etc.)
        Gate::define('admin-only', function (Usuario $user) {
            $name = Str::lower((string) $user->NomUsuario);
            return Str::contains($name, 'admin');
            // Si prefieres "empieza por": return Str::startsWith($name, ['admin','administrador','administrator']);
        });

        // Proveedor de usuarios personalizado
        Auth::provider('usuarios', function ($app, array $config) {
            return new UsuarioUserProvider();
        });
    }
}
