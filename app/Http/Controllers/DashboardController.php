<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\EstadoFinanciero;
use App\Models\TipoEmpresa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Muestra el dashboard principal con estadísticas y actividad.
     */
    public function index()
    {
        // --- Zona 1: Vistazo Rápido (Stats) ---
        $totalEmpresas = Empresa::count();
        $totalAnalisis = EstadoFinanciero::count(); // Usamos esto como "análisis"
        $totalSectores = TipoEmpresa::count();
        $ultimoPeriodo = EstadoFinanciero::max('periodo');

        // --- Zona 2: Datos para "Tarjetas Inteligentes" ---
        $ultimoAnalisis = EstadoFinanciero::with('empresa')
                                ->latest('updated_at')
                                ->first();

        // --- Zona 3: Actividad Reciente (Simulada por ahora) ---
        // Una implementación real requeriría una tabla de 'actividades' o 'logs'.
        // Por ahora, pasamos los 5 últimos estados financieros como "actividad".
        $actividadReciente = EstadoFinanciero::with('empresa')
                                ->latest('created_at')
                                ->take(5)
                                ->get()
                                ->map(function ($ef) {
                                    return [
                                        'id' => $ef->id,
                                        'tipo' => 'Importación', // Asumimos que son importaciones
                                        'descripcion' => 'Se importó el periodo ' . $ef->periodo->format('Y') . ' para',
                                        'empresa_nombre' => $ef->empresa->nombre ?? 'Empresa Desconocida',
                                        'fecha' => $ef->created_at->diffForHumans()
                                    ];
                                });

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalEmpresas' => $totalEmpresas,
                'totalAnalisis' => $totalAnalisis,
                'totalSectores' => $totalSectores,
                'ultimoPeriodo' => $ultimoPeriodo ? (new \Carbon\Carbon($ultimoPeriodo))->format('Y') : 'N/A',
            ],
            'ultimoAnalisis' => $ultimoAnalisis ? [
                'empresa_nombre' => $ultimoAnalisis->empresa->nombre ?? 'N/A',
                'periodo' => $ultimoAnalisis->periodo->format('Y')
            ] : null,
            'actividadReciente' => $actividadReciente,
        ]);
    }
}