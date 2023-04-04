import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./components/home/home.module').then((m) => m.HomeModule),
    },
    {
        path: 'planner',
        loadChildren: () => import('./components/planner/planner.module').then((m) => m.PlannerModule),
    },
    {
        path: 'mortgage-calculator',
        loadChildren: () => import('./components/mortgage-calculator/mortgage-calculator.module').then((m) => m.MortgageCalculatorModule),
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
