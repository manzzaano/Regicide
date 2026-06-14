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
    <div class="auth-page" [style.backgroundImage]="'url(/assets/imgs/background.png)'">
      <div class="overlay"></div>
      <div class="auth-box">
        <div class="card-header">
          <div class="crown">👑</div>
          <h1>REGICIDE</h1>
          <p class="subtitle">Desafía a la Realeza</p>
        </div>

        <div class="card-display">
          <img src="/assets/imgs/Picas/13.png" alt="King" class="display-card">
          <div class="vs">VS</div>
          <img src="/assets/imgs/Tréboles/13.png" alt="King" class="display-card">
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Guerrero</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="Tu nombre"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Tu clave"
              class="form-input"
            />
          </div>

          <button
            type="submit"
            [disabled]="!loginForm.valid"
            class="btn-login"
          >
            ⚔️ ENTRAR
          </button>

          <div *ngIf="error" class="error-box">
            {{ error }}
          </div>
        </form>

        <div class="divider">O</div>

        <button (click)="playAsGuest()" class="btn-guest">
          🎭 JUGAR SIN CUENTA
        </button>

        <div class="auth-footer">
          <p>¿Primera vez?</p>
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
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Georgia', serif;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1;
    }

    .auth-box {
      background: linear-gradient(135deg, rgba(30, 20, 10, 0.95) 0%, rgba(50, 30, 10, 0.95) 100%);
      border: 3px solid #8b4513;
      border-radius: 8px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow:
        0 0 30px rgba(0, 0, 0, 0.8),
        inset 0 0 20px rgba(139, 69, 19, 0.3);
      position: relative;
      z-index: 10;
    }

    .card-header {
      text-align: center;
      margin-bottom: 25px;
    }

    .crown {
      font-size: 3em;
      margin-bottom: 10px;
    }

    .card-header h1 {
      margin: 0;
      font-size: 2.8em;
      color: #d4a574;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      letter-spacing: 3px;
      font-weight: bold;
    }

    .subtitle {
      margin: 8px 0 0 0;
      color: #b8860b;
      font-size: 0.95em;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    }

    .card-display {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin: 25px 0;
    }

    .display-card {
      height: 100px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
      transition: transform 0.3s ease;
    }

    .display-card:hover {
      transform: scale(1.05) rotateZ(-2deg);
    }

    .vs {
      color: #d4a574;
      font-weight: bold;
      font-size: 1.2em;
      text-transform: uppercase;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      color: #d4a574;
      font-weight: bold;
      margin-bottom: 6px;
      font-size: 0.95em;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .form-input {
      padding: 11px 13px;
      border: 2px solid #8b4513;
      background: rgba(20, 10, 0, 0.6);
      color: #d4a574;
      border-radius: 4px;
      font-size: 1em;
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }

    .form-input:focus {
      outline: none;
      border-color: #d4a574;
      box-shadow: 0 0 10px rgba(212, 165, 116, 0.3);
      background: rgba(20, 10, 0, 0.8);
    }

    .form-input::placeholder {
      color: #666;
    }

    .btn-login {
      padding: 13px;
      background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
      color: #f5deb3;
      border: 2px solid #d4a574;
      border-radius: 4px;
      font-weight: bold;
      font-size: 1em;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      margin-top: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
      background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
    }

    .btn-login:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .divider {
      text-align: center;
      color: #8b4513;
      margin: 20px 0;
      font-weight: bold;
    }

    .btn-guest {
      width: 100%;
      padding: 13px;
      background: transparent;
      color: #d4a574;
      border: 2px solid #d4a574;
      border-radius: 4px;
      font-weight: bold;
      font-size: 1em;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .btn-guest:hover {
      background: rgba(212, 165, 116, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
    }

    .error-box {
      background: rgba(139, 0, 0, 0.2);
      border: 2px solid #8b0000;
      color: #ff6b6b;
      padding: 12px;
      border-radius: 4px;
      text-align: center;
      font-size: 0.9em;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .auth-footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(212, 165, 116, 0.2);
    }

    .auth-footer p {
      margin: 0 0 10px 0;
      color: #b8860b;
      font-size: 0.9em;
    }

    .link-register {
      color: #d4a574;
      text-decoration: none;
      font-weight: bold;
      transition: all 0.3s ease;
      border-bottom: 2px solid transparent;
    }

    .link-register:hover {
      color: #f5deb3;
      border-bottom-color: #f5deb3;
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

  playAsGuest(): void {
    this.router.navigate(['/juego-invitado']);
  }
}
