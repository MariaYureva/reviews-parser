<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $fillable = [
        'user_id', 'yandex_url', 'yandex_id', 'name',
        'avg_rating', 'ratings_count', 'reviews_count', 'parsed_at',
    ];

    protected $casts = [
        'parsed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function needsRefresh(): bool
    {
        return is_null($this->parsed_at)
            || $this->parsed_at->diffInHours(now()) >= 1;
    }
}
