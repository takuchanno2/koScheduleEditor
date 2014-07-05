/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />

class Task {
    public constructor(
        public name = "",
        public timeSpan = TimeSpan.zero
        ) {
        ko.track(this);
    }

    public get isValid() {
        return this.timeSpan.span.totalMinutes > 0;
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
        }
    }

    public remove(task: Task) {
        this.tasks.remove(task);
    }

    public updateIndex(task: Task) {
        if (this.tasks.length > 1) {
            this.tasks.remove(task);
            var idx = _(this.tasks).sortedIndex(task, this.taskIterator);
            this.tasks.splice(idx, 0, task);
        }
    }

    private taskIterator(task: Task) {
        return task.timeSpan.begin.totalMinutes * 24 * 60 + task.timeSpan.end.totalMinutes;
    }
}