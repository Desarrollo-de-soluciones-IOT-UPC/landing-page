document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('header');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateHeaderState() {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 12);
    }

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle) {
                navToggle.checked = false;
            }
        });
    });

    const navToggleLabel = document.querySelector('.nav-toggle-label');
    if (navToggleLabel) {
        navToggleLabel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    const slider = document.querySelector('.testimonial-slider');
    const slides = document.querySelectorAll('.testimonial-slide');
    const testimonialNav = document.querySelector('.testimonial-nav');
    let currentSlide = 0;

    if (slider && testimonialNav && slides.length > 0) {
        testimonialNav.innerHTML = '';

        slides.forEach((_, index) => {
            const button = document.createElement('button');
            button.setAttribute('aria-label', `Ver testimonio ${index + 1}`);
            if (index === 0) button.classList.add('active');

            button.addEventListener('click', () => {
                goToSlide(index);
            });

            testimonialNav.appendChild(button);
        });

        function updateActiveTestimonialButton() {
            document.querySelectorAll('.testimonial-nav button').forEach((btn, i) => {
                btn.classList.toggle('active', i === currentSlide);
            });
        }

        function goToSlide(n) {
            currentSlide = (n + slides.length) % slides.length;
            const offset = slides[currentSlide].offsetLeft;
            slider.scrollTo({
                left: offset,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

            updateActiveTestimonialButton();
        }

        slider.addEventListener('scroll', () => {
            const index = Math.round(slider.scrollLeft / slider.clientWidth);
            if (index !== currentSlide) {
                currentSlide = index;
                updateActiveTestimonialButton();
            }
        }, { passive: true });
    }

    const heroMotionItems = [
        document.querySelector('.hero-text h1'),
        document.querySelector('.hero-text p'),
        document.querySelector('.hero-text .cta-button'),
        document.querySelector('.hero-image img')
    ].filter(Boolean);

    heroMotionItems.forEach((el, index) => {
        el.classList.add('hero-motion');
        el.style.transitionDelay = prefersReducedMotion ? '0ms' : `${index * 110}ms`;
    });

    requestAnimationFrame(() => {
        heroMotionItems.forEach(el => el.classList.add('reveal-visible'));
    });

    const revealSelectors = [
        '.feature-card',
        '.benefit-item',
        '.subscription-card',
        '.about-section',
        '.problem-card',
        '.problem-video-container',
        '.testimonial-slide',
        '.location-card',
        '.map-card',
        '.info-card',
        '.contact-form'
    ];

    document.querySelectorAll('.features-grid .feature-card, .benefits-grid .benefit-item, .subscription-grid .subscription-card').forEach(el => {
        el.classList.add('stagger-item');
    });

    const revealElements = document.querySelectorAll(revealSelectors.join(', '));
    revealElements.forEach(el => {
        el.classList.add('reveal', 'reveal-blur');
    });

    if (prefersReducedMotion) {
        revealElements.forEach(el => {
            el.classList.add('reveal-visible', 'animate');
        });
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible', 'animate');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });
});
