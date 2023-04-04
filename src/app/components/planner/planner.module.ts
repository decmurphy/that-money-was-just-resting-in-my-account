import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlannerComponent } from './planner.component';

import { MyCommonModule } from '../common/common.module';
import { routing } from './planner.routing';

import { PlotlyModule } from 'app/modules/chart/plotly.module';
import { ChartModule } from 'app/modules/chart/chart.module';
import { OverlayModule } from 'app/modules/overlay/overlay.module';



@NgModule({
  imports: [
    CommonModule,
    MyCommonModule,
    routing,

    PlotlyModule,
    ChartModule,
    OverlayModule,
  ],
  declarations: [
    PlannerComponent
  ],
})
export class PlannerModule { }
