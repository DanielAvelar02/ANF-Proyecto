<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoCuenta extends Model
{
    use HasFactory;
    
    protected $table = 'catalogo_cuentas';

    
    protected $fillable = ['empresa_id', 'codigo_cuenta', 'nombre_cuenta'];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
    /**
     * Relación: Una cuenta puede estar en muchos Detalles de estados.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleEstado::class);
    }
}