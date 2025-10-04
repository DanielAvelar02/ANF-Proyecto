<?php
namespace App\Http\Middleware;
use Closure;

class EnsureSessionAuth {
  public function handle($request, Closure $next) {
    if (!session()->has('uid')) return redirect('/login');
    return $next($request);
  }
}
