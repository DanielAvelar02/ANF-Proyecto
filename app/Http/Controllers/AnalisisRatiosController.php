<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Empresa;
use App\Models\EstadoFinanciero;
use App\Models\Ratio;
use App\Models\ResultadoRatio;
use App\Models\TipoEmpresa;      // 🛑 1. IMPORTAR TipoEmpresa
use App\Services\RatioService;
use App\Services\DataExtractorService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AnalisisRatiosController extends Controller
{
    protected $ratioService;
    protected $dataExtractor;

    public function __construct(RatioService $ratioService, DataExtractorService $dataExtractor)
    {
        $this->ratioService = $ratioService;
        $this->dataExtractor = $dataExtractor;
    }

    /**
     * 🛑 CAMBIO: index()
     * Ahora carga los periodos dinámicamente y también la lista de Tipos de Empresa.
     */
    public function index(Request $request)
    {
        $empresas = Empresa::select('id', 'nombre')->get();
        $selectedEmpresaId = $empresas->first()->id ?? null;

        // Carga los periodos de la empresa seleccionada
        $periodos = $this->fetchPeriodosDisponibles($selectedEmpresaId);
        
        // Carga todas las definiciones de ratios
        $ratioDefinitions = Ratio::all()->map(fn($r) => [
            'key' => $r->key,
            'nombre' => $r->nombre_ratio,
            'formula' => $r->formula,
            'categoria' => $r->categoria
        ]);
        
        // 🛑 2. Carga todos los Tipos de Empresa (Sectores)
        $tiposEmpresa = TipoEmpresa::select('id', 'nombre')->get();

        $periodoA = $periodos[0] ?? Carbon::now()->year;
        $periodoB = $periodos[1] ?? Carbon::now()->year - 1;

        if (!$selectedEmpresaId) {
             return Inertia::render('AnalisisRatios/Index', [
                'empresas' => $empresas,
                'periodosDisponibles' => $periodos,
                'ratioDefinitions' => $ratioDefinitions,
                'tiposEmpresa' => $tiposEmpresa, // 🛑 3. Enviar al frontend
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
            'tiposEmpresa' => $tiposEmpresa, // 🛑 3. Enviar al frontend
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
     * 🛑 CAMBIO: getAnalysisData
     * Ya no calcula 'ratiosSectorial', ahora lo devuelve vacío.
     */
    protected function getAnalysisData(int $empresaId, int $periodoA, int $periodoB): array
    {
        // Años para la Pestaña 1 (Horizontal)
        $ratiosA_horizontal = $this->obtenerOcalcularRatios($empresaId, $periodoA);
        $ratiosB_horizontal = $this->obtenerOcalcularRatios($empresaId, $periodoB);

        // Años para la Pestaña 3 (Gráficos)
        $periodoGraficoB = $periodoA - 1;
        $periodoGraficoC = $periodoA - 2;
        $ratiosB_grafico = $this->obtenerOcalcularRatios($empresaId, $periodoGraficoB);
        $ratiosC_grafico = $this->obtenerOcalcularRatios($empresaId, $periodoGraficoC);

        // Preparar datos
        $horizontalDataArray = $this->prepareHorizontalData($ratiosA_horizontal, $ratiosB_horizontal, $periodoA, $periodoB);

        return [
            'ratiosHorizontal' => [
                $empresaId => [
                    $periodoA => $horizontalDataArray
                ]
            ],
            // 🛑 4. 'ratiosSectorial' AHORA ESTÁ VACÍO. Se cargará por su propia API.
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

    protected function prepareHorizontalData(array $ratiosA, array $ratiosB, int $periodoA, int $periodoB): array
    {
        $data = [];
        $benchmarkRatios = $this->getBenchmarkRatios(); 
        $menorEsMejorKeys = ['4', '6', '9'];

        foreach ($ratiosA as $i => $ratioA) {
            $ratioB = collect($ratiosB)->firstWhere('key', $ratioA['key']) ?? ['valor' => 0.0];
            
            $valorA = round($ratioA['valor'], 3);
            $valorB = round($ratioB['valor'], 3);
            $variacion = ($valorB != 0) ? (($valorA - $valorB) / abs($valorB)) * 100 : null;

            $benchmark = collect($benchmarkRatios)->firstWhere('key', $ratioA['key']);
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
                'ratioSector' => $valorSector,
                'benchmarkResultado' => $cumple,
            ];
        }
        return $data;
    }

    // 🛑 5. prepareSectorialData() YA NO ES NECESARIO AQUÍ.
    protected function prepareSectorialData(int $empresaId, int $periodo): array
    {
         return []; // Ya no se calcula aquí
    }
    
    // ... (prepareGraficosData, getRatioDefinitions, getBenchmarkRatios no cambian) ...

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
    
    protected function getBenchmarkRatios(): array
    {
        return [
            ['key' => '1', 'valor_sector' => 1.5],
            ['key' => '2', 'valor_sector' => 0.4],
            ['key' => '3', 'valor_sector' => 7.0],
            ['key' => '4', 'valor_sector' => 51.4],
            ['key' => '5', 'valor_sector' => 5.0],
            ['key' => '6', 'valor_sector' => 72.0],
            ['key' => '7', 'valor_sector' => 1.2],
            ['key' => '8', 'valor_sector' => 2.5],
            ['key' => '9', 'valor_sector' => 0.6],
            ['key' => '10', 'valor_sector' => 0.4],
        ];
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

    /**
     * 🛑 6. NUEVA FUNCIÓN API PARA LA PESTAÑA 2
     * Devuelve los datos de ratios para un sector y período específicos.
     */
    public function getComparativoSectorial(Request $request)
    {
        $request->validate([
            'tipo_empresa_id' => 'required|exists:tipo_empresas,id',
            'periodo' => 'required|integer',
        ]);

        $tipoEmpresaId = $request->tipo_empresa_id;
        $periodo = $request->periodo;

        // 1. Encontrar todas las empresas de ESE MISMO sector
        $empresasDelSectorIds = Empresa::where('tipo_empresa_id', $tipoEmpresaId)->pluck('id');

        // 2. Encontrar los IDs de los estados financieros para ese sector Y ese período
        $estadoIds = EstadoFinanciero::whereIn('empresa_id', $empresasDelSectorIds)
                        ->whereYear('periodo', $periodo)
                        ->pluck('id');

        // 3. Obtener TODOS los resultados de ratios para esos estados
        $resultadosSector = ResultadoRatio::whereIn('estado_financiero_id', $estadoIds)
                            ->with('ratio', 'estadoFinanciero.empresa') // Carga relaciones
                            ->get();

        // 4. Agrupar los resultados por 'ratio_key' (para el dropdown del frontend)
        $datosAgrupados = [];
        foreach ($resultadosSector as $resultado) {
            if (!$resultado->ratio || !$resultado->estadoFinanciero || !$resultado->estadoFinanciero->empresa) {
                continue; 
            }
            
            $ratioKey = $resultado->ratio->key;
            $datosAgrupados[$ratioKey][] = [
                'empresaId' => $resultado->estadoFinanciero->empresa_id,
                'nombre' => $resultado->estadoFinanciero->empresa->nombre,
                'valor' => (float) $resultado->valor_calculado,
            ];
        }

        return response()->json($datosAgrupados);
    }
}