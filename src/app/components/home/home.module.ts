import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from '../../modules/chart/chart.module';
import { PlotlyModule } from '../../modules/chart/plotly.module';
import { OverlayModule } from '../../modules/overlay/overlay.module';

import { HomeComponent } from './home.component';
import { routing } from './home.routing';
import { MyCommonModule } from '../common/common.module';


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
    HomeComponent
  ],
})
export class HomeModule { }
