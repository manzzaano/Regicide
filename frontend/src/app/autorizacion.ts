import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Sesion } from './sesion';

/** Envía el JWT a la API y, si el servidor lo rechaza (caducado o falso), cierra la sesión. */
export const autorizacion: HttpInterceptorFn = (peticion, siguiente) => {
  const sesion = inject(Sesion);
  const token = sesion.token();
  if (!token || !peticion.url.startsWith('/api/')) {
    return siguiente(peticion);
  }
  return siguiente(peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        sesion.olvidar();
      }
      return throwError(() => error);
    }),
  );
};
