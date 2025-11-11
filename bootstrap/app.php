<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpException;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
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
        $render403 = function (string $message, Request $request) {
            return Inertia::render('Errors/403', [
                'title' => 'Acceso restringido',
                'message' => $message ?: 'Necesitas permisos de administrador para esta sección.',
            ])->toResponse($request)->setStatusCode(403);
        };

        $exceptions->render(function (AuthorizationException $e, Request $request) use ($render403) {
            return $render403($e->getMessage(), $request);
        });

        $exceptions->render(function (HttpException $e, Request $request) use ($render403) {
            if ($e->getStatusCode() !== 403)
                return null;
            return $render403($e->getMessage(), $request);
        });
    })
    ->withProviders([
        App\Providers\AuthServiceProvider::class,
    ])
    ->create();

