<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProyeccionesController;
use App\Http\Controllers\TipoEmpresaController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EstadoFinancieroController;
use App\Http\Controllers\BenchmarkSectorController;
use App\Http\Controllers\AnalisisRatiosController; // Asegúrate de que este 'use' esté
use App\Http\Controllers\CatalogoCuentaController;
use App\Http\Controllers\AnalisisHorizontalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect('/login'));

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn() => inertia('Dashboard/Index'))->name('dashboard');

    // Rutas para Proyecciones
    Route::get('/proyecciones', [ProyeccionesController::class, 'index'])->name('proyecciones.index');
    Route::post('/proyecciones/calcular', [ProyeccionesController::class, 'calcular'])->name('proyecciones.calcular');
    Route::post('/proyecciones/importar-excel', [ProyeccionesController::class, 'importarExcel'])->name('proyecciones.importar');

    // Rutas para Estados Financieros y Catálogo
    Route::resource('empresas.catalogo-cuentas', CatalogoCuentaController::class)
        ->shallow()
        ->only(['store', 'update', 'destroy']);
    Route::get('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'index'])->name('empresas.estados-financieros.index');
    Route::get('/empresas/{empresa}/plantilla-excel', [EstadoFinancieroController::class, 'descargarPlantilla'])->name('empresas.plantilla-excel.download');
    Route::post('/empresas/{empresa}/estados-financieros/importar', [EstadoFinancieroController::class, 'importarExcel'])->name('empresas.estados-financieros.importar');
    Route::post('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'store'])->name('empresas.estados-financieros.store');
    Route::resource('/estados-financieros', EstadoFinancieroController::class)->except(['index'])->parameters(['estados-financieros' => 'estadoFinanciero']);

    // Rutas gestión Empresas
    Route::resource('/empresas', EmpresaController::class);
    Route::resource('/tipos-empresa', TipoEmpresaController::class)->parameters(['tipos-empresa' => 'tipoEmpresa'])->except(['create', 'edit', 'show']);

    // --- RUTAS PARA ANÁLISIS DE RATIOS ---

    // 1. Ruta para la carga inicial de la página
    Route::get('/analisis-ratios', [AnalisisRatiosController::class, 'index'])->name('analisis-ratios.index');

    // 2. Ruta API para Pestaña 1 (Horizontal)
    Route::get('/api/analisis-ratios/data', [AnalisisRatiosController::class, 'getAnalysisDataApi'])->name('api.analisis.ratios.data');

    // 3. Ruta para forzar el recálculo de ratios
    Route::post('/analisis-ratios/recalcular', [AnalisisRatiosController::class, 'recalcularRatios'])->name('analisis-ratios.recalcular');

    // 4. Ruta API para obtener los periodos/años de una empresa específica
    Route::get('/api/empresas/{empresa}/periodos', [AnalisisRatiosController::class, 'getPeriodosPorEmpresa'])->name('api.empresas.periodos');

    // 5. 🛑 RUTA NUEVA AÑADIDA 🛑
    // Para la Pestaña 2 (Análisis Comparativo Sectorial)
    Route::get('/api/analisis-ratios/comparativo-sectorial', [AnalisisRatiosController::class, 'getComparativoSectorial'])->name('api.analisis.comparativo-sectorial');

    // Rutas Benchmark Sector
Route::get('/tipos-empresa/{tipo_empresa}/benchmarks', [BenchmarkSectorController::class, 'index'])
     ->name('tipos-empresa.benchmarks.index');

// POST: Guardar (crear/actualizar) los benchmarks para un TipoEmpresa
Route::post('/tipos-empresa/{tipo_empresa}/benchmarks', [BenchmarkSectorController::class, 'store'])
     ->name('tipos-empresa.benchmarks.store');

    // Rutas Análisis Horizontal
    Route::get('/analisis-horizontal', [AnalisisHorizontalController::class, 'index'])
        ->name('analisis.horizontal.index');
    Route::get('/analisis-horizontal/anios', [AnalisisHorizontalController::class, 'aniosPorEmpresa'])
        ->name('analisis.horizontal.anios');
    Route::get('/analisis-horizontal/datos', [AnalisisHorizontalController::class, 'datos'])
        ->name('analisis.horizontal.datos');
});