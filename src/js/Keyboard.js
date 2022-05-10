import { KEYBOARD_MAP } from './keysData.js';
import KeyBuilder from './KeyBuilder.js';
import { createDomNode } from './keyboardHelpers.js';

const KEYBOARD_WRAPPER_CLASS = 'keyboard';

export default class Keyboard {
  constructor() {
    this.isShift = false;
    this.isCtrl = false;
    this.isCapsLock = false;
    this.isMouseClicked = false;
    this.lang = localStorage.getItem('lang') || 'en';
    this.domElements = {};
    this.domElements.keyBase = {};
  }

  initKeyboard = () => {
    this.createWrapper();
    this.createInput();
    this.createKeyboard();
    this.setKeysText();
    this.initClickHandlers();
  };

  createWrapper = (className = KEYBOARD_WRAPPER_CLASS) => {
    const wrapper = createDomNode('section', '', [className]);
    const title = createDomNode('h1', 'Virtual Keyboard');
    wrapper.append(title);
    this.domElements.wrapper = wrapper;
    document.body.append(this.domElements.wrapper);
  };

  createInput = () => {
    const inputWrapper = createDomNode('div', '', ['keyboard-text']);
    const inputArea = createDomNode('textarea', '', ['keyboard-input']);
    inputArea.setAttribute('placeholder', 'Type here...');
    inputWrapper.append(inputArea);
    this.domElements.textArea = inputArea;
    this.domElements.wrapper.append(inputWrapper);
  };

  createKeyboard = () => {
    const kbwrapper = createDomNode('div', '', ['keyboard-area']);
    KEYBOARD_MAP.forEach((line) => {
      kbwrapper.append(this.createKeyboardLine(line));
    });
    kbwrapper.append(
      createDomNode('h2', 'Press CTRL + SHIFT to switch layout'),
    );
    kbwrapper.append(
      createDomNode('p', 'Created in Windows 10, Ubuntu 20, Chrome'),
    );
    this.domElements.wrapper.append(kbwrapper);
  };

  createKeyboardLine = (keysLine) => {
    const lineWrapper = createDomNode('div', '', ['keyboard-area__line']);
    keysLine.forEach((code) => {
      const newKeyObj = new KeyBuilder(code);
      this.domElements.keyBase[`${code}`] = newKeyObj;
      lineWrapper.append(newKeyObj.getNode());
    });
    return lineWrapper;
  };

  setKeysText = () => {
    const keyStorage = this.domElements.keyBase;
    Object.keys(keyStorage).forEach((keyId) => {
      const key = keyStorage[`${keyId}`];
      // if no text value => system key, don't touch
      if (!key.keyData.ru) return;
      if (this.isShift) {
        key.setContent(this.lang, 'shifted', this.isCapsLock);
      } else {
        key.setContent(this.lang, 'normal', this.isCapsLock);
      }
    });
  };

  initClickHandlers = () => {
    const keyStorage = this.domElements.keyBase;
    Object.keys(keyStorage).forEach((keyId) => {
      const key = this.domElements.keyBase[`${keyId}`].getNode();
      key.addEventListener('mousedown', (e) => this.handleKeyEvent(e));
      key.addEventListener('mouseup', (e) => this.handleKeyEvent(e));
      key.addEventListener('mouseout', (e) => this.handleKeyEvent(e));
    });
    document.body.addEventListener('keydown', (e) => this.handleKeyEvent(e));
    document.body.addEventListener('keyup', (e) => this.handleKeyEvent(e));
  };

  handleKeyEvent(event) {
    const currentKey = this.domElements.keyBase[
      `${event.code || event.currentTarget.closest('.key').dataset.keyId}`
    ];
    if (!currentKey) return;
    // handle shift press
    if (['ShiftLeft', 'ShiftRight'].includes(currentKey.keyId)) {
      event.preventDefault();
      this.shiftHandler(event, currentKey);
      // handle Control key
    } else if (['ControlLeft', 'ControlRight'].includes(currentKey.keyId)) {
      this.controlHandler(event, currentKey);
      // handle CAPS LOCK
    } else if (['CapsLock'].includes(currentKey.keyId)) {
      this.capsLockHandler(event, currentKey);
      // handle Delete
    } else if (['MetaLeft'].includes(currentKey.keyId)) {
      event.preventDefault();
      currentKey.renderEvent(event);
      // handle Alt
    } else if (['AltLeft', 'AltRight'].includes(currentKey.keyId)) {
      event.preventDefault();
      currentKey.renderEvent(event);
      // handle Delete
    } else if (['Delete'].includes(currentKey.keyId)) {
      currentKey.renderEvent(event);
      if (event.type === 'mousedown') {
        event.preventDefault();
        this.updateTextField(event, currentKey, 1);
      }
      // handle backspace
    } else if (['Backspace'].includes(currentKey.keyId)) {
      currentKey.renderEvent(event);
      if (event.type === 'mousedown') {
        event.preventDefault();
        this.updateTextField(event, currentKey, -1);
      }
    } else {
      event.preventDefault();
      currentKey.renderEvent(event);
      this.updateTextField(event, currentKey);
    }
    this.domElements.textArea.focus();
  }

  updateTextField = (event, key = null, step = 0) => {
    // update only after press, avoid duplication on key/mouseup
    if (!['keydown', 'mousedown'].includes(event.type)) return;
    let currentValue = key ? key.currentValue : event.key || '';
    if (key.keyData.isSystem) {
      currentValue = key.keyData.currentValue;
    }
    const { textArea } = this.domElements;
    const selection = {
      start: textArea.selectionStart || 0,
      end: textArea.selectionEnd || 0,
      whole: textArea.value,
      beforeSel:
        textArea.value.substring(0, textArea.selectionStart) || textArea.value,
      afterSel:
        textArea.value.substring(
          textArea.selectionEnd,
          textArea.value.length,
        ) || '',
    };
    // handle Del
    if (step > 0) {
      if (selection.start === selection.end) {
        textArea.value = `${selection.beforeSel}${selection.afterSel.slice(step)}`;
      } else {
        textArea.value = `${selection.beforeSel}${selection.afterSel}`;
      }
      textArea.selectionStart = selection.start;
    } else // handle Backspace
    if (step < 0) {
      // handle unicodes by pre-switching it to a single char
      selection.beforeSel.replace(/\\u\d+$/, '#');
      if (selection.start === selection.end) {
        textArea.value = `${selection.beforeSel.slice(0, step)}${selection.afterSel}`;
        textArea.selectionStart = selection.start + step;
      } else {
        textArea.value = `${selection.beforeSel}${selection.afterSel}`;
        textArea.selectionStart = selection.start; // step is a negative value
      }
    } else { // input character
      textArea.value = `${selection.beforeSel}${currentValue}${selection.afterSel}`;
      textArea.selectionStart = selection.start + currentValue.length;
    }
    textArea.selectionEnd = textArea.selectionStart;
  };

  capsLockHandler = (event, key) => {
    if (['mousedown', 'keydown'].includes(event.type)) {
      if (this.isCapsLock) {
        this.isCapsLock = false;
        key.getNode().classList.remove('key__capslock_active');
      } else {
        this.isCapsLock = true;
        key.getNode().classList.add('key__capslock_active');
      }
    }
    this.setKeysText();
    key.renderEvent(event);
  };

  shiftHandler = (event, key) => {
    if (['mousedown', 'keydown'].includes(event.type)) {
      // if already pressed CTRL - flip locale
      if (this.isCtrl) {
        this.switchInputLanguage();
        return;
      }
      this.isShift = true;
      this.setKeysText();
    } else if (['mouseup', 'keyup', 'mouseout'].includes(event.type)) {
      this.isShift = false;
      this.setKeysText();
    }
    key.renderEvent(event, this.isMouseClicked === key);
  };

  controlHandler = (event, key) => {
    if (['mousedown', 'keydown'].includes(event.type)) {
      // if already pressed Shift - flip locale
      if (this.isShift) {
        this.switchInputLanguage();
        this.setKeysText();
      }
      this.isCtrl = true;
    } else if (['mouseup', 'keyup', 'mouseout'].includes(event.type)) {
      // if (this.isMouseClicked !== key) {
      this.isCtrl = false;
      // }
    }
    key.renderEvent(event, this.isMouseClicked === key);
  };

  switchInputLanguage = () => {
    this.lang = this.lang === 'en' ? 'ru' : 'en';
    localStorage.setItem('lang', this.lang);
    this.isShift = false;
    this.isCtrl = false;
  };
}
