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
                this[prop] = this[prop].bind(this);
            });
    }
}

class TaskCollectionViewModel extends BaseViewModel{
    public tasks: TaskCollection = new TaskCollection();

    private focusedTask: Task = null;
    private focusedTaskOriginal: Task = null;
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
        if (!this.isEditingTask) { this.tasks.add(this.focusedTask); }
        this.clear();
        this.isTextBoxFocused = true;
    }

    public duplicate() {
        var clone = this.focusedTask.clone();
        this.tasks.add(clone);
        this.focus(clone);
        this.isTextBoxFocused = true;
    }

    public cancel() {
        if (this.isEditingTask) {
            this.focusedTask.copyFrom(this.focusedTaskOriginal);
            this.tasks.updateIndex(this.focusedTask);
            this.focus(null);
        } else {
            this.clear();
        }

        this.isTextBoxFocused = true;
    }

    public clear() {
        this.focusedTask = new Task();
        this.focusedTaskOriginal = null;
        this.timeSpanBegin = this.intialTimeSpanOption;
        this.timeSpanEnd = this.intialTimeSpanOption;

        this.isTextBoxFocused = true;
    }

    public remove(task: Task) {
        if (task === this.focusedTask) {
            this.clear();
        }

        this.tasks.remove(task);
        this.isTextBoxFocused = true;
    }

    public focus(task: Task) {
        if (task) {
            if (task !== this.focusedTask) {
                this.focusedTask = task;
                this.focusedTaskOriginal = task.clone();
                this.timeSpanBegin = task.timeSpan.begin;
                this.timeSpanEnd = task.timeSpan.end;
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
                this.tasks.updateIndex(this.focusedTask);
            }
        }
    }

    public get isEditingTask() {
        return (this.focusedTaskOriginal !== null);
    }
}
