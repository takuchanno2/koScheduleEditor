/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
var TaskViewModel = (function () {
    function TaskViewModel(name) {
        if (typeof name === "undefined") { name = ""; }
        this.name = name;
        ko.track(this);
    }
    TaskViewModel.prototype.clone = function () {
        return new TaskViewModel(this.name);
    };

    TaskViewModel.prototype.copyFrom = function (task) {
        this.name = task.name;
    };
    return TaskViewModel;
})();

var TaskListViewModel = (function () {
    function TaskListViewModel() {
        var _this = this;
        this.tasks = [];
        this.focusedTask = new TaskViewModel();
        this.focusedTaskOriginal = null;
        this.add = function () {
            if (!_this.isEditingTask) {
                _this.tasks.push(_this.focusedTask);
            }
            _this.focus(null);
        };
        this.cancel = function () {
            if (_this.isEditingTask) {
                _this.focusedTask.copyFrom(_this.focusedTaskOriginal);
            }

            _this.focus(null);
        };
        this.remove = function (task) {
            if (task === _this.focusedTask) {
                _this.focusedTaskOriginal = null;
            }
            _this.tasks.remove(task);
        };
        this.focus = function (task) {
            if (task) {
                _this.focusedTask = task;
                _this.focusedTaskOriginal = task.clone();
            } else {
                _this.focusedTask = new TaskViewModel();
                _this.focusedTaskOriginal = null;
            }
        };
        this.focus(null);
        ko.track(this);
    }
    Object.defineProperty(TaskListViewModel.prototype, "isEditingTask", {
        get: function () {
            return (this.focusedTaskOriginal !== null);
        },
        enumerable: true,
        configurable: true
    });
    return TaskListViewModel;
})();
//# sourceMappingURL=Task.js.map
