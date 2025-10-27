<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\CatalogoCuenta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalisisHorizontalController extends Controller
{
    public function index(Request $request)
    {
        $empresas = Empresa::orderBy('nombre')
            ->get(['id','nombre'])
            ->map(fn ($e) => ['value' => $e->id, 'label' => $e->nombre])
            ->values();

        // No enviamos años aquí; se cargan al elegir empresa
        return Inertia::render('AnalisisHorizontal/Index', [
            'empresas' => $empresas,
            'anios'    => [], // se llenará tras seleccionar empresa
        ]);
    }

    /**
     * Devuelve años disponibles (distinct YEAR(periodo)) para una empresa.
     */
    public function aniosPorEmpresa(Request $request)
    {
        $empresaId = $request->integer('empresa_id');
        if (!$empresaId) {
            return response()->json(['anios' => []]);
        }

        // NOTE MySQL: YEAR(periodo). Si usas PostgreSQL => EXTRACT(YEAR FROM periodo)
        $anios = DB::table('estado_financieros')
            ->where('empresa_id', $empresaId)
            ->select(DB::raw('YEAR(periodo) as anio'))
            ->distinct()
            ->orderBy('anio')
            ->pluck('anio')
            ->toArray();

        return response()->json(['anios' => $anios]);
    }

    /**
     * Devuelve TODAS las cuentas de la empresa, con suma por año en el rango
     * y variaciones YoY por cuenta.
     *
     * Respuesta: { years: [2020,...,2024], rows: [{ key, cuenta_id, codigo, nombre, y2020, ..., d2021, p2021, ... }] }
     */
    public function datos(Request $request)
    {
        $val = $request->validate([
            'empresa_id' => 'required|integer|exists:empresas,id',
            'desde'      => 'required|integer',
            'hasta'      => 'required|integer|gte:desde',
        ]);

        $empresaId = (int) $val['empresa_id'];
        $desde     = (int) $val['desde'];
        $hasta     = (int) $val['hasta'];

        $years = range($desde, $hasta);

        // 1) Traemos el catálogo completo de cuentas de la empresa
        $cuentas = CatalogoCuenta::where('empresa_id', $empresaId)
            ->orderBy('codigo_cuenta')
            ->get(['id','codigo_cuenta','nombre_cuenta']);

        // 2) Traemos SUM(monto) por cuenta x año dentro del rango
        //    MySQL: YEAR(e.periodo). Si usas PostgreSQL, cambia por EXTRACT(YEAR FROM e.periodo).
        $sumas = DB::table('catalogo_cuentas as c')
            ->join('detalle_estados as d', 'd.catalogo_cuenta_id', '=', 'c.id')
            ->join('estado_financieros as e', 'e.id', '=', 'd.estado_financiero_id')
            ->where('c.empresa_id', $empresaId)
            ->whereBetween(DB::raw('YEAR(e.periodo)'), [$desde, $hasta])
            ->groupBy('c.id', 'c.codigo_cuenta', 'c.nombre_cuenta', DB::raw('YEAR(e.periodo)'))
            ->orderBy('c.codigo_cuenta')
            ->select([
                'c.id as cuenta_id',
                'c.codigo_cuenta',
                'c.nombre_cuenta',
                DB::raw('YEAR(e.periodo) as anio'),
                DB::raw('SUM(d.monto) as monto'),
            ])
            ->get();

        // 3) Indexamos sumas por cuenta y año
        $map = []; // [cuenta_id][anio] => monto
        foreach ($sumas as $r) {
            $map[$r->cuenta_id][(int)$r->anio] = (float)$r->monto;
        }

        // 4) Construimos filas por cuenta (incluimos cuentas sin movimiento en el rango => valores null/0)
        $rows = [];
        foreach ($cuentas as $c) {
            $row = [
                'key'       => (string) $c->id,
                'cuenta_id' => $c->id,
                'codigo'    => $c->codigo_cuenta,
                'nombre'    => $c->nombre_cuenta,
            ];

            // valores por año y variaciones YoY
            $prev = null;
            foreach ($years as $i => $y) {
                $curr = $map[$c->id][$y] ?? 0.0; // si no hay registro, 0.0
                $row['y'.$y] = round($curr, 2);

                if ($i > 0) {
                    $delta = ($prev === null) ? null : $curr - $prev;
                    // %: si prev == 0, evitamos división (dejamos null)
                    $pct   = ($prev && abs($prev) > 0) ? ($delta / $prev) * 100 : null;

                    $row['d'.$y] = is_null($delta) ? null : round($delta, 2);
                    $row['p'.$y] = is_null($pct)   ? null : round($pct, 2);
                }
                $prev = $curr;
            }

            $rows[] = $row;
        }

        return response()->json([
            'years' => $years,
            'rows'  => $rows,
        ]);
    }
}
