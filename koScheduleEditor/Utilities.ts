"use strict";

function isAccessor(obj: any, prop: string) {
    return !_.isEmpty(_(Object.getOwnPropertyDescriptor(obj, prop)).pick("set", "get"));
}

function assert(expr: any, message = null) {
    if (!expr) {
        debugger;
        throw new Error(message || "Assertion Error!");
    }
} 
