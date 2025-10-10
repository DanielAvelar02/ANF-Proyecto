<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProyeccionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'metodo'  => 'required|in:minimos_cuadrados,incremento_porcentual,incremento_absoluto',
            'valores' => 'required|array|min:11|max:12',
            'valores.*' => 'numeric|min:0', // ventas no negativas
        ];
    }

    public function messages(): array
    {
        return [
            'valores.min' => 'Debe proporcionar al menos 11 meses de datos.',
            'valores.max' => 'Solo se aceptan 12 meses para la base histórica.',
        ];
    }
}
