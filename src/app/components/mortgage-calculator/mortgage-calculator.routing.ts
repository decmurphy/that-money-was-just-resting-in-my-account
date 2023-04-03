import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MortgageCalculatorModule } from './mortgage-calculator.module';


const routes: Routes = [
    {
        path: '',
        component: MortgageCalculatorComponent
    },
];

export const routing: ModuleWithProviders<MortgageCalculatorModule> = RouterModule.forChild(routes);
