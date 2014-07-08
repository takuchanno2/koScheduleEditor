/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
/// <reference path="BaseTypes.ts" />
/// <reference path="Models.ts" />
/// <reference path="Utilities.ts" />

"use strict";

class BaseViewModel {
    public constructor() {
        // 定義されている関数内のthisが、イベントコールバック時などでも常に自分のクラスを指すようにする
        var fn = Object.getPrototypeOf(this);
        _(Object.getOwnPropertyNames(fn))
            .filter((prop) => (!isAccessor(fn, prop) && _.isFunction(fn[prop])))
            .forEach((prop) => {
                (<any>this)[prop] = ((<any>this)[prop]).bind(this);
            });
    }
}

class TaskViewModel extends BaseViewModel {
    public hasTimeSpanOverlap = false;

    public constructor(public task: Task) {
        super();

        ko.track(this);
        ko.getObservable(this, "hasTimeSpanOverlap").extend({ "rateLimit": 0 });
    }

    public get name() { return this.task.name; }
    public set name(value: string) { this.task.name = value; }
    public get timeSpan() { return this.task.timeSpan; }
    public set timeSpan(value: TimeSpan) { this.task.timeSpan = value; } 

    public get valid() {
        return !this.hasTimeSpanOverlap && this.timeSpan.span.totalMinutes > 0;
    }

    public clone() {
        return new TaskViewModel(this.task.clone());
    }

    public copyFrom(taskvm: TaskViewModel) {
        return this.task.copyFrom(taskvm.task);
    }

    public static iterator(taskvm: TaskViewModel) {
        return taskvm.timeSpan.begin.totalMinutes * 24 * 60 + taskvm.timeSpan.end.totalMinutes;
    }
}


class TaskListViewModel extends BaseViewModel {
    public tasks: TaskViewModel[] = [];

    private focusedTask: TaskViewModel = null;
    private focusedTaskOriginal: TaskViewModel = null;
    private isTextBoxFocused = false;

    private timeOptions: Time[] = [];
    private intialTimeSpanOption: Time = null;

    private timeSpanBegin: Time = null;
    private timeSpanEnd: Time = null;

    public constructor() {
        super();

        for (var i = 0; i <= 24 * 60; i += Time.unitMinutes) {
            var time = new Time(i);
            if (!this.intialTimeSpanOption && TimeSpan.coretime.includes(time)) {
                this.intialTimeSpanOption = time;
            }
            this.timeOptions.push(time);
        }

        this.clear();
        this.updateTaskTimeSpan();

        ko.track(this);
        ko.getObservable(this, "timeSpanBegin")
            .extend({ "rateLimit": 0 })
            .subscribe(this.onTimeSpanBeginChanged);
        ko.getObservable(this, "timeSpanEnd")
            .extend({ "rateLimit": 0 })
            .subscribe(this.onTimeSpanEndChanged);
    }

    public add() {
        if (!this.isEditingTask) {
            this.addNewTaskViewModel(this.focusedTask);
        }
        this.clear();
        this.isTextBoxFocused = true;
    }

    public duplicate() {
        var clone = this.focusedTask.clone();
        this.addNewTaskViewModel(clone);
        this.focus(clone);
        this.isTextBoxFocused = true;
    }

    private addNewTaskViewModel(taskvm: TaskViewModel) {
        if (_.isEmpty(this.tasks)) {
            this.tasks.push(taskvm);
        } else {
            var idx = _(this.tasks).sortedIndex(taskvm, TaskViewModel.iterator);
            this.tasks.splice(idx, 0, taskvm);
            this.validateTask();
        }
    }

    public cancel() {
        if (this.isEditingTask) {
            this.focusedTask.copyFrom(this.focusedTaskOriginal);
            this.updateIndex(this.focusedTask);
            this.focus(null);
        } else {
            this.clear();
        }

        this.isTextBoxFocused = true;
    }

    public clear() {
        this.focusedTask = new TaskViewModel(new Task());
        this.focusedTaskOriginal = null;
        this.timeSpanBegin = this.intialTimeSpanOption;
        this.timeSpanEnd = this.intialTimeSpanOption;

        this.isTextBoxFocused = true;
    }

    public remove(taskvm: TaskViewModel) {
        if (taskvm === this.focusedTask) {
            this.clear();
        }

        this.tasks.remove(taskvm);
        this.validateTask();
        this.isTextBoxFocused = true;
    }

    public focus(taskvm: TaskViewModel) {
        if (taskvm) {
            if (taskvm !== this.focusedTask) {
                this.focusedTask = taskvm;
                this.focusedTaskOriginal = taskvm.clone();
                this.timeSpanBegin = taskvm.timeSpan.begin;
                this.timeSpanEnd = taskvm.timeSpan.end;
            }
        } else {
            if (this.isEditingTask) {
                this.clear();
            }
        }

        this.isTextBoxFocused = true;
    }

    private colorCoretimeOptions(option: Element, item: Time) {
        ko.applyBindingsToNode(option, { "css": (TimeSpan.coretime.includes(item) ? "coretime" : "") }, item);
    }

    private onTimeSpanBeginChanged() {
        if (this.timeSpanBegin.totalMinutes > this.timeSpanEnd.totalMinutes) {
            this.timeSpanEnd = this.timeSpanBegin;
        }
        this.updateTaskTimeSpan();
    }

    private onTimeSpanEndChanged() {
        if (this.timeSpanBegin.totalMinutes > this.timeSpanEnd.totalMinutes) {
            this.timeSpanBegin = this.timeSpanEnd;
        }
        this.updateTaskTimeSpan();
    }

    private updateTaskTimeSpan() {
        var newTimeSpan = new TimeSpan(this.timeSpanBegin, this.timeSpanEnd);
        if (!TimeSpan.equals(this.focusedTask.timeSpan, newTimeSpan)) {
            this.focusedTask.timeSpan = newTimeSpan;
            if (this.isEditingTask) {
                this.updateIndex(this.focusedTask);
            }
        }
    }

    private validateTask() {
        this.tasks.forEach((t) => { t.hasTimeSpanOverlap = false; });
        if (this.tasks.length < 2) return;

        var queue = [_.first(this.tasks)]; // task.endで昇順ソート
        _(this.tasks).rest(1).forEach((task) => {
            while (!_.isEmpty(queue) && _.first(queue).task.timeSpan.end <= task.timeSpan.begin) {
                queue.shift();
            }

            queue.forEach((qtask) => {
                if (task.timeSpan.hasOverlap(qtask.timeSpan)) {
                    task.hasTimeSpanOverlap = true;
                    qtask.hasTimeSpanOverlap = true;
                }
            });

            var idx = _.sortedIndex(queue, task, (t) => t.timeSpan.end.totalMinutes);
            queue.splice(idx, 0, task);
        });
    }

    private updateIndex(taskvm: TaskViewModel) {
        if (this.tasks.length > 1) {
            this.tasks.remove(taskvm);
            var idx = _(this.tasks).sortedIndex(taskvm, TaskViewModel.iterator);
            this.tasks.splice(idx, 0, taskvm);
            this.validateTask();
        }
    }

    public get isEditingTask() {
        return (this.focusedTaskOriginal !== null);
    }
}