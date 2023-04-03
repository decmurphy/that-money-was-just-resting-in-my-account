import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from '../../modules/chart/chart.module';
import { PlotlyModule } from '../../modules/chart/plotly.module';
import { OverlayModule } from '../../modules/overlay/overlay.module';

import { MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MyCommonModule } from '../common/common.module';
import { routing } from './mortgage-calculator.routing';

@NgModule({
  declarations: [
    MortgageCalculatorComponent
  ],
  imports: [
    CommonModule,
    MyCommonModule,
    routing,

    PlotlyModule,
    ChartModule,
    OverlayModule,
  ]
})
export class MortgageCalculatorModule { }
