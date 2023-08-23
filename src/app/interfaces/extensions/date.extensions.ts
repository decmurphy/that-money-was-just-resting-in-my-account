export { };

declare global {
    interface Date {
        equals(obj1: Date): boolean;
        toStartOfMonth(): Date;
        toStartOfYear(): Date;
        toDateOfMonth(date: number): Date;
        plusMonths(months: number): Date;
        plusYears(years: number): Date;
        toGraphString(): string
        getFractionalYear(): number
    }
}

Date.prototype.equals = function (obj1: Date) {
    return obj1.getMonth() == this.getMonth() && obj1.getFullYear() == this.getFullYear();
};

Date.prototype.toStartOfMonth = function () {
    this.setDate(1);
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};

Date.prototype.toStartOfYear = function () {
    this.setMonth(0);
    this.setDate(1);
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};

Date.prototype.toDateOfMonth = function (date: number) {
    this.setDate(date);
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};

Date.prototype.plusMonths = function (months: number) {
    const d = new Date(this.getTime());
    d.setFullYear(d.getMonth() + months);
    return d;
};

Date.prototype.plusYears = function (years: number) {
    const d = new Date(this.getTime());
    d.setFullYear(d.getFullYear() + years);
    return d;
};

Date.prototype.toGraphString = function () {
    return this.toISOString().substring(0, 7);
};

Date.prototype.getFractionalYear = function () {
    return this.getFullYear() + (this.getMonth() / 12.0);
};