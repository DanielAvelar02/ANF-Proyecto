<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ResultadoRatio extends Model
{
    protected $guarded = [];

    // Un resultado pertenece a una definición de Ratio
    public function ratio()
    {
        return $this->belongsTo(Ratio::class);
    }

    // Un resultado pertenece a un Estado Financiero
    public function estadoFinanciero()
    {
        return $this->belongsTo(EstadoFinanciero::class);
    }
}