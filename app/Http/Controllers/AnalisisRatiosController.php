<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Empresa;
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

    public function index(Request $request)
    {
        $empresas = Empresa::select('id', 'nombre')->get();
        $periodos = [
            Carbon::now()->year, 
            Carbon::now()->subYear()->year, 
            Carbon::now()->subYears(2)->year
        ];
        $ratioDefinitions = $this->getRatioDefinitions();

        $selectedEmpresaId = $empresas->first()->id ?? null;
        $periodoA = Carbon::now()->year;

        // Si no hay empresas, evitamos llamar a getAnalysisData con null
        if (!$selectedEmpresaId) {
             return Inertia::render('AnalisisRatios/Index', [
                'empresas' => $empresas,
                'periodosDisponibles' => $periodos,
                'ratioDefinitions' => $ratioDefinitions,
                'initialRatiosHorizontal' => [],
                'initialRatiosSectorial' => [],
                'initialGraficos' => [],
            ]);
        }
        
        $dataProps = $this->getAnalysisData($selectedEmpresaId, $periodoA);

        return Inertia::render('AnalisisRatios/Index', [
            'empresas' => $empresas,
            'periodosDisponibles' => $periodos,
            'ratioDefinitions' => $ratioDefinitions,
            'initialRatiosHorizontal' => $dataProps['ratiosHorizontal'],
            'initialRatiosSectorial' => $dataProps['ratiosSectorial'],
            'initialGraficos' => $dataProps['graficosEvolucion'],
        ]);
    }
    
    public function getAnalysisDataApi(Request $request)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'periodo' => 'required|integer',
        ]);
        
        $empresaId = $request->integer('empresa_id');
        $periodoA = $request->integer('periodo');

        $dataProps = $this->getAnalysisData($empresaId, $periodoA);

        return response()->json($dataProps);
    }

    /**
     * Lógica principal (Usando el Extractor Corregido)
     */
    protected function getAnalysisData(int $empresaId, int $periodoA): array
    {
        $periodoB = $periodoA - 1;
        $periodoC = $periodoA - 2;
        
        // 🛑🛑 CAMBIO 1: Añadimos el Período D (2022) 🛑🛑
        $periodoD = $periodoA - 3;

        // 1. Extracción de Montos
        $montosA = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodoA); // 2025
        $montosB = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodoB); // 2024
        $montosC = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodoC); // 2023
        
        // 🛑🛑 CAMBIO 2: Extraemos los montos de 2022 🛑🛑
        $montosD = $this->dataExtractor->getMontosPorPeriodo($empresaId, $periodoD); // 2022
        
        
        // 2. Cálculo de Promedios
        $promediosA = $this->calcularPromedios($montosA, $montosB); // Promedio para 2025
        $promediosB = $this->calcularPromedios($montosB, $montosC); // Promedio para 2024
        
        // 🛑🛑 CAMBIO 3: Calculamos los promedios para 2023 🛑🛑
        $promediosC = $this->calcularPromedios($montosC, $montosD); // Promedio para 2023


        // 3. Cálculo de Ratios
        $ratiosA = $this->ratioService->calcularTodosLosRatios($montosA, $promediosA); // Ratios 2025
        $ratiosB = $this->ratioService->calcularTodosLosRatios($montosB, $promediosB); // Ratios 2024
        
        // 🛑🛑 CAMBIO 4: Calculamos los ratios para 2023 🛑🛑
        $ratiosC = $this->ratioService->calcularTodosLosRatios($montosC, $promediosC); // Ratios 2023

        // 4. Preparación de Datos (Estructura anidada)
        $horizontalDataArray = $this->prepareHorizontalData($ratiosA, $ratiosB, $periodoA, $periodoB);

        return [
            'ratiosHorizontal' => [
                $empresaId => [
                    $periodoA => $horizontalDataArray
                ]
            ],
            'ratiosSectorial' => $this->prepareSectorialData($ratiosA),
            
            // 🛑🛑 CAMBIO 5: Pasamos los 3 años de ratios reales a la función de gráficos 🛑🛑
            'graficosEvolucion' => $this->prepareGraficosData($ratiosA, $ratiosB, $ratiosC, $periodoA, $periodoB, $periodoC),
        ];
    }
    
    /**
     * Calcula los promedios de Activo, Cuentas por Cobrar/Pagar, usando dos periodos.
     * @param array $montosActual Montos del periodo A (ej: 2025)
     * @param array $montosAnterior Montos del periodo B (ej: 2024)
     * @return array Los promedios calculados.
     */
    protected function calcularPromedios(array $montosActual, array $montosAnterior): array
    {
        // Esta función ya es correcta
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
     * Prepara los datos para la tabla de análisis horizontal (Pestaña 1)
     */
    protected function prepareHorizontalData(array $ratiosA, array $ratiosB, int $periodoA, int $periodoB): array
    {
        $data = [];
        $benchmarkRatios = $this->getBenchmarkRatios(); 

        foreach ($ratiosA as $i => $ratioA) {
            $ratioB = $ratiosB[$i] ?? ['valor' => 0.0];
            $valorA = round($ratioA['valor'], 3);
            $valorB = round($ratioB['valor'], 3);
            $variacion = ($valorB != 0) ? (($valorA - $valorB) / abs($valorB)) * 100 : null;

            $benchmark = collect($benchmarkRatios)->firstWhere('key', $ratioA['key']);
            $valorSector = $benchmark['valor_sector'] ?? 0.0;

            $data[] = [
                'key' => $ratioA['key'], 'nombre' => $ratioA['nombre'], 'formula' => $ratioA['formula'],
                'valor_A' => $valorA, 'valor_B' => $valorB,
                'variacion' => is_null($variacion) ? null : round($variacion, 2),
                'tendencia' => $variacion <=> 0, 'periodoA' => $periodoA, 'periodoB' => $periodoB,
                'ratioSector' => $valorSector,
            ];
        }
        return $data;
    }

    protected function prepareSectorialData(array $ratiosA): array
    {
        $benchmark = $this->getBenchmarkRatios();
        $data = [];

        foreach ($ratiosA as $i => $ratioA) {
            $valorA = round($ratioA['valor'], 3);
            $data[$ratioA['key']][] = [ 'empresaId' => 1, 'nombre' => 'Empresa Actual (Simulación)', 'valor' => $valorA];
        }
        return $data;
    }
    
    /**
     * 🛑🛑 CAMBIO 6: Función de gráficos actualizada 🛑🛑
     * Ahora acepta $ratiosC y usa los 3 años de datos reales.
     */
    protected function prepareGraficosData(array $ratiosA, array $ratiosB, array $ratiosC, int $periodoA, int $periodoB, int $periodoC): array
    {
        $ratiosEvolution = [];
        // Nombres de los ratios que SÍ existen en las nuevas definiciones
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
            
            // 🛑🛑 CAMBIO 7: Buscamos el ratio real de 2023 🛑🛑
            $targetRatioC = collect($ratiosC)->firstWhere('nombre', $ratioNombre);
            
            $valorA = $targetRatioA['valor'] ?? 0.0;
            $valorB = $targetRatioB['valor'] ?? 0.0;
            
            // 🛑🛑 CAMBIO 8: Usamos el valor real en lugar de la simulación 🛑🛑
            $valorC = $targetRatioC['valor'] ?? 0.0; 
            
            $ratiosEvolution[$ratioNombre] = [
                ['anio' => $periodoC, 'valor' => round($valorC, 2)], // 2023
                ['anio' => $periodoB, 'valor' => round($valorB, 2)], // 2024
                ['anio' => $periodoA, 'valor' => round($valorA, 2)], // 2025
            ];
        }
        return $ratiosEvolution;
    }

    /**
     * Definiciones de Ratios (Sin cambios)
     */
    protected function getRatioDefinitions(): array
    {
        return [
            ['key' => '1', 'nombre' => 'Razón Circulante', 
             'formula' => 'Activos Corrientes / Pasivos Corrientes'],
            ['key' => '2', 'nombre' => 'Capital de Trabajo a Activos Totales', 
             'formula' => '(Activo Cte. - Pasivo Cte.) / Activos Totales'],
            ['key' => '3', 'nombre' => 'Rotación Cuentas por Cobrar', 
             'formula' => 'Ventas Netas / Cuentas por Cobrar Promedio'],
            ['key' => '4', 'nombre' => 'Periodo Medio de Cobro (días)', 
             'formula' => '(Prom. Cuentas Cobrar * 360) / Ventas Netas'],
            ['key' => '5', 'nombre' => 'Rotación Cuentas por Pagar', 
             'formula' => 'Compras / Cuentas por Pagar Promedio'],
            ['key' => '6', 'nombre' => 'Periodo Medio de Pago (días)', 
             'formula' => '(Prom. Cuentas Pagar * 360) / Compras'],
            ['key' => '7', 'nombre' => 'Rotación de Activos Totales', 
             'formula' => 'Ventas Netas / Activo Total Promedio'],
            ['key' => '8', 'nombre' => 'Rotación de Activos Fijos', 
             'formula' => 'Ventas Netas / Activo Fijo Neto Promedio'],
            ['key' => '9', 'nombre' => 'Grado de Endeudamiento', 
             'formula' => 'Pasivo Total / Activo Total'],
            ['key' => '10', 'nombre' => 'Grado de Propiedad', 
             'formula' => 'Patrimonio / Activo Total'],
        ];
    }
    
    /**
     * Benchmarks (Sin cambios)
     */
    protected function getBenchmarkRatios(): array
    {
        return [
            ['key' => '1', 'valor_sector' => 1.5], // Razón Circulante
            ['key' => '2', 'valor_sector' => 0.4], // Capital de Trabajo (NUEVO)
            ['key' => '3', 'valor_sector' => 7.0], // Rot. Cuentas Cobrar
            ['key' => '4', 'valor_sector' => 51.4], // Periodo Cobro
            ['key' => '5', 'valor_sector' => 5.0], // Rot. Cuentas Pagar
            ['key' => '6', 'valor_sector' => 72.0], // Periodo Pago
            ['key' => '7', 'valor_sector' => 1.2], // Rot. Activos Totales
            ['key' => '8', 'valor_sector' => 2.5], // Rot. Activos Fijos
            ['key' => '9', 'valor_sector' => 0.6], // Endeudamiento
            ['key' => '10', 'valor_sector' => 0.4], // Grado Propiedad (NUEVO)
        ];
    }
}