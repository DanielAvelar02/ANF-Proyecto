<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('AccesoUsuario', function (Blueprint $t) {
            $t->char('IdOpcion', 3);
            $t->char('IdUsuario', 2);

            $t->primary(['IdOpcion', 'IdUsuario']);

            $t->foreign('IdOpcion')
                ->references('IdOpcion')->on('OpcionForm')
                ->cascadeOnUpdate()->cascadeOnDelete();

            $t->foreign('IdUsuario')
                ->references('IdUsuario')->on('Usuario')
                ->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('AccesoUsuario');
    }
};
