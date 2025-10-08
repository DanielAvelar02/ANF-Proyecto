<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::updateOrCreate(
            ['IdUsuario' => 'A1'],
            ['NomUsuario' => 'Admin', 'Clave' => '12345'] // PIN de prueba
        );
    }
}
