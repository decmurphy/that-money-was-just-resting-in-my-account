import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ServiceWorkerModule } from '@angular/service-worker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CurrencyPipe } from '@angular/common';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AppServicesModule } from './modules/app-services.module';

@NgModule({
    imports: [
        BrowserModule,
        ServiceWorkerModule.register('ngsw-worker.js?version=13', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000',
        }),
        AppRoutingModule,
        NoopAnimationsModule,

        AppServicesModule,
    ],
    declarations: [AppComponent],
    providers: [CurrencyPipe],
    bootstrap: [AppComponent],
})
export class AppModule { }
