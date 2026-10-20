import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { autorizacion } from './autorizacion';
import { Sesion } from './sesion';
import { tokenDePrueba } from './pruebas';

describe('autorizacion', () => {
  let http: HttpClient;
  let servidor: HttpTestingController;
  let sesion: Sesion;
  const token = tokenDePrueba('ana');

  beforeEach(() => {
    localStorage.setItem('token', token);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([autorizacion])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    servidor = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
  });

  afterEach(() => {
    servidor.verify();
    localStorage.clear();
  });

  it('añade el token a las peticiones a la API', () => {
    http.get('/api/games/me').subscribe();

    expect(servidor.expectOne('/api/games/me').request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('no envía el token a otros sitios', () => {
    http.get('https://otro.example/datos').subscribe();

    expect(servidor.expectOne('https://otro.example/datos').request.headers.has('Authorization')).toBe(false);
  });

  it('sin sesión no añade nada', () => {
    sesion.salir();
    http.get('/api/leaderboard').subscribe();

    expect(servidor.expectOne('/api/leaderboard').request.headers.has('Authorization')).toBe(false);
  });

  it('si el servidor rechaza el token, cierra la sesión', () => {
    http.get('/api/games/me').subscribe({ error: () => {} });
    servidor.expectOne('/api/games/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(sesion.nombre()).toBeNull();
  });

  it('una contraseña incorrecta no cierra una sesión que no existía', () => {
    sesion.salir();
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });
    servidor.expectOne('/api/auth/login').flush({ mensaje: 'Nombre o contraseña incorrectos' }, { status: 401, statusText: 'Unauthorized' });

    expect(sesion.nombre()).toBeNull();
  });
});
