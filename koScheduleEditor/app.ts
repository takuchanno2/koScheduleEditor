/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />

$(() => {
    ko.applyBindings(new TaskCollectionViewModel());
});
