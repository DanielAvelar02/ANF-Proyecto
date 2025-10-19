<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CatalogoCuenta;
use App\Models\Empresa;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CatalogoCuentaController extends Controller
{
    public function store(Request $request, Empresa $empresa)
    {
        $validated = $request->validate([
            'codigo_cuenta' => ['required', 'string', 'max:20', Rule::unique('catalogo_cuentas')->where('empresa_id', $empresa->id)],
            'nombre_cuenta' => ['required', 'string', 'max:100'],
        ]);

        $empresa->catalogoCuentas()->create($validated);
        return Redirect::back()->with('success', 'Cuenta añadida al catálogo.');
    }

    public function update(Request $request, CatalogoCuenta $catalogoCuenta)
    {
        $empresaId = $catalogoCuenta->empresa_id;
        $validated = $request->validate([
            
            'codigo_cuenta' => ['required', 'string', 'max:20', Rule::unique('catalogo_cuentas')->where('empresa_id', $empresaId)->ignore($catalogoCuenta->id)],
            'nombre_cuenta' => ['required', 'string', 'max:100'],
        ]);

        $catalogoCuenta->update($validated);
        return Redirect::back()->with('success', 'Cuenta actualizada.');
    }

    public function destroy(CatalogoCuenta $catalogoCuenta)
    {
        $catalogoCuenta->delete();
        return Redirect::back()->with('success', 'Cuenta eliminada del catálogo.');
    }
}