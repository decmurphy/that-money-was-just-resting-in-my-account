import { Injectable } from '@angular/core';

import { AppServicesModule } from '../modules/app-services.module';

@Injectable({
    providedIn: AppServicesModule,
})
export class UtilityService {
    constructor() { }

    static newID(prefix = '') {
        if (prefix != '') {
            if (prefix.length < 2 || prefix.length > 10) {
                throw new Error(
                    `Prefix [${prefix}] length must be 2-10 characters`
                );
            }
        }
        return prefix + '_' + Math.random().toString(36).substring(2, 11);
    }

    static sum(arr: number[]): number {
        return arr.reduce((acc, cur) => acc + cur, 0.0);
    }
}
