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

class TaskListViewModel extends BaseViewModel{
    public tasks: Task[] = [];

    private focusedTask: Task = null;
    private focusedTaskOriginal: Task = null;
    private isTextBoxFocused = false;
    private timeOptions: Time[] = [];

    private hoge1: Time = null;
    private hoge2: Time = null;

    public constructor() {
        super();
        this.clear();

        for (var i = 0; i <= 24 * 60; i += Time.unitMinutes) {
            this.timeOptions.push(new Time(i));
        }

        ko.track(this);
    }

    public add() {
        if (!this.isEditingTask) { this.tasks.push(this.focusedTask); }
        this.clear();
        this.isTextBoxFocused = true;
    }

    public duplicate() {
        var clone = this.focusedTask.clone();
        this.tasks.push(clone);
        this.focus(clone);
        this.isTextBoxFocused = true;
    }

    public cancel() {
        if (this.isEditingTask) {
            this.focusedTask.copyFrom(this.focusedTaskOriginal);
            this.focus(null);
        } else {
            this.clear();
        }

        this.isTextBoxFocused = true;
    }

    public clear() {
        this.focusedTask = new Task();
        this.focusedTaskOriginal = null;
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
            }
        } else {
            if (this.isEditingTask) {
                this.clear();
            }
        }

        this.isTextBoxFocused = true;
    }

    public get isEditingTask() {
        return (this.focusedTaskOriginal !== null);
    }
}
