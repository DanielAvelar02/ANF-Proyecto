<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoEmpresa extends Model
{
    use HasFactory;
    
    // Nombre de la tabla
    protected $table = 'tipo_empresas';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * Relación: Un TipoEmpresa tiene muchas Empresas.
     */
    public function empresas(): HasMany
    {
        return $this->hasMany(Empresa::class);
    }

    public function benchmarks()
    {
        return $this->hasMany(BenchmarkSector::class);
    }
}