<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('tipo_empresas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre', 100);
        // Campo para la descripción, puede ser nulo si no se proporciona.
        $table->text('descripcion')->nullable(); 
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_empresas');
    }
};
