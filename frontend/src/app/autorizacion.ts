import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Idioma } from './idioma';
import { Sesion } from './sesion';

/**
 * Pide a la API los textos en el idioma de la interfaz, le envía el JWT y, si el servidor lo
 * rechaza (caducado o falso), cierra la sesión.
 */
export const autorizacion: HttpInterceptorFn = (peticion, siguiente) => {
  if (!peticion.url.startsWith('/api/')) {
    return siguiente(peticion);
  }
  const sesion = inject(Sesion);
  const token = sesion.token();
  const idioma = { 'Accept-Language': inject(Idioma).actual() };
  if (!token) {
    return siguiente(peticion.clone({ setHeaders: idioma }));
  }
  return siguiente(peticion.clone({ setHeaders: { ...idioma, Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        sesion.olvidar();
      }
      return throwError(() => error);
    }),
  );
};
