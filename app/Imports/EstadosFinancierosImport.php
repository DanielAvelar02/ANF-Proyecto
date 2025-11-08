<?php

namespace App\Imports;

use App\Models\EstadoFinanciero;
use App\Models\Empresa;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class EstadosFinancierosImport implements ToCollection, WithStartRow
{
    protected $empresa;
    protected $año;
    protected $nuevoEstadoFinanciero; // Almacenará el EF recién creado

    public function __construct(Empresa $empresa, int $año)
    {
        $this->empresa = $empresa;
        $this->año = $año; // <--- ¡¡AÑADE ESTA LÍNEA!!
    }

    /**
     * Indica a Maatwebsite/Excel que empiece a leer desde la fila 2,
     * saltando así los encabezados 'id_cuenta', 'Codigo', 'Monto', etc.
     */
    public function startRow(): int
    {
        return 2;
    }

    /**
     * Procesa la colección de filas del Excel.
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        // 1. Validar que el archivo no esté vacío
        if ($rows->isEmpty()) {
            throw new \Exception("El archivo está vacío o no tiene datos.");
        }

        // 2. Usamos una transacción para asegurar que todo se guarde correctamente
        DB::transaction(function () use ($rows) {

            // 3. Creamos el registro principal (EstadoFinanciero)
            $this->nuevoEstadoFinanciero = $this->empresa->estadosFinancieros()->create([
                // Ahora $this->año SÍ tiene el valor correcto
                'periodo' => Carbon::createFromDate($this->año, 1, 1)->startOfYear(),
                'origen' => 'Importado'
            ]);

            // 4. Recorremos cada fila del Excel
            foreach ($rows as $row) {
                
                // Leemos las columnas según el exportador:
                $cuentaId = $row[0]; // Columna A: 'id_cuenta (No editar...)'
                $monto = $row[3];    // Columna D: 'Monto (Ingresar aquí)'

                // Verificación simple
                if (!is_numeric($cuentaId) || !is_numeric($monto)) {
                    // Si una fila es inválida, revertimos toda la transacción
                    throw new \Exception("Fila inválida encontrada. Asegúrese de que todos los montos sean números.");
                }

                // 5. Creamos el registro de detalle para esta fila
                $this->nuevoEstadoFinanciero->detalles()->create([
                    'catalogo_cuenta_id' => $cuentaId,
                    'monto' => $monto,
                ]);
            }
        });
    }

    /**
     * Función auxiliar para obtener el Estado Financiero creado
     * después de que la importación sea exitosa.
     */
    public function getEstadoFinancieroCreado(): ?EstadoFinanciero
    {
        return $this->nuevoEstadoFinanciero;
    }
}