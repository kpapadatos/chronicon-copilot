import keycode from "keycode";
import ffi from "ffi-napi";
import ref from "ref-napi";
import os from "os";
import import_Struct from "ref-struct-di";

var arch = os.arch();
const Struct = import_Struct(ref);

var Input = Struct({
    "type": "int",
    "???": "int",
    "wVK": "short",
    "wScan": "short",
    "dwFlags": "int",
    "time": "int",
    "dwExtraInfo": "int64"
});

var user32 = ffi.Library("user32", {
    SendInput: ["int", ["int", Input, "int"]],
    mouse_event: ['void', ['int', 'int', 'int', 'int', 'int']]
});

const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_UNICODE = 0x0004;
const KEYEVENTF_SCANCODE = 0x0008;

export class KeyToggle_Options {
    asScanCode = true;
    keyCodeIsScanCode = false;
    flags?: number;
    async = false;
}

let entry = new Input();
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;

export function dispatchKeyEvent(keyCode: number, type = "down" as "down" | "up", options?: Partial<KeyToggle_Options>) {
    const opt = Object.assign({}, new KeyToggle_Options(), options);

    if (opt.asScanCode) {
        let scanCode = opt.keyCodeIsScanCode ? keyCode : convertKeyCodeToScanCode(keyCode);
        let isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;

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
        return new Promise((resolve, reject) => {
            user32.SendInput.async(1, entry, arch === "x64" ? 40 : 28, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
    return user32.SendInput(1, entry, arch === "x64" ? 40 : 28);
}

const MOUSEEVENTF_LEFTDOWN = 2;
const MOUSEEVENTF_LEFTUP = 4;

export function mouseDown() {
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
}

export function mouseUp() {
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
}

let keys = "**1234567890-=**qwertyuiop[]**asdfghjkl;'`*\\zxcvbnm,./".split("");

export function convertKeyCodeToScanCode(keyCode: number) {
    let keyChar = String.fromCharCode(keyCode).toLowerCase();
    let result = keys.indexOf(keyChar);
    console.assert(result != -1, `Could not find scan-code for key ${keyCode} (${keycode.names[keyCode]}).`)
    return result;
}