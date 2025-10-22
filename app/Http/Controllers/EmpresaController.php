<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\TipoEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;

class EmpresaController extends Controller
{
    /**
     * Muestra la lista de empresas y tipos.
     */
    public function index()
    {
        $empresas = Empresa::with('tipo:id,nombre')->get()->map(function ($empresa) {
            return [
                'id' => $empresa->id,
                'nombre' => $empresa->nombre,
                'tipo' => ['nombre' => $empresa->tipo->nombre ?? 'N/A'],
                'idTipo' => $empresa->tipo_empresa_id,
            ];
        });

        $tiposDeEmpresa = TipoEmpresa::select('id', 'nombre')->get();

        return Inertia::render('Empresas/Index', [
            'empresas' => $empresas,
            'tiposDeEmpresa' => $tiposDeEmpresa,
        ]);
    }

    /**
     * Crea una empresa.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'idTipo' => ['required', 'integer', 'exists:tipo_empresas,id'],
        ]);

        Empresa::create([
            'nombre' => $validated['nombre'],
            'tipo_empresa_id' => $validated['idTipo'],
        ]);

        return Redirect::route('empresas.index')->with('success', 'Empresa creada con éxito.');
    }

    /**
     * Actualiza una empresa.
     */
    public function update(Request $request, Empresa $empresa)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'idTipo' => ['required', 'integer', 'exists:tipo_empresas,id'],
        ]);

        $empresa->update([
            'nombre' => $validated['nombre'],
            'tipo_empresa_id' => $validated['idTipo'],
        ]);

        return Redirect::route('empresas.index')->with('success', 'Empresa actualizada con éxito.');
    }

    /**
     * Elimina una empresa.
     */
    public function destroy(Empresa $empresa)
    {
        try {
            $nombre = $empresa->nombre;
            $empresa->delete();
            return Redirect::route('empresas.index')->with('success', "La empresa '{$nombre}' fue eliminada.");
        } catch (QueryException $e) {
            // Por ejemplo, violación de integridad si hay estados financieros / catálogo asociados.
            return Redirect::back()->with('error', 'No fue posible eliminar la empresa: tiene dependencias asociadas.');
        }
    }
}
