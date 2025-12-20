@php use Illuminate\Support\Str; @endphp
<!doctype html>
<html lang="bs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pridruži se sobi</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #090909;
      --card: rgba(255, 255, 255, 0.92);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
      background: #050505;
      color: #fff;
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }

    .screen {
      width: 100%;
      max-width: 520px;
      border-radius: 32px;
      overflow: hidden;
      background: linear-gradient(160deg, rgba(255,255,255,0.9), rgba(255,255,255,0));
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
    }

    .hero {
      position: relative;
      height: 320px;
      background-image: linear-gradient(180deg, rgba(9, 9, 9, 0.1), rgba(9, 9, 9, 0.85)), url('{{ $cover ?? 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80' }}');
      background-size: cover;
      background-position: center;
      padding: 32px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 8px;
    }

    .hero h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #fff;
    }

    .hero p {
      margin: 0;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.85);
    }

    .code-wrapper {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .code-label {
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.3em;
      color: #a3a3a3;
    }

    .code-value {
      font-size: 42px;
      letter-spacing: 0.5em;
      font-weight: 700;
      color: #111;
      background: #fff;
      padding: 22px;
      border-radius: 16px;
      display: inline-block;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      color: #5c5c5c;
      font-size: 14px;
    }

    .meta strong {
      color: #111;
      font-weight: 700;
    }

    .description {
      font-size: 15px;
      color: #2b2b2b;
      background: #fff;
      border-radius: 18px;
      padding: 18px;
      line-height: 1.5;
    }

    .cta-row {
      padding: 28px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .cta {
      flex: 1;
      border: none;
      border-radius: 16px;
      padding: 18px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .cta.primary {
      background: #ffb703;
      color: #000;
      box-shadow: 0 20px 30px rgba(0, 0, 0, 0.25);
    }

    .cta.secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cta:active {
      transform: scale(0.98);
    }

    @media (max-width: 600px) {
      body {
        padding: 16px;
      }
      .code-value {
        letter-spacing: 0.2em;
        font-size: 32px;
      }
    }
  </style>
</head>
<body>
  <div class="screen">
    <div class="hero">
      <p>Pridruži se</p>
      <h1>{{ $roomName }}</h1>
      @if($tagline)
        <p>{{ $tagline }}</p>
      @endif
    </div>
    <div class="code-wrapper">
      <span class="code-label">{{ $privacy }}</span>
      <div class="code-value">{{ $code }}</div>
      <div class="meta">
        <span>Članova: <strong>{{ number_format($members) }}</strong></span>
        @if($description)
        <span>Info: <strong>{{ Str::limit($description, 40) }}</strong></span>
        @endif
      </div>
      <div class="description">
        Lijepa vibra čeka. Kopiraj kod, podijeli ga, i uđi u sobu gdje se dešava zabava.
      </div>
    </div>
    <div class="cta-row">
      <a href="/" class="cta secondary">Nazad</a>
      <button class="cta primary" onclick="navigator.clipboard.writeText('{{ $code }}')">Kopiraj kod</button>
    </div>
  </div>
</body>
</html>
