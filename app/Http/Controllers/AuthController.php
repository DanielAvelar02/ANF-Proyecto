<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Mostrar el formulario de inicio de sesión
    public function showLogin(Request $request)
    {
        // Si ya está autenticado, redirige al dashboard
        if (Auth::check()) {
            return redirect('/dashboard');
        }

        return Inertia::render('Auth/Login'); // si usas Inertia
        // return view('auth.login'); // si usas Blade clásico
    }

    // Manejar el envío del formulario de inicio de sesión
    public function login(Request $request)
    {
        $data = $request->validate(
            [
                'usuario' => ['required', 'string'],
                'contrasena' => ['required', 'digits:5'], // exactos 5 dígitos
            ],
            [
                'usuario.required' => 'Ingresa tu usuario.',
                'contrasena.required' => 'Ingresa tu contraseña.',
                'contrasena.digits' => 'La contraseña debe tener exactamente 5 dígitos.',
            ]
        );

         if (!Auth::attempt($data, remember: false)) {
        // En vez de lanzar ValidationException, vuelve con errores a sesión:
        return back()
            ->withErrors(['contrasena' => 'Credenciales inválidas.'])
            ->onlyInput('usuario');
    }

        // Regenera la sesión para evitar fijación de sesión
        $request->session()->regenerate();

        // Redirige al dashboard
        return redirect()->intended('/dashboard');
    }

    public function logout(Request $request)
    {
        // Cierra la sesión y invalida la sesión actual
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
