<?php

namespace Database\Seeders;

use App\Models\RoomVibe;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RoomVibeSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $vibes = [
            [
                'slug' => 'skolska-raja',
                'name' => 'Školska raja',
                'icon' => 'school-outline',
                'description' => 'Razred, odjeljenje i ekipa iz klupa.',
            ],
            [
                'slug' => 'porodica',
                'name' => 'Porodica',
                'icon' => 'home-outline',
                'description' => 'Dom, rodbina i kućne grupe u jednoglasnom raspoloženju.',
            ],
            [
                'slug' => 'fakultetske-kolege',
                'name' => 'Fakultetske kolege',
                'icon' => 'book-outline',
                'description' => 'Studenti, kolegiji, domovi i sve zajedničke teme fakulteta.',
            ],
            [
                'slug' => 'posao',
                'name' => 'Ekipica s posla',
                'icon' => 'briefcase-outline',
                'description' => 'Kancelarija, timovi i pomalo birokratski štimung.',
            ],
            [
                'slug' => 'najbolji-prijatelji',
                'name' => 'Najbolji prijatelji',
                'icon' => 'people-outline',
                'description' => 'Uža raja, core grupa koja prati svaki dan.',
            ],
            [
                'slug' => 'komsiluk',
                'name' => 'Komšiluk',
                'icon' => 'location-outline',
                'description' => 'Kvart, zgrada i lokalna četa.',
            ],
            [
                'slug' => 'influenserska',
                'name' => 'Influenserska',
                'icon' => 'camera-outline',
                'description' => 'Reels, kampanje i zajednički brand momenti.',
            ],
            [
                'slug' => 'sport',
                'name' => 'Sportska ekipa',
                'icon' => 'football-outline',
                'description' => 'Treninzi, utakmice i navijačka energija.',
            ],
            [
                'slug' => 'izlasci',
                'name' => 'Noćni izlasci',
                'icon' => 'wine-outline',
                'description' => 'Klubovi, barovi i vikend žurka.',
            ],
            [
                'slug' => 'travel',
                'name' => 'Travel ekipa',
                'icon' => 'airplane-outline',
                'description' => 'Tripovi, destinacije i zajedničke avanture.',
            ],
            [
                'slug' => 'gejmeri',
                'name' => 'Gejmerska ekipa',
                'icon' => 'game-controller-outline',
                'description' => 'Squadovi, co-op sesije i Discord vibe.',
            ],
            [
                'slug' => 'kreativci',
                'name' => 'Kreativci',
                'icon' => 'brush-outline',
                'description' => 'Crtači, dizajneri i muzičari razmjenjuju inspiraciju.',
            ],
            [
                'slug' => 'chill',
                'name' => 'Chill zajednica',
                'icon' => 'leaf-outline',
                'description' => 'Relaks vibra, kasni chatovi i opuštena druženja.',
            ],
            [
                'slug' => 'street-fashion',
                'name' => 'Street & Fashion ekipa',
                'icon' => 'shirt-outline',
                'description' => 'Outfiti, street style i modne preporuke.',
            ],
            [
                'slug' => 'foodie',
                'name' => 'Foodie ekipa',
                'icon' => 'pizza-outline',
                'description' => 'Hrana, preporuke i gurmanski planovi.',
            ],
            [
                'slug' => 'poezija',
                'name' => 'Poezija & literarni',
                'icon' => 'reader-outline',
                'description' => 'Kratki stihovi, knjige i pjesnički flow.',
            ],
            [
                'slug' => 'film',
                'name' => 'Filmski klub',
                'icon' => 'film-outline',
                'description' => 'Filmske večeri, preporuke i kritike.',
            ],
            [
                'slug' => 'diy',
                'name' => 'DIY lab',
                'icon' => 'construct-outline',
                'description' => 'Uradi sam projekti i kreativno eksperimentiranje.',
            ],
            [
                'slug' => 'podcast',
                'name' => 'Podcast sesija',
                'icon' => 'mic-outline',
                'description' => 'Razgovori, storytelling i snimateljske priče.',
            ],
            [
                'slug' => 'retro',
                'name' => 'Retro vibra',
                'icon' => 'logo-apple-appstore',
                'description' => 'Old-school playlist, kasete i vintage inspiracija.',
            ],
            [
                'slug' => 'girls-only',
                'name' => 'Girls only',
                'icon' => 'female-outline',
                'description' => 'Siguran krug za cure, bez muške ekipe.',
            ],
            [
                'slug' => 'boys-only',
                'name' => 'Boys only',
                'icon' => 'male-outline',
                'description' => 'Samo muška ekipa, chill i šala bez filtera.',
            ],
        ];

        $payload = array_map(function ($item) use ($now) {
            return array_merge($item, [
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }, $vibes);

        RoomVibe::query()->upsert(
            $payload,
            ['slug'],
            ['name', 'icon', 'description', 'updated_at']
        );
    }
}
