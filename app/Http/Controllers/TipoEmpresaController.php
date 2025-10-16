<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TipoEmpresaController extends Controller
{
    /**
     * Muestra la lista de los tipos de empresa.
     */
    public function index()
    {
        return Inertia::render('TiposEmpresa/Index');
    }

    /**
     * Muestra el formulario para crear un nuevo tipo de empresa.
     */
    public function create()
    {
        // Se implementará en el futuro.
    }

    /**
     * Guarda un nuevo tipo de empresa en la base de datos.
     */
    public function store(Request $request)
    {
        // Se implementará en el futuro.
    }

    /**
     * Muestra un tipo de empresa específico.
     */
    public function show($id)
    {
        // Se implementará en el futuro.
    }

    /**
     * Muestra el formulario para editar un tipo de empresa.
     */
    public function edit($id)
    {
        // Se implementará en el futuro.
    }

    /**
     * Actualiza un tipo de empresa en la base de datos.
     */
    public function update(Request $request, $id)
    {
        // Se implementará en el futuro.
    }

    /**
     * Elimina un tipo de empresa de la base de datos.
     */
    public function destroy($id)
    {
        // Se implementará en el futuro.
    }
}