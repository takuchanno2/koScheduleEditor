"use strict";

function assert(expr: any, message = null) {
    if (!expr) {
        debugger;
        throw new Error(message || "Assertion Error!");
    }
} 
