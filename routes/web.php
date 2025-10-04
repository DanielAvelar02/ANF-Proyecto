<?php

use App\Http\Controllers\AuthController;

Route::get('/', fn() => redirect('/login'));

Route::get('/login', [AuthController::class,'showLogin'])->name('login');
Route::post('/login', [AuthController::class,'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class,'logout'])->middleware('session.auth');

Route::middleware('session.auth')->group(function () {
  Route::get('/dashboard', fn() => inertia('Dashboard/Index'));
});

