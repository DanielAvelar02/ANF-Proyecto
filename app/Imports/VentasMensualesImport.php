<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToArray;

class VentasMensualesImport implements ToArray
{
    protected array $valores = [];

    /**
     * Espera un archivo con una columna "ventas" o números en la primera columna.
     * Lee máximo 12 filas, en orden cronológico.
     */
    public function array(array $rows)
    {
        $vals = [];
        foreach ($rows as $i => $row) {
            if (! count($row)) {
                continue;
            }
            $valor = $row[0]; // primera columna
            if (is_numeric($valor)) {
                $vals[] = (float) $valor;
            } elseif (isset($row['ventas']) && is_numeric($row['ventas'])) {
                $vals[] = (float) $row['ventas'];
            }
            if (count($vals) >= 12) {
                break;
            }
        }
        // Nos quedamos con 11 o 12 en orden de aparición
        $this->valores = array_values($vals);
    }

    public function getValores(): array
    {
        // Validaciones simples: no negativos
        return array_map(fn ($x) => max(0, (float) $x), $this->valores);
    }
}
