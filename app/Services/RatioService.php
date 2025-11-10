<?php

namespace App\Services;

class RatioService
{
    // --- Métodos de Ratios Individuales (Protegidos) ---
    
    public function calcularRazonCorriente(float $activoCorriente, float $pasivoCorriente): float
    {
        return $pasivoCorriente != 0 ? $activoCorriente / $pasivoCorriente : 0.0;
    }

    public function calcularCapitalTrabajoSobreActivos(float $activoCorriente, float $pasivoCorriente, float $activoTotal): float
    {
        $capitalTrabajo = $activoCorriente - $pasivoCorriente;
        return $activoTotal != 0 ? $capitalTrabajo / $activoTotal : 0.0;
    }

    public function calcularGradoEndeudamiento(float $pasivoTotal, float $activoTotal): float
    {
        return $activoTotal != 0 ? $pasivoTotal / $activoTotal : 0.0;
    }
    
    public function calcularGradoPropiedad(float $patrimonio, float $activoTotal): float
    {
        return $activoTotal != 0 ? $patrimonio / $activoTotal : 0.0;
    }

    public function calcularRotacionActivosTotales(float $ventasNetas, float $activoTotalPromedio): float
    {
        return $activoTotalPromedio != 0 ? $ventasNetas / $activoTotalPromedio : 0.0;
    }
    
    public function calcularRotacionCuentasCobrar(float $ventasNetas, float $cuentasCobrarPromedio): float
    {
        return $cuentasCobrarPromedio != 0 ? $ventasNetas / $cuentasCobrarPromedio : 0.0;
    }

    public function calcularPeriodoMedioCobro(float $rotacionCuentasCobrar): float
    {
        return $rotacionCuentasCobrar != 0 ? 360 / $rotacionCuentasCobrar : 0.0;
    }

    public function calcularRotacionCuentasPagar(float $compras, float $cuentasPagarPromedio): float
    {
        return $cuentasPagarPromedio != 0 ? $compras / $cuentasPagarPromedio : 0.0;
    }

    public function calcularPeriodoMedioPago(float $rotacionCuentasPagar): float
    {
        return $rotacionCuentasPagar != 0 ? 360 / $rotacionCuentasPagar : 0.0;
    }

    public function calcularRotacionActivoFijoNeto(float $ventasNetas, float $activoFijoNetoPromedio): float
    {
        return $activoFijoNetoPromedio != 0 ? $ventasNetas / $activoFijoNetoPromedio : 0.0;
    }

    // --- Método Global de Cálculo (Actualizado) ---

    public function calcularTodosLosRatios(array $montos, array $promedios): array
    {
        $activoCorriente = $montos['activoCorriente'] ?? 0.0;
        $pasivoCorriente = $montos['pasivoCorriente'] ?? 0.0;
        $activoTotal     = $montos['activoTotal'] ?? 0.0;
        $pasivoTotal     = $montos['pasivoTotal'] ?? 0.0;
        $patrimonio      = $montos['patrimonio'] ?? 0.0;
        $ventasNetas     = $montos['ventasNetas'] ?? 0.0;
        $compras         = $montos['compras'] ?? 0.0;

        $promedioActivoTotal = $promedios['activoTotal'] ?? 0.0;
        $promedioCuentasCobrar = $promedios['cuentasPorCobrar'] ?? 0.0;
        
        // 🛑🛑🛑 EL TYPO ESTABA AQUÍ 🛑🛑🛑
        // Decía 'cuentasPagar' en lugar de 'cuentasPorPagar'
        $promedioCuentasPagar = $promedios['cuentasPorPagar'] ?? 0.0; // ✅ CORREGIDO
        
        $promedioActivoFijoNeto = $promedios['activoFijoNeto'] ?? 0.0;

        $ratios = [];
        
        $ratios[] = [
            'key' => '1', 'nombre' => 'Razón Circulante', 
            'formula' => 'Activos Corrientes / Pasivos Corrientes',
            'valor' => $this->calcularRazonCorriente($activoCorriente, $pasivoCorriente),
        ];
        $ratios[] = [
            'key' => '2', 'nombre' => 'Capital de Trabajo a Activos Totales', 
            'formula' => '(Activo Cte. - Pasivo Cte.) / Activos Totales',
            'valor' => $this->calcularCapitalTrabajoSobreActivos($activoCorriente, $pasivoCorriente, $activoTotal),
        ];
        
        $rotacionCobrar = $this->calcularRotacionCuentasCobrar($ventasNetas, $promedioCuentasCobrar);
        $ratios[] = [
            'key' => '3', 'nombre' => 'Rotación Cuentas por Cobrar', 
            'formula' => 'Ventas Netas / Cuentas por Cobrar Promedio',
            'valor' => $rotacionCobrar,
        ];
        $ratios[] = [
            'key' => '4', 'nombre' => 'Periodo Medio de Cobro (días)', 
            'formula' => '(Prom. Cuentas Cobrar * 360) / Ventas Netas',
            'valor' => $this->calcularPeriodoMedioCobro($rotacionCobrar),
        ];

        $rotacionPagar = $this->calcularRotacionCuentasPagar($compras, $promedioCuentasPagar);
        $ratios[] = [
            'key' => '5', 'nombre' => 'Rotación Cuentas por Pagar', 
            'formula' => 'Compras / Cuentas por Pagar Promedio',
            'valor' => $rotacionPagar,
        ];
        $ratios[] = [
            'key' => '6', 'nombre' => 'Periodo Medio de Pago (días)', 
             'formula' => '(Prom. Cuentas Pagar * 360) / Compras',
            'valor' => $this->calcularPeriodoMedioPago($rotacionPagar),
        ];
        
        $ratios[] = [
            'key' => '7', 'nombre' => 'Rotación de Activos Totales', 
            'formula' => 'Ventas Netas / Activo Total Promedio',
            'valor' => $this->calcularRotacionActivosTotales($ventasNetas, $promedioActivoTotal),
        ];
        $ratios[] = [
            'key' => '8', 'nombre' => 'Rotación de Activos Fijos', 
            'formula' => 'Ventas Netas / Activo Fijo Neto Promedio',
            'valor' => $this->calcularRotacionActivoFijoNeto($ventasNetas, $promedioActivoFijoNeto),
        ];
        $ratios[] = [
            'key' => '9', 'nombre' => 'Grado de Endeudamiento', 
            'formula' => 'Pasivo Total / Activo Total',
            'valor' => $this->calcularGradoEndeudamiento($pasivoTotal, $activoTotal),
        ];
        $ratios[] = [
            'key' => '10', 'nombre' => 'Grado de Propiedad', 
            'formula' => 'Patrimonio / Activo Total',
            'valor' => $this->calcularGradoPropiedad($patrimonio, $activoTotal),
        ];
        
        return $ratios;
    }
}