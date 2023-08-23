import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormElementsModule } from '../../modules/form-elements/form-elements.module';

import { IncomePensionComponent } from './income-pension/income-pension.component';
import { ExpendituresComponent } from './expenditures/expenditures.component';
import { MortgageComponent } from './mortgage/mortgage.component';
import { StrategyComponent } from './strategy/strategy.component';
import { StrategyEventComponent } from './strategy-event/strategy-event.component';
import { TaxpayerComponent } from './taxpayer/taxpayer.component';
import { TableComponent } from './table/table.component';
import { NamedAmountComponent } from './named-amount/named-amount.component';
import { ChipComponent } from './layout/chip/chip.component';

import { SummaryPipe } from './pipes/summary.pipe';
import { SalarySummaryPipe } from './pipes/salary-summary.pipe';
import { PensionSummaryPipe } from './pipes/pension-summary.pipe';
import { SumPipe } from './pipes/sum.pipe';
import { AllIncomesPipe } from './pipes/all-incomes.pipe';
import { FilterByNotInPipe } from './pipes/filter-by-not-in.pipe';
import { ContainsPipe } from './pipes/contains.pipe';
import { DisplayPipe } from './table/display.pipe';

@NgModule({
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,
    FormElementsModule,
  ],
  declarations: [
    IncomePensionComponent,
    ExpendituresComponent,
    MortgageComponent,
    StrategyComponent,
    StrategyEventComponent,
    TaxpayerComponent,
    TableComponent,
    NamedAmountComponent,
    ChipComponent,

    SummaryPipe,
    SalarySummaryPipe,
    PensionSummaryPipe,
    SumPipe,
    AllIncomesPipe,
    FilterByNotInPipe,
    ContainsPipe,
    DisplayPipe,
  ],
  exports: [
    IncomePensionComponent,
    ExpendituresComponent,
    MortgageComponent,
    StrategyComponent,
    StrategyEventComponent,
    TaxpayerComponent,
    TableComponent,
    NamedAmountComponent,
    ChipComponent,

    SummaryPipe,
    SalarySummaryPipe,
    PensionSummaryPipe,
    SumPipe,
    AllIncomesPipe,
    FilterByNotInPipe,
    ContainsPipe,
    DisplayPipe,
  ]
})
export class MyCommonModule { }
