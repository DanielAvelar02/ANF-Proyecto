<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/..._create_detalle_estados_table.php

    public function up(): void
    {
        Schema::create('detalle_estados', function (Blueprint $table) {
            $table->id();
            $table->decimal('monto', 10, 2);
            $table->foreignId('estado_financiero_id')->constrained('estado_financieros')->cascadeOnDelete();
            $table->foreignId('catalogo_cuenta_id')->constrained('catalogo_cuentas')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_estados');
    }
};
