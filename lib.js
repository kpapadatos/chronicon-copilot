"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertKeyCodeToScanCode = exports.mouseUp = exports.mouseDown = exports.dispatchKeyEvent = exports.KeyToggle_Options = void 0;
var keycode_1 = __importDefault(require("keycode"));
var ffi_napi_1 = __importDefault(require("ffi-napi"));
var ref_napi_1 = __importDefault(require("ref-napi"));
var os_1 = __importDefault(require("os"));
var ref_struct_di_1 = __importDefault(require("ref-struct-di"));
var arch = os_1.default.arch();
var Struct = ref_struct_di_1.default(ref_napi_1.default);
var Input = Struct({
    "type": "int",
    "???": "int",
    "wVK": "short",
    "wScan": "short",
    "dwFlags": "int",
    "time": "int",
    "dwExtraInfo": "int64"
});
var user32 = ffi_napi_1.default.Library("user32", {
    SendInput: ["int", ["int", Input, "int"]],
    mouse_event: ['void', ['int', 'int', 'int', 'int', 'int']]
});
var extendedKeyPrefix = 0xe000;
var INPUT_KEYBOARD = 1;
var KEYEVENTF_EXTENDEDKEY = 0x0001;
var KEYEVENTF_KEYUP = 0x0002;
var KEYEVENTF_UNICODE = 0x0004;
var KEYEVENTF_SCANCODE = 0x0008;
var KeyToggle_Options = /** @class */ (function () {
    function KeyToggle_Options() {
        this.asScanCode = true;
        this.keyCodeIsScanCode = false;
        this.async = false;
    }
    return KeyToggle_Options;
}());
exports.KeyToggle_Options = KeyToggle_Options;
var entry = new Input();
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;
function dispatchKeyEvent(keyCode, type, options) {
    if (type === void 0) { type = "down"; }
    var opt = Object.assign({}, new KeyToggle_Options(), options);
    if (opt.asScanCode) {
        var scanCode = opt.keyCodeIsScanCode ? keyCode : convertKeyCodeToScanCode(keyCode);
        var isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;
        entry.dwFlags = KEYEVENTF_SCANCODE;
        if (isExtendedKey) {
            entry.dwFlags |= KEYEVENTF_EXTENDEDKEY;
        }
        entry.wVK = 0;
        entry.wScan = isExtendedKey ? scanCode - extendedKeyPrefix : scanCode;
    }
    else {
        entry.dwFlags = 0;
        entry.wVK = keyCode;
        entry.wScan = 0;
    }
    if (opt.flags != null) {
        entry.dwFlags = opt.flags;
    }
    if (type == "up") {
        entry.dwFlags |= KEYEVENTF_KEYUP;
    }
    if (opt.async) {
        return new Promise(function (resolve, reject) {
            user32.SendInput.async(1, entry, arch === "x64" ? 40 : 28, function (error, result) {
                if (error)
                    reject(error);
                resolve(result);
            });
        });
    }
    return user32.SendInput(1, entry, arch === "x64" ? 40 : 28);
}
exports.dispatchKeyEvent = dispatchKeyEvent;
var MOUSEEVENTF_LEFTDOWN = 2;
var MOUSEEVENTF_LEFTUP = 4;
function mouseDown() {
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
}
exports.mouseDown = mouseDown;
function mouseUp() {
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
}
exports.mouseUp = mouseUp;
var keys = "**1234567890-=**qwertyuiop[]**asdfghjkl;'`*\\zxcvbnm,./".split("");
function convertKeyCodeToScanCode(keyCode) {
    var keyChar = String.fromCharCode(keyCode).toLowerCase();
    var result = keys.indexOf(keyChar);
    console.assert(result != -1, "Could not find scan-code for key " + keyCode + " (" + keycode_1.default.names[keyCode] + ").");
    return result;
}
exports.convertKeyCodeToScanCode = convertKeyCodeToScanCode;
