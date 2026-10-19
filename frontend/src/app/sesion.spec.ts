import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Sesion } from './sesion';
import { tokenDePrueba } from './pruebas';

describe('Sesion', () => {
  let http: HttpTestingController;

  function crear(): Sesion {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(Sesion);
  }

  beforeEach(() => localStorage.clear());

  afterEach(() => http.verify());

  it('sin token guardado, el jugador es invitado', () => {
    const sesion = crear();

    expect(sesion.nombre()).toBeNull();
    expect(sesion.token()).toBeNull();
  });

  it('al entrar guarda el token y saca el nombre de él', () => {
    const sesion = crear();
    const token = tokenDePrueba('ana');

    sesion.entrar('ana', 'contrasena-segura').subscribe();
    const peticion = http.expectOne('/api/auth/login');
    expect(peticion.request.body).toEqual({ nombre: 'ana', contrasena: 'contrasena-segura' });
    peticion.flush({ token });

    expect(sesion.nombre()).toBe('ana');
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('al registrarse también queda con la sesión iniciada', () => {
    const sesion = crear();

    sesion.registrarse('ana', 'contrasena-segura').subscribe();
    http.expectOne('/api/auth/register').flush({ token: tokenDePrueba('ana') }, { status: 201, statusText: 'Created' });

    expect(sesion.nombre()).toBe('ana');
  });

  it('recupera la sesión guardada al recargar la página', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));

    expect(crear().nombre()).toBe('ana');
  });

  it('descarta un token guardado que ya ha caducado', () => {
    localStorage.setItem('token', tokenDePrueba('ana', -60));

    expect(crear().nombre()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('descarta un token guardado que no se puede leer', () => {
    localStorage.setItem('token', 'basura');

    expect(crear().nombre()).toBeNull();
  });

  it('al salir borra el token', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));
    const sesion = crear();

    sesion.salir();

    expect(sesion.nombre()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
