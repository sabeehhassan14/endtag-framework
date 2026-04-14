/**
 * END TAG DIGITAL - ETCH JAVASCRIPT MASTER ENGINE
 * Includes: LCP Optimization, Theme Toggle, Parallax, and Animations.
 * Recommended placement: <head> (to prevent FOUC and layout shifts).
 */

// ==========================================================================
// 1. LCP & BOT OPTIMIZATION (Runs Immediately)
// ==========================================================================
(function() {
    function isBot() {
        const botAgents = [
            'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 
            'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver', 
            'adsbot-google', 'apis-google', 'mediapartners-google'
        ];
        const userAgent = navigator.userAgent.toLowerCase();
        return botAgents.some(agent => userAgent.includes(agent));
    }

    function isFirstSessionVisit() {
        try {
            if (sessionStorage.getItem('hasVisitedSession') === null) {
                sessionStorage.setItem('hasVisitedSession', 'true');
                return true;
            }
        } catch (e) {
            console.warn('SessionStorage not available. ATF animation will run.');
            return false;
        }
        return false;
    }

    if (isBot() || isFirstSessionVisit()) {
        document.documentElement.classList.add('no-atf-animation');
    }
})();

// ==========================================================================
// 2. THEME INITIALIZATION (Runs Immediately to prevent FOUC)
// ==========================================================================
(function() {
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem('endtag-theme');
    
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlEl.setAttribute('data-theme', 'dark');
    }
})();

// ==========================================================================
// 3. EVENT LISTENERS (Theme Toggles, Parallax, & Animations)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- ETCH BUILDER DETECTION ---
    // If inside the Etch iframe, bail out of interactive visual JS.
    const isBuilder = window.self !== window.top || (window.frameElement && window.frameElement.id === 'etch-iframe');
    if (isBuilder) {
        document.documentElement.classList.add('is-etch-builder');
        return; // Abort further animation/parallax logic
    }

    // --- THEME TOGGLE UI ---
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const htmlEl = document.documentElement;

    if (themeToggles.length) {
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const currentTheme = htmlEl.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                htmlEl.setAttribute('data-theme', newTheme);
                localStorage.setItem('endtag-theme', newTheme);
            });
        });
    }

    // --- PARALLAX ENGINE ---
    const parallaxElements = document.querySelectorAll('.floating-parallax, .floating-parallax-absolute');
    if (parallaxElements.length) {
        const mediaQuery = window.matchMedia('(min-width: 992px)');

        const handleParallax = () => {
            if (!mediaQuery.matches) return;

            window.requestAnimationFrame(() => {
                parallaxElements.forEach(el => {
                    const parent = el.closest('.parallax-section') || el.closest('section');
                    if (!parent) return;

                    const rect = parent.getBoundingClientRect();
                    const windowHeight = window.innerHeight;

                    if (rect.top <= windowHeight && rect.bottom >= 0) {
                        const speed = parseFloat(el.getAttribute('data-speed')) || 0.05;
                        const sectionCenter = rect.top + (rect.height / 2);
                        const viewportCenter = windowHeight / 2;
                        const yMovement = (sectionCenter - viewportCenter) * speed;

                        el.style.transform = `translate3d(0, ${yMovement}px, 0)`;
                    }
                });
            });
        };

        mediaQuery.addEventListener('change', (e) => {
            if (!e.matches) {
                parallaxElements.forEach(el => el.style.transform = ''); 
            } else {
                handleParallax();
            }
        });

        window.addEventListener('scroll', handleParallax, { passive: true });
        handleParallax(); // Initial check
    }

    // --- STAGGER & FADE-IN ENGINE ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const runStaggerAnimation = (container) => {
        const children = container.querySelectorAll('.has-fade-in:not(.is-visible)');
        if (!children.length) return;

        let delay = 100;
        const increment = 150;
        const animationDuration = 400; 
        let maxDelay = 0;

        children.forEach(child => {
            child.style.transitionDelay = `${delay}ms`;
            
            requestAnimationFrame(() => {
                child.classList.add('is-visible');
            });

            maxDelay = delay;
            delay += increment;
        });

        // Single bulletproof cleanup timer
        const cleanupTime = maxDelay + animationDuration + 100;
        setTimeout(() => {
            children.forEach(child => {
                child.style.transitionDelay = '';
            });
        }, cleanupTime);
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runStaggerAnimation(entry.target);
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Initialize with a slight buffer for the View Transitions API
    setTimeout(() => {
        document.querySelectorAll('.has-fade-in:not(.stagger-container .has-fade-in)').forEach(el => {
            fadeObserver.observe(el);
        });

        document.querySelectorAll('.stagger-container').forEach(container => {
            staggerObserver.observe(container);
        });
    }, 100);

});
