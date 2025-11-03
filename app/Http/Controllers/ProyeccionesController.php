<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProyeccionRequest;
use App\Services\ProyeccionVentasServicio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\VentasMensualesImport;

class ProyeccionesController extends Controller
{
    public function index()
    {
        return Inertia::render('Proyecciones/Index');
    }

    public function calcular(ProyeccionRequest $request, ProyeccionVentasServicio $servicio)
    {
        // Use validated() from the FormRequest to obtain input safely (avoids undefined input() in some static analysis)
        $data = $request->validated();
        $metodo = $data['metodo'] ?? null;              // 'minimos_cuadrados' | 'incremento_porcentual' | 'incremento_absoluto'
        $valores = $data['valores'] ?? [];              // array de números (11 o 12)

        $resultado = $servicio->calcular($valores, $metodo);

        return response()->json($resultado);
    }

    public function importarExcel(Request $request)
    {
        $request->validate([
            'archivo' => ['required', 'file', 'mimes:xlsx,xls']
        ]);

        $import = new VentasMensualesImport();
        Excel::import($import, $request->file('archivo'));

        // El import devuelve un array de ventas en orden cronológico
        $valores = $import->getValores(); // 11 o 12 elementos

        return response()->json([
            'valores' => $valores,
        ]);
    }
}
