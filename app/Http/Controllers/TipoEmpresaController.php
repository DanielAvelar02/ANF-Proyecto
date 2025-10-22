<?php

namespace App\Http\Controllers;

use App\Models\TipoEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class TipoEmpresaController extends Controller
{
    /**
     * Muestra la lista de tipos de empresa.
     */
    public function index()
    {
        // Trae id, nombre, descripcion y el conteo de empresas asociadas
        $tiposDeEmpresa = TipoEmpresa::withCount('empresas')
            ->get(['id', 'nombre', 'descripcion']);
            
        return Inertia::render('TiposEmpresa/Index', [
            'tiposDeEmpresa' => $tiposDeEmpresa,
        ]);
    }

    /**
     * Almacena un nuevo tipo de empresa. (CREAR)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:tipo_empresas,nombre'],
            'descripcion' => ['nullable', 'string'],
        ]);

        TipoEmpresa::create($validated);

        // Redirige al index para recargar la página con el nuevo tipo y muestra un mensaje flash
        return Redirect::route('tipos-empresa.index')->with('success', 'Tipo de empresa creado con éxito.');
    }

    /**
     * Actualiza el tipo de empresa especificado. (EDITAR)
     */
    public function update(Request $request, TipoEmpresa $tipoEmpresa)
    {
        $validated = $request->validate([
            // La validación 'unique' debe ignorar el registro actual al actualizar
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tipo_empresas', 'nombre')->ignore($tipoEmpresa->id),
            ],
            'descripcion' => ['nullable', 'string'],
        ]);

        $tipoEmpresa->update($validated);

        return Redirect::route('tipos-empresa.index')->with('success', 'Tipo de empresa actualizado con éxito.');
    }

    /**
     * Elimina el tipo de empresa especificado. (ELIMINAR)
     */
    public function destroy(TipoEmpresa $tipoEmpresa)
    {
        // Nota: Las empresas relacionadas se eliminarán en cascada por la definición de tu migración
        $nombre = $tipoEmpresa->nombre;
        $tipoEmpresa->delete();

        return Redirect::route('tipos-empresa.index')->with('success', "El tipo '{$nombre}' fue eliminado.");
    }
}