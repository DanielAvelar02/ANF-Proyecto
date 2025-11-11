<?php

namespace App\Http\Controllers;

use App\Models\TipoEmpresa;
use App\Models\BenchmarkSector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class BenchmarkSectorController extends Controller
{
    /**
     * GET: Devuelve los benchmarks existentes para un tipo de empresa.
     * Lo devolvemos como JSON simple para que React lo consuma.
     */
    public function index(TipoEmpresa $tipo_empresa)
    {
        // Transformamos la colección en un mapa: [nombreRatio => valorReferencia]
        // Esto es exactamente lo que el formulario de Ant Design necesita.
        $benchmarkMap = $tipo_empresa->benchmarks
            ->pluck('valorReferencia', 'nombreRatio');

        return response()->json($benchmarkMap);
    }

    /**
     * POST: Guarda los benchmarks para un tipo de empresa.
     * Usamos updateOrCreate para manejar la creación y actualización
     * de forma eficiente en una sola operación.
     */
    public function store(Request $request, TipoEmpresa $tipo_empresa)
    {
        // Opcional: Validar que todos los inputs sean numéricos o nulos
        $validatedData = $request->validate([
            '*' => 'nullable|numeric'
        ]);

        try {
            DB::transaction(function () use ($validatedData, $tipo_empresa) {
                foreach ($validatedData as $nombreRatio => $valorReferencia) {

                    // Si el valor es nulo/vacío, podríamos optar por eliminarlo o guardarlo como null.
                    // Guardar como null es más simple.

                    BenchmarkSector::updateOrCreate(
                        [
                            'tipo_empresa_id' => $tipo_empresa->id,
                            'nombreRatio'     => $nombreRatio
                        ],
                        [
                            'valorReferencia' => $valorReferencia
                        ]
                    );
                }
            });
        } catch (\Exception $e) {
            // En caso de error, volvemos con un mensaje de error
            return Redirect::back()->withErrors(['db' => 'Error al guardar benchmarks: ' . $e->getMessage()]);
        }

        // Todo bien, Inertia se encarga de recargar.
        return Redirect::back()->with('success', 'Benchmarks guardados con éxito.');
    }
}