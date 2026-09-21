/* ============================================
   GUARINA0x0 - Shared JavaScript
   ============================================ */

/* Service Worker registration */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
}

/* Theme toggle (default = dark; light is opt-in) */
(function() {
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', function() {
        var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
})();

/* Hamburger / Mobile nav */
(function() {
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', function() {
        var isActive = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
})();

/* Nav scroll effect */
(function() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', function() {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
})();

/* Scroll reveal */
(function() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
    });
})();

/* Page Transitions (fade to black) */
(function() {
    var transitioning = false;

    document.querySelectorAll('a[href]').forEach(function(a) {
        var href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
            a.addEventListener('click', function(e) {
                if (transitioning) return;
                transitioning = true;
                e.preventDefault();
                var overlay = document.createElement('div');
                overlay.className = 'page-transition-overlay';
                document.body.appendChild(overlay);
                setTimeout(function() { window.location.href = href; }, 350);
            });
        }
    });
})();

/* Sidebar active tracking (review pages) */
(function() {
    var sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    if (!sidebarLinks.length) return;

    var sections = [];
    sidebarLinks.forEach(function(link) {
        var id = link.getAttribute('href');
        if (id && id.startsWith('#')) {
            var el = document.getElementById(id.substring(1));
            if (el) sections.push({ link: link, el: el });
        }
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                sidebarLinks.forEach(function(l) { l.classList.remove('active'); });
                var match = sections.find(function(s) { return s.el === entry.target; });
                if (match) match.link.classList.add('active');
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px' });

    sections.forEach(function(s) { observer.observe(s.el); });
})();

/* Reading progress bar (review pages) */
(function() {
    var bar = document.querySelector('.reading-progress');
    if (!bar) return;
    window.addEventListener('scroll', function() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
    });
})();

/* Back to top button */
(function() {
    var btn = document.querySelector('.back-top');
    if (!btn) return;
    window.addEventListener('scroll', function() {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
})();
