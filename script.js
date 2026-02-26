
window.addEventListener("DOMContentLoaded", function() {
    
    const formularioCita = document.querySelector("#book_form form");

    if (formularioCita) {
        console.log("¡Formulario encontrado y listo!");

        formularioCita.addEventListener("submit", function(event) {
            event.preventDefault(); // Frenamos el envío

            const datosCita = {
                 cliente: document.getElementById("guest_name").value,
                 email: document.getElementById("email_guest").value,
                 fecha: document.getElementById("guest_date").value,
                 hora: document.getElementById("time_guest").value,
                 servicio: document.getElementById("consultation_type").value
            };

            console.log("Nueva solicitud de joyeria recibida", datosCita);
        });
    } else {
        console.error("No se ha encontrado el formulario. Revisa el ID.");
    }
});