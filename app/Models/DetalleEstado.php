<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleEstado extends Model
{
    use HasFactory;

    protected $table = 'detalle_estados';

    protected $fillable = [
        'monto',
        'estado_financiero_id',
        'catalogo_cuenta_id',
    ];

    /**
     * Relación: Un detalle pertenece a un Estado Financiero.
     */
    public function estadoFinanciero(): BelongsTo
    {
        return $this->belongsTo(EstadoFinanciero::class);
    }

    /**
     * Relación: Un detalle pertenece a una Cuenta del Catálogo.
     */
    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(CatalogoCuenta::class, 'catalogo_cuenta_id');
    }
}