<?php

use App\Http\Controllers\AuthController; // Controlador de autenticación - Avelar
use App\Http\Controllers\ProyeccionesController;
use App\Http\Controllers\TipoEmpresaController; // Controlador de Tipos de Empresa
use App\Http\Controllers\EmpresaController; // Controlador de Empresas
use App\Http\Controllers\EstadoFinancieroController; // Controlador de Estados Financieros
use App\Http\Controllers\AnalisisRatiosController; // Controlador de Análisis de Ratios
use App\Http\Controllers\CatalogoCuentaController;
use App\Http\Controllers\AnalisisHorizontalController; // Controlador de Análisis Horizontal
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use function Psy\sh;

Route::get('/', fn() => redirect('/login'));

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // Limita a 5 intentos por minuto
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn() => inertia('Dashboard/Index'))->name('dashboard');

    // Rutas para Proyecciones
    Route::get('/proyecciones', [ProyeccionesController::class, 'index'])->name('proyecciones.index');
    Route::post('/proyecciones/calcular', [ProyeccionesController::class, 'calcular'])->name('proyecciones.calcular');
    Route::post('/proyecciones/importar-excel', [ProyeccionesController::class, 'importarExcel'])->name('proyecciones.importar');

    //Rutas Ratios
    Route::resource('empresas.catalogo-cuentas', CatalogoCuentaController::class)
        ->shallow()
        ->only(['store', 'update', 'destroy']);
    Route::get('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'index'])->name('empresas.estados-financieros.index');
    // 1. Para descargar la plantilla de Excel
    Route::get('/empresas/{empresa}/plantilla-excel', [EstadoFinancieroController::class, 'descargarPlantilla'])->name('empresas.plantilla-excel.download');
    // 2. Para recibir el archivo Excel subido
    Route::post('/empresas/{empresa}/estados-financieros/importar', [EstadoFinancieroController::class, 'importarExcel'])->name('empresas.estados-financieros.importar');

    Route::post('/empresas/{empresa}/estados-financieros', [EstadoFinancieroController::class, 'store'])->name('empresas.estados-financieros.store');
    Route::resource('/estados-financieros', EstadoFinancieroController::class)->except(['index'])->parameters(['estados-financieros' => 'estadoFinanciero']); // Excluimos index para no chocar con la ruta de arriba

    //Rutas gestión Empresas
    Route::resource('/empresas', EmpresaController::class);
    Route::resource('/tipos-empresa', TipoEmpresaController::class)->parameters(['tipos-empresa' => 'tipoEmpresa'])->except(['create', 'edit', 'show']);

    Route::get('/analisis-ratios', [AnalisisRatiosController::class, 'index'])->name('analisis-ratios.index');

    //Rutas Análisis Horizontal
    Route::get('/analisis-horizontal', [AnalisisHorizontalController::class, 'index'])
        ->name('analisis.horizontal.index');

    // Años disponibles para la empresa elegida
    Route::get('/analisis-horizontal/anios', [AnalisisHorizontalController::class, 'aniosPorEmpresa'])
        ->name('analisis.horizontal.anios');

    // Datos (todas las cuentas de la empresa en el rango de años)
    Route::get('/analisis-horizontal/datos', [AnalisisHorizontalController::class, 'datos'])
        ->name('analisis.horizontal.datos');
});
