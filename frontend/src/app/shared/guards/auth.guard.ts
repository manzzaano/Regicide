import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
class AuthGuardImpl {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/inicio']);
    return false;
  }
}

export const authGuard = (route: any, state: any) => {
  const authGuardImpl = new AuthGuardImpl(
    new AuthService(null!),
    null!
  );
  return authGuardImpl.canActivate();
};
