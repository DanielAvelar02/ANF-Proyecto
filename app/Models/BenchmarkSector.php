<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenchmarkSector extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo_empresa_id',
        'nombreRatio',
        'valorReferencia',
    ];

    public function tipoEmpresa()
    {
        return $this->belongsTo(TipoEmpresa::class);
    }
}