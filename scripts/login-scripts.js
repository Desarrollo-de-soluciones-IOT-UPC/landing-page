document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulación de verificación de credenciales
        if (username === 'admin' && password === 'password') {
            loginError.textContent = '';
            loginError.style.display = 'none';
            // Animación de éxito
            loginForm.classList.add('success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            loginError.textContent = 'Usuario o contraseña incorrectos';
            loginError.style.display = 'block';
            // Animación de error
            loginForm.classList.add('error');
            setTimeout(() => {
                loginForm.classList.remove('error');
            }, 500);
        }
    });

    // Efecto de focus en los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});