<?php

namespace App\Actions;

use App\Models\EstadoFinanciero;
use App\Models\CatalogoCuenta;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\SimpleExcel\SimpleExcelReader;

class ImportarEstadoFinancieroAction
{
    private $empresa_id;
    private $catalogoCuentas;

    public function __construct(int $empresa_id)
    {
        $this->empresa_id = $empresa_id;
        // Cargamos el catálogo para una búsqueda rápida y eficiente
        $this->catalogoCuentas = CatalogoCuenta::pluck('id', 'nombre_cuenta');
    }

    /**
     * Ejecuta la lógica de importación.
     *
     * @param string $pathToFile Ruta al archivo subido
     * @return void
     */
    public function execute(string $pathToFile)
    {
        // 1. Leer los datos del Excel
        $reader = SimpleExcelReader::create($pathToFile);

        // Obtenemos todas las filas como una colección
        $rows = $reader->getRows();

        // 2. Extraer el periodo (metadatos)
        // La librería no tiene un método directo para una celda,
        // así que accedemos a la primera fila (índice 0) y su segunda columna.
        $periodo = $rows->first()['Periodo:'] ?? null; // spatie/simple-excel puede usar la cabecera como clave

        // Si la primera fila no tiene cabecera, usamos el índice numérico
        if (!$periodo) {
            $firstRowArray = $rows->first();
            $periodo = array_values($firstRowArray)[1] ?? null; // Accede al valor en la columna B
        }
        
        if (!$periodo) {
            throw new \Exception('Importación fallida: No se encontró el periodo en la celda B1.');
        }

        // 3. Extraer las cuentas y montos
        // Omitimos las primeras 3 filas (Periodo, Fila en blanco, Cabeceras)
        $cuentasConMontos = $rows->slice(3)
            ->mapWithKeys(function ($row) {
                // 'spatie/simple-excel' usa la cabecera como clave del array por defecto.
                // Asegúrate de que las cabeceras en tu Excel (fila 3) sean 'Cuenta' y 'Monto'.
                $nombreCuenta = $row['Cuenta'] ?? null;
                $monto = $row['Monto'] ?? null;
                
                if (!empty($nombreCuenta) && !is_null($monto)) {
                    return [trim($nombreCuenta) => $monto];
                }
                return []; // Devuelve un array vacío para las filas no válidas
            })
            ->filter(); // Elimina las entradas vacías
        
        if ($cuentasConMontos->isEmpty()) {
            throw new \Exception('Importación fallida: No se encontraron datos de cuentas válidos.');
        }

        // 4. Iniciar la transacción de Base de Datos
        DB::beginTransaction();

        try {
            // 5. Crear el registro principal 'EstadoFinanciero'
            $estadoFinanciero = EstadoFinanciero::create([
                'periodo' => $periodo . '-01-01',
                'empresa_id' => $this->empresa_id,
            ]);

            // 6. Iterar y crear los 'DetalleEstado'
            foreach ($cuentasConMontos as $nombreCuenta => $monto) {
                $cuentaId = $this->catalogoCuentas->get($nombreCuenta);

                if ($cuentaId) {
                    $estadoFinanciero->detalles()->create([
                        'monto' => $monto,
                        'catalogo_cuenta_id' => $cuentaId,
                    ]);
                } else {
                    Log::warning("Cuenta no encontrada en el catálogo: '{$nombreCuenta}'. Se omitió.");
                }
            }

            // 7. Confirmar la transacción
            DB::commit();

        } catch (\Exception $e) {
            // 8. Si algo falla, revertir todo
            DB::rollBack();
            Log::error("Error durante la importación: " . $e->getMessage());
            // Relanzamos la excepción para que el controlador la capture
            throw new \Exception("Error al procesar el archivo. Revise los registros de errores.");
        }
    }
}