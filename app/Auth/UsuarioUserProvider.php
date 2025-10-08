<?php

namespace App\Auth;

use App\Models\Usuario;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;

// Proveedor de usuario personalizado para autenticación basada en el modelo Usuario
class UsuarioUserProvider implements UserProvider
{
    // Recupera un usuario por su identificador (IdUsuario)
    public function retrieveById($identifier): ?Authenticatable
    {
        return Usuario::find($identifier);
    }

    // No usamos "remember me", así que este método no es necesario
    public function retrieveByToken($identifier, $token): ?Authenticatable
    {
        return null;
    }

    // No usamos "remember me", así que este método no es necesario
    public function updateRememberToken(Authenticatable $user, $token): void {}

    // Recupera un usuario por sus credenciales (NomUsuario)
    public function retrieveByCredentials(array $credentials): ?Authenticatable
    {
        // Verifica que el campo 'usuario' esté presente
        if (! isset($credentials['usuario'])) {
            return null;
        }

        // Busca el usuario por su nombre de usuario
        return Usuario::where('NomUsuario', $credentials['usuario'])->first();
    }

    // Valida las credenciales del usuario (PIN de 5 dígitos)
    public function validateCredentials(Authenticatable $user, array $credentials): bool
    {
        $pin = $credentials['contrasena'] ?? ''; // PIN proporcionado
        // Verifica que el PIN sea una cadena de exactamente 5 dígitos
        if (! is_string($pin) || ! preg_match('/^\d{5}$/', $pin)) {
            return false;
        }

        // Verifica que el usuario sea una instancia de Usuario
        if (! $user instanceof Usuario) {
            return false;
        }

        // Compara el PIN proporcionado con el almacenado
        return (string) $user->getAttribute('Clave') === $pin;
    }

    // Requerido en Laravel 11+
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): void
    {
        // no usamos hashes -> nada que rehachear
    }
}
