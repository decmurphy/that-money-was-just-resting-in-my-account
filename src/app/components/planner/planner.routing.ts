import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlannerComponent } from './planner.component';
import { PlannerModule } from './planner.module';

const routes: Routes = [
    {
        path: '',
        component: PlannerComponent
    },
];

export const routing: ModuleWithProviders<PlannerModule> = RouterModule.forChild(routes);
