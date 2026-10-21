// Обычный курсор + кружочки, которые вылетают при клике.
// ПК (мышь): кружочки вылетают из точки клика в любом месте страницы.
// Телефон/планшет: такая же анимация при нажатии на кнопку или ссылку.
(function () {
  const BASE_SIZE = 20;      // «размер» эффекта на большом мониторе, px (от него считаются дальность и размер кружочков)
  const MIN_SIZE = 12;       // минимум на маленьких экранах
  const FULL_WIDTH = 1440;   // от этой ширины окна эффект максимального размера
  const TOUCH_SIZE = 18;     // размер эффекта на телефоне
  const PARTS = 10;          // сколько кружочков вылетает
  const INTERACTIVE = 'a[href], button, [role="button"], summary, label[for], input[type="submit"]';

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let layer = null;

  function effectSize() {
    const size = (BASE_SIZE * window.innerWidth) / FULL_WIDTH;
    return Math.round(Math.min(BASE_SIZE, Math.max(MIN_SIZE, size)));
  }

  function getLayer() {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'cursor-fx-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function makePart(d, cx, cy) {
    const el = document.createElement('span');
    el.className = 'cursor-fx';
    el.style.width = d + 'px';
    el.style.height = d + 'px';
    el.style.margin = -d / 2 + 'px 0 0 ' + -d / 2 + 'px';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    getLayer().appendChild(el);
    return el;
  }

  // Кружочки вылетают из точки (cx, cy), немного висят и гаснут
  function burst(cx, cy, size) {
    if (reduceMotion.matches || !document.body.animate) return;

    const offset = Math.random() * Math.PI * 2;
    for (let i = 0; i < PARTS; i++) {
      const angle = offset + (i / PARTS) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = size * (1.5 + Math.random() * 1.7);
      const d = size * (0.22 + Math.random() * 0.22);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x0 = cos * size * 0.15;
      const y0 = sin * size * 0.15;
      const dx = cos * dist;
      const dy = sin * dist;
      const drift = size * (0.2 + Math.random() * 0.3);

      const part = makePart(d, cx, cy);
      part.animate(
        [
          { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(0.3)', opacity: 1, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1)', opacity: 1, offset: 0.35 },
          { transform: 'translate(' + dx * 1.1 + 'px,' + (dy * 1.1 + drift) + 'px) scale(1)', opacity: 1, offset: 0.75 },
          { transform: 'translate(' + dx * 1.15 + 'px,' + (dy * 1.15 + drift * 1.6) + 'px) scale(0.5)', opacity: 0 },
        ],
        { duration: 950 + Math.random() * 250, fill: 'forwards' }
      ).onfinish = function () { part.remove(); };
    }
  }

  // ПК: нажатие мышью где угодно на странице
  document.addEventListener(
    'pointerdown',
    function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      burst(e.clientX, e.clientY, effectSize());
    },
    true
  );

  // Телефон/планшет: только нажатие на кнопку или ссылку
  document.addEventListener(
    'click',
    function (e) {
      if (fine.matches) return;
      if (!e.target.closest || !e.target.closest(INTERACTIVE)) return;
      if (!e.clientX && !e.clientY) return; // клик с клавиатуры — без эффекта
      burst(e.clientX, e.clientY, TOUCH_SIZE);
    },
    true
  );
})();
