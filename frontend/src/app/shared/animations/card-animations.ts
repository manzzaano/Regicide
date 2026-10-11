import { gsap } from 'gsap';

/** Respeta la preferencia del usuario de reducir movimiento. */
function reduced(): boolean {
  return typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Reparto en abanico: las cartas entran desde abajo escalonadas. */
export function dealIn(elements: ArrayLike<Element>): void {
  if (reduced() || !elements.length) return;
  gsap.from(elements, {
    y: 60,
    opacity: 0,
    rotateZ: -8,
    duration: 0.5,
    ease: 'back.out(1.4)',
    stagger: 0.08
  });
}

/** Flip 3D al jugar una carta. */
export function flipPlay(el: Element, onComplete?: () => void): void {
  if (reduced()) { onComplete?.(); return; }
  gsap.timeline({ onComplete })
    .to(el, { rotateY: 90, duration: 0.16, ease: 'power1.in' })
    .to(el, { scale: 1.15, duration: 0.12 })
    .to(el, { y: -40, opacity: 0, duration: 0.22, ease: 'power2.in' });
}

/** Sacudida al recibir/infligir daño. */
export function shake(el: Element): void {
  if (reduced()) return;
  gsap.fromTo(el,
    { x: -8 },
    { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' }
  );
}

/** Desvanecido del enemigo derrotado. */
export function defeatEnemy(el: Element, onComplete?: () => void): void {
  if (reduced()) { onComplete?.(); return; }
  gsap.to(el, {
    scale: 0.6, opacity: 0, rotateZ: 12,
    duration: 0.45, ease: 'power2.in', onComplete
  });
}

/** Pulso de aparición del nuevo enemigo. */
export function enemyEnter(el: Element): void {
  if (reduced() || !el) return;
  gsap.from(el, { scale: 0.7, opacity: 0, duration: 0.4, ease: 'back.out(1.6)' });
}
