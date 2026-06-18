document.addEventListener('DOMContentLoaded', function() {
    const plans = {
        home: [
            {
                id: 'home-basic',
                name: 'Hogar Basico',
                range: '0 a 10 sensores',
                price: 1190,
                description: 'Ideal para hogares pequenos, departamentos o espacios familiares compactos.',
                benefits: ['Acceso completo a la plataforma', 'Alertas e historial incluidos', 'Cobertura para zonas principales']
            },
            {
                id: 'home-intermediate',
                name: 'Hogar Intermedio',
                range: '10 a 20 sensores',
                price: 1990,
                description: 'Pensado para casas medianas con varias habitaciones y areas de trabajo.',
                benefits: ['Monitoreo por ambientes', 'Mayor cobertura interior', 'Recomendado para familias activas']
            },
            {
                id: 'home-advanced',
                name: 'Hogar Avanzado',
                range: '20 a 30 sensores',
                price: 2790,
                description: 'Cobertura amplia para viviendas grandes o espacios con varios dispositivos.',
                benefits: ['Cobertura extendida', 'Seguimiento por zonas', 'Ideal para hogares con oficina o estudio']
            }
        ],
        business: [
            {
                id: 'business-initial',
                name: 'Empresa Inicial',
                range: '30 a 100 sensores',
                price: 4890,
                description: 'Ideal para oficinas pequenas, consultorios o locales comerciales.',
                benefits: ['Cobertura por areas', 'Gestion desde plataforma', 'Preparado para espacios de atencion']
            },
            {
                id: 'business-professional',
                name: 'Empresa Profesional',
                range: '100 a 200 sensores',
                price: 7990,
                description: 'Para empresas con multiples ambientes, mayor flujo de personas y monitoreo constante.',
                benefits: ['Cobertura multiambiente', 'Escalabilidad operativa', 'Recomendado para sedes medianas']
            },
            {
                id: 'business-corporate',
                name: 'Empresa Corporativa',
                range: '200 sensores a mas',
                price: 9990,
                description: 'Para organizaciones con sedes amplias, instituciones o instalaciones de alta demanda.',
                benefits: ['Cobertura corporativa', 'Plan preparado para crecimiento', 'Ideal para sedes grandes']
            }
        ]
    };

    const state = {
        planType: new URLSearchParams(window.location.search).get('type') === 'business' ? 'business' : 'home',
        selectedPlanId: null,
        step: 1,
        customer: {},
        billingEmail: ''
    };

    const planOptions = document.querySelector('[data-plan-options]');
    const stepPanels = document.querySelectorAll('[data-step]');
    const stepButtons = document.querySelectorAll('[data-step-button]');
    const typeButtons = document.querySelectorAll('[data-plan-type]');
    const selectedTypeLabels = document.querySelectorAll('[data-selected-type]');
    const customerForm = document.getElementById('customer-form');
    const paymentForm = document.getElementById('payment-form');
    const customerTypeInput = document.getElementById('customer-type');
    const customerTypeLabel = document.getElementById('customer-type-label');
    const businessFields = document.querySelector('[data-business-fields]');
    const payButton = document.querySelector('[data-pay-now]');
    const checkoutFlow = document.querySelector('.checkout-flow');

    function formatPrice(plan) {
        return `S/ ${plan.price}/mes`;
    }

    function planTypeLabel(type = state.planType) {
        return type === 'business' ? 'Empresa' : 'Hogar';
    }

    function getCurrentPlanList() {
        return plans[state.planType];
    }

    function getSelectedPlan() {
        return getCurrentPlanList().find(plan => plan.id === state.selectedPlanId) || getCurrentPlanList()[0];
    }

    function selectPlanType(type) {
        state.planType = type;
        state.selectedPlanId = plans[type][0].id;
        if (customerTypeInput) customerTypeInput.value = type;
        if (customerTypeLabel) customerTypeLabel.value = planTypeLabel(type);
        renderPlanOptions();
        updateCartSummary();
        updateTypeFields();
    }

    function selectPlanRange(planId) {
        state.selectedPlanId = planId;
        renderPlanOptions();
        updateCartSummary();
    }

    function updateCartSummary() {
        const plan = getSelectedPlan();
        const benefits = plan.benefits.map(item => `<li><i class="fas fa-check"></i>${item}</li>`).join('');
        setText('[data-cart-name]', plan.name);
        setText('[data-cart-description]', plan.description);
        setText('[data-cart-type]', planTypeLabel());
        setText('[data-cart-range]', plan.range);
        setText('[data-cart-price]', formatPrice(plan));
        setText('[data-cart-total]', formatPrice(plan));
        setText('[data-confirmation-plan]', plan.name);
        setText('[data-confirmation-price]', formatPrice(plan));
        document.querySelector('[data-cart-benefits]').innerHTML = benefits;
    }

    function setText(selector, text) {
        document.querySelectorAll(selector).forEach(element => {
            element.textContent = text;
        });
    }

    function renderPlanOptions() {
        selectedTypeLabels.forEach(label => {
            label.textContent = planTypeLabel();
        });

        typeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.planType === state.planType);
        });

        planOptions.innerHTML = getCurrentPlanList().map(plan => `
            <article class="range-card ${plan.id === state.selectedPlanId ? 'selected' : ''}" data-plan-id="${plan.id}" tabindex="0">
                <h3>${plan.name}</h3>
                <p class="range">${plan.range}</p>
                <div class="price">${formatPrice(plan).replace('/mes', '<span>/mes</span>')}</div>
                <p>${plan.description}</p>
                <ul>
                    ${plan.benefits.map(item => `<li><i class="fas fa-check"></i>${item}</li>`).join('')}
                </ul>
            </article>
        `).join('');

        document.querySelectorAll('[data-plan-id]').forEach(card => {
            card.addEventListener('click', () => selectPlanRange(card.dataset.planId));
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectPlanRange(card.dataset.planId);
                }
            });
        });
    }

    function goToCheckoutStep(step) {
        if (step > state.step) {
            if (state.step === 1 && !state.selectedPlanId) return;
            if (state.step === 3 && !validateCustomerData()) return;
            if (state.step === 4 && !validatePaymentForm()) return;
        }

        state.step = Math.max(1, Math.min(5, step));
        stepPanels.forEach(panel => {
            panel.classList.toggle('active', Number(panel.dataset.step) === state.step);
        });
        stepButtons.forEach(button => {
            button.classList.toggle('active', Number(button.dataset.stepButton) === state.step);
        });
        const headerHeight = document.querySelector('.checkout-header') ? document.querySelector('.checkout-header').offsetHeight : 0;
        const flowTop = checkoutFlow ? checkoutFlow.offsetTop - headerHeight - 12 : 0;
        window.scrollTo({ top: Math.max(0, flowTop), behavior: 'smooth' });
    }

    function clearFormErrors(form) {
        form.querySelectorAll('.checkout-field').forEach(field => field.classList.remove('has-error'));
        form.querySelectorAll('small[data-error-for]').forEach(error => {
            error.textContent = '';
        });
    }

    function setFormError(form, name, message) {
        const input = form.elements[name];
        const error = form.querySelector(`[data-error-for="${name}"]`);
        if (input) input.closest('.checkout-field').classList.add('has-error');
        if (error) error.textContent = message;
    }

    function validateCustomerData() {
        clearFormErrors(customerForm);
        const values = {
            customerName: customerForm.elements.customerName.value.trim(),
            customerEmail: customerForm.elements.customerEmail.value.trim(),
            customerPhone: customerForm.elements.customerPhone.value.trim(),
            customerType: customerForm.elements.customerType.value,
            companyName: customerForm.elements.companyName.value.trim(),
            companyRuc: customerForm.elements.companyRuc.value.replace(/\D/g, ''),
            installationAddress: customerForm.elements.installationAddress.value.trim()
        };
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let valid = true;

        if (!values.customerName) {
            setFormError(customerForm, 'customerName', 'Ingresa el nombre completo.');
            valid = false;
        }
        if (!emailPattern.test(values.customerEmail)) {
            setFormError(customerForm, 'customerEmail', 'Ingresa un correo valido.');
            valid = false;
        }
        if (values.customerPhone.length < 7) {
            setFormError(customerForm, 'customerPhone', 'Ingresa un telefono valido.');
            valid = false;
        }
        if (!values.installationAddress) {
            setFormError(customerForm, 'installationAddress', 'Ingresa la direccion de instalacion.');
            valid = false;
        }
        if (values.customerType === 'business') {
            if (!values.companyName) {
                setFormError(customerForm, 'companyName', 'Ingresa el nombre de empresa.');
                valid = false;
            }
            if (values.companyRuc.length !== 11) {
                setFormError(customerForm, 'companyRuc', 'Ingresa un RUC de 11 digitos.');
                valid = false;
            }
        }

        if (valid) {
            state.customer = values;
            paymentForm.elements.billingEmail.value = values.customerEmail;
        }

        return valid;
    }

    function validatePaymentForm() {
        clearFormErrors(paymentForm);
        const values = {
            cardHolder: paymentForm.elements.cardHolder.value.trim(),
            cardNumber: paymentForm.elements.cardNumber.value.replace(/\D/g, ''),
            cardExpiry: paymentForm.elements.cardExpiry.value.trim(),
            cardCvv: paymentForm.elements.cardCvv.value.replace(/\D/g, ''),
            billingEmail: paymentForm.elements.billingEmail.value.trim()
        };
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let valid = true;

        if (!values.cardHolder) {
            setFormError(paymentForm, 'cardHolder', 'Ingresa el nombre del titular.');
            valid = false;
        }
        if (values.cardNumber.length < 13) {
            setFormError(paymentForm, 'cardNumber', 'Ingresa un numero de tarjeta valido.');
            valid = false;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry)) {
            setFormError(paymentForm, 'cardExpiry', 'Usa el formato MM/AA.');
            valid = false;
        }
        if (values.cardCvv.length < 3) {
            setFormError(paymentForm, 'cardCvv', 'Ingresa un CVV de 3 o 4 digitos.');
            valid = false;
        }
        if (!emailPattern.test(values.billingEmail)) {
            setFormError(paymentForm, 'billingEmail', 'Ingresa un correo de facturacion valido.');
            valid = false;
        }

        if (valid) {
            state.billingEmail = values.billingEmail;
        }

        return valid;
    }

    function setPaymentProcessing(processing) {
        payButton.classList.toggle('is-loading', processing);
        payButton.disabled = processing;
        payButton.querySelector('span').textContent = processing ? 'Procesando pago...' : 'Pagar ahora';
        paymentForm.classList.toggle('is-processing', processing);
        paymentForm.querySelectorAll('input').forEach(input => {
            input.disabled = processing;
        });
    }

    function simulatePayment() {
        if (!validatePaymentForm()) return;
        setPaymentProcessing(true);
        setTimeout(() => {
            setPaymentProcessing(false);
            showConfirmation();
        }, 1800);
    }

    function showConfirmation() {
        const email = state.billingEmail || state.customer.customerEmail || 'tu correo';
        setText('[data-confirmation-email]', email);
        goToCheckoutStep(5);
    }

    function returnToLanding() {
        window.location.href = 'index.html';
    }

    function updateTypeFields() {
        customerTypeInput.value = state.planType;
        if (customerTypeLabel) customerTypeLabel.value = planTypeLabel();
        const isBusiness = state.planType === 'business';
        businessFields.classList.toggle('is-visible', isBusiness);
    }

    typeButtons.forEach(button => {
        button.addEventListener('click', () => selectPlanType(button.dataset.planType));
    });

    document.querySelectorAll('[data-next-step]').forEach(button => {
        button.addEventListener('click', () => goToCheckoutStep(state.step + 1));
    });

    document.querySelectorAll('[data-prev-step]').forEach(button => {
        button.addEventListener('click', () => goToCheckoutStep(state.step - 1));
    });

    paymentForm.elements.cardNumber.addEventListener('input', function(event) {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
        event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    paymentForm.elements.cardExpiry.addEventListener('input', function(event) {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
        event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });

    paymentForm.elements.cardCvv.addEventListener('input', function(event) {
        event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
    });

    customerForm.elements.companyRuc.addEventListener('input', function(event) {
        event.target.value = event.target.value.replace(/\D/g, '').slice(0, 11);
    });

    payButton.addEventListener('click', simulatePayment);

    window.returnToLanding = returnToLanding;

    selectPlanType(state.planType);
    updateCartSummary();
    goToCheckoutStep(1);
});
