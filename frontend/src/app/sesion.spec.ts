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

    sesion.entrar('ana', 'una frase de paso larga').subscribe();
    const peticion = http.expectOne('/api/auth/login');
    expect(peticion.request.body).toEqual({ nombre: 'ana', contrasena: 'una frase de paso larga' });
    peticion.flush({ token });

    expect(sesion.nombre()).toBe('ana');
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('al registrarse queda con la sesión iniciada', () => {
    const sesion = crear();

    sesion.registrarse('ana', 'una frase de paso larga').subscribe();
    const peticion = http.expectOne('/api/auth/register');
    expect(peticion.request.body).toEqual({ nombre: 'ana', contrasena: 'una frase de paso larga' });
    peticion.flush({ token: tokenDePrueba('ana') }, { status: 201, statusText: 'Created' });

    expect(sesion.nombre()).toBe('ana');
  });

  it('el correo solo se envía si se ha escrito', () => {
    const sesion = crear();

    sesion.registrarse('ana', 'una frase de paso larga', 'ana@example.com').subscribe();

    expect(http.expectOne('/api/auth/register').request.body).toEqual({
      nombre: 'ana',
      contrasena: 'una frase de paso larga',
      correo: 'ana@example.com',
    });
  });

  it('restablecer la contraseña no inicia sesión', () => {
    const sesion = crear();

    sesion.restablecer('enlace', 'una frase de paso larga').subscribe();
    const peticion = http.expectOne('/api/auth/restablecer');
    expect(peticion.request.body).toEqual({ enlace: 'enlace', nueva: 'una frase de paso larga' });
    peticion.flush(null, { status: 204, statusText: 'No Content' });

    expect(sesion.nombre()).toBeNull();
  });

  it('al cambiar la contraseña se queda con el token nuevo', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));
    const sesion = crear();
    const nuevo = tokenDePrueba('ana', 7200);

    sesion.cambiarContrasena('una frase de paso larga', 'otra frase de paso larga').subscribe();
    http.expectOne('/api/auth/contrasena').flush({ token: nuevo });

    expect(sesion.token()).toBe(nuevo);
    expect(localStorage.getItem('token')).toBe(nuevo);
  });

  it('al borrar la cuenta olvida el token', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));
    const sesion = crear();

    sesion.borrarCuenta('una frase de paso larga').subscribe();
    http.expectOne('/api/auth/borrar').flush(null, { status: 204, statusText: 'No Content' });

    expect(sesion.nombre()).toBeNull();
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

  it('al salir avisa al servidor y luego borra el token', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));
    const sesion = crear();

    sesion.salir();
    expect(sesion.nombre()).toBe('ana');
    http.expectOne('/api/auth/salir').flush(null, { status: 204, statusText: 'No Content' });

    expect(sesion.nombre()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('borra el token aunque el servidor no responda al salir', () => {
    localStorage.setItem('token', tokenDePrueba('ana'));
    const sesion = crear();

    sesion.salir();
    http.expectOne('/api/auth/salir').error(new ProgressEvent('error'));

    expect(sesion.nombre()).toBeNull();
  });
});
