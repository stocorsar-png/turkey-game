# Звичайний день індика

## Запуск на Mac
1. Розпакуйте папку `turkey-game`.
2. Відкрийте Terminal у цій папці.
3. Виконайте:
   `python3 -m http.server 8000`
4. Відкрийте у браузері: `http://localhost:8000`

Гра використовує локальні JavaScript-модулі та WebP-зображення, тому запуск через localhost є правильним способом тестування.

## iPhone 13
Інтерфейс налаштований для вертикального мобільного режиму, touch-керування та safe area iOS. Орієнтир макета сцен: 1080×2340.

## Зображення
Усі зображення підключені у форматі `.webp`; конвертація в PNG не потрібна.


## v6 release
- WebP assets only.
- Functional native temperature slider over the illustrated temperature scale.
- iPhone touch/safe-area optimizations.
- Cache-busted CSS/JS URLs for reliable updates.
