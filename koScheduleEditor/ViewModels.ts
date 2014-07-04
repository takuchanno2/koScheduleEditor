/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
/// <reference path="BaseTypes.ts" />
/// <reference path="Utilities.ts" />

"use strict";

class TaskViewModel {
    public constructor(public name = "", public begin = TimeSpan.coretime.begin, public end = TimeSpan.coretime.end) {
        initViewModel(this);
    }

    public clone(): TaskViewModel {
        return new TaskViewModel(this.name);
    }

    public copyFrom(task: TaskViewModel) {
        this.name = task.name;
    }
}

class TaskListViewModel {
    public tasks: TaskViewModel[] = [];
    private focusedTask: TaskViewModel;
    private focusedTaskOriginal: TaskViewModel;

    public constructor() {
        this.clear();
        initViewModel(this);
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

function initViewModel(viewModel: any) {
    // thisが常に自分のクラスを指すようにする
    _(Object.getOwnPropertyNames(Object.getPrototypeOf(viewModel)))
        .filter((prop) => _.isFunction(viewModel[prop]))
        .forEach((prop) => {
            viewModel[prop] = viewModel[prop].bind(viewModel);
        });

    ko.track(viewModel);
}
