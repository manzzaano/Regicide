import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <h1>Regicide - Registro</h1>
      <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
        <div>
          <label>Username</label>
          <input type="text" formControlName="username" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" formControlName="email" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" formControlName="password" required />
        </div>
        <button type="submit" [disabled]="!registerForm.valid">Registrarse</button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
      <p>
        ¿Ya tienes cuenta? <a routerLink="/inicio">Inicia sesión aquí</a>
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
      background: #28a745;
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
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/juego']),
      error: (err) => this.error = err.error?.message || 'Error en el registro'
    });
  }
}
