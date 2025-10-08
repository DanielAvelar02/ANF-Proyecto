<?php
namespace App\Models;


use Illuminate\Foundation\Auth\User as Authenticatable;

// Modelo Usuario personalizado, extiende de Authenticatable para usar con Auth
class Usuario extends Authenticatable
{
    protected $table = 'Usuario';
    protected $primaryKey = 'IdUsuario';
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';

    protected $fillable = ['IdUsuario','NomUsuario','Clave']; // campos asignables masivamente
    protected $hidden = ['Clave']; // no exponerla en JSON
}
