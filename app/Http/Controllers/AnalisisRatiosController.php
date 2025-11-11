<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Empresa;
use App\Models\EstadoFinanciero;
use App\Models\Ratio;
use App\Models\ResultadoRatio;
use App\Models\TipoEmpresa;
use App\Services\RatioService;
use App\Services\DataExtractorService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Models\BenchmarkSector; // 🛑 CAMBIO 1: Importar el nuevo modelo

class AnalisisRatiosController extends Controller
{
    protected $ratioService;
    protected $dataExtractor;

    public function __construct(RatioService $ratioService, DataExtractorService $dataExtractor)
    {
        $this->ratioService = $ratioService;
        $this->dataExtractor = $dataExtractor;
    }

    public function index(Request $request)
    {
        $empresas = Empresa::select('id', 'nombre')->get();
        $selectedEmpresaId = $empresas->first()->id ?? null;
        $periodos = $this->fetchPeriodosDisponibles($selectedEmpresaId);
        
        $ratioDefinitions = Ratio::all()->map(fn($r) => [
            'key' => $r->key,
            'nombre' => $r->nombre_ratio,
            'formula' => $r->formula,
            'categoria' => $r->categoria
        ]);
        
        $tiposEmpresa = TipoEmpresa::select('id', 'nombre')->get();

        $periodoA = $periodos[0] ?? Carbon::now()->year;
        $periodoB = $periodos[1] ?? Carbon::now()->year - 1;

        if (!$selectedEmpresaId) {
             return Inertia::render('AnalisisRatios/Index', [
                'empresas' => $empresas,
                'periodosDisponibles' => $periodos,
                'ratioDefinitions' => $ratioDefinitions,
                'tiposEmpresa' => $tiposEmpresa,
                'initialRatiosHorizontal' => [],
                'initialRatiosSectorial' => [],
                'initialGraficos' => [],
            ]);
        }
        
        $dataProps = $this->getAnalysisData($selectedEmpresaId, $periodoA, $periodoB);

        return Inertia::render('AnalisisRatios/Index', [
            'empresas' => $empresas,
            'periodosDisponibles' => $periodos,
            'ratioDefinitions' => $ratioDefinitions,
            'tiposEmpresa' => $tiposEmpresa,
            'initialRatiosHorizontal' => $dataProps['ratiosHorizontal'],
            'initialRatiosSectorial' => $dataProps['ratiosSectorial'],
            'initialGraficos' => $dataProps['graficosEvolucion'],
        ]);
    }
    
    public function getAnalysisDataApi(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'periodo_a' => 'required|integer',
            'periodo_b' => 'required|integer',
        ]);
        
        $empresaId = $request->integer('empresa_id');
        $periodoA = $request->integer('periodo_a');
        $periodoB = $request->integer('periodo_b');

        $dataProps = $this->getAnalysisData($empresaId, $periodoA, $periodoB);

        return response()->json($dataProps);
    }

    /**
     * 🛑 CAMBIO 2: getAnalysisData
     * Ahora obtiene el 'tipo_empresa_id' de la empresa
     * y se lo pasa a 'prepareHorizontalData'.
     */
    protected function getAnalysisData(int $empresaId, int $periodoA, int $periodoB): array
    {
        // Obtener la empresa y su tipo_empresa_id
        $empresa = Empresa::find($empresaId);
        $tipo_empresa_id = $empresa->tipo_empresa_id ?? null;

        // Años para la Pestaña 1 (Horizontal)
        $ratiosA_horizontal = $this->obtenerOcalcularRatios($empresaId, $periodoA);
        $ratiosB_horizontal = $this->obtenerOcalcularRatios($empresaId, $periodoB);

        // Años para la Pestaña 3 (Gráficos)
        $periodoGraficoB = $periodoA - 1;
        $periodoGraficoC = $periodoA - 2;
        $ratiosB_grafico = $this->obtenerOcalcularRatios($empresaId, $periodoGraficoB);
        $ratiosC_grafico = $this->obtenerOcalcularRatios($empresaId, $periodoGraficoC);

        // Preparar datos (pasando el tipo_empresa_id)
        $horizontalDataArray = $this->prepareHorizontalData(
            $ratiosA_horizontal, 
            $ratiosB_horizontal, 
            $periodoA, 
            $periodoB,
            $tipo_empresa_id // 👈 Se pasa el ID del tipo de empresa
        );

        return [
            'ratiosHorizontal' => [
                $empresaId => [
                    $periodoA => $horizontalDataArray
                ]
            ],
            'ratiosSectorial' => [],
            'graficosEvolucion' => $this->prepareGraficosData($ratiosA_horizontal, $ratiosB_grafico, $ratiosC_grafico, $periodoA, $periodoGraficoB, $periodoGraficoC),
        ];
    }
    
    // ... (obtenerOcalcularRatios, calcularYAlmacenarRatios, recalcularRatios, calcularPromedios no cambian) ...
    protected function obtenerOcalcularRatios(int $empresaId, int $periodo): array
    {
        $estadoFinanciero = EstadoFinanciero::where('empresa_id', $empresaId)
                            ->whereYear('periodo', $periodo)
                            ->first();

        if (!$estadoFinanciero) {
            return [];
        }

        $resultadosGuardados = ResultadoRatio::where('estado_financiero_id', $estadoFinanciero->id)
                                ->with('ratio')
                                ->get();
        
        if ($resultadosGuardados->isNotEmpty()) {
            return $resultadosGuardados->map(function ($res) {
                return [
                    'key' => $res->ratio->key,
                    'nombre' => $res->ratio->nombre_ratio,
                    'formula' => $res->ratio->formula,
                    'valor' => (float) $res->valor_calculado,
                ];
            })->toArray();
        }

        return $this->calcularYAlmacenarRatios($empresaId, $periodo, $estadoFinanciero);
    }

    protected function calcularYAlmacenarRatios(int $empresaId, int $periodo, EstadoFinanciero $estadoFinanciero): array
    {
        $montosActual = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodo);
        $montosAnterior = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodo - 1);

        $promedios = $this->calcularPromedios($montosActual, $montosAnterior);
        $ratiosCalculados = $this->ratioService->calcularTodosLosRatios($montosActual, $promedios);

        $ratioDefinitions = Ratio::all();
        $datosParaGuardar = [];

        foreach ($ratiosCalculados as $ratio) {
            $definicion = $ratioDefinitions->firstWhere('key', $ratio['key']);
            if ($definicion) {
                $datosParaGuardar[] = [
                    'ratio_id' => $definicion->id,
                    'estado_financiero_id' => $estadoFinanciero->id,
                    'valor_calculado' => $ratio['valor'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($datosParaGuardar)) {
            ResultadoRatio::insert($datosParaGuardar);
        }

        return $ratiosCalculados;
    }

    public function recalcularRatios(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
        ]);

        $estadoIds = EstadoFinanciero::where('empresa_id', $request->empresa_id)->pluck('id');
        ResultadoRatio::whereIn('estado_financiero_id', $estadoIds)->delete();

        return redirect()->route('analisis-ratios.index');
    }

    protected function calcularPromedios(array $montosActual, array $montosAnterior): array
    {
        $keys = ['activoTotal', 'cuentasPorCobrar', 'cuentasPorPagar', 'activoFijoNeto'];
        $promedios = [];
        
        foreach ($keys as $key) {
            $montoA = $montosActual[$key] ?? 0.0;
            $montoB = $montosAnterior[$key] ?? 0.0;
            
            if ($montoB == 0.0 && $montoA != 0.0) {
                $promedios[$key] = $montoA; 
            } else {
                $promedios[$key] = ($montoA + $montoB) / 2;
            }
        }
        return $promedios;
    }

    /**
     * 🛑 CAMBIO 3: prepareHorizontalData
     * Ahora acepta 'tipo_empresa_id' como parámetro.
     */
    protected function prepareHorizontalData(array $ratiosA, array $ratiosB, int $periodoA, int $periodoB, ?int $tipo_empresa_id): array
    {
        $data = [];
        // Llama a getBenchmarkRatios con el ID del tipo de empresa
        $benchmarkRatios = $this->getBenchmarkRatios($tipo_empresa_id); 
        $menorEsMejorKeys = ['4', '6', '9'];

        foreach ($ratiosA as $i => $ratioA) {
            $ratioB = collect($ratiosB)->firstWhere('key', $ratioA['key']) ?? ['valor' => 0.0];
            
            $valorA = round($ratioA['valor'], 3);
            $valorB = round($ratioB['valor'], 3);
            $variacion = ($valorB != 0) ? (($valorA - $valorB) / abs($valorB)) * 100 : null;

            // Busca el benchmark por 'key' (ej: '1')
            $benchmark = $benchmarkRatios->firstWhere('key', $ratioA['key']);
            // Usa 'valor_sector' (el alias que definimos en el query)
            $valorSector = $benchmark['valor_sector'] ?? 0.0;

            $cumple = 'N/A';
            if ($valorSector != 0) {
                if (in_array($ratioA['key'], $menorEsMejorKeys)) {
                    $cumple = ($valorA <= $valorSector) ? 'Cumple' : 'No Cumple';
                } else {
                    $cumple = ($valorA >= $valorSector) ? 'Cumple' : 'No Cumple';
                }
            }

            $data[] = [
                'key' => $ratioA['key'], 'nombre' => $ratioA['nombre'], 'formula' => $ratioA['formula'],
                'valor_A' => $valorA, 'valor_B' => $valorB,
                'variacion' => is_null($variacion) ? null : round($variacion, 2),
                'tendencia' => $variacion <=> 0, 'periodoA' => $periodoA, 'periodoB' => $periodoB,
                'ratioSector' => $valorSector, // 👈 Este valor ahora es dinámico
                'benchmarkResultado' => $cumple, // 👈 Este resultado ahora es dinámico
            ];
        }
        return $data;
    }

    protected function prepareSectorialData(int $empresaId, int $periodo): array
    {
         return []; // Ya no se calcula aquí
    }
    
    // ... (prepareGraficosData, getRatioDefinitions no cambian) ...

    protected function prepareGraficosData(array $ratiosA, array $ratiosB, array $ratiosC, int $periodoA, int $periodoB, int $periodoC): array
    {
        $ratiosEvolution = [];
        $graficableRatios = [
            'Razón Circulante', 
            'Grado de Endeudamiento', 
            'Rotación de Activos Totales', 
            'Periodo Medio de Cobro (días)', 
            'Periodo Medio de Pago (días)'
        ];

        foreach ($graficableRatios as $ratioNombre) {
            $targetRatioA = collect($ratiosA)->firstWhere('nombre', $ratioNombre);
            $targetRatioB = collect($ratiosB)->firstWhere('nombre', $ratioNombre);
            $targetRatioC = collect($ratiosC)->firstWhere('nombre', $ratioNombre);
            
            $valorA = $targetRatioA['valor'] ?? 0.0;
            $valorB = $targetRatioB['valor'] ?? 0.0;
            $valorC = $targetRatioC['valor'] ?? 0.0; 
            
            $ratiosEvolution[$ratioNombre] = [
                ['anio' => $periodoC, 'valor' => round($valorC, 2)], 
                ['anio' => $periodoB, 'valor' => round($valorB, 2)], 
                ['anio' => $periodoA, 'valor' => round($valorA, 2)], 
            ];
        }
        return $ratiosEvolution;
    }
    
    protected function getRatioDefinitions(): array
    {
        $ratiosDB = Ratio::all()->map(fn($r) => [
            'key' => $r->key,
            'nombre' => $r->nombre_ratio,
            'formula' => $r->formula,
        ]);
        
        if ($ratiosDB->isNotEmpty()) {
            return $ratiosDB->toArray();
        }
        return [];
    }

   // Reemplaza la función getBenchmarkRatios() completa por esta:

    /**
     * 🛑 CAMBIO 4: getBenchmarkRatios (VERSIÓN CORREGIDA)
     * Esta versión mapea manualmente los nombres largos (de React)
     * a las 'keys' de los ratios (ej: '1', '2'), ya que los nombres
     * en la tabla 'ratios' y 'benchmark_sectors' no coinciden.
     */
    protected function getBenchmarkRatios(?int $tipo_empresa_id): Collection
    {
        // Si la empresa no tiene un tipo/sector asignado, devuelve una colección vacía.
        if (!$tipo_empresa_id) {
            return collect();
        }

        // Esta lista DEBE ser IDÉNTICA (en orden y texto) a la
        // 'listaDeRatios' en tu archivo 'TiposEmpresaIndex.jsx'
        $listaDeRatiosReact = [
            'Razón de Liquidez corriente o Razón de Circulante', // Corresponde a key '1'
            'Razón de Capital de Trabajo a activos totales',     // Corresponde a key '2'
            'Razón de Rotación de cuentas por cobrar',           // Corresponde a key '3'
            'Razón de periodo medio de cobranza',                // Corresponde a key '4'
            'Razón de Rotación de cuentas por pagar',            // Corresponde a key '5'
            'Razón periodo medio de pago',                       // Corresponde a key '6'
            'Índice de Rotación de Activos totales',             // Corresponde a key '7'
            'Índice de Rotación de Activos fijos',               // Corresponde a key '8'
            'Razón de Endeudamiento Patrimonial',                // Corresponde a key '9'
            'Grado de Propiedad',                                // Corresponde a key '10'
            'Razón de Cobertura de Gastos Financieros',          // Corresponde a key '11'
            'Rentabilidad del Patrimonio (ROE)',                 // Corresponde a key '12'
            'Rentabilidad del Activo (ROA)',                     // Corresponde a key '13'
            'Rentabilidad sobre Ventas',                         // Corresponde a key '14'
        ];

        // 1. Obtenemos los benchmarks guardados para este sector.
        //    Ej: ['Razón de Liquidez corriente...' => 1.5, 'Razón de Capital...' => 0.4]
        $savedBenchmarks = BenchmarkSector::where('tipo_empresa_id', $tipo_empresa_id)
            ->pluck('valorReferencia', 'nombreRatio');

        $results = collect();

        // 2. Mapeamos los valores guardados a la 'key' del ratio que espera el análisis.
        //    Asumimos que el 'key' (1, 2, 3...) corresponde al índice (0, 1, 2...)
        foreach ($listaDeRatiosReact as $index => $longName) {
            
            // Buscamos el valor guardado (ej: 1.5) usando el nombre largo
            $valor = $savedBenchmarks->get($longName);

            // Si existe un valor para ese ratio...
            if ($valor !== null) {
                // ...lo agregamos a los resultados usando la 'key' numérica
                $results->push([
                    'key'          => (string)($index + 1), // Mapea índice 0 -> key '1', índice 1 -> key '2'
                    'valor_sector' => (float)$valor,
                ]);
            }
        }
        
        // 3. Devolvemos la colección (ej: [{'key': '1', 'valor_sector': 1.5}, ...])
        return $results;
    }

    // --- FUNCIONES API (AÑADIDAS AL FINAL) ---

    public function getPeriodosPorEmpresa(Request $request, Empresa $empresa)
    {
        $periodos = $this->fetchPeriodosDisponibles($empresa->id);
        return response()->json($periodos);
    }

    private function fetchPeriodosDisponibles(?int $empresaId): Collection
    {
        if (!$empresaId) {
            return collect();
        }

        return EstadoFinanciero::where('empresa_id', $empresaId)
            ->selectRaw('YEAR(periodo) as anio')
            ->distinct()
            ->orderBy('anio', 'desc')
            ->pluck('anio');
    }

    public function getComparativoSectorial(Request $request)
    {
        $request->validate([
            'tipo_empresa_id' => 'required|exists:tipo_empresas,id',
            'periodo' => 'required|integer',
        ]);

        $tipoEmpresaId = $request->tipo_empresa_id;
        $periodo = $request->periodo;

        $empresasDelSectorIds = Empresa::where('tipo_empresa_id', $tipoEmpresaId)->pluck('id');

        $estadoIds = EstadoFinanciero::whereIn('empresa_id', $empresasDelSectorIds)
                            ->whereYear('periodo', $periodo)
                            ->pluck('id');

        $resultadosSector = ResultadoRatio::whereIn('estado_financiero_id', $estadoIds)
                            ->with('ratio', 'estadoFinanciero.empresa')
                            ->get();

        $datosAgrupados = [];
        foreach ($resultadosSector as $resultado) {
            $ratioKey = $resultado->ratio->key;
            $empresaNombre = $resultado->estadoFinanciero->empresa->nombre;
            $empresaId = $resultado->estadoFinanciero->empresa->id;

            if (!isset($datosAgrupados[$ratioKey])) {
                $datosAgrupados[$ratioKey] = [];
            }

            $datosAgrupados[$ratioKey][] = [
                'empresaId' => $empresaId,
                'nombre' => $empresaNombre,
                'valor' => (float) $resultado->valor_calculado,
            ];
        }

        return response()->json($datosAgrupados);
    }
}