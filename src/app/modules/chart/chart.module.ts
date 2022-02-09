import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Chart2dComponent } from './chart2d/chart2d.component';
import { PlotlyModule } from './plotly.module';

@NgModule({
    declarations: [Chart2dComponent],
    imports: [CommonModule, PlotlyModule],
    exports: [Chart2dComponent],
})
export class ChartModule {}
