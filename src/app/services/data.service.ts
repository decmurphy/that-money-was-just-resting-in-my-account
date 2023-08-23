import { Injectable } from '@angular/core';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { Strategy } from 'app/interfaces/v3/strategy';
import { AppServicesModule } from 'app/modules/app-services.module';
import { Observable, ReplaySubject, debounceTime, distinct } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

import 'app/interfaces/extensions/date.extensions';
import { Household } from 'app/interfaces/v3/household';
import { Snapshot } from 'app/interfaces/v3/snapshot';
import { TaxPayer } from 'app/interfaces/v3/people/people';
import { Mortgage } from 'app/interfaces/v3/mortgage';
import { Expenditures } from 'app/interfaces/v3/expenditures';
import { Event, Noop } from 'app/interfaces/v3/events/events';

@Injectable({
    providedIn: AppServicesModule,
})
export class DataService {

    private dataLSKey: string;
    private data: Household;
    private dataChanged: ReplaySubject<Household> = new ReplaySubject();

    private snapshot: Snapshot[] = [];
    private snapshotChanged: ReplaySubject<Snapshot[]> = new ReplaySubject();

    private netWorthData: GenericPlotData[];
    private netWorthDataChanged: ReplaySubject<GenericPlotData[]> = new ReplaySubject();

    constructor(private ls: LocalStorageService) {
        this.dataLSKey = 'mortgageCalcConfigV3';
        const mccString = this.ls.get(this.dataLSKey);
        const mcc = JSON.parse(mccString) || Household.sampleData();
        this.setData(mcc);

        this.getData()
            .pipe(distinct(), debounceTime(200))
            .subscribe(() => {
                this.updateFormInputs();
                this.dataChanged.next(this.data);
                this.ls.put(this.dataLSKey, JSON.stringify(this.data));
            });

    }

    getData(): Observable<Household> {
        return this.dataChanged.asObservable();
    }

    setData(data: Household): void {
        this.data = Household.create(data);
        this.dataChanged.next(this.data);
    }

    getSnapshot(): Observable<Snapshot[]> {
        return this.snapshotChanged.asObservable();
    }

    setSnapshot(snapshot: Snapshot[]): void {
        this.snapshot = snapshot;
        this.snapshotChanged.next(this.snapshot);
    }

    getNetWorthData(): Observable<GenericPlotData[]> {
        return this.netWorthDataChanged.asObservable();
    }

    setNetWorthData(data: GenericPlotData[]): void {
        this.netWorthData = data;
        this.netWorthDataChanged.next(this.netWorthData);
    }

    addTaxpayer() {
        this.data.taxpayers.push(new TaxPayer());
        this.setData(this.data);
    }

    removeTaxpayer(idx: number): void {
        this.data.taxpayers.splice(idx, 1);
        this.setData(this.data);
    }

    setTaxpayer(idx: number, model: TaxPayer): void {
        this.data.taxpayers[idx] = model;
        this.setData(this.data);
    }

    setMortgage(model: Mortgage): void {
        this.data.mortgage = model;
        this.setData(this.data);
    }

    setExpenditures(model: Expenditures): void {
        this.data.expenditures = model;
        this.setData(this.data);
    }

    setStrategy(model: Strategy): void {
        this.data.strategy = model;
        this.setData(this.data);
    }

    setEvent(id: string, model: Event): void {
        this.data.strategy.events = this.data.strategy.events.map(ev => ev.id == id ? model : ev);
        this.setData(this.data);
    }

    addEvent(): void {
        this.data.strategy.events.push(new Noop());
        this.setData(this.data);
    }

    deleteEvent(id: string): void {
        const eventToDelete = this.data.strategy.events.find(ev => ev.id == id);
        const idx = this.data.strategy.events.indexOf(eventToDelete);
        this.data.strategy.events.splice(idx, 1);
        this.setData(this.data);
    }

    updateFormInputs() {

        const copy = Household.create(this.data);
        copy.evaluate();

        this.setSnapshot(copy.createSnapshotSeries());

        const netWorthData: GenericPlotData[] = [

            {
                mode: 'lines',
                name: 'Net Worth',
                x: this.snapshot.map(el => new Date(el.timestamp).getFractionalYear()),
                y: this.snapshot.map(el => el.netWorth)
            },

            {
                mode: 'lines',
                name: 'Savings',
                x: this.snapshot.map(el => new Date(el.timestamp).getFractionalYear()),
                y: this.snapshot.map(el => el.cash)
            },

            {
                mode: 'lines',
                name: 'Liabilities',
                x: this.snapshot.map(el => new Date(el.timestamp).getFractionalYear()),
                y: this.snapshot.map(el => -el.principal)
            }

        ];

        copy.taxpayers.forEach((tp, i) => {
            netWorthData.push({
                mode: 'lines',
                name: `Pension (${tp.details.name})`,
                x: this.snapshot.map(el => new Date(el.timestamp).getFractionalYear()),
                y: this.snapshot.map(el => el.pension[i])
            });
        });

        this.setNetWorthData(netWorthData);

    }

}
