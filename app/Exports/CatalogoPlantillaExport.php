<?php

namespace App\Exports;

use App\Models\CatalogoCuenta;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class CatalogoPlantillaExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $empresaId;

    public function __construct(int $empresaId)
    {
        $this->empresaId = $empresaId;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Obtiene las cuentas de la empresa para la plantilla
        return CatalogoCuenta::where('empresa_id', $this->empresaId)
                              ->orderBy('codigo_cuenta')
                              ->get(['id', 'codigo_cuenta', 'nombre_cuenta']);
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        // Define las columnas que verá el usuario en el Excel
        return [
            'id_cuenta (No editar esta columna)',
            'Codigo',
            'Nombre de la Cuenta',
            'Monto (Ingresar aquí)',
        ];
    }
}