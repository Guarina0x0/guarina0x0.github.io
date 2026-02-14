/* ============================================
   GUARINA0x0 - Index Page Scripts
   ============================================ */

/* Portal Particles */
(function() {
    var container = document.querySelector('.portal-container');
    if (!container) return;
    for (var i = 0; i < 12; i++) {
        var particle = document.createElement('div');
        particle.className = 'portal-particle';
        var angle = (i / 12) * Math.PI * 2;
        var radius = 140 + Math.random() * 40;
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.setProperty('--tx', Math.cos(angle) * radius + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * radius + 'px');
        particle.style.animationDelay = (i * 0.25) + 's';
        particle.style.animationDuration = (2 + Math.random() * 2) + 's';

        var colors = ['#39ff14', '#00d4ff', '#8b5cf6', '#00ff88'];
        particle.style.background = colors[i % colors.length];
        particle.style.boxShadow = '0 0 6px ' + colors[i % colors.length];

        container.appendChild(particle);
    }
})();

/* Categories Search Filter */
(function() {
    var input = document.getElementById('searchInput');
    var grid = document.getElementById('categoriesGrid');
    if (!input || !grid) return;
    var cards = grid.querySelectorAll('.category-card');
    var countEl = document.getElementById('resultCount');
    var noResults = document.getElementById('noResults');

    input.addEventListener('input', function() {
        var query = input.value.toLowerCase().trim();
        var visible = 0;

        cards.forEach(function(card) {
            var tags = card.dataset.tags || '';
            var title = card.querySelector('.card-title').textContent.toLowerCase();
            var desc = card.querySelector('.card-description').textContent.toLowerCase();
            var match = !query || tags.includes(query) || title.includes(query) || desc.includes(query);

            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });

        if (countEl) countEl.textContent = visible;
        if (noResults) noResults.classList.toggle('visible', visible === 0);
    });
})();

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
                var step = Math.ceil(target / 40);
                var interval = setInterval(function() {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    entry.target.textContent = current + '+';
                }, 30);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function(c) { observer.observe(c); });
})();

/* Card Mouse Glow Effect */
(function() {
    document.querySelectorAll('.category-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });
})();

/* Interactive Terminal */
(function() {
    var body = document.getElementById('heroTerminalBody');
    var inputLine = document.getElementById('heroTerminalInputLine');
    var input = document.getElementById('heroTerminalInput');
    if (!body) return;

    var autoSequence = [
        { cmd: 'whoami', output: ['<span class="term-success">guarina0x0</span> :: Red Team Operator'] },
        { cmd: 'cat /etc/certs.conf', output: [
            '<span class="term-output">CRTE    - Certified Red Team Expert       <a href="https://www.credential.net/71c40f42-aabb-49c4-80f1-3f17b0155248#acc.h5SLtkHQ" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">CWP     - Certified Wireless Professional <a href="https://www.credential.net/043feaa3-5005-4f2f-ae85-75d0bacc57f8#acc.C6SI9s1x" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">CARTP   - Certified Azure Red Team Prof.  <a href="https://www.credential.net/f4d8f49f-d851-4cde-8167-62067255b04a#acc.m2td8i0C" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">CRTO    - Certified Red Team Operator     <a href="https://badges.parchment.eu/public/assertions/Fd1yqdbjQi-gjl1uouhjQA" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">CRTP    - Certified Red Team Professional <a href="https://www.credential.net/6aa5eeab-b942-4241-a119-3f1ae971dab0#acc.RnH7icPt" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">eCPPTv2 - Certified Prof. Pen Tester     <a href="https://verified.elearnsecurity.com/certificates/1b79f5ae-b4f9-466b-b295-d5036d3b75b2" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>',
            '<span class="term-output">eWPT    - eLearnSecurity Web Pentester    <a href="https://verified.elearnsecurity.com/certificates/4d193434-560d-40de-845e-412c276da0e0" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">[verify]</a></span>'
        ]},
        { cmd: 'nmap -sV --top-ports 100 portfolio.local', output: [
            '<span class="term-output">Starting Nmap scan...</span>',
            '<span class="term-output">PORT    STATE  SERVICE</span>',
            '<span class="term-success">22/tcp  open   ssh-portal</span>',
            '<span class="term-success">80/tcp  open   http-cheatsheets</span>',
            '<span class="term-success">443/tcp open   https-knowledge</span>',
            '<span class="term-success">8080/tcp open  red-team-api</span>',
            '<span class="term-output">Nmap done: 1 host up, 4 services detected</span>'
        ]},
        { cmd: 'python3 exploit.py --target knowledge-base', output: [
            '<span class="term-output">[*] Connecting to knowledge-base...</span>',
            '<span class="term-output">[*] Enumerating cheatsheets...</span>',
            '<span class="term-success">[+] Found 4 cheatsheets, 240+ commands indexed</span>',
            '<span class="term-success">[+] Exploitation successful. Portal ready.</span>'
        ]}
    ];

    var easterEggs = {
        help: ['<span class="term-output">Available: whoami, certs, skills, contact, hack, ls, clear, ping, date, uname, cat /etc/passwd, sudo, exit</span>'],
        whoami: ['<span class="term-success">guarina0x0</span> :: Red Team Operator'],
        certs: [
            '<span class="term-output"><a href="https://www.credential.net/71c40f42-aabb-49c4-80f1-3f17b0155248#acc.h5SLtkHQ" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">CRTE</a> | <a href="https://www.credential.net/043feaa3-5005-4f2f-ae85-75d0bacc57f8#acc.C6SI9s1x" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">CWP</a> | <a href="https://www.credential.net/f4d8f49f-d851-4cde-8167-62067255b04a#acc.m2td8i0C" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">CARTP</a> | <a href="https://badges.parchment.eu/public/assertions/Fd1yqdbjQi-gjl1uouhjQA" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">CRTO</a> | <a href="https://www.credential.net/6aa5eeab-b942-4241-a119-3f1ae971dab0#acc.RnH7icPt" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">CRTP</a> | <a href="https://verified.elearnsecurity.com/certificates/1b79f5ae-b4f9-466b-b295-d5036d3b75b2" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">eCPPTv2</a> | <a href="https://verified.elearnsecurity.com/certificates/4d193434-560d-40de-845e-412c276da0e0" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">eWPT</a></span>'
        ],
        skills: ['<span class="term-output">Active Directory, Kerberos, Cobalt Strike, Wi-Fi Hacking, Azure AD, Web Exploitation, EDR Evasion</span>'],
        contact: ['<span class="term-output">GitHub: <a href="https://github.com/Guarina0x0" target="_blank" rel="noopener noreferrer" style="color:var(--portal-green)">github.com/Guarina0x0</a></span>', '<span class="term-output">LinkedIn: <a href="https://www.linkedin.com/in/antonio-gallego-l%C3%B3pez-14047b1bb/" target="_blank" rel="noopener noreferrer" style="color:var(--rick-blue)">Antonio Gallego L\u00f3pez</a></span>', '<span class="term-output">X/Twitter: <a href="https://x.com/Guarina0x0" target="_blank" rel="noopener noreferrer" style="color:var(--morty-yellow)">@Guarina0x0</a></span>'],
        hack: ['<span class="term-success">[+] Initializing exploit framework...</span>', '<span class="term-success">[+] Access granted. Welcome to dimension C-137.</span>'],
        sudo: ['<span class="term-error">[!] Nice try. Rick doesn\'t need sudo.</span>'],
        clear: [],
        ls: ['<span class="term-output">crte-cheatsheet.html  crto-cheatsheet.html  cwp-cheatsheet.html  cartp-cheatsheet.html</span>'],
        exit: ['<span class="term-error">There is no escape from the portal, Morty.</span>'],
        ping: ['<span class="term-output">PING dimension-c137 (127.0.0.1): 64 bytes, time=0.042ms</span>', '<span class="term-success">--- 1 packet transmitted, 1 received, 0% loss ---</span>'],
        date: ['<span class="term-output">' + new Date().toString() + '</span>'],
        uname: ['<span class="term-output">PortalOS 137.0.0 guarina0x0-kernel x86_64 GNU/Dimension</span>'],
        'cat /etc/passwd': ['<span class="term-error">root:x:0:0:Rick Sanchez:/root:/bin/portal</span>', '<span class="term-output">morty:x:1000:1000:Morty Smith:/home/morty:/bin/bash</span>']
    };

    function addLine(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function typeCommand(text, callback) {
        addLine('<span class="term-prompt">$</span> <span class="term-cmd" id="termTyping"></span><span class="typewriter-cursor"></span>');
        var typing = document.getElementById('termTyping');
        var ci = 0;
        function t() {
            if (ci < text.length) {
                typing.textContent += text[ci];
                ci++;
                setTimeout(t, 40 + Math.random() * 60);
            } else {
                var cursor = typing.nextElementSibling;
                if (cursor) cursor.remove();
                typing.removeAttribute('id');
                setTimeout(callback, 300);
            }
        }
        setTimeout(t, 200);
    }

    function showOutput(lines, callback) {
        var li = 0;
        function next() {
            if (li < lines.length) {
                addLine(lines[li]);
                li++;
                setTimeout(next, 80 + Math.random() * 40);
            } else {
                setTimeout(callback, 400);
            }
        }
        next();
    }

    function runSequence(idx) {
        if (idx >= autoSequence.length) {
            enableInput();
            return;
        }
        var item = autoSequence[idx];
        typeCommand(item.cmd, function() {
            showOutput(item.output, function() {
                runSequence(idx + 1);
            });
        });
    }

    function enableInput() {
        if (inputLine) {
            inputLine.style.display = 'flex';
            input.placeholder = 'Type a command...';
            input.focus({ preventScroll: true });
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    var cmd = input.value.trim().toLowerCase();
                    input.value = '';
                    if (!cmd) return;
                    addLine('<span class="term-prompt">$</span> <span class="term-cmd">' + cmd.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>');
                    if (cmd === 'clear') {
                        body.innerHTML = '';
                    } else if (easterEggs[cmd]) {
                        easterEggs[cmd].forEach(function(l) { addLine(l); });
                    } else {
                        addLine('<span class="term-error">command not found: ' + cmd.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '. Try "help"</span>');
                    }
                }
            });
        }
    }

    setTimeout(function() { runSequence(0); }, 1500);
})();

/* Rick Quotes - Hacking Edition */
(function() {
    var quotes = [
        { text: '"Wubba Lubba Dub-Dub" \u2014 Lo que grito cuando consigo un <span>reverse shell</span> en el Domain Controller.', author: '- Rick S\u00e1nchez, Red Team Operator' },
        { text: '"La escuela no es un lugar para gente inteligente, Morty." Por eso aprendemos hacking en <span>CTFs</span> y labs.', author: '- Rick S\u00e1nchez, Exploit Developer' },
        { text: '"Yo soy el hombre m\u00e1s inteligente del universo, pero a\u00fan as\u00ed documento mis <span>exploits</span>."', author: '- Rick S\u00e1nchez, OPSEC Enthusiast' },
        { text: '"No pienses en ello, Morty." \u2014 Excepto cuando est\u00e1s enumerando <span>Active Directory</span>. Ah\u00ed piensa en todo.', author: '- Rick S\u00e1nchez, AD Specialist' },
        { text: '"En una dimensi\u00f3n infinita, hay infinitas configuraciones mal hechas de <span>Kerberos</span>."', author: '- Rick S\u00e1nchez, Kerberoast Master' },
        { text: '"Necesito que te concentres, Morty. Este <span>buffer overflow</span> no se va a explotar solo."', author: '- Rick S\u00e1nchez, Binary Exploitation' },
        { text: '"\u00bfSabes qu\u00e9 es gracioso? Que el 80% de las empresas a\u00fan tienen <span>SMB signing</span> deshabilitado."', author: '- Rick S\u00e1nchez, Network Pentester' },
        { text: '"He hackeado la burocracia intergal\u00e1ctica, Morty. Un <span>WAF</span> no me va a parar."', author: '- Rick S\u00e1nchez, WAF Bypass Expert' },
        { text: '"La paz es una ilusi\u00f3n. Y tambi\u00e9n lo es la seguridad perimetral sin <span>Zero Trust</span>."', author: '- Rick S\u00e1nchez, Security Philosopher' },
        { text: '"A veces la ciencia es m\u00e1s arte que ciencia, Morty. Como escribir un buen <span>phishing</span>."', author: '- Rick S\u00e1nchez, Social Engineer' }
    ];

    var quoteEl = document.getElementById('rickQuote');
    if (!quoteEl) return;

    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.innerHTML = randomQuote.text + '<br><small style="color: var(--text-dim); font-style: normal; font-size: 0.75rem;">' + randomQuote.author + '</small>';
})();
