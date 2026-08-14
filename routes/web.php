<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as TwoUser;

Route::view('/', 'pages.home')->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::view('dashboard', 'pages.dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

Route::get('/auth/redirect', function () {
    // dd(Socialite::driver('google')->redirect());
    return Socialite::driver('google')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('google')->user();
    assert($user instanceof TwoUser);

    $uwu = User::updateOrCreate([
        'google_id' => $user->id,
    ], [
        'name' => $user->name,
        'email' => $user->email,
        'google_token' => $user->token,
        'google_refresh_token' => $user->refreshToken,
    ]);

    Auth::login($uwu);

    return redirect('/dashboard');
});
