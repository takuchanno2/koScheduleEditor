/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />
var Task = (function () {
    function Task(name) {
        this.name = name;
        ko.track(this);
    }
    return Task;
})();
//# sourceMappingURL=BaseTypes.js.map
