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

    const paymentModal = document.getElementById('payment-modal');
    const paymentDialog = paymentModal ? paymentModal.querySelector('.payment-dialog') : null;
    const paymentForm = paymentModal ? paymentModal.querySelector('.payment-form') : null;
    const paymentSubmit = paymentModal ? paymentModal.querySelector('.payment-submit') : null;
    const paymentSubmitText = paymentModal ? paymentModal.querySelector('.payment-submit-text') : null;
    const paymentAlert = paymentModal ? paymentModal.querySelector('[data-payment-alert]') : null;
    const paymentFields = paymentForm ? paymentForm.querySelectorAll('input') : [];
    let selectedPaymentPlan = null;
    let paymentTimer = null;

    function setText(selector, value) {
        if (!paymentModal) return;
        paymentModal.querySelectorAll(selector).forEach(el => {
            el.textContent = value;
        });
    }

    function clearPaymentErrors() {
        if (!paymentForm) return;
        paymentForm.querySelectorAll('.payment-field').forEach(field => {
            field.classList.remove('has-error');
        });
        paymentForm.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
        });
        if (paymentAlert) {
            paymentAlert.classList.remove('is-visible');
            paymentAlert.textContent = '';
        }
    }

    function setPaymentError(fieldName, message) {
        const input = paymentForm ? paymentForm.elements[fieldName] : null;
        const error = paymentForm ? paymentForm.querySelector(`[data-error-for="${fieldName}"]`) : null;
        if (input) {
            input.closest('.payment-field').classList.add('has-error');
        }
        if (error) {
            error.textContent = message;
        }
    }

    function setPaymentProcessing(isProcessing) {
        if (!paymentForm || !paymentSubmit || !paymentSubmitText) return;
        paymentForm.classList.toggle('is-processing', isProcessing);
        paymentSubmit.classList.toggle('is-loading', isProcessing);
        paymentSubmit.disabled = isProcessing;
        paymentSubmitText.textContent = isProcessing ? 'Procesando pago...' : 'Pagar ahora';
        paymentFields.forEach(input => {
            input.disabled = isProcessing;
        });
    }

    function resetPaymentForm() {
        if (!paymentForm || !paymentDialog) return;
        clearTimeout(paymentTimer);
        paymentDialog.classList.remove('is-success');
        paymentForm.reset();
        clearPaymentErrors();
        setPaymentProcessing(false);
    }

    function openPaymentModal(plan) {
        if (!paymentModal || !paymentDialog) return;
        selectedPaymentPlan = plan;
        resetPaymentForm();
        setText('[data-payment-plan]', plan.name);
        setText('[data-payment-price]', plan.price);
        setText('[data-payment-order-plan]', plan.name);
        setText('[data-payment-order-price]', plan.price);
        setText('[data-payment-total]', plan.price);
        setText('[data-success-plan]', plan.name);
        setText('[data-success-price]', plan.price);
        paymentModal.classList.add('is-open');
        paymentModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('payment-lock');
        paymentDialog.scrollTop = 0;
        setTimeout(() => {
            const firstInput = paymentForm ? paymentForm.elements.cardHolder : null;
            if (firstInput) firstInput.focus({ preventScroll: true });
        }, 120);
    }

    function closePaymentModal() {
        if (!paymentModal) return;
        clearTimeout(paymentTimer);
        paymentModal.classList.remove('is-open');
        paymentModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('payment-lock');
        setPaymentProcessing(false);
    }

    function validatePaymentForm() {
        if (!paymentForm) return false;
        clearPaymentErrors();

        const values = {
            cardHolder: paymentForm.elements.cardHolder.value.trim(),
            cardNumber: paymentForm.elements.cardNumber.value.replace(/\D/g, ''),
            cardExpiry: paymentForm.elements.cardExpiry.value.trim(),
            cardCvv: paymentForm.elements.cardCvv.value.replace(/\D/g, ''),
            paymentEmail: paymentForm.elements.paymentEmail.value.trim()
        };
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        if (!values.cardHolder) {
            setPaymentError('cardHolder', 'Ingresa el nombre del titular.');
            isValid = false;
        }
        if (values.cardNumber.length < 13) {
            setPaymentError('cardNumber', 'Ingresa un número de tarjeta válido para la simulación.');
            isValid = false;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry)) {
            setPaymentError('cardExpiry', 'Usa el formato MM/AA.');
            isValid = false;
        }
        if (values.cardCvv.length < 3) {
            setPaymentError('cardCvv', 'Ingresa un CVV de 3 o 4 dígitos.');
            isValid = false;
        }
        if (!emailPattern.test(values.paymentEmail)) {
            setPaymentError('paymentEmail', 'Ingresa un correo electrónico válido.');
            isValid = false;
        }

        if (!isValid && paymentAlert) {
            paymentAlert.textContent = 'Revisa los campos marcados para continuar con la simulación.';
            paymentAlert.classList.add('is-visible');
        }

        return isValid;
    }

    function showPaymentSuccess() {
        if (!paymentDialog) return;
        setPaymentProcessing(false);
        paymentDialog.classList.add('is-success');
    }

    function simulatePayment() {
        if (!validatePaymentForm()) return;
        setPaymentProcessing(true);
        paymentTimer = setTimeout(() => {
            showPaymentSuccess();
        }, 1800);
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            simulatePayment();
        });

        paymentForm.elements.cardNumber.addEventListener('input', function(e) {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
            e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        });

        paymentForm.elements.cardExpiry.addEventListener('input', function(e) {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
            e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
        });

        paymentForm.elements.cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    document.querySelectorAll('.payment-plan-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = button.closest('.subscription-card');
            const planName = button.dataset.planName || (card ? card.querySelector('h3').textContent.trim() : 'Plan EMSafe');
            const planPrice = card ? card.querySelector('.subscription-price').textContent.replace(/\s+/g, ' ').trim() : 'S/ 0/mes';
            openPaymentModal({
                name: planName,
                price: planPrice
            });
        });
    });

    document.querySelectorAll('[data-close-payment]').forEach(control => {
        control.addEventListener('click', closePaymentModal);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && paymentModal && paymentModal.classList.contains('is-open')) {
            closePaymentModal();
        }
    });

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
