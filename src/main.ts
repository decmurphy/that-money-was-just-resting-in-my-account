import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((moduleRef) => {
        //   if (!environment.production) {
        //     const applicationRef = moduleRef.injector.get(ApplicationRef);
        //     const componentRef = applicationRef.components[0];
        //     // allows to run `ng.profiler.timeChangeDetection();`
        //     enableDebugTools(componentRef);
        //   }

        if ('serviceWorker' in navigator && environment.production) {
            navigator.serviceWorker.register('ngsw-worker.js');
        }
    })
    .catch((err) => console.error(err));
