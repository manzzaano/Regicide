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
    <div class="auth-container">
      <h1>Regicide - Login</h1>
      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <div>
          <label>Username</label>
          <input type="text" formControlName="username" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" formControlName="password" required />
        </div>
        <button type="submit" [disabled]="!loginForm.valid">Login</button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
      <p>
        ¿No tienes cuenta? <a routerLink="/registro">Regístrate aquí</a>
      </p>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    form div {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .error {
      color: red;
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
