<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalisisRatiosController extends Controller
{
    public function index()
    {
        // Le decimos a Inertia que renderice nuestro futuro componente de React.
        return Inertia::render('AnalisisRatios/Index');
    }
}