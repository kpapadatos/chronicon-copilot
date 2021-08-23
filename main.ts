import { app, globalShortcut } from 'electron';
import keycode from "keycode";
import { dispatchKeyEvent, mouseDown, mouseUp } from './lib';

(async () => {
    console.log('waiting ready');
    await app.whenReady();
    console.log('ready');

    let state: 'down' | 'up' = 'up';

    const result = globalShortcut.register('Z', () => {
        if (state === 'up') {
            rotationDown();
            state = 'down';
        } else {
            rotationUp();
            state = 'up';
        }
    });

    console.log('listening: ' + result)
})();

function rotationDown() {
    console.log('rotationDown');

    dispatchKeyEvent(keycode.codes[1], 'down');
    dispatchKeyEvent(keycode.codes[2], 'down');
    dispatchKeyEvent(keycode.codes[3], 'down');
    dispatchKeyEvent(keycode.codes[4], 'down');

    mouseDown();
}

function rotationUp() {
    console.log('rotationUp');

    dispatchKeyEvent(keycode.codes[1], 'up');
    dispatchKeyEvent(keycode.codes[2], 'up');
    dispatchKeyEvent(keycode.codes[3], 'up');
    dispatchKeyEvent(keycode.codes[4], 'up');

    mouseUp();
}