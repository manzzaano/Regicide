import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TitleStrategy, provideRouter } from '@angular/router';
import localeEs from '@angular/common/locales/es';
import { autorizacion } from './autorizacion';
import { Titulos, routes } from './app.routes';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([autorizacion])),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: TitleStrategy, useExisting: Titulos },
  ],
};
