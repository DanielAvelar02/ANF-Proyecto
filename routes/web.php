<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProyeccionesController;
use App\Http\Controllers\TipoEmpresaController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EstadoFinancieroController;
use App\Http\Controllers\BenchmarkSectorController;
use App\Http\Controllers\AnalisisRatiosController;
use App\Http\Controllers\CatalogoCuentaController;
use App\Http\Controllers\AnalisisHorizontalController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect('/login'));

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

// --- Rutas Protegidas ---
Route::middleware('auth')->group(function () {

    Route::get('/dashboard', fn() => inertia('Dashboard/Index'))->name('dashboard');

    // --- Proyecciones (todos los autenticados) ---
    Route::get('/proyecciones', [ProyeccionesController::class, 'index'])->name('proyecciones.index');
    Route::post('/proyecciones/calcular', [ProyeccionesController::class, 'calcular'])->name('proyecciones.calcular');
    Route::post('/proyecciones/importar-excel', [ProyeccionesController::class, 'importarExcel'])->name('proyecciones.importar');

    // --- Análisis Ratios (todos los autenticados) ---
    Route::get('/analisis-ratios', [AnalisisRatiosController::class, 'index'])->name('analisis-ratios.index');
    Route::get('/api/analisis-ratios/data', [AnalisisRatiosController::class, 'getAnalysisDataApi'])->name('api.analisis.ratios.data');
    Route::post('/analisis-ratios/recalcular', [AnalisisRatiosController::class, 'recalcularRatios'])->name('analisis-ratios.recalcular');
    Route::get('/api/empresas/{empresa}/periodos', [AnalisisRatiosController::class, 'getPeriodosPorEmpresa'])->name('api.empresas.periodos');
    Route::get('/api/analisis-ratios/comparativo-sectorial', [AnalisisRatiosController::class, 'getComparativoSectorial'])->name('api.analisis.comparativo-sectorial');

    // --- Análisis Horizontal (todos los autenticados) ---
    Route::get('/analisis-horizontal', [AnalisisHorizontalController::class, 'index'])->name('analisis.horizontal.index');
    Route::get('/analisis-horizontal/anios', [AnalisisHorizontalController::class, 'aniosPorEmpresa'])->name('analisis.horizontal.anios');
    Route::get('/analisis-horizontal/datos', [AnalisisHorizontalController::class, 'datos'])->name('analisis.horizontal.datos');

    // --- Benchmarks Sector (decide tú si quieres solo admin, por ahora todos autenticados) ---
    Route::get('/tipos-empresa/{tipo_empresa}/benchmarks', [BenchmarkSectorController::class, 'index'])
        ->name('tipos-empresa.benchmarks.index');
    Route::post('/tipos-empresa/{tipo_empresa}/benchmarks', [BenchmarkSectorController::class, 'store'])
        ->name('tipos-empresa.benchmarks.store');

    // ===================== SOLO ADMIN (por nombre) =====================
    Route::middleware('can:admin-only')->group(function () {

        // Gestión de Empresas
        Route::resource('/empresas', EmpresaController::class);

        // Tipos de Empresa
        Route::resource('/tipos-empresa', TipoEmpresaController::class)
            ->parameters(['tipos-empresa' => 'tipoEmpresa'])
            ->except(['create', 'edit', 'show']);

        // Catálogo de Cuentas anidado
        Route::resource('empresas.catalogo-cuentas', CatalogoCuentaController::class)
            ->shallow()
            ->only(['store', 'update', 'destroy']);

        // Estados Financieros (todas las operaciones protegidas)
        Route::get('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'index'])
            ->name('empresas.estados-financieros.index');

        Route::get('/empresas/{empresa}/plantilla-excel', [EstadoFinancieroController::class, 'descargarPlantilla'])
            ->name('empresas.plantilla-excel.download');

        Route::post('/empresas/{empresa}/estados-financieros/importar', [EstadoFinancieroController::class, 'importarExcel'])
            ->name('empresas.estados-financieros.importar');

        Route::post('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'store'])
            ->name('empresas.estados-financieros.store');

        Route::resource('/estados-financieros', EstadoFinancieroController::class)
            ->except(['index'])
            ->parameters(['estados-financieros' => 'estadoFinanciero']);
    });
    // =================================================
});
