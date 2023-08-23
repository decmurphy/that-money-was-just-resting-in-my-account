import { UtilityService } from "app/services/utility.service";

export class Snapshot {

    public constructor(
        public _id: string = null,
        public timestamp: number = null,
        public cash: number,
        public pension: number[],
        public principal: number,
        public interestDelta: number,
        public interestPaid: number,
        public payment: number,
        public equityInHouse: number,
        public netWorth: number
    ) {
        this._id = this._id || UtilityService.newID('snapshot');
    }

}
