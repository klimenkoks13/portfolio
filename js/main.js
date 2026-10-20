// Подсветка активного пункта меню при скролле.
// Активный раздел — тот, заголовок которого находится в центре экрана.
(function () {
  const links = Array.from(document.querySelectorAll('.nav__link'));
  const sections = Array.from(document.querySelectorAll('section[data-section]'));

  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  function setActive(id) {
    // Если у раздела нет пункта в меню (например, «Контакты» на странице кейса) — ничего не меняем
    if (!links.some((link) => link.dataset.section === id)) return;
    links.forEach((link) => {
      const isActive = link.dataset.section === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.dataset.section);
        }
      });
    },
    {
      // Срабатываем, когда раздел пересекает центральную полосу экрана
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));

  // Клик по пункту меню: плавный переход (поведение задаётся в CSS scroll-behavior).
  // Сразу подсвечиваем выбранный пункт, не дожидаясь окончания прокрутки.
  links.forEach((link) => {
    link.addEventListener('click', () => {
      setActive(link.dataset.section);
    });
  });

  // Если пользователь в самом низу страницы, подсвечиваем последний раздел
  window.addEventListener(
    'scroll',
    () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActive(sections[sections.length - 1].dataset.section);
      }
    },
    { passive: true }
  );

  // Чтобы «Главная» подсвечивалась в самом верху страницы
  if (window.scrollY < 10) {
    setActive('top');
  }
})();


// Мобильное меню (бургер): открытие/закрытие выпадающей навигации
(function () {
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.burger');
  if (!header || !burger) return;

  function setOpen(open) {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => {
    setOpen(!header.classList.contains('is-open'));
  });

  // Закрываем меню по клику на пункт, по Escape, по клику вне меню и при переходе на десктопную ширину
  header.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) setOpen(false);
  });

  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
})();
