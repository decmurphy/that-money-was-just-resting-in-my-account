import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FormElementsModule } from './modules/form-elements/form-elements.module';
import { ChartModule } from './modules/chart/chart.module';
import { PlotlyModule } from './modules/chart/plotly.module';
import { SummaryPipe } from './pipes/summary.pipe';
import { SalarySummaryPipe } from './pipes/salary-summary.pipe';
import { PensionSummaryPipe } from './pipes/pension-summary.pipe';
import { MortgageSummaryPipe } from './pipes/mortgage-summary.pipe';
import { AppServicesModule } from './modules/app-services.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { IncomePensionComponent } from './components/income-pension/income-pension.component';
import { ExpendituresComponent } from './components/expenditures/expenditures.component';
import { MortgageComponent } from './components/mortgage/mortgage.component';
import { StrategyComponent } from './components/strategy/strategy.component';
import { StrategyEventComponent } from './components/strategy-event/strategy-event.component';
import { TaxpayerComponent } from './components/taxpayer/taxpayer.component';
import { SummaryComponent } from './components/summary/summary.component';
import { TableComponent } from './components/table/table.component';
import { NamedAmountComponent } from './components/named-amount/named-amount.component';
import { SumPipe } from './pipes/sum.pipe';

@NgModule({
    declarations: [
        AppComponent,
        SummaryPipe,
        SalarySummaryPipe,
        PensionSummaryPipe,
        MortgageSummaryPipe,
        IncomePensionComponent,
        ExpendituresComponent,
        MortgageComponent,
        StrategyComponent,
        StrategyEventComponent,
        TaxpayerComponent,
        SummaryComponent,
        TableComponent,
        NamedAmountComponent,
        SumPipe,
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

        MatTableModule,
        MatPaginatorModule,
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
