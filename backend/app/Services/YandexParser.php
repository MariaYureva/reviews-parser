<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Review;
use Illuminate\Support\Facades\Log;

class YandexParser
{
    public function parse(Organization $organization): void
    {
        set_time_limit(300);

        $scriptPath = base_path('scraper/parse.js');
        $url = escapeshellarg($organization->yandex_url);

        $output = shell_exec("node {$scriptPath} {$url} 2>&1");

        if (!$output) {
            throw new \RuntimeException('Парсер не вернул данные. Проверь что Node.js установлен.');
        }

        $data = json_decode($output, true);

        if (!$data || isset($data['error'])) {
            Log::error('Yandex parser error', ['output' => $output]);
            throw new \RuntimeException($data['error'] ?? 'Ошибка парсинга: ' . $output);
        }

        $organization->update([
            'name'          => $data['name'] ?: $organization->name,
            'avg_rating'    => $data['avg_rating'],
            'ratings_count' => $data['ratings_count'],
            'reviews_count' => $data['reviews_count'],
            'parsed_at'     => now(),
        ]);

        $organization->reviews()->delete();

        $chunks = array_chunk($data['reviews'], 100);
        foreach ($chunks as $chunk) {
            $rows = array_map(fn($r) => [
                'organization_id' => $organization->id,
                'author'          => $r['author'] ?? 'Аноним',
                'rating'          => $r['rating'] ?? null,
                'text'            => $r['text'] ?? null,
                'date'            => $r['date'] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ], $chunk);

            Review::insert($rows);
        }
    }
}
