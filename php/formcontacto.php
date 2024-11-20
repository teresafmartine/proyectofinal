<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Configuración del correo
    $to = "teresamfm2000@gmail.com"; // Reemplaza esto con tu correo electrónico
    $subject = "Nuevo mensaje de contacto: " . $subject;
    $body = "Nombre: $name\nCorreo Electrónico: $email\n\nMensaje:\n$message";
    $headers = "From: $email";

    // Enviar el correo
    if (mail($to, $subject, $body, $headers)) {
        echo "Mensaje enviado con éxito.";
    } else {
        echo "Hubo un problema al enviar el mensaje. Inténtalo nuevamente.";
    }
}
?>
