/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />

class Task {
    public constructor(
        public name = "",
        public timeSpan = null
        ) {
        ko.track(this);
    }

    public clone(): Task {
        return _.clone(this);
    }

    public copyFrom(obj: Task) {
        this.name = obj.name;
        this.timeSpan = obj.timeSpan;
    }
}
