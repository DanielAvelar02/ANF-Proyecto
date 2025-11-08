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
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CatalogoPlantillaExport;
use App\Imports\EstadosFinancierosImport;
use Illuminate\Support\Facades\Log;

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
                'origen' => $ef->origen,
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
                    'origen' => 'Manual'
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
        
        // Renderizamos una NUEVA página de React 'Edit.jsx'
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
   
    
    /**
     * NUEVO: Genera y descarga la plantilla de Excel.
     */
    public function descargarPlantilla(Empresa $empresa)
    {
        $nombreArchivo = 'plantilla_' . preg_replace('/[^A-Za-z0-9-]/', '_', $empresa->nombre) . '.xlsx';
        return Excel::download(new CatalogoPlantillaExport($empresa->id), $nombreArchivo);
    }

    
    /**
     * NUEVO: Recibe el archivo Excel importado.
     * (Por ahora solo es un placeholder)
     */
    public function importarExcel(Request $request, Empresa $empresa)
    {
        // LÍNEA CORREGIDA: Asignamos el resultado a $validated
        $validated = $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls,csv',
            'año' => 'required|numeric|date_format:Y'
        ]);

        try {
            // 1. Inicializamos nuestra clase de importación pasándole la empresa
            $import = new EstadosFinancierosImport($empresa, $validated['año']);

            // 2. Usamos el Facade de Excel para procesar el archivo subido
            Excel::import($import, $validated['archivo']);

            // 3. Obtenemos el registro que se creó
            $estadoFinanciero = $import->getEstadoFinancieroCreado();
            $periodo = $estadoFinanciero ? $estadoFinanciero->periodo->format('Y') : 'nuevo';

            // 4. Devolvemos una respuesta JSON exitosa
            return response()->json([
                'status' => 'success',
                'message' => "Estado financiero del periodo {$periodo} importado con éxito.",
                'data' => $estadoFinanciero // Enviamos el EF creado
            ]);

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            // Captura errores de validación de Maatwebsite (si los añades)
            $fallas = $e->failures();
            Log::error('Error de validación al importar Excel:', [$fallas]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación en el archivo.',
                'errors' => $fallas
            ], 422); // 422 Unprocessable Entity

        } catch (\Exception $e) {
            // Captura errores generales (ej: filas inválidas, problemas de BD)
            Log::error('Error al importar Excel:', [$e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage() // 'Hubo un problema al procesar el archivo.'
            ], 500); // 500 Internal Server Error
        }
    }
}