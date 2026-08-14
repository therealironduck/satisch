#!/usr/bin/env just --justfile

# Default recipe to display help information
default:
    @just --list

# Install Laravel sail without docker images running
[group('installation')]
initial-install:
    docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html jkniest/docker-testing-php:7 composer install --ignore-platform-reqs --no-scripts
    cp .env.example .env
    ./vendor/bin/sail up -d
    ./vendor/bin/sail run just build

[group('installation')]
rebuild:
    ./vendor/bin/sail down -v --remove-orphans
    ./vendor/bin/sail build
    ./vendor/bin/sail up -d
    ./vendor/bin/sail run just build

[group('installation')]
reinstall:
    ./vendor/bin/sail run just build

# # View and follow the logs of the app server
[group('utilities')]
logs:
    ./vendor/bin/sail logs -f laravel.test
