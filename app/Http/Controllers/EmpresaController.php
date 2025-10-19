<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\TipoEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EmpresaController extends Controller
{
    /**
     * Muestra la lista de empresas y tipos.
     */
    public function index()
    {
        // 1. Obtener todas las empresas con su relación de tipo (eager loading)
        $empresas = Empresa::with('tipo:id,nombre')->get()->map(function ($empresa) {
            // Adaptar la estructura al formato esperado por el frontend de React
            return [
                'id' => $empresa->id,
                'nombre' => $empresa->nombre,
                // Formato para Antd Table: { tipo: { nombre: '...' }, idTipo: 1 }
                'tipo' => [
                    'nombre' => $empresa->tipo->nombre ?? 'N/A',
                ],
                'idTipo' => $empresa->tipo_empresa_id,
            ];
        });

        // 2. Obtener todos los tipos de empresa
        $tiposDeEmpresa = TipoEmpresa::select('id', 'nombre')->get();

        // 3. Renderizar la vista Inertia, pasando los datos como props
        return Inertia::render('Empresas/Index', [
            'empresas' => $empresas,
            'tiposDeEmpresa' => $tiposDeEmpresa,
        ]);
    }

    /**
     * Almacena una nueva empresa en la base de datos.
     */
    public function store(Request $request)
    {
        // 1. Validar los datos de entrada
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'idTipo' => ['required', 'exists:tipo_empresas,id'], // Asegura que idTipo exista en la tabla tipo_empresas
        ]);

        // 2. Crear la nueva empresa
        Empresa::create([
            'nombre' => $validated['nombre'],
            'tipo_empresa_id' => $validated['idTipo'], // Mapear idTipo a tipo_empresa_id
        ]);

        // 3. Redirigir a la misma página (refresca los props) con un mensaje de éxito
        return Redirect::route('empresas.index')->with('success', 'Empresa creada con éxito.');
    }
    
    // ... aquí irían los métodos update y destroy
}