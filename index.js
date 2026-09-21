/* ============================================
   GUARINA0x0 - Index Page Scripts
   ============================================ */

/* Stat Counter Animation */
(function() {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                var target = parseInt(entry.target.dataset.count);
                var current = 0;
                var step = Math.max(1, Math.ceil(target / 40));
                var interval = setInterval(function() {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    entry.target.textContent = current;
                }, 30);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function(c) { observer.observe(c); });
})();
