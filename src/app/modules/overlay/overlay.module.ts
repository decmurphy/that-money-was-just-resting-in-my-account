import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayComponent } from './overlay.component';

@NgModule({
    declarations: [OverlayComponent],
    imports: [CommonModule],
    exports: [OverlayComponent],
})
export class OverlayModule {}
