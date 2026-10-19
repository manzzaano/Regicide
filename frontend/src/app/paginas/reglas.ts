import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Menu } from '../menu';

@Component({
  selector: 'app-reglas',
  imports: [Carta, Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <h1 class="titulo">¿Cómo jugar?</h1>
      <article class="caja">
      <p class="entrada">
        Derrota a los 12 enemigos del castillo, uno detrás de otro: primero las 4 sotas, después las 4 reinas y al
        final los 4 reyes. Empiezas con 8 cartas en la mano y la posada como mazo para robar.
      </p>

      <section>
        <h2>Los enemigos</h2>
        <ul class="enemigos">
          <li><app-carta [carta]="{ numero: 11, palo: 'DIAMANTES' }" /><strong>Sota</strong> vida 20, ataque 10</li>
          <li><app-carta [carta]="{ numero: 12, palo: 'TREBOLES' }" /><strong>Reina</strong> vida 30, ataque 15</li>
          <li><app-carta [carta]="{ numero: 13, palo: 'CORAZONES' }" /><strong>Rey</strong> vida 40, ataque 20</li>
        </ul>
      </section>

      <section>
        <h2>Tu turno</h2>
        <ol>
          <li>
            <strong>Atacas</strong> con una carta, con 2 a 4 cartas del mismo número que sumen 10 como máximo, o con
            un as junto a una única carta. El daño es la suma de sus valores.
          </li>
          <li>Se activan los <strong>poderes</strong> de los palos jugados.</li>
          <li>
            Si el enemigo llega a 0 de vida, cae y pasa el siguiente. Con la vida justa, se va encima de la posada y lo
            puedes robar como carta.
          </li>
          <li>
            Si sobrevive, te <strong>ataca</strong>: descarta cartas de tu mano que sumen al menos su ataque. Si no
            puedes, pierdes.
          </li>
        </ol>
        <p>Las figuras robadas valen 10 (sota), 15 (reina) y 20 (rey). El as vale 1.</p>
      </section>

      <section>
        <h2>Los poderes de los palos</h2>
        <dl class="poderes">
          <div>
            <dt>Corazones</dt>
            <dd>Devuelve cartas del descarte a la posada, por debajo, tantas como el daño.</dd>
          </div>
          <div>
            <dt>Diamantes</dt>
            <dd>Robas tantas cartas como el daño, sin pasar de 8 en la mano.</dd>
          </div>
          <div>
            <dt>Picas</dt>
            <dd>Baja el ataque del enemigo tanto como el daño, hasta que lo derrotes.</dd>
          </div>
          <div>
            <dt>Tréboles</dt>
            <dd>Dobla el daño.</dd>
          </div>
        </dl>
        <p>Ningún enemigo se deja afectar por el poder de su propio palo.</p>
      </section>

      <section>
        <h2>Comodines</h2>
        <p>
          Tienes dos por partida. Cada uno descarta tu mano y te da 8 cartas nuevas. Puedes usarlo antes de atacar o
          antes de defenderte.
        </p>
      </section>

      <section>
        <h2>Ganar y perder</h2>
        <p>
          Ganas al derrotar al último rey. Pierdes si, sin comodines, no puedes atacar o no puedes cubrir un ataque.
        </p>
      </section>

      </article>
      <a class="boton jugar" routerLink="/partida">Jugar</a>
    </main>
  `,
  styles: `
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 16px 30px;
    }
    .entrada {
      margin-top: 0;
      font-size: 18px;
    }
    h2 {
      margin: 20px 0 8px;
      color: var(--titulo);
      font-size: 22px;
    }
    .enemigos {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding: 0;
      list-style: none;
    }
    .enemigos li {
      display: grid;
      gap: 6px;
      width: 120px;
    }
    ol {
      padding-left: 20px;
    }
    li + li {
      margin-top: 6px;
    }
    .poderes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 10px;
    }
    .poderes div {
      padding: 10px 12px;
      border-radius: 5px;
      background: var(--caja-mazos);
    }
    dt {
      font-weight: bold;
    }
    dd {
      margin: 4px 0 0;
    }
    .jugar {
      display: table;
      margin: 20px auto 0;
    }
  `,
})
export class Reglas {}
