/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />

class Task {
    public hasTimeSpanOverlap = false;

    public constructor(
        public name = "",
        public timeSpan = TimeSpan.zero
        ) {
        ko.track(this);
        ko.getObservable(this, "hasTimeSpanOverlap").extend({"rateLimit": 0});
    }

    public get isValid() {
        return !this.hasTimeSpanOverlap && this.timeSpan.span.totalMinutes > 0;
    }

    public clone(): Task {
        return new Task(this.name, this.timeSpan);
    }

    public copyFrom(obj: Task) {
        this.name = obj.name;
        this.timeSpan = obj.timeSpan;
    }
}

class TaskCollection {
    public tasks: Task[] = [];

    public constructor() {
        ko.track(this);
    }

    public add(task: Task) {
        if (_.isEmpty(this.tasks)) {
            this.tasks.push(task);
        } else {
            var idx = _(this.tasks).sortedIndex(task, this.taskIterator);
            this.tasks.splice(idx, 0, task);
            this.validateTask();
        }
    }

    public remove(task: Task) {
        this.tasks.remove(task);
        this.validateTask();
    }

    public updateIndex(task: Task) {
        if (this.tasks.length > 1) {
            this.tasks.remove(task);
            var idx = _(this.tasks).sortedIndex(task, this.taskIterator);
            this.tasks.splice(idx, 0, task);
            this.validateTask();
        }
    }

    // もう少しどうにかできないか
    private validateTask() {
        if (!_.isEmpty(this.tasks)) {
            this.tasks[0].hasTimeSpanOverlap = false;
        }

        for (var i = 1; i < this.tasks.length; i++) {
            var prev = this.tasks[i - 1];
            var curr = this.tasks[i];
            if (prev.timeSpan.hasOverlap(curr.timeSpan)) {
                prev.hasTimeSpanOverlap = true;
                curr.hasTimeSpanOverlap = true;
            } else {
                curr.hasTimeSpanOverlap = false;
            }
        }
    }

    private taskIterator(task: Task) {
        return task.timeSpan.begin.totalMinutes * 24 * 60 + task.timeSpan.end.totalMinutes;
    }
}