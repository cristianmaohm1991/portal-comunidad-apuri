document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");
    const dniInput = document.getElementById("dni");
    const passwordInput = document.getElementById("password");
    const button = document.getElementById("login-button");
    const message = document.getElementById("message");


    function mostrarMensaje(texto, tipo) {

        message.textContent = texto;

        message.className = "message " + tipo;
    }


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const dni = dniInput.value.trim();
        const password = passwordInput.value;


        if (!/^\d{8}$/.test(dni)) {

            mostrarMensaje(
                "Ingrese un DNI válido de 8 dígitos.",
                "error"
            );

            return;
        }


        if (!password) {

            mostrarMensaje(
                "Ingrese su contraseña.",
                "error"
            );

            return;
        }


        button.disabled = true;
        button.textContent = "Ingresando...";

        mostrarMensaje("", "");


        try {

            /*
             * PASO 1
             * Buscamos el usuario mediante su DNI.
             *
             * La función de Supabase solamente
             * devuelve usuarios de comuneros ACTIVOS.
             */

            const {
                data: usuario,
                error: errorDni
            } = await supabaseClient.rpc(
                "obtener_login_por_dni",
                {
                    p_dni: dni
                }
            );


            if (errorDni) {

                console.error(
                    "Error al buscar DNI:",
                    errorDni
                );

                mostrarMensaje(
                    "No se pudo verificar el DNI. Intente nuevamente.",
                    "error"
                );

                return;
            }


            /*
             * Si no existe resultado,
             * el DNI no pertenece a un comunero activo.
             */

            if (!usuario || usuario.length === 0) {

                mostrarMensaje(
                    "El DNI no está registrado como comunero activo.",
                    "error"
                );

                return;
            }


            const email = usuario[0].email;


            /*
             * PASO 2
             * Autenticamos al usuario mediante
             * Supabase Auth.
             *
             * El comunero NO necesita conocer
             * este correo interno.
             */

            const {
                data: sesion,
                error: errorLogin
            } = await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


            if (errorLogin) {

                console.error(
                    "Error de autenticación:",
                    errorLogin
                );

                mostrarMensaje(
                    "DNI o contraseña incorrectos.",
                    "error"
                );

                return;
            }


            /*
             * Login correcto.
             */

            console.log(
                "Usuario autenticado:",
                sesion.user
            );


            mostrarMensaje(
                "Ingreso correcto. Redirigiendo...",
                "success"
            );


            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 800);


        } catch (error) {

            console.error(
                "Error inesperado:",
                error
            );

            mostrarMensaje(
                "Ocurrió un error. Intente nuevamente.",
                "error"
            );

        } finally {

            button.disabled = false;

            button.textContent = "🔐 Ingresar";

        }

    });

});
