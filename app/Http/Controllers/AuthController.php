<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function showLogin() { return inertia('Auth/Login'); }

    public function login(Request $r): RedirectResponse {
        $r->validate(['nom'=>'required', 'clave'=>'required|string|max:5']);
        $u = Usuario::where('NomUsuario', $r->nom)->first();

        if (!$u || trim($u->Clave) !== substr($r->clave, 0, 5)) {
            return back()->withErrors(['nom'=>'Usuario o clave inválidos']);
        }

        session(['uid'=>$u->IdUsuario, 'uname'=>$u->NomUsuario]);
        return redirect()->intended('/dashboard');
    }

    public function logout(): RedirectResponse {
        session()->flush();
        return redirect('/login');
    }
}
