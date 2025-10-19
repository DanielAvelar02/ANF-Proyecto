<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoFinanciero extends Model
{
    use HasFactory;

    protected $table = 'estado_financieros';

    protected $fillable = [
        'periodo',
        'empresa_id',
    ];

    // Para que Laravel maneje el campo 'periodo' como un objeto de fecha
    protected $casts = [
        'periodo' => 'date',
    ];

    /**
     * Relación: Un Estado Financiero pertenece a una Empresa.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }
    
    /* Relación: Un Estado Financiero tiene muchos Detalles.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleEstado::class);
    }
}