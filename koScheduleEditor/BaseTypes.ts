﻿/// <reference path="Utilities.ts" />

"use strict";

class Time {
    public static unitMinutes = 30;

    public totalMinutes: number;

    public constructor(totalMinutes: number);
    public constructor(hours: number, minutes: number);
    public constructor(x: number, y?: number) {
        if (y === undefined) {
            // constructor(totalMinutes: number)
            this.totalMinutes = x;
        } else {
            // constructor(hours: number, minutes: number)
            this.totalMinutes = (x * 60 + y);
        }

        // 24 * 60は明日の0:00を示すこととして、例外的に設定可
        assert(0 <= this.totalMinutes && this.totalMinutes <= 24 * 60 && this.totalMinutes % Time.unitMinutes == 0);

        Object.freeze(this);
    }

    public get hours(): number { return Math.floor(this.totalMinutes / 60); }
    public get minutes(): number { return this.totalMinutes % 60; }
    public get deciamlHours(): number { return this.hours + (this.minutes / 60.0); }

    public static subtract(x: Time, y: Time) {
        return new Time(x.totalMinutes - y.totalMinutes);
    }

    public toString(): string { return String(this.hours) + ":" + String(100 + this.minutes).slice(1); }
    public static fromString(time: string): Time {
        var hm = time.split(":");
        return new Time(Number(hm[0]), Number(hm[1]));
    }

    public static fromJSONObject(obj: any): Time {
        return new Time(obj._totalMinutes);
    }
}

class TimeSpan {
    // public static coretime: TimeSpan = null;
    public static coretime = new TimeSpan(new Time(9, 0), new Time(17, 0));

    public static init(config: any) {
        TimeSpan.coretime = TimeSpan.fromJSONObject(config.coretimeSpan);
    }

    public constructor(public begin: Time, public end: Time) {
        assert(begin.totalMinutes < end.totalMinutes);
        Object.freeze(this);
    }

    public get span(): Time { return Time.subtract(this.end, this.begin); }

    public includes(time: Time): boolean {
        return (this.begin.totalMinutes <= time.totalMinutes) && (time.totalMinutes < this.end.totalMinutes);
    }

    public static fromJSONObject(obj: any): TimeSpan {
        return new TimeSpan(Time.fromJSONObject(obj._begin), Time.fromJSONObject(obj._end));
    }
}