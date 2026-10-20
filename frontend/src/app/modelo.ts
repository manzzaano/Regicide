import { Lengua } from './idioma';

// Los mismos datos que envía el backend (EstadoPartida, PuestoEnClasificacion, ResumenPartida).
export type Palo = 'PICAS' | 'CORAZONES' | 'TREBOLES' | 'DIAMANTES';

export type Fase = 'ATAQUE' | 'DEFENSA' | 'VICTORIA' | 'DERROTA';

export interface Carta {
  numero: number;
  palo: Palo;
}

export interface EstadoPartida {
  fase: Fase;
  mano: Carta[];
  enemigo: { carta: Carta; vida: number; ataque: number } | null;
  enemigosRestantes: number;
  cartasEnPosada: number;
  cartasEnDescarte: number;
  cartasJugadas: Carta[];
  comodines: number;
}

export interface PuestoEnClasificacion {
  nombre: string;
  victorias: number;
  partidas: number;
  mejorPartida: number;
  /** Jugador de ejemplo que trae la base de datos; no es una cuenta real. */
  simulado: boolean;
}

export interface ResumenPartida {
  resultado: 'VICTORIA' | 'DERROTA';
  enemigosDerrotados: number;
  comodinesUsados: number;
  terminadaEn: string;
}

const NOMBRES_PALO: Record<Lengua, Record<Palo, string>> = {
  es: { PICAS: 'Picas', CORAZONES: 'Corazones', TREBOLES: 'Tréboles', DIAMANTES: 'Diamantes' },
  en: { PICAS: 'Spades', CORAZONES: 'Hearts', TREBOLES: 'Clubs', DIAMANTES: 'Diamonds' },
};

const FIGURAS: Record<Lengua, Record<number, string>> = {
  es: { 1: 'As', 11: 'Sota', 12: 'Reina', 13: 'Rey' },
  en: { 1: 'Ace', 11: 'Jack', 12: 'Queen', 13: 'King' },
};

export function nombrePalo(palo: Palo, lengua: Lengua = 'es'): string {
  return NOMBRES_PALO[lengua][palo];
}

export function nombreCarta(carta: Carta, lengua: Lengua = 'es'): string {
  const numero = FIGURAS[lengua][carta.numero] ?? carta.numero;
  return `${numero} ${lengua === 'es' ? 'de' : 'of'} ${nombrePalo(carta.palo, lengua)}`;
}

export function terminada(estado: EstadoPartida): boolean {
  return estado.fase === 'VICTORIA' || estado.fase === 'DERROTA';
}
