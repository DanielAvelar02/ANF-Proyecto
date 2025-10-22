<?php

// app/Http/Controllers/AnalisisHorizontalController.php
namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\CatalogoCuenta;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalisisHorizontalController extends Controller
{
    public function index(Request $request)
    {
        // Opciones para <Select> de empresas
        $empresas = Empresa::query()
            ->orderBy('nombre')
            ->get(['id','nombre'])
            ->map(fn ($e) => ['value' => $e->id, 'label' => $e->nombre])
            ->values();

        // Empresa por defecto (primera) solo para precargar cuentas
        $empresaId = $empresas->first()['value'] ?? null;

        // Opciones de cuentas de esa empresa (puedes dejar [] si prefieres cargar todo por AJAX)
        $cuentas = $empresaId
            ? CatalogoCuenta::where('empresa_id', $empresaId)
                ->orderBy('codigo_cuenta')
                ->get(['id','codigo_cuenta','nombre_cuenta'])
                ->map(function ($c) {
                    $label = trim(($c->codigo_cuenta ? $c->codigo_cuenta.' - ' : '').$c->nombre_cuenta);
                    return ['value' => $c->id, 'label' => $label];
                })->values()
            : collect();

        return Inertia::render('AnalisisHorizontal/Index', [
            'empresas' => $empresas,
            'cuentas'  => $cuentas,
            // rango rápido de años (ajústalo luego con tus datos reales)
            'anios'    => range(date('Y') - 10, date('Y')),
        ]);
    }

    // Endpoint para traer cuentas por empresa (AJAX desde React)
    public function cuentasPorEmpresa(Request $request)
    {
        $empresaId = $request->integer('empresa_id');
        if (!$empresaId) {
            return response()->json(['options' => []]);
        }

        $options = CatalogoCuenta::where('empresa_id', $empresaId)
            ->orderBy('codigo_cuenta')
            ->get(['id','codigo_cuenta','nombre_cuenta'])
            ->map(function ($c) {
                $label = trim(($c->codigo_cuenta ? $c->codigo_cuenta.' - ' : '').$c->nombre_cuenta);
                return ['value' => $c->id, 'label' => $label];
            })->values();

        return response()->json(['options' => $options]);
    }

    // (más adelante) calcularás aquí los datos reales para la tabla/gráfica
    public function datos(Request $request)
    {
        // ...
        return response()->json(['data' => []]);
    }
}
