<?php

namespace App\Http\Controllers;

use App\Models\EstadoFinanciero;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstadoFinancieroController extends Controller
{
    /**
     * Muestra la lista de estados financieros para una empresa específica.
     */
    public function index(Empresa $empresa)
    {
        // Esta es la lógica que antes estaba en EmpresaController.
        // Ahora está en su lugar correcto.
        return Inertia::render('EstadosFinancieros/Index', [
            'empresa' => $empresa
        ]);
    }

    // Muestra los detalles de un único estado financiero.
    public function show(EstadoFinanciero $estadoFinanciero)
    {
        // Más adelante, aquí cargaremos los detalles de la base de datos.
        // Por ahora, solo renderizamos la vista y le pasamos el estado financiero.
        return Inertia::render('EstadosFinancieros/Show', [
            'estadoFinanciero' => $estadoFinanciero
        ]);
    }

    //Aca ira el metodo para importar el excel xd
}