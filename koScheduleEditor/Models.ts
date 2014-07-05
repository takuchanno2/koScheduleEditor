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

    public clone(): Task {
        return new Task(this.name, this.timeSpan);
    }

    public copyFrom(obj: Task) {
        this.name = obj.name;
        this.timeSpan = obj.timeSpan;
    }
}

class TaskCollection {
    private tasks: Task[] = [];

    public constructor() {
        ko.track(this);
    }

    public add(task: Task) {
        this.tasks.push(task);
    }

    public remove(task: Task) {
        this.tasks.remove(task);
    }
  
}