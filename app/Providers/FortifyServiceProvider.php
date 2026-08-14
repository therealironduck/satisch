<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureViews();
    }

    private function configureViews(): void
    {
        // TODO
        Fortify::loginView(fn () => 'Login');
    }
}
