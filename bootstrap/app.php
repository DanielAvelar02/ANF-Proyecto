<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias opcionales tuyos
        $middleware->alias([
            // Asegura que el usuario esté autenticado mediante la sesión
            'session.auth' => \App\Http\Middleware\EnsureSessionAuth::class, // si la clase existe
        ]);

        // 👇 Muy importante: agrega el middleware de Inertia al grupo web
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class, // opcional y recomendado
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withProviders([
        App\Providers\AuthServiceProvider::class,
    ])
    ->create();
