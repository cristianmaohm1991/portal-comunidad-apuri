async function cargarResumenEconomico() {

    const { data, error } =
        await supabaseClient.rpc("obtener_resumen_caja");

    if (error) {
        console.error("Error al cargar la caja:", error);
        return;
    }

    document.getElementById("total-ingresos").textContent =
        "S/ " + Number(data[0].ingresos).toFixed(2);

    document.getElementById("total-egresos").textContent =
        "S/ " + Number(data[0].egresos).toFixed(2);

    document.getElementById("total-saldo").textContent =
        "S/ " + Number(data[0].saldo).toFixed(2);


    const { data: multas, error: errorMultas } =
        await supabaseClient.rpc("obtener_total_multas");

    if (errorMultas) {
        console.error("Error al cargar multas:", errorMultas);
        return;
    }

    document.getElementById("total-multas").textContent =
        "S/ " + Number(multas).toFixed(2);
}


cargarResumenEconomico();
