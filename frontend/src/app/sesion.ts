import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

const CLAVE = 'token';

interface DatosDelToken {
  sub: string;
  exp: number;
}

function leer(token: string): DatosDelToken | null {
  try {
    const carga = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(carga)) as DatosDelToken;
  } catch {
    return null;
  }
}

function vigente(token: string | null): token is string {
  const datos = token ? leer(token) : null;
  return datos !== null && datos.exp * 1000 > Date.now();
}

/**
 * El JWT del jugador, guardado en localStorage para no perder la sesión al recargar. El
 * navegador no comprueba la firma: solo lee el nombre y la caducidad; quien decide es el servidor.
 */
@Injectable({ providedIn: 'root' })
export class Sesion {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(Sesion.tokenGuardado());
  readonly nombre = computed(() => {
    const token = this.token();
    return token ? (leer(token)?.sub ?? null) : null;
  });

  entrar(nombre: string, contrasena: string): Observable<void> {
    return this.pedirToken('/api/auth/login', nombre, contrasena);
  }

  registrarse(nombre: string, contrasena: string): Observable<void> {
    return this.pedirToken('/api/auth/register', nombre, contrasena);
  }

  salir(): void {
    localStorage.removeItem(CLAVE);
    this.token.set(null);
  }

  private pedirToken(ruta: string, nombre: string, contrasena: string): Observable<void> {
    return this.http.post<{ token: string }>(ruta, { nombre, contrasena }).pipe(
      map(({ token }) => {
        localStorage.setItem(CLAVE, token);
        this.token.set(token);
      }),
    );
  }

  private static tokenGuardado(): string | null {
    const token = localStorage.getItem(CLAVE);
    if (vigente(token)) {
      return token;
    }
    localStorage.removeItem(CLAVE);
    return null;
  }
}
