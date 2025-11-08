<?php

namespace App\Http\Controllers;

use App\Models\EstadoFinanciero;
use App\Models\Empresa;
use App\Models\DetalleEstado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class EstadoFinancieroController extends Controller
{
    /**
     * Muestra la lista de estados financieros para una empresa específica.
     */
    public function index(Empresa $empresa)
    {
        // Cargamos los estados financieros relacionados con la empresa
        $estadosFinancieros = $empresa->estadosFinancieros()->get()->map(function ($ef) {
            return [
                'id' => $ef->id,
                'periodo' => $ef->periodo->format('Y'), // Formateamos para mostrar solo el año
                'origen' => 'Importado', 
            ];
        });
    $catalogoDeCuentas = $empresa->catalogoCuentas()->orderBy('codigo_cuenta')->get();

    return Inertia::render('EstadosFinancieros/Index', [
        'empresa' => $empresa,
        'estadosFinancieros' => $estadosFinancieros,
        'catalogoDeCuentas' => $catalogoDeCuentas, 
    ]);
    }

    /**
     * Muestra los detalles de un único estado financiero.
     */
    public function show(EstadoFinanciero $estadoFinanciero)
{
    // Eager loading para cargar la empresa y los detalles con sus cuentas asociadas.
    // Esto es muy eficiente y evita múltiples consultas a la base de datos.
    $estadoFinanciero->load('empresa', 'detalles.cuenta');

    // Mapeamos los detalles al formato que el frontend espera.
    $detalles = $estadoFinanciero->detalles->map(function ($detalle) {
        return [
            'id' => $detalle->id,
            'monto' => $detalle->monto,
            // Accedemos a la información de la cuenta a través de la relación
            'codigo_cuenta' => $detalle->cuenta->codigo_cuenta,
            'nombre_cuenta' => $detalle->cuenta->nombre_cuenta,
        ];
    });

    return Inertia::render('EstadosFinancieros/Show', [
        'estadoFinanciero' => $estadoFinanciero,
        'detalles' => $detalles, // ¡Ahora pasamos los datos reales!
    ]);
}
    /**
     * Almacena un nuevo estado financiero y sus detalles desde el formulario manual.
     */
    public function store(Request $request, Empresa $empresa)
    {
        // 1. Validación de los datos que vienen del frontend
        $validated = $request->validate([
            'año' => ['required', 'numeric', 'date_format:Y'],
            'montos' => ['required', 'array'],
            // Validamos cada item dentro del array 'montos'
            'montos.*.catalogo_cuenta_id' => ['required', 'exists:catalogo_cuentas,id'],
            'montos.*.monto' => ['required', 'numeric'],
        ]);

        // 2. Usamos una transacción para asegurar la integridad de los datos
        try {
            DB::transaction(function () use ($validated, $empresa) {
                // 2.1. Creamos el registro principal (EstadoFinanciero)
                $estadoFinanciero = $empresa->estadosFinancieros()->create([
                    'periodo' => Carbon::createFromDate($validated['año'], 1, 1)->startOfYear(),
                ]);

                // 2.2. Recorremos los montos y creamos los registros de detalle
                foreach ($validated['montos'] as $detalleData) {
                    $estadoFinanciero->detalles()->create([
                        'catalogo_cuenta_id' => $detalleData['catalogo_cuenta_id'],
                        'monto' => $detalleData['monto'],
                    ]);
                }
            });
        } catch (\Exception $e) {
            // Si algo falla, redirigimos con un error
            return Redirect::back()->with('error', 'Ocurrió un error al guardar el estado financiero.');
        }

        // 3. Si todo sale bien, redirigimos con un mensaje de éxito
        return Redirect::route('empresas.estados-financieros.index', ['empresa' => $empresa->id])
            ->with('success', 'Estado financiero del año ' . $validated['año'] . ' guardado con éxito.');
    }

    /**
     * Muestra el formulario para editar un estado financiero existente.
     */
    public function edit(EstadoFinanciero $estadoFinanciero)
    {
        // Usamos la misma lógica del método 'show' para cargar los datos.
        $estadoFinanciero->load('empresa', 'detalles.cuenta');

        $detalles = $estadoFinanciero->detalles->map(function ($detalle) {
            return [
                'id' => $detalle->id,
                'monto' => $detalle->monto,
                'codigo_cuenta' => $detalle->cuenta->codigo_cuenta,
                'nombre_cuenta' => $detalle->cuenta->nombre_cuenta,
            ];
        });

        // Renderizamos una NUEVA página de React: 'Edit.jsx'
        return Inertia::render('EstadosFinancieros/Edit', [
            'estadoFinanciero' => $estadoFinanciero,
            'detalles' => $detalles,
        ]);
    }

    /**
     * Actualiza un estado financiero en la base de datos.
     */
    public function update(Request $request, EstadoFinanciero $estadoFinanciero)
    {
        // 1. Validación de los datos que vienen del frontend
        $validated = $request->validate([
            'montos' => ['required', 'array'],
            'montos.*.id' => ['required', 'exists:detalle_estados,id'], // ID del detalle a actualizar
            'montos.*.monto' => ['required', 'numeric'],
        ]);

        // 2. Usamos una transacción para asegurar que todo se guarde correctamente
        try {
            DB::transaction(function () use ($validated) {
                foreach ($validated['montos'] as $detalleData) {
                    // Buscamos cada detalle por su ID y actualizamos solo el monto
                    $detalle = DetalleEstado::find($detalleData['id']);
                    if ($detalle) {
                        $detalle->update(['monto' => $detalleData['monto']]);
                    }
                }
            });
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Ocurrió un error al actualizar los montos.');
        }

        // 3. Redirigimos de vuelta a la página 'show' con un mensaje de éxito.
        return Redirect::route('estados-financieros.show', $estadoFinanciero->id)
            ->with('success', 'Estado financiero actualizado con éxito.');
    }

    /**
     * Elimina un estado financiero.
     */
  public function destroy(EstadoFinanciero $estadoFinanciero)
{
   
        $empresaId = $estadoFinanciero->empresa_id;
        $periodo = $estadoFinanciero->periodo ? $estadoFinanciero->periodo->format('Y') : 'desconocido';

        $estadoFinanciero->delete();

        // Esta parte no se ejecutará si hay un error
        if ($empresaId) {
            return Redirect::route('empresas.estados-financieros.index', ['empresa' => $empresaId])
                ->with('success', "Estado financiero del periodo {$periodo} eliminado.");
        }
        return Redirect::route('empresas.index')
            ->with('success', "Un estado financiero (periodo {$periodo}) fue eliminado.");


}
   
}