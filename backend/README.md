Hajp Backend (Laravel)

Setup
- Install PHP, Composer, and MySQL
- Run: `composer install`
- Copy `.env` and set MySQL credentials
- Ensure these env vars: `APP_URL=http://localhost:8000`, `DB_CONNECTION=mysql`, `DB_DATABASE=hajp_db`
- Install Sanctum: `composer require laravel/sanctum` and publish assets
- Do not run migrations yet (constraint)

Provided
- Migrations for `users` extra fields, `polls`, `poll_votes`, `subscriptions`, `anonymous_inboxes`, `anonymous_messages`, `rooms`, `room_members`
- Models and relationships
- Controllers: `AuthController`, `PollController`, `SubscriptionController`, `AnonInboxController`
- API routes in `routes/api.php`
- Seeders and factories (`DemoDataSeeder`) with demo data

Run (when allowed)
- `php artisan migrate`
- `php artisan db:seed`
- `php artisan serve --port=8000`
