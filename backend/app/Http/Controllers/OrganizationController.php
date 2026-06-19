<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\YandexParser;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'yandex_url' => [
                'required',
                'url',
                function ($attribute, $value, $fail) {
                    if (!str_contains($value, 'yandex.ru/maps')) {
                        $fail('Ссылка должна быть на Яндекс.Карты');
                    }
                },
            ],
        ]);

        $organization = Organization::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['yandex_url' => $request->yandex_url, 'parsed_at' => null]
        );

        try {
            app(YandexParser::class)->parse($organization);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($organization->fresh());
    }

    public function show(Organization $organization)
    {
        return response()->json($organization);
    }
}
