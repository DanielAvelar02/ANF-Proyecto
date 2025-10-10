<?php

namespace App\Services;

class ProyeccionVentasServicio
{
    /**
     * @param  array<float>  $valores  11 o 12 meses (cronológicos)
     * @param  string  $metodo  'minimos_cuadrados' | 'incremento_porcentual' | 'incremento_absoluto'
     */
    public function calcular(array $valores, string $metodo): array
    {
        // Si vienen 11 meses, completar el mes 12 según el método elegido:
        if (count($valores) === 11) {
            $valores[] = $this->completarMes12($valores, $metodo);
        }

        // Proyectar 12 meses hacia adelante
        $pronostico = match ($metodo) {
            'minimos_cuadrados' => $this->proyectarMinimosCuadrados($valores, 12),
            'incremento_porcentual' => $this->proyectarIncrementoPorcentual($valores, 12),
            'incremento_absoluto' => $this->proyectarIncrementoAbsoluto($valores, 12),
        };

        return [
            'base' => array_values($valores),   // 12 meses base (ya completados si eran 11)
            'pronostico' => $pronostico,              // 12 meses futuros
            'metodo' => $metodo,
        ];
    }

    /** Completa el mes 12 cuando sólo hay 11 datos */
    protected function completarMes12(array $v, string $metodo): float
    {
        return match ($metodo) {
            'minimos_cuadrados' => $this->predecirMinimosCuadrados($v, 12),
            'incremento_porcentual' => $this->siguientePorIncrementoPorcentual($v),
            'incremento_absoluto' => $this->siguientePorIncrementoAbsoluto($v),
        };
    }

    /** ---------- MÉTODO: Mínimos Cuadrados (tendencia lineal) ---------- */
    protected function proyectarMinimosCuadrados(array $valores, int $horizonte): array
    {
        $n = count($valores);
        // y = a + b*t  con t = 1..n
        [$a, $b] = $this->coeficientesRegresion($valores);

        $result = [];
        for ($k = 1; $k <= $horizonte; $k++) {
            $t = $n + $k;
            $y = $a + $b * $t;
            $result[] = max(0, round($y, 2));
        }

        return $result;
    }

    protected function predecirMinimosCuadrados(array $valores, int $mesIndex): float
    {
        [$a, $b] = $this->coeficientesRegresion($valores);

        return max(0, round($a + $b * $mesIndex, 2));
    }

    protected function coeficientesRegresion(array $y): array
    {
        $n = count($y);
        $sumT = 0;
        $sumY = 0;
        $sumTT = 0;
        $sumTY = 0;
        for ($t = 1; $t <= $n; $t++) {
            $sumT += $t;
            $sumY += $y[$t - 1];
            $sumTT += $t * $t;
            $sumTY += $t * $y[$t - 1];
        }
        $den = ($n * $sumTT - $sumT * $sumT) ?: 1;
        $b = ($n * $sumTY - $sumT * $sumY) / $den;
        $a = ($sumY - $b * $sumT) / $n;

        return [$a, $b];
    }

    /** ---------- MÉTODO: Incremento porcentual (promedio geométrico robusto) ---------- */
    protected function proyectarIncrementoPorcentual(array $valores, int $horizonte): array
    {
        $n = count($valores);
        $r = $this->tasaMediaGeometrica($valores); // puede ser 0 si hay ceros

        $result = [];
        $base = $valores[$n - 1];
        for ($k = 1; $k <= $horizonte; $k++) {
            $base = $base * (1 + $r);
            $result[] = max(0, round($base, 2));
        }

        return $result;
    }

    protected function siguientePorIncrementoPorcentual(array $valores): float
    {
        $r = $this->tasaMediaGeometrica($valores);
        $ultimo = end($valores);

        return max(0, round($ultimo * (1 + $r), 2));
    }

    protected function tasaMediaGeometrica(array $v): float
    {
        // r_geom = (Π (y_t / y_{t-1}))^(1/(n-1)) - 1
        $n = count($v);
        if ($n < 2) {
            return 0.0;
        }

        $prod = 1.0;
        $pairs = 0;
        for ($i = 1; $i < $n; $i++) {
            $prev = $v[$i - 1];
            $curr = $v[$i];
            if ($prev <= 0 || $curr <= 0) {
                // Fallback: promedio aritmético de variaciones cuando hay ceros
                return $this->tasaMediaAritmetica($v);
            }
            $prod *= ($curr / $prev);
            $pairs++;
        }

        return pow($prod, 1 / max(1, $pairs)) - 1;
    }

    protected function tasaMediaAritmetica(array $v): float
    {
        $n = count($v);
        $sum = 0;
        $pairs = 0;
        for ($i = 1; $i < $n; $i++) {
            if ($v[$i - 1] <= 0) {
                continue;
            }
            $sum += ($v[$i] - $v[$i - 1]) / max(1e-9, $v[$i - 1]);
            $pairs++;
        }

        return $pairs ? $sum / $pairs : 0.0;
    }

    /** ---------- MÉTODO: Incremento absoluto (promedio de diferencias) ---------- */
    protected function proyectarIncrementoAbsoluto(array $valores, int $horizonte): array
    {
        $n = count($valores);
        $d = $this->promedioDiferencias($valores);

        $result = [];
        $base = $valores[$n - 1];
        for ($k = 1; $k <= $horizonte; $k++) {
            $base = $base + $d;
            $result[] = max(0, round($base, 2));
        }

        return $result;
    }

    protected function siguientePorIncrementoAbsoluto(array $valores): float
    {
        $d = $this->promedioDiferencias($valores);
        $ultimo = end($valores);

        return max(0, round($ultimo + $d, 2));
    }

    protected function promedioDiferencias(array $v): float
    {
        $n = count($v);
        if ($n < 2) {
            return 0.0;
        }
        $sum = 0;
        $pairs = 0;
        for ($i = 1; $i < $n; $i++) {
            $sum += ($v[$i] - $v[$i - 1]);
            $pairs++;
        }

        return $pairs ? $sum / $pairs : 0.0;
    }
}
