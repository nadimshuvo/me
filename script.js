/**
 * Mobile Navigation Toggle
 */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/**
 * Scroll Animations using IntersectionObserver
 */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach((el) => {
    observer.observe(el);
});

/**
 * Active Navigation Link on Scroll
 */
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

/**
 * Smooth Scroll for Safari/Older Browsers (Optional polyfill-like behavior)
 * ensuring standard behavior works across the board.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for fixed header
                behavior: 'smooth'
            });
        }
    });
});
/**
 * Typewriter Effect
 */
function initTypewriter() {
    const roleElement = document.querySelector('.hero-role');
    if (!roleElement) return;

    const texts = roleElement.getAttribute('data-typing-text').split('|');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            roleElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            roleElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        // Handle typing states
        if (!isDeleting && charIndex === currentText.length) {
            // Finished typing word
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting word
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length; // Next word
            typeSpeed = 500; // Pause before new word
        }

        // Add cursor visual
        roleElement.innerHTML = `${roleElement.textContent}<span class="cursor">|</span>`;

        setTimeout(type, typeSpeed);
    }

    type();
}

/**
 * 3D Tilt Effect
 */
function initTilt() {
    const cards = document.querySelectorAll('.skill-card, .project-card, .certification-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.transition = 'transform 0.1s ease'; // Fast transition for smoothness
        });

        card.addEventListener('mouseleave', () => {
             card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
             card.style.transition = 'transform 0.5s ease'; // Smooth return
        });
    });
}

/**
 * Background Particles
 */
function initParticles() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    heroSection.appendChild(particlesContainer);

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 20 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration and delay
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

/**
 * Custom Counter Logic
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // Animation duration in milliseconds
        const startTime = performance.now();
        const startValue = 0;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation (easeOutQuart)
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            const currentValue = Math.floor(startValue + (target - startValue) * easeProgress);
            counter.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target; // Ensure final value is exact
            }
        };
        
        requestAnimationFrame(updateCounter);
    };
    
    // Use IntersectionObserver to trigger animation when counters are visible
    const observerOptions = {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted'); // Prevent re-animation
                animateCounter(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}


// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initTilt();
    initParticles();
    initCounters();
});

// Back to Top Button Logic
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.querySelector('.back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

/**
 * Background Music Logic (Hybrid: Autoplay + Button)
 */
document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle');
    
    if (music && toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        music.volume = 0.3;

        // updateIcon function
        const updateIcon = () => {
            if (music.paused) {
                toggleBtn.classList.remove('playing');
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-music');
            } else {
                toggleBtn.classList.add('playing');
                icon.classList.remove('fa-music');
                icon.classList.add('fa-pause');
            }
        };

        // 1. Try Autoplay logic
        const tryPlayMusic = () => {
            // If already playing, don't do anything
            if (!music.paused) return;

            const playPromise = music.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    console.log("Music started playing via autoplay/interaction.");
                    updateIcon();
                    // Cleanup interactions
                    document.removeEventListener('click', tryPlayMusic);
                    document.removeEventListener('keydown', tryPlayMusic);
                }).catch(error => {
                    console.log("Autoplay prevented. Waiting for user interaction.");
                    updateIcon(); // Ensure icon reflects paused state
                });
            }
        };

        // Try immediately
        tryPlayMusic();

        // Fallback: Try on first interaction
        document.addEventListener('click', tryPlayMusic, { once: true });
        document.addEventListener('keydown', tryPlayMusic, { once: true });

        // 2. Button Click Logic
        toggleBtn.addEventListener('click', (e) => {
            // Stop propagation so this click doesn't trigger the document-level "tryPlayMusic"
            // although "tryPlayMusic" handles "if (!music.paused) return", it's cleaner.
            e.stopPropagation();

            if (music.paused) {
                music.play().then(updateIcon).catch(console.error);
            } else {
                music.pause();
                updateIcon();
            }
        });
    }
});
