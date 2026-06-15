import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

declare global {
  var global: any;
}

if (typeof (globalThis as any).global === 'undefined') {
  (globalThis as any).global = globalThis;
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
