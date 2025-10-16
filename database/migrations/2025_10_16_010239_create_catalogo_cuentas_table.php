<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/..._create_catalogo_cuentas_table.php

    public function up(): void
    {
        Schema::create('catalogo_cuentas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_cuenta', 20);
            $table->string('nombre_cuenta', 100);
            $table->foreignId('empresa_id')->constrained('empresas')->cascadeOnDelete();

            $table->timestamps(); // Columnas 'created_at' y 'updated_at'.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_cuentas');
    }
};
