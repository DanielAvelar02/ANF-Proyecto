<?php

use App\Http\Controllers\AuthController; // Controlador de autenticación - Avelar
use App\Http\Controllers\ProyeccionesController;
use App\Http\Controllers\TipoEmpresaController; // Controlador de Tipos de Empresa
use App\Http\Controllers\EmpresaController; // Controlador de Empresas
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect('/login'));

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // Limita a 5 intentos por minuto
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn () => inertia('Dashboard/Index'))->name('dashboard');

    // Rutas para Proyecciones
    Route::get('/proyecciones', [ProyeccionesController::class, 'index'])->name('proyecciones.index');
    Route::post('/proyecciones/calcular', [ProyeccionesController::class, 'calcular'])->name('proyecciones.calcular');
    Route::post('/proyecciones/importar-excel', [ProyeccionesController::class, 'importarExcel'])->name('proyecciones.importar');

    //Rutas Ratios
    Route::resource('/tipos-empresa', TipoEmpresaController::class);
    Route::resource('/empresas', EmpresaController::class);

});
