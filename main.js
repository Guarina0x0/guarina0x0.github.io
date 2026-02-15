/* ============================================
   GUARINA0x0 - Shared JavaScript
   ============================================ */

/* Service Worker registration */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
}

/* Theme toggle */
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

/* (Starfield/Matrix canvas is handled by the toggle module at the bottom) */

/* Enhanced Global Search (Ctrl+K modal) */
(function() {
    var searchIndex = window.__searchIndex || null;
    var activeIdx = -1;
    var activeSheetFilter = 'all';
    var activeLangFilter = 'all';

    var overlay = document.getElementById('searchOverlay');
    var input = document.getElementById('searchInput') || document.getElementById('globalSearchInput');
    var results = document.getElementById('searchResults') || document.getElementById('globalSearchResults');
    var countEl = document.getElementById('searchCount') || document.getElementById('globalSearchCount');
    var filtersEl = document.getElementById('searchFilters') || document.getElementById('globalSearchFilters');
    var trigger = document.getElementById('searchTrigger');

    if (!overlay || !input || !results) return;

    function getLangCategory(lang) {
        if (!lang) return 'Other';
        var l = lang.toLowerCase();
        if (/powershell|pwsh/.test(l)) return 'PowerShell';
        if (/bash|sh|linux|zsh/.test(l)) return 'Bash';
        if (/cmd|batch|dos/.test(l)) return 'CMD';
        if (/cobalt|beacon|cs/.test(l)) return 'Cobalt Strike';
        return 'Other';
    }

    function getRecent() {
        try { return JSON.parse(localStorage.getItem('guarina_recent_searches') || '[]'); } catch(e) { return []; }
    }
    function saveRecent(q) {
        if (q.length < 2) return;
        var recent = getRecent().filter(function(r) { return r !== q; });
        recent.unshift(q);
        if (recent.length > 5) recent = recent.slice(0, 5);
        localStorage.setItem('guarina_recent_searches', JSON.stringify(recent));
    }
    function showRecent() {
        var recent = getRecent();
        if (!recent.length) {
            results.innerHTML = '<div class="search-empty">Type to search commands across all cheatsheets...</div>';
            return;
        }
        results.innerHTML = '<div class="search-recent-title">Recent Searches</div>' +
            recent.map(function(r) { return '<div class="search-recent-item" data-query="' + r.replace(/"/g,'&quot;') + '">' + r + '</div>'; }).join('');
        results.querySelectorAll('.search-recent-item').forEach(function(el) {
            el.addEventListener('click', function() {
                input.value = this.dataset.query;
                input.dispatchEvent(new Event('input'));
            });
        });
    }

    function openSearch() {
        overlay.classList.add('active');
        input.value = '';
        input.focus();
        if (countEl) countEl.textContent = '';
        activeIdx = -1;
        showRecent();
    }
    function closeSearch() {
        overlay.classList.remove('active');
        activeIdx = -1;
    }

    if (trigger) trigger.addEventListener('click', openSearch);
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            overlay.classList.contains('active') ? closeSearch() : openSearch();
        }
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
    });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeSearch(); });

    if (filtersEl) {
        filtersEl.querySelectorAll('.filter-chip[data-sheet]').forEach(function(chip) {
            chip.addEventListener('click', function() {
                filtersEl.querySelectorAll('.filter-chip[data-sheet]').forEach(function(c) { c.classList.remove('active'); });
                this.classList.add('active');
                activeSheetFilter = this.dataset.sheet;
                input.dispatchEvent(new Event('input'));
            });
        });
        filtersEl.querySelectorAll('.filter-chip[data-lang]').forEach(function(chip) {
            chip.addEventListener('click', function() {
                filtersEl.querySelectorAll('.filter-chip[data-lang]').forEach(function(c) { c.classList.remove('active'); });
                this.classList.add('active');
                activeLangFilter = this.dataset.lang;
                input.dispatchEvent(new Event('input'));
            });
        });
    }

    function highlight(text, query) {
        if (!query) return text;
        return text.replace(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    }

    function renderResults(items, q) {
        if (!items.length) {
            results.innerHTML = '<div class="search-empty">No results found</div>';
            if (countEl) countEl.textContent = '0 results';
            return;
        }
        var shown = items.slice(0, 25);
        if (countEl) countEl.textContent = items.length + ' result' + (items.length !== 1 ? 's' : '');
        results.innerHTML = shown.map(function(item, i) {
            var langCat = getLangCategory(item.lang || '');
            return '<a class="search-result-item" href="' + item.url + '" data-idx="' + i + '">' +
                '<div class="search-result-meta"><span>' + item.cheatsheet + '</span><span class="result-section">' + item.section + '</span>' +
                (langCat !== 'Other' ? '<span class="search-result-lang" data-lang="' + langCat + '">' + langCat + '</span>' : '') +
                '</div><div class="search-result-code">' + item.highlightedText + '</div></a>';
        }).join('');
        if (q) saveRecent(q);
    }

    input.addEventListener('input', function() {
        var q = this.value.trim().toLowerCase();
        if (q.length < 2 || !searchIndex) {
            if (countEl) countEl.textContent = '';
            if (q.length > 0) results.innerHTML = '<div class="search-empty">Type at least 2 characters...</div>';
            else showRecent();
            activeIdx = -1;
            return;
        }
        var filtered = searchIndex.filter(function(item) {
            if (activeSheetFilter !== 'all' && !(item.cheatsheet || '').toUpperCase().includes(activeSheetFilter)) return false;
            if (activeLangFilter !== 'all' && getLangCategory(item.lang || '') !== activeLangFilter) return false;
            return item.text.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.cheatsheet.toLowerCase().includes(q);
        }).map(function(item) {
            return Object.assign({}, item, { highlightedText: highlight(item.text.substring(0, 120), q) });
        });
        renderResults(filtered, q);
        activeIdx = -1;
    });

    input.addEventListener('keydown', function(e) {
        var items = results.querySelectorAll('.search-result-item');
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIdx = (activeIdx + 1) % items.length;
            items.forEach(function(el, i) { el.classList.toggle('active', i === activeIdx); });
            items[activeIdx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIdx = activeIdx <= 0 ? items.length - 1 : activeIdx - 1;
            items.forEach(function(el, i) { el.classList.toggle('active', i === activeIdx); });
            items[activeIdx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            var link = items[activeIdx].getAttribute('href');
            if (link) window.location.href = link;
        }
    });
})();

/* Copy code button handler (for cheatsheet pages) */
(function() {
    document.querySelectorAll('.code-copy').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var block = this.closest('.code-block');
            var pre = block.querySelector('pre');
            if (!pre) return;
            var text = pre.textContent;
            navigator.clipboard.writeText(text).then(function() {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(function() {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });
})();

/* Sidebar active tracking (for cheatsheet pages) */
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

/* Reading progress bar (for cheatsheet pages) */
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

/* ============================================
   MATRIX RAIN / STARFIELD TOGGLE
   ============================================ */
(function() {
    var canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var currentMode = localStorage.getItem('bgMode') || 'stars';
    var animationId = null;

    /* --- Starfield renderer --- */
    var stars = [];
    var STAR_COUNT = 200;

    function createStars() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.3 + 0.05,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var time = Date.now() * 0.001;
        stars.forEach(function(star) {
            var flicker = Math.sin(time * star.speed * 2 + star.pulse) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(57, 255, 20, ' + (star.alpha * flicker * 0.4) + ')';
            ctx.fill();
            if (star.radius > 1) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(139, 92, 246, ' + (star.alpha * flicker * 0.1) + ')';
                ctx.fill();
            }
        });
        animationId = requestAnimationFrame(drawStars);
    }

    /* --- Matrix rain renderer --- */
    var columns = [];
    var FONT_SIZE = 14;
    var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]=/\\*+-;:'.split('');

    function initMatrix() {
        var colCount = Math.ceil(canvas.width / FONT_SIZE);
        columns = [];
        for (var i = 0; i < colCount; i++) {
            columns.push({
                y: Math.random() * canvas.height / FONT_SIZE | 0,
                speed: 0.5 + Math.random() * 1.5,
                acc: 0
            });
        }
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(5, 5, 16, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = FONT_SIZE + 'px "Share Tech Mono", monospace';

        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            var char = chars[Math.random() * chars.length | 0];
            var x = i * FONT_SIZE;
            var y = col.y * FONT_SIZE;

            /* Head character: bright green/white */
            ctx.fillStyle = 'rgba(57, 255, 20, 0.95)';
            ctx.fillText(char, x, y);

            /* Glow on head */
            ctx.shadowColor = '#39ff14';
            ctx.shadowBlur = 8;
            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;

            /* Previous chars fade */
            if (Math.random() > 0.97) {
                ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
                ctx.fillText(chars[Math.random() * chars.length | 0], x, y - FONT_SIZE * 2);
            }

            col.acc += col.speed;
            if (col.acc >= 1) {
                col.acc = 0;
                col.y++;
                if (col.y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                    col.y = 0;
                    col.speed = 0.5 + Math.random() * 1.5;
                }
            }
        }

        animationId = requestAnimationFrame(drawMatrix);
    }

    /* --- Resize handler --- */
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (currentMode === 'stars') createStars();
        else initMatrix();
    }

    /* --- Mode switching --- */
    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function startMode(mode) {
        stopAnimation();
        currentMode = mode;
        localStorage.setItem('bgMode', mode);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var toggleBtn = document.getElementById('bgToggle');
        if (toggleBtn) toggleBtn.classList.toggle('matrix-active', mode === 'matrix');

        if (mode === 'matrix') {
            initMatrix();
            drawMatrix();
        } else {
            createStars();
            drawStars();
        }
    }

    /* --- Visibility optimization --- */
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAnimation();
        } else {
            if (currentMode === 'matrix') drawMatrix();
            else drawStars();
        }
    });

    window.addEventListener('resize', resize);
    resize();
    startMode(currentMode);

    /* Expose toggle for button */
    window.__toggleBgMode = function() {
        startMode(currentMode === 'stars' ? 'matrix' : 'stars');
    };
})();
