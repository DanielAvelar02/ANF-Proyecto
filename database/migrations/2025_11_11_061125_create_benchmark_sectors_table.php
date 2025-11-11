<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('benchmark_sectors', function (Blueprint $table) {
            $table->id(); // 'idBenchmark'

            // Asumiendo que la tabla 'tipo_empresas' usa 'id' como PK
            $table->foreignId('tipo_empresa_id')
                  ->constrained('tipo_empresas') // Asegúrate que 'tipo_empresas' es el nombre de tu tabla
                  ->onDelete('cascade');

            $table->string('nombreRatio', 100);
            $table->decimal('valorReferencia', 10, 4)->nullable(); // 10,4 es más estándar que 100,4
            $table->timestamps();

            // Asegurar que un ratio solo exista una vez por tipo de empresa
            $table->unique(['tipo_empresa_id', 'nombreRatio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('benchmark_sectors');
    }
};