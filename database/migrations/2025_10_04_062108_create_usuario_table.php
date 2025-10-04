<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Usuario', function (Blueprint $t) {
            $t->char('IdUsuario', 2)->primary();
            $t->string('NomUsuario', 30);
            $t->char('Clave', 5); // solo para cumplir el requisito del diagrama
            // sin timestamps por requerimiento
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Usuario');
    }
};
