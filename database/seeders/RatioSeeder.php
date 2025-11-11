<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Ratio;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema; // 1. IMPORTAMOS SCHEMA

class RatioSeeder extends Seeder
{
    public function run(): void
    {
        // 2. DESACTIVAMOS LA REVISIÓN DE LLAVES FORÁNEAS
        Schema::disableForeignKeyConstraints();

        // 3. VACIAMOS LAS TABLAS (HIJA PRIMERO, LUEGO PADRE)
        DB::table('resultado_ratios')->truncate(); // Vacía los resultados
        DB::table('ratios')->truncate();           // Ahora sí podemos vaciar las definiciones

        // 4. REACTIVAMOS LA REVISIÓN
        Schema::enableForeignKeyConstraints();

        // 5. Insertamos las definiciones de ratios
        $definitions = [
            ['key' => '1', 'nombre' => 'Razón Circulante', 'formula' => 'Activos Corrientes / Pasivos Corrientes', 'categoria' => 'Liquidez'],
            ['key' => '2', 'nombre' => 'Capital de Trabajo a Activos Totales', 'formula' => '(Activo Cte. - Pasivo Cte.) / Activos Totales', 'categoria' => 'Liquidez'],
            ['key' => '3', 'nombre' => 'Rotación Cuentas por Cobrar', 'formula' => 'Ventas Netas / Cuentas por Cobrar Promedio', 'categoria' => 'Actividad'],
            ['key' => '4', 'nombre' => 'Periodo Medio de Cobro (días)', 'formula' => '(Prom. Cuentas Cobrar * 360) / Ventas Netas', 'categoria' => 'Actividad'],
            ['key' => '5', 'nombre' => 'Rotación Cuentas por Pagar', 'formula' => 'Compras / Cuentas por Pagar Promedio', 'categoria' => 'Actividad'],
            ['key' => '6', 'nombre' => 'Periodo Medio de Pago (días)', 'formula' => '(Prom. Cuentas Pagar * 360) / Compras', 'categoria' => 'Actividad'],
            ['key' => '7', 'nombre' => 'Rotación de Activos Totales', 'formula' => 'Ventas Netas / Activo Total Promedio', 'categoria' => 'Actividad'],
            ['key' => '8', 'nombre' => 'Rotación de Activos Fijos', 'formula' => 'Ventas Netas / Activo Fijo Neto Promedio', 'categoria' => 'Actividad'],
            ['key' => '9', 'nombre' => 'Grado de Endeudamiento', 'formula' => 'Pasivo Total / Activo Total', 'categoria' => 'Apalancamiento'],
            ['key' => '10', 'nombre' => 'Grado de Propiedad', 'formula' => 'Patrimonio / Activo Total', 'categoria' => 'Apalancamiento'],
        ];

        foreach ($definitions as $def) {
            Ratio::create([
                'key' => $def['key'],
                'nombre_ratio' => $def['nombre'],
                'formula' => $def['formula'],
                'categoria' => $def['categoria'],
                'descripcion' => $def['nombre'], 
            ]);
        }
    }
}