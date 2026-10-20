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

const NOMBRES_PALO: Record<Palo, string> = {
  PICAS: 'Picas',
  CORAZONES: 'Corazones',
  TREBOLES: 'Tréboles',
  DIAMANTES: 'Diamantes',
};

const FIGURAS: Record<number, string> = { 1: 'As', 11: 'Sota', 12: 'Reina', 13: 'Rey' };

export function nombrePalo(palo: Palo): string {
  return NOMBRES_PALO[palo];
}

export function nombreCarta(carta: Carta): string {
  return `${FIGURAS[carta.numero] ?? carta.numero} de ${nombrePalo(carta.palo)}`;
}

export function terminada(estado: EstadoPartida): boolean {
  return estado.fase === 'VICTORIA' || estado.fase === 'DERROTA';
}
