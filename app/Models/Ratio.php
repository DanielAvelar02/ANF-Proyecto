<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Ratio extends Model
{
    protected $guarded = [];

    // Un Ratio (definición) puede tener muchos resultados
    public function resultados()
    {
        return $this->hasMany(ResultadoRatio::class);
    }
}