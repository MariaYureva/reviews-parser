<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Organization $organization)
    {
        $reviews = $organization->reviews()
            ->orderByDesc('id')
            ->paginate(50);

        return response()->json($reviews);
    }
}
