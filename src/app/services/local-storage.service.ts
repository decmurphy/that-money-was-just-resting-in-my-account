import { Injectable } from '@angular/core';
import { AppServicesModule } from '../modules/app-services.module';

@Injectable({
    providedIn: AppServicesModule,
})
export class LocalStorageService {
    supported: boolean;
    storage: Storage;

    constructor() {
        this.supported = Storage !== void 0;
        this.storage = window.localStorage;
    }

    isSupported(): boolean {
        return this.supported;
    }

    put(key: string, val: string): void {
        this.delete(key);
        this.storage.setItem(key, val);
        if (val != null && val !== 'null') {
            this.storage.setItem(key, val);
        }
    }

    delete(key: string): void {
        this.storage.removeItem(key);
    }

    get(key: string): string {
        return this.storage.getItem(key);
    }
}
