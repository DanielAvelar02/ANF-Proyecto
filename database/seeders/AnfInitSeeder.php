<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnfInitSeeder extends Seeder
{
    public function run(): void
    {
        // Usuarios
        DB::table('Usuario')->upsert([
            ['IdUsuario' => 'AD', 'NomUsuario' => 'admin', 'Clave' => '12345'],
            ['IdUsuario' => 'RE', 'NomUsuario' => 'restr', 'Clave' => '12345'],
        ], ['IdUsuario'], ['NomUsuario', 'Clave']);

    }
}
