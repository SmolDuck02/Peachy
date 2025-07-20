import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
// provideFirebaseApp(() => initializeApp(environment.firebase))
export const appConfig: ApplicationConfig = {
  providers: [
      provideAuth(() => getAuth()), provideHttpClient(withFetch()), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay())]
};
