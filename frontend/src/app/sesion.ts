import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';

const CLAVE = 'token';

interface DatosDelToken {
  sub: string;
  exp: number;
}

export interface DatosDeCuenta {
  nombre: string;
  correo: string | null;
  correoPendiente: string | null;
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
    return this.http
      .post<{ token: string }>('/api/auth/login', { nombre, contrasena })
      .pipe(map(({ token }) => this.guardar(token)));
  }

  /** Crea la cuenta y deja la sesión iniciada. Con correo, el servidor envía el enlace para confirmarlo. */
  registrarse(nombre: string, contrasena: string, correo = ''): Observable<void> {
    return this.http
      .post<{ token: string }>('/api/auth/register', { nombre, contrasena, ...(correo ? { correo } : {}) })
      .pipe(map(({ token }) => this.guardar(token)));
  }

  /** Pide el enlace para restablecer la contraseña; devuelve el mensaje del servidor, que es siempre el mismo. */
  olvide(nombre: string): Observable<string> {
    return this.http.post<{ mensaje: string }>('/api/auth/olvide', { nombre }).pipe(map(({ mensaje }) => mensaje));
  }

  /** Pone la contraseña nueva con el enlace del correo. No inicia sesión. */
  restablecer(enlace: string, nueva: string): Observable<void> {
    return this.http.post<void>('/api/auth/restablecer', { enlace, nueva });
  }

  confirmarCorreo(enlace: string): Observable<void> {
    return this.http.post<void>('/api/auth/correo/confirmar', { enlace });
  }

  cuenta(): Observable<DatosDeCuenta> {
    return this.http.get<DatosDeCuenta>('/api/auth/cuenta');
  }

  /** Las demás sesiones se cierran; esta sigue con el token nuevo que manda el servidor. */
  cambiarContrasena(actual: string, nueva: string): Observable<void> {
    return this.http
      .post<{ token: string }>('/api/auth/contrasena', { actual, nueva })
      .pipe(map(({ token }) => this.guardar(token)));
  }

  /** Un correo vacío lo quita. */
  cambiarCorreo(correo: string, contrasena: string): Observable<DatosDeCuenta> {
    return this.http.post<DatosDeCuenta>('/api/auth/correo', { correo, contrasena });
  }

  borrarCuenta(contrasena: string): Observable<void> {
    return this.http.post<void>('/api/auth/borrar', { contrasena }).pipe(map(() => this.olvidar()));
  }

  /** Cierra la sesión en el servidor, en todos los dispositivos, y luego en este navegador. */
  salir(): void {
    this.http
      .post<void>('/api/auth/salir', {})
      .pipe(finalize(() => this.olvidar()))
      .subscribe({ error: () => {} });
  }

  /** Solo en este navegador: para cuando el servidor ya ha rechazado el token. */
  olvidar(): void {
    localStorage.removeItem(CLAVE);
    this.token.set(null);
  }

  private guardar(token: string): void {
    localStorage.setItem(CLAVE, token);
    this.token.set(token);
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
