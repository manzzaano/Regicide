import { Component } from '@angular/core';
import { Menu } from '../menu';

/** RGPD art. 13. Sin cookies: el token en localStorage es estrictamente necesario (LSSI 22.2). */
@Component({
  selector: 'app-privacidad',
  imports: [Menu],
  template: `
    <app-menu />
    <main class="privacidad">
      <p class="eyebrow">Privacidad</p>
      <h1>Política de privacidad</h1>
      <p class="fecha">Última actualización: octubre de 2026</p>

      <h2>Responsable</h2>
      <p>
        Ismael Manzano León. Correo: <a href="mailto:contact@leosoftware.dev">contact&#64;leosoftware.dev</a>. El aviso legal está en
        <a href="https://leosoftware.dev/legal">leosoftware.dev/legal</a>.
      </p>

      <h2>Qué datos se guardan</h2>
      <ul>
        <li><strong>Si juegas como invitado</strong>, ninguno: la partida vive en la memoria del servidor y se pierde al cerrar la pestaña.</li>
        <li><strong>Si creas una cuenta</strong>: tu nombre de jugador, tu contraseña cifrada con Argon2 (nunca en claro), tu partida en curso y tus estadísticas. El nombre y las estadísticas aparecen en la clasificación pública.</li>
        <li><strong>Correo, si lo añades</strong>: es opcional y solo sirve para recuperar la contraseña y avisarte de cambios en la cuenta. No se usa para nada más ni se envía publicidad.</li>
        <li><strong>Registros del servidor</strong>: la IP y la dirección de cada petición, para defenderse de abusos. Se sobrescriben al llenarse y no se cruzan con nada.</li>
      </ul>
      <p>
        Al elegir contraseña se comprueba si aparece en filtraciones conocidas con Have I Been Pwned. Solo salen los 5 primeros
        caracteres de su resumen SHA-1, que no permiten saber cuál es ni quién eres.
      </p>

      <h2>Para qué y con qué base</h2>
      <p>
        Los datos de la cuenta, para darte el servicio que pides al crearla: guardar tu partida y tus estadísticas (art. 6.1.b del
        RGPD). El correo, con tu consentimiento al añadirlo, que retiras quitándolo desde tu cuenta. Los registros, por el interés
        legítimo de mantener el servicio seguro.
      </p>

      <h2>Quién más los trata</h2>
      <ul>
        <li><strong>Oracle Cloud</strong> aloja el servidor y la base de datos en Fráncfort (Alemania).</li>
        <li><strong>Resend</strong> (Resend Inc., EE. UU.) envía los correos. Actúa como encargado del tratamiento con cláusulas contractuales tipo.</li>
      </ul>

      <h2>Cuánto tiempo</h2>
      <p>
        Hasta que borres la cuenta. Desde <strong>Tu cuenta</strong> puedes borrarla en cualquier momento y desaparecen tu nombre,
        tu correo, tu partida y tus estadísticas. Los enlaces de los correos caducan en 30 minutos (contraseña) o 24 horas (confirmar el correo).
      </p>

      <h2>Cookies</h2>
      <p>
        Esta web no usa cookies, ni analítica, ni publicidad. Si entras con tu cuenta, el navegador guarda tu sesión en su
        almacenamiento local para no pedirte la contraseña al recargar. Es imprescindible para el servicio, así que no necesita
        consentimiento, y se borra al salir.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad de tus datos escribiendo a
        <a href="mailto:contact@leosoftware.dev">contact&#64;leosoftware.dev</a>. Si no te respondo bien, puedes reclamar ante la
        <a href="https://www.aepd.es">Agencia Española de Protección de Datos</a>.
      </p>
    </main>
  `,
  styles: `
    .privacidad {
      width: min(100%, 720px);
      margin: 0 auto;
      padding: 0 16px 48px;
      color: var(--texto-suave);
      font-size: 15px;
      line-height: 1.6;
    }
    .eyebrow {
      margin: 0;
      color: var(--rojo);
      font: 500 12px var(--mono);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0.1em 0 0;
      color: var(--titulo);
      font: 800 clamp(28px, 4vw, 40px) var(--display);
    }
    .fecha {
      margin-top: 0.2em;
      font-size: 0.85em;
    }
    h2 {
      margin: 1.6em 0 0.4em;
      color: var(--titulo);
      font-size: 1.1em;
    }
    strong {
      color: var(--texto);
    }
    ul {
      padding-left: 1.2em;
    }
    li + li {
      margin-top: 0.4em;
    }
    a {
      color: var(--rojo);
    }
  `,
})
export class Privacidad {}
