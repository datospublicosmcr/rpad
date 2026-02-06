/**
 * Contacto - RPAD
 * Lógica del formulario de contacto
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contacto-form');
    const btnEnviar = document.getElementById('btn-enviar');
    const mensajeTextarea = document.getElementById('mensaje');
    const charCount = document.getElementById('char-count');
    const charCounter = charCount.parentElement;
    const messageContainer = document.getElementById('message-container');

    // Contador de caracteres
    mensajeTextarea.addEventListener('input', () => {
        const count = mensajeTextarea.value.length;
        charCount.textContent = count;

        charCounter.classList.remove('warning', 'danger');
        if (count > 1800) {
            charCounter.classList.add('danger');
        } else if (count > 1500) {
            charCounter.classList.add('warning');
        }
    });

    /**
     * Mostrar mensaje de alerta
     */
    const mostrarMensaje = (tipo, texto) => {
        const iconSuccess = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
        const iconError = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';

        messageContainer.innerHTML = `
            <div class="alert alert-${tipo === 'success' ? 'success' : 'error'}">
                ${tipo === 'success' ? iconSuccess : iconError}
                <span>${texto}</span>
            </div>
        `;

        // Scroll al mensaje
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-ocultar
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, tipo === 'success' ? 15000 : 10000);
    };

    /**
     * Envío del formulario
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar mensajes previos
        messageContainer.innerHTML = '';

        // Deshabilitar botón
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Enviando...
        `;

        // Recopilar datos
        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            tipo: document.getElementById('tipo').value,
            mensaje: document.getElementById('mensaje').value.trim()
        };

        // Validación básica del lado del cliente
        if (datos.nombre.length < 2) {
            mostrarMensaje('error', 'El nombre debe tener al menos 2 caracteres.');
            resetButton();
            return;
        }

        if (datos.mensaje.length < 10) {
            mostrarMensaje('error', 'El mensaje debe tener al menos 10 caracteres.');
            resetButton();
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/contacto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            if (result.success) {
                mostrarMensaje('success', result.message || 'Su consulta fue enviada correctamente. Le responderemos a la brevedad.');
                form.reset();
                charCount.textContent = '0';
                charCounter.classList.remove('warning', 'danger');
            } else {
                mostrarMensaje('error', result.error || 'Error al enviar el formulario.');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error de conexión. Verifique su conexión a internet e intente nuevamente.');
        } finally {
            resetButton();
        }
    });

    /**
     * Resetear botón de envío
     */
    function resetButton() {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            Enviar consulta
        `;
    }
});

// Agregar animación de spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinnerStyle);