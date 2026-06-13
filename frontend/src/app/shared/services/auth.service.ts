import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthRequest {
  username: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  register(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.loggedIn$.next(true);
        }
      })
    );
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.loggedIn$.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }
}
