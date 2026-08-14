<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        // TODO
        return new Response('todo');

        // return Inertia::render('settings/Profile', [
        // 'status' => $request->session()->get('status'),
        // ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        assert($user instanceof User);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
