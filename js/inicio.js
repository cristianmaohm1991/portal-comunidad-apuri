async function cargarResumenEconomico() {

    console.log("Cargando información económica...");

    const { data, error } =
        await supabaseClient.rpc("obtener_resumen_caja");

    if (error) {
        console.error("Error al obtener resumen de caja:", error);

        document.getElementById("total-ingresos").textContent = "Error";
        document.getElementById("total-egresos").textContent = "Error";
        document.getElementById("total-saldo").textContent = "Error";

        return;
    }

    console.log("Resumen de caja:", data);

    const resumen = data[0];

    document.getElementById("total-ingresos").textContent =
        "S/ " + Number(resumen.ingresos).toFixed(2);

    document.getElementById("total-egresos").textContent =
        "S/ " + Number(resumen.egresos).toFixed(2);

    document.getElementById("total-saldo").textContent =
        "S/ " + Number(resumen.saldo).toFixed(2);


    const { data: multas, error: errorMultas } =
        await supabaseClient.rpc("obtener_total_multas");

    if (errorMultas) {
        console.error("Error al obtener multas:", errorMultas);

        document.getElementById("total-multas").textContent = "Error";

        return;
    }

    console.log("Multas pendientes:", multas);

    document.getElementById("total-multas").textContent =
        "S/ " + Number(multas).toFixed(2);
}


document.addEventListener("DOMContentLoaded", () => {
    cargarResumenEconomico();
});
