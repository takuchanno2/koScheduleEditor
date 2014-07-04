/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
/// <reference path="Utility.ts" />

class Time {
    
}

class TaskViewModel {
    public constructor(public name: String = "") {
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
    private focusedTask = new TaskViewModel();
    public focusedTaskOriginal: TaskViewModel = null;

    public constructor() {
        this.focus(null);
        initViewModel(this);
    }

    public add() {
        if (!this.isEditingTask) { this.tasks.push(this.focusedTask); }
        this.focus(null);
    }

    public cancel() {
        if (this.isEditingTask) {
            this.focusedTask.copyFrom(this.focusedTaskOriginal);
        }

        this.focus(null);
    }

    public remove(task: TaskViewModel) {
        if (task === this.focusedTask) {
            this.focusedTaskOriginal = null;
        }
        this.tasks.remove(task);
    }

    public focus(task: TaskViewModel) {
        if (task) {
            this.focusedTask = task;
            this.focusedTaskOriginal = task.clone();
        } else {
            this.focusedTask = new TaskViewModel();
            this.focusedTaskOriginal = null;
        }
    }

    public get isEditingTask() {
        return (this.focusedTaskOriginal !== null);
    }
}
