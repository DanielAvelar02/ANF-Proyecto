<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model {
    protected $table = 'Usuario';
    protected $primaryKey = 'IdUsuario';
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';
    protected $fillable = ['IdUsuario','NomUsuario','Clave'];
}
