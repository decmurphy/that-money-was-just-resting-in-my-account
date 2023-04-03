import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeModule } from './home.module';
import { HomeComponent } from './home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
];

export const routing: ModuleWithProviders<HomeModule> = RouterModule.forChild(routes);
