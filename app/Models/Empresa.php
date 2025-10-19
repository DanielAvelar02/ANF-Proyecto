<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    use HasFactory;

    // Nombre de la tabla
    protected $table = 'empresas';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'nombre',
        'tipo_empresa_id',
    ];
    
    // Campos que deben ser casteados a tipos nativos.
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación: Una Empresa pertenece a un TipoEmpresa.
     */
    public function tipo(): BelongsTo
    {
        // 'tipo_empresa_id' es la clave foránea en la tabla 'empresas'
        return $this->belongsTo(TipoEmpresa::class, 'tipo_empresa_id');
    }
    /**
     * Relación: Una Empresa tiene muchos Estados Financieros.
     */
    public function estadosFinancieros(): HasMany
    {
        return $this->hasMany(EstadoFinanciero::class);
    }
    public function catalogoCuentas(): HasMany
    {
        return $this->hasMany(CatalogoCuenta::class);
    }
}