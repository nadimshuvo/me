/**
 * Modern Animation System
 */
const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Page loader
 */
function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader || prefersReducedMotion()) {
        document.body.classList.remove('is-loading');
        loader?.classList.add('is-done');
        return;
    }

    document.body.classList.add('is-loading');

    const finish = () => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        initHeroAnimations();
    };

    if (document.readyState === 'complete') {
        setTimeout(finish, 600);
    } else {
        window.addEventListener('load', () => setTimeout(finish, 900));
    }
}

/**
 * Unified scroll reveal
 */
function initScrollReveal() {
    const selector =
        '.reveal, .fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .reveal-image, .section-title';
    const targets = [...document.querySelectorAll(selector)].filter(
        el => !el.closest('#hero')
    );

    if (prefersReducedMotion()) {
        document.querySelectorAll(selector).forEach(el => el.classList.add('is-visible', 'visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible', 'visible');
                obs.unobserve(entry.target);
            });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    targets.forEach(el => observer.observe(el));
}

/**
 * Hero entrance after loader
 */
function initHeroAnimations() {
    const heroItems = document.querySelectorAll('#hero .reveal');
    if (prefersReducedMotion()) {
        heroItems.forEach(el => el.classList.add('is-visible'));
        return;
    }

    requestAnimationFrame(() => {
        heroItems.forEach(el => el.classList.add('is-visible'));
    });
}

/**
 * Hero abstract animations — particles + parallax
 */
function initHeroAbstract() {
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('hero-particles');
    if (!hero) return;

    if (!prefersReducedMotion() && window.matchMedia('(min-width: 769px)').matches) {
        initHeroParallax(hero);
        if (canvas) initHeroParticles(canvas, hero);
    }
}

function initHeroParallax(hero) {
    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty('--hero-px', x.toFixed(3));
        hero.style.setProperty('--hero-py', y.toFixed(3));
    });

    hero.addEventListener('mouseleave', () => {
        hero.style.setProperty('--hero-px', '0');
        hero.style.setProperty('--hero-py', '0');
    });
}

function initHeroParticles(canvas, hero) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationId = null;
    let mouse = { x: 0, y: 0, active: false };
    const particles = [];
    const count = 38;
    const linkDist = 110;

    const resize = () => {
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const createParticles = () => {
        particles.length = 0;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.5 + 0.5
            });
        }
    };

    const draw = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            if (mouse.active) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 140) {
                    p.x -= dx * 0.008;
                    p.y -= dy * 0.008;
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(129, 140, 248, 0.45)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.hypot(dx, dy);
                if (dist < linkDist) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(34, 211, 238, ${0.12 * (1 - dist / linkDist)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(draw);
    };

    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animationId);
        else draw();
    });
}

/**
 * Stagger grid children
 */
function initGridStagger() {
    document.querySelectorAll('.skills-grid, .certifications-grid, .projects-grid').forEach(grid => {
        [...grid.children].forEach((child, index) => {
            child.style.setProperty('--stagger', `${(index % 6) * 0.06}s`);
        });
    });
}

/**
 * Skill card spotlight follow
 */
function initCardSpotlight() {
    if (prefersReducedMotion()) return;

    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

/**
 * Mobile Navigation
 */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/**
 * Header scroll state
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Scroll progress
 */
function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
}

/**
 * Active nav link
 */
const sections = document.querySelectorAll('section');

window.addEventListener(
    'scroll',
    () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(current));
        });
    },
    { passive: true }
);

/**
 * Smooth scroll
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

/**
 * Typewriter
 */
function initTypewriter() {
    const el = document.querySelector('.hero-role');
    if (!el) return;

    const texts = el.getAttribute('data-typing-text').split('|');
    let textIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const current = texts[textIndex];
        let delay = 70;

        if (deleting) {
            charIndex--;
            delay = 35;
        } else {
            charIndex++;
            delay = 55;
        }

        el.innerHTML = `${current.substring(0, charIndex)}<span class="cursor"></span>`;

        if (!deleting && charIndex === current.length) {
            deleting = true;
            delay = 2000;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            textIndex = (textIndex + 1) % texts.length;
            delay = 400;
        }

        setTimeout(tick, delay);
    };

    tick();
}

/**
 * Stat counters
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const run = counter => {
        const target = parseInt(counter.dataset.target, 10);
        const duration = 1800;
        const start = performance.now();

        const step = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            counter.textContent = Math.floor(target * eased);
            if (progress < 1) requestAnimationFrame(step);
            else counter.textContent = target;
        };

        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    run(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(c => observer.observe(c));
}

/**
 * Form focus states
 */
function initFormAnimations() {
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('is-focused'));
        input.addEventListener('blur', () => input.parentElement.classList.remove('is-focused'));
    });
}

/**
 * Back to top
 */
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener(
        'scroll',
        () => btn.classList.toggle('active', window.scrollY > 300),
        { passive: true }
    );

    btn.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Background music
 */
function initMusic() {
    const music = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle');
    if (!music || !toggleBtn) return;

    const icon = toggleBtn.querySelector('i');
    music.volume = 0.3;

    const updateIcon = () => {
        const playing = !music.paused;
        toggleBtn.classList.toggle('playing', playing);
        icon.classList.toggle('fa-pause', playing);
        icon.classList.toggle('fa-music', !playing);
    };

    const tryPlay = () => {
        if (!music.paused) return;
        music.play().then(updateIcon).catch(updateIcon);
    };

    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });

    toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (music.paused) music.play().then(updateIcon).catch(console.error);
        else {
            music.pause();
            updateIcon();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initScrollReveal();
    initHeaderScroll();
    initScrollProgress();
    initGridStagger();
    initHeroAbstract();
    initCardSpotlight();
    initTypewriter();
    initCounters();
    initFormAnimations();
    initBackToTop();
    initMusic();

    if (prefersReducedMotion()) {
        initHeroAnimations();
    }
});
