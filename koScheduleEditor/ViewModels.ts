﻿/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
/// <reference path="BaseTypes.ts" />
/// <reference path="Utilities.ts" />

"use strict";

class BaseViewModel {
    public constructor() {
        // thisが常に自分のクラスを指すようにする
        _(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
            .filter((prop) => _.isFunction(this[prop]))
            .forEach((prop) => {
                this[prop] = this[prop].bind(this);
            });
    }
}

class TaskViewModel extends BaseViewModel{
    public constructor(public name = "", public begin = TimeSpan.coretime.begin, public end = TimeSpan.coretime.end) {
        super();
        ko.track(this);
    }

    public clone(): TaskViewModel {
        return new TaskViewModel(this.name);
    }

    public copyFrom(task: TaskViewModel) {
        this.name = task.name;
    }
}

class TaskListViewModel extends BaseViewModel{
    public tasks: TaskViewModel[] = [];
    private focusedTask: TaskViewModel;
    private focusedTaskOriginal: TaskViewModel;

    public constructor() {
        super();
        this.clear();
        ko.track(this);
    }

    public add() {
        if (!this.isEditingTask) { this.tasks.push(this.focusedTask); }
        this.clear();
    }

    public duplicate() {
        var clone = this.focusedTask.clone();
        this.tasks.push(clone);
        this.focus(clone);
    }

    public cancel() {
        if (this.isEditingTask) {
            this.focusedTask.copyFrom(this.focusedTaskOriginal);
            this.focus(null);
        } else {
            this.clear();
        }
    }

    public clear() {
        this.focusedTask = new TaskViewModel();
        this.focusedTaskOriginal = null;
    }

    public remove(task: TaskViewModel) {
        if (task === this.focusedTask) {
            this.clear();
        }

        this.tasks.remove(task);
    }

    public focus(task: TaskViewModel) {
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
    }

    public get isEditingTask() {
        return (this.focusedTaskOriginal !== null);
    }
}
