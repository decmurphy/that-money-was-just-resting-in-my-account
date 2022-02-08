import { Injectable } from '@angular/core';

import { AppServicesModule } from '../modules/app-services.module';

@Injectable({
    providedIn: AppServicesModule
})
export class UtilityService {

    constructor() { }

    newID (prefix = "") {
        if (prefix != "") {
            if (prefix.length < 3 || prefix.length > 5) {
                throw new Error(`Prefix [${prefix}] length must be 3-5 characters`);
            }
        }
        return prefix + '_' + Math.random().toString(36).substring(2, 11);
    }

}
