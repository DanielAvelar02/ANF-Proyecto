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
        $this->año = $año;
    }

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows)
    {
        // 1. Validar que el archivo no esté vacío
        if ($rows->isEmpty()) {
            throw new \Exception("El archivo está vacío o no tiene datos.");
        }

        // ✅ PRE-CARGAMOS las cuentas válidas de esta empresa
        $cuentasValidas = $this->empresa->catalogoCuentas()->pluck('id')->toArray();

        DB::transaction(function () use ($rows, $cuentasValidas) {

            // 2. Crear el estado financiero
            $this->nuevoEstadoFinanciero = $this->empresa->estadosFinancieros()->create([
                'periodo' => Carbon::createFromDate($this->año, 1, 1)->startOfYear(),
                'origen' => 'Importado'
            ]);

            // 3. Procesar filas
            foreach ($rows as $row) {
                
                $cuentaId = $row[0]; // ID cuenta (columna A)
                $monto = $row[3];    // Monto (columna D)

                // Validar ID numérico
                if (!is_numeric($cuentaId)) {
                    throw new \Exception("Fila inválida: El ID de la cuenta no es numérico. Fila: " . $row->toJson());
                }

                // ✅ Validar que la cuenta pertenezca a la empresa
                if (!in_array($cuentaId, $cuentasValidas)) {
                    throw new \Exception("La cuenta con ID {$cuentaId} no pertenece a la empresa {$this->empresa->nombre}.");
                }

                // Validar monto; si no es número → 0
                if (!is_numeric($monto)) {
                    $monto = 0;
                }

                // Crear detalle
                $this->nuevoEstadoFinanciero->detalles()->create([
                    'catalogo_cuenta_id' => $cuentaId,
                    'monto' => $monto,
                ]);
            }
        });
    }

    public function getEstadoFinancieroCreado(): ?EstadoFinanciero
    {
        return $this->nuevoEstadoFinanciero;
    }
}
