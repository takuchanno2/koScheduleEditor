/// <reference path="Scripts/typings/knockout.es5/knockout.es5.d.ts" />

function fixThis(viewModel: any) {
    // thisが常に自分のクラスを指すようにする
    for (var prop in viewModel) {
        console.log(prop);
        if (!viewModel.hasOwnProperty(prop) && typeof (viewModel[prop]) === 'function') {
            viewModel[prop] = viewModel[prop].bind(viewModel);
        }
    }
}

function initViewModel(viewModel: any) {
    fixThis(viewModel);
    ko.track(viewModel);
}
