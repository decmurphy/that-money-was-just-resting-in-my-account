import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ServiceWorkerModule } from '@angular/service-worker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

import { AppServicesModule } from './modules/app-services.module';
import { FormElementsModule } from './modules/form-elements/form-elements.module';
import { ChartModule } from './modules/chart/chart.module';
import { PlotlyModule } from './modules/chart/plotly.module';
import { OverlayModule } from './modules/overlay/overlay.module';

import { SummaryPipe } from './pipes/summary.pipe';
import { SalarySummaryPipe } from './pipes/salary-summary.pipe';
import { PensionSummaryPipe } from './pipes/pension-summary.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { AllIncomesPipe } from './pipes/all-incomes.pipe';
import { FilterByNotInPipe } from './pipes/filter-by-not-in.pipe';
import { ContainsPipe } from './pipes/contains.pipe';
import { FilterOpsForTypePipe } from './pipes/filter-ops-for-type.pipe';
import { RequiresTaxpayerPipe } from './pipes/requires-taxpayer.pipe';

import { IncomePensionComponent } from './components/income-pension/income-pension.component';
import { ExpendituresComponent } from './components/expenditures/expenditures.component';
import { MortgageComponent } from './components/mortgage/mortgage.component';
import { StrategyComponent } from './components/strategy/strategy.component';
import { StrategyEventComponent } from './components/strategy-event/strategy-event.component';
import { TaxpayerComponent } from './components/taxpayer/taxpayer.component';
import { TableComponent } from './components/table/table.component';
import { NamedAmountComponent } from './components/named-amount/named-amount.component';
import { ChipComponent } from './components/layout/chip/chip.component';
import { DisplayPipe } from './components/table/display.pipe';

@NgModule({
    declarations: [
        AppComponent,
        SummaryPipe,
        SalarySummaryPipe,
        PensionSummaryPipe,
        SumPipe,
        AllIncomesPipe,
        FilterByNotInPipe,
        ContainsPipe,
        FilterOpsForTypePipe,
        RequiresTaxpayerPipe,

        IncomePensionComponent,
        ExpendituresComponent,
        MortgageComponent,
        StrategyComponent,
        StrategyEventComponent,
        TaxpayerComponent,
        TableComponent,
        NamedAmountComponent,
        ChipComponent,
        DisplayPipe,
    ],
    imports: [
        BrowserModule,
        ServiceWorkerModule.register('ngsw-worker.js?version=13', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000',
        }),
        NoopAnimationsModule,

        FormsModule,
        ReactiveFormsModule,
        FormElementsModule,
        DragDropModule,

        PlotlyModule,
        ChartModule,
        OverlayModule,

        AppServicesModule,
    ],
    providers: [CurrencyPipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
