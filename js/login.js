document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    if (!form) {
        console.error("No se encontró el formulario de login.");
        return;
    }

    const dniInput =
        document.querySelector("#dni") ||
        document.querySelector('input[name="dni"]') ||
        document.querySelector('input[type="text"]');

    const passwordInput =
        document.querySelector("#password") ||
        document.querySelector('input[name="password"]') ||
        document.querySelector('input[type="password"]');

    const mensaje =
        document.querySelector("#mensaje") ||
        document.querySelector("#error-message") ||
        document.querySelector(".mensaje") ||
        document.querySelector(".error-message");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const dni = dniInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!dni || !password) {

            mostrarMensaje(
                "Ingrese su DNI y contraseña.",
                true
            );

            return;
        }

        if (!/^\d{8}$/.test(dni)) {

            mostrarMensaje(
                "El DNI debe tener 8 dígitos.",
                true
            );

            return;
        }

        const boton =
            form.querySelector('button[type="submit"]') ||
            form.querySelector("button");

        const textoOriginal =
            boton ? boton.textContent : "";

        if (boton) {
            boton.disabled = true;
            boton.textContent = "Ingresando...";
        }

        mostrarMensaje("Validando sus datos...", false);

        try {

            /*
             * Enviamos DNI + contraseña a nuestra
             * Edge Function de Supabase.
             */

            const { data, error } =
                await supabaseClient.functions.invoke(
                    "login-dni",
                    {
                        body: {
                            dni: dni,
                            password: password
                        }
                    }
                );

            console.log("Respuesta login:", data);

            if (error) {

                console.error(
                    "Error llamando a login-dni:",
                    error
                );

                mostrarMensaje(
                    "No fue posible comunicarse con el servicio de acceso.",
                    true
                );

                return;
            }

            /*
             * Comunero inactivo
             */

            if (data?.inactive) {

                mostrarMensaje(
                    data.message ||
                    "Su condición actual como comunero se encuentra INACTIVA.",
                    true
                );

                return;
            }

            /*
             * Usuario o contraseña incorrectos
             */

            if (
                !data?.success ||
                !data?.session?.access_token ||
                !data?.session?.refresh_token
            ) {

                mostrarMensaje(
                    data?.message ||
                    "DNI o contraseña incorrectos.",
                    true
                );

                return;
            }

            /*
             * Guardamos la sesión de Supabase.
             *
             * Desde este momento dashboard.html
             * podrá reconocer al usuario autenticado.
             */

            const {
                access_token,
                refresh_token
            } = data.session;

            const {
                data: sessionData,
                error: sessionError
            } = await supabaseClient.auth.setSession({
                access_token,
                refresh_token
            });

            if (sessionError) {

                console.error(
                    "Error guardando sesión:",
                    sessionError
                );

                mostrarMensaje(
                    "No fue posible establecer la sesión.",
                    true
                );

                return;
            }

            console.log(
                "Sesión establecida correctamente:",
                sessionData
            );

            /*
             * Login exitoso.
             */

            mostrarMensaje(
                "Acceso correcto. Ingresando...",
                false
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);

        } catch (error) {

            console.error(
                "Error inesperado:",
                error
            );

            mostrarMensaje(
                "Ocurrió un error al procesar el acceso.",
                true
            );

        } finally {

            if (boton) {
                boton.disabled = false;
                boton.textContent = textoOriginal;
            }
        }
    });


    function mostrarMensaje(texto, esError) {

        if (mensaje) {

            mensaje.textContent = texto;

            mensaje.style.display = "block";

            if (esError) {
                mensaje.style.color = "#b42318";
            } else {
                mensaje.style.color = "#067647";
            }

            return;
        }

        console.log(texto);
    }

});
