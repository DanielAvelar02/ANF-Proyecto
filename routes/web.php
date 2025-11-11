<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProyeccionesController;
use App\Http\Controllers\TipoEmpresaController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EstadoFinancieroController;
use App\Http\Controllers\AnalisisRatiosController;
use App\Http\Controllers\CatalogoCuentaController;
use App\Http\Controllers\AnalisisHorizontalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect('/login'));

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');


// --- Rutas Protegidas ---
Route::middleware('auth')->group(function () {
    
    Route::get('/dashboard', fn() => inertia('Dashboard/Index'))->name('dashboard');

    // --- Rutas de Proyecciones (Accesibles para todos los autenticados) ---
    Route::get('/proyecciones', [ProyeccionesController::class, 'index'])->name('proyecciones.index');
    Route::post('/proyecciones/calcular', [ProyeccionesController::class, 'calcular'])->name('proyecciones.calcular');
    Route::post('/proyecciones/importar-excel', [ProyeccionesController::class, 'importarExcel'])->name('proyecciones.importar');

    // --- Rutas de Análisis (Accesibles para todos los autenticados) ---
    Route::get('/analisis-ratios', [AnalisisRatiosController::class, 'index'])->name('analisis-ratios.index');
    Route::get('/analisis-horizontal', [AnalisisHorizontalController::class, 'index'])->name('analisis.horizontal.index');
    Route::get('/analisis-horizontal/anios', [AnalisisHorizontalController::class, 'aniosPorEmpresa'])->name('analisis.horizontal.anios');
    Route::get('/analisis-horizontal/datos', [AnalisisHorizontalController::class, 'datos'])->name('analisis.horizontal.datos');

    // ---      RUTAS SOLO PARA ADMIN      ---

    // --- Gestión de Empresas ---
    Route::resource('/empresas', EmpresaController::class)
        ->middleware('can:admin-only');

    // --- Gestión de Tipos de Empresa ---
    Route::resource('/tipos-empresa', TipoEmpresaController::class)
        ->parameters(['tipos-empresa' => 'tipoEmpresa'])
        ->except(['create', 'edit', 'show'])
        ->middleware('can:admin-only');

    // --- Gestión de Catálogo de Cuentas (para el modal) ---
    Route::resource('empresas.catalogo-cuentas', CatalogoCuentaController::class)
        ->shallow()
        ->only(['store', 'update', 'destroy'])
        ->middleware('can:admin-only');

    // --- Gestión de Estados Financieros ---
    
    // Página principal de estados financieros de una empresa
    Route::get('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'index'])
        ->name('empresas.estados-financieros.index')
        ->middleware('can:admin-only');

    // Descargar plantilla Excel
    Route::get('/empresas/{empresa}/plantilla-excel', [EstadoFinancieroController::class, 'descargarPlantilla'])
        ->name('empresas.plantilla-excel.download')
        ->middleware('can:admin-only');
    
    // Importar desde Excel
    Route::post('/empresas/{empresa}/estados-financieros/importar', [EstadoFinancieroController::class, 'importarExcel'])
        ->name('empresas.estados-financieros.importar')
        ->middleware('can:admin-only');

    // Guardar estado financiero manualmente
    Route::post('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'store'])
        ->name('empresas.estados-financieros.store')
        ->middleware('can:admin-only');

    // Rutas para ver, editar, actualizar y eliminar estados financieros individuales
    // (show, edit, update, destroy)
    Route::resource('/estados-financieros', EstadoFinancieroController::class)
        ->except(['index', 'create', 'store']) // Excluimos las que ya definimos arriba
        ->parameters(['estados-financieros' => 'estadoFinanciero'])
        ->middleware('can:admin-only');

});