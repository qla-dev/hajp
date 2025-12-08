<!doctype html>
<html lang="bs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pošalji anonimnu poruku</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <style>
    :root {
      --gradient-start: {{ $gradientStart }};
      --gradient-end: {{ $gradientEnd }};
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
      font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: stretch;
    }

    .screen {
      width: 100%;
      max-width: 430px;
      padding: 28px 20px 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-shell {
      border-radius: 32px;
      background: #fff;
      overflow: hidden;
      min-height: 270px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 30px 50px rgba(0, 0, 0, 0.25);
    }

    .card-top {
      background: #fff;
      padding: 18px 22px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid #ececec;
      border-top-left-radius: 32px;
      border-top-right-radius: 32px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      background: #d6d6d6;
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-top small {
      display: block;
      font-size: 12px;
      color: #7c7c7c;
    }

    .card-top h5 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: black;
    }

    .question-caption {
      margin: 4px 0 0;
      font-size: 14px;
      color: #b45176;
      text-transform: lowercase;
      opacity: 0.8;
    }

    .card-body {
      flex: 1;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.78));
      border-bottom-left-radius: 32px;
      border-bottom-right-radius: 32px;
      padding: 20px 24px 26px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .typing-box {
    }

    .typing-box textarea {
      width: 100%;
      border: none;
      background: transparent;
      resize: none;
      font-size: 20px;
      font-weight: 600;
      color: #2a2a2a;
      line-height: 1.3;
      font-family: inherit;
      outline: none;
      min-height: 90px;
    }

    .dice {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.18);
      align-self: flex-end;
      font-size: 26px;
    }

    .lock {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.4em;
      color: #fff;
    }

    .lock span {
      font-size: 20px;
    }

    .tap-count {
      font-size: 18px;
      text-align: center;
      letter-spacing: 0.02em;
      padding-top: 32px;
    }

    .cta {
      margin-top: 4px;
      background: #000;
      border-radius: 999px;
      padding: 18px 22px;
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.4);
      border: none;
      color: #fff;
      cursor: pointer;
      text-decoration: none;
    }

    .cta.hidden {
      display: none;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 18px;
      font-size: 12px;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .footer-links a {
      text-decoration: none;
      color: inherit;
    }
  </style>
</head>
<body>
  <div class="screen">
    <div class="card-shell">
      <div class="card-top">
        <div class="avatar">
          <img src="{{ $profilePhoto }}" alt="avatar of {{ $displayName }}" />
        </div>
        <div>
          <small>{{ '@' . $username }}</small>
          <h5>{{ ucfirst($question) }}</h5>
        </div>
      </div>
      <div class="card-body">
        <div class="typing-box">
          <textarea id="messageInput" placeholder=""></textarea>
        </div>
        <div class="dice">🎲</div>
      </div>
    </div>

    <div class="lock">
      <span>🔒</span>
      ANONIMNA Q&A
    </div>

    <button id="sendButton" class="cta hidden">Pošalji</button>

    <div class="tap-count">
      👇 {{ $tapCount ?? 256 }} prijatelja je dodirnulo dugme 👇
    </div>

    <a href="{{ $link }}" class="cta">Uzmi svoje poruke!</a>

    <div class="footer-links">
      <a href="#">uslovi</a>
      <a href="#">privatnost</a>
    </div>
  </div>

  <script>
    const placeholders = [
      'Ko ti je simpatija?',
      'Ko ti se sviđa?',
      'Koja ti je najveća tajna?',
      'Šta bi volio/voljela da znaš o sebi?',
      'Koja ti je najluđa priča?',
      'Ko ti je dao najviše podrške?'
    ];

    const input = document.getElementById('messageInput');
    const send = document.getElementById('sendButton');
    const successUrl = '{{ route('share.success', [$username, $slug]) }}';
    const csrfToken = '{{ csrf_token() }}';

    const setRandomPlaceholder = () => {
      const index = Math.floor(Math.random() * placeholders.length);
      input.placeholder = placeholders[index];
    };

    setRandomPlaceholder();

    input.addEventListener('input', () => {
      const hasValue = input.value.trim().length > 0;
      send.classList.toggle('hidden', !hasValue);
    });

    send.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) {
        return;
      }
      const form = new FormData();
      form.append('message', value);
      fetch(successUrl, {
        method: 'POST',
        body: form,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken
        }
      })
        .then(() => {
          window.location.href = successUrl;
        })
        .catch(() => {
          window.location.href = successUrl;
        });
    });
  </script>
</body>
</html>
