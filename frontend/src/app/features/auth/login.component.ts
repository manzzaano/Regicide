import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="stars"></div>
      <div class="auth-box">
        <div class="card-header">
          <h1>⚔️ REGICIDE</h1>
          <p class="subtitle">Challenge the Royalty</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="Ingresa tu usuario"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Ingresa tu contraseña"
              class="form-input"
            />
          </div>

          <button
            type="submit"
            [disabled]="!loginForm.valid"
            class="btn-login"
          >
            ENTRAR AL JUEGO
          </button>

          <div *ngIf="error" class="error-box">
            {{ error }}
          </div>
        </form>

        <div class="auth-footer">
          <p>¿Primera vez aquí?</p>
          <a routerLink="/registro" class="link-register">Crea tu cuenta</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .auth-page {
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Arial', sans-serif;
    }

    .stars {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0.3;
      background-image:
        radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0));
      background-repeat: repeat;
      background-size: 500px 500px;
      animation: twinkle 5s infinite;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }

    .auth-box {
      background: rgba(20, 33, 61, 0.95);
      border: 2px solid #d4af37;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(212, 175, 55, 0.3);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-header h1 {
      margin: 0;
      font-size: 2.5em;
      color: #d4af37;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      letter-spacing: 2px;
      font-weight: bold;
    }

    .subtitle {
      margin: 8px 0 0 0;
      color: #a0a0a0;
      font-size: 0.9em;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      color: #d4af37;
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 0.95em;
      letter-spacing: 0.5px;
    }

    .form-input {
      padding: 12px 14px;
      border: 1px solid #d4af37;
      background: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      border-radius: 6px;
      font-size: 1em;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #ffd700;
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
      background: rgba(0, 0, 0, 0.5);
    }

    .form-input::placeholder {
      color: #777;
    }

    .btn-login {
      padding: 14px;
      background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 1em;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
    }

    .btn-login:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-login:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-box {
      background: rgba(220, 53, 69, 0.2);
      border: 1px solid #dc3545;
      color: #ff6b6b;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      font-size: 0.9em;
    }

    .auth-footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }

    .auth-footer p {
      margin: 0 0 10px 0;
      color: #a0a0a0;
      font-size: 0.9em;
    }

    .link-register {
      color: #d4af37;
      text-decoration: none;
      font-weight: bold;
      transition: all 0.3s ease;
      border-bottom: 2px solid transparent;
    }

    .link-register:hover {
      color: #ffd700;
      border-bottom-color: #ffd700;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/juego']),
      error: () => this.error = 'Credenciales inválidas'
    });
  }
}
