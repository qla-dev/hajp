<!doctype html>
<html lang="bs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Poruka poslana</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <style>
    :root {
      --gradient-start: {{ $gradientStart }};
      --gradient-end: {{ $gradientEnd }};
    }

    body {
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
      font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .success-screen {
      width: 100%;
      max-width: 420px;
      padding: 48px 28px 60px;
      text-align: center;
    }

    .check-circle {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--gradient-start);
      font-size: 40px;
      margin-bottom: 24px;
    }

    .headline {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .subtext {
      font-size: 18px;
      margin-bottom: 32px;
      color: rgba(255, 255, 255, 0.9);
    }

    .number-pill {
      font-size: 16px;
      margin-bottom: 30px;
      letter-spacing: 0.04em;
    }

    .gradient-btn {
      border-radius: 999px;
      padding: 16px 32px;
      border: none;
      font-size: 16px;
      font-weight: 600;
      background: #000;
      color: #fff;
      width: 100%;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .gradient-btn:hover {
      transform: translateY(-2px);
    }

    .link-row {
      margin-top: 28px;
      font-size: 16px;
    }

    .link-row a {
      color: #ffffff;
      text-decoration: underline;
      font-weight: 600;
    }

    .link-row span {
      display: block;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="success-screen">
    <div class="check-circle">✓</div>
    <div class="headline">Poslano!</div>
    <div class="subtext">{{ ucfirst($question) }}</div>
    <div class="number-pill">👇 {{ $tapCount }} prijatelja je dodirnulo dugme 👇</div>
    <a href="{{ $link }}" class="gradient-btn">Uzmi svoje poruke!</a>
    <div class="link-row">
      <span>Želiš ponovo poslati?</span>
      <a href="{{ route('share.show', [$username, $slug]) }}">Pošalji novu poruku</a>
    </div>
  </div>
</body>
</html>
