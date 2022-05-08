import { KEYBOARD_MAP } from "./keysData.js";
import { KeyBuilder } from "./KeyBuilder.js";
import { createDomNode } from "./keyboardHelpers.js";

const KEYBOARD_WRAPPER_CLASS = "keyboard";

export class Keyboard {
  constructor() {
    this.isShift = false;
    this.isCtrl = false;
    this.isCapsLock = false;
    this.isMouseClicked = false;
    this.lang = localStorage.getItem("lang") || "en";
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
    let wrapper = createDomNode("section", "", [className]);
    let title = createDomNode("h1", "Virtual Keyboard");
    wrapper.append(title);
    this.domElements.wrapper = wrapper;
    document.body.append(this.domElements.wrapper);
  };
  createInput = () => {
    let inputWrapper = createDomNode("div", "", ["keyboard-text"]);
    let inputArea = createDomNode("textarea", "", ["keyboard-input"]);
    inputArea.setAttribute("placeholder", "Type here...");
    inputWrapper.append(inputArea);
    this.domElements.textArea = inputArea;
    this.domElements.wrapper.append(inputWrapper);
  };
  createKeyboard = () => {
    let kbwrapper = createDomNode("div", "", ["keyboard-area"]);
    KEYBOARD_MAP.forEach((line) => {
      kbwrapper.append(this.createKeyboardLine(line));
    });
    kbwrapper.append(
      createDomNode("h2", "Press CTRL + SHIFT to switch layout")
    );
    this.domElements.wrapper.append(kbwrapper);
  };
  createKeyboardLine = (keysLine) => {
    let lineWrapper = createDomNode("div", "", ["keyboard-area__line"]);
    keysLine.forEach((code) => {
      let newKeyObj = new KeyBuilder(code);
      this.domElements.keyBase[`${code}`] = newKeyObj;
      lineWrapper.append(newKeyObj.getNode());
    });
    return lineWrapper;
  };
  setKeysText = () => {
    let keyStorage = this.domElements.keyBase;
    Object.keys(keyStorage).forEach((keyCode) => {
      let key = keyStorage[`${keyCode}`];
      //if no text value => system key, don't touch
      if (!key.keyData.en) return;
      if (this.isShift) {
        if (this.isCapsLock && !key.keyData.noCaps) {
          key.setContent(this.lang);
        } else {
          key.setContent(this.lang, "shifted");
        }
      } else {
        if (this.isCapsLock && !key.keyData.noCaps) {
          key.setContent(this.lang, "shifted");
        } else {
          key.setContent(this.lang);
        }
      }
    });
  };
  initClickHandlers = () => {
    let keyStorage = this.domElements.keyBase;
    Object.keys(keyStorage).forEach((keyCode) => {
      let key = this.domElements.keyBase[`${keyCode}`].getNode();
      key.addEventListener("mousedown", (e) => this.handleKeyEvent(e));
      key.addEventListener("mouseup", (e) => this.handleKeyEvent(e));
      key.addEventListener("mouseout", (e) => this.handleKeyEvent(e));
    });
    document.body.addEventListener("keydown", (e) => this.handleKeyEvent(e));
    document.body.addEventListener("keyup", (e) => this.handleKeyEvent(e));
  };
  handleKeyEvent(event) {
    event.preventDefault();
    let currentKey =
      this.domElements.keyBase[
        `${event.code || event.currentTarget.closest(".key").dataset.keyCode}`
      ];
    //handle shift press
    if (["ShiftLeft", "ShiftRight"].includes(currentKey.keyCode)) {
      this.shiftHandler(event, currentKey);
    } else if (["ControlLeft", "ControlRight"].includes(currentKey.keyCode)) {
      this.controlHandler(event, currentKey);
    } else currentKey.renderEvent(event);
    this.updateTextField(event, currentKey);

    //this.updateTextField(event, currentKey);
  }
  updateTextField = (event, key = null) => {
    // update only after press, avoid duplication on key/mouseup
    if (!["keydown", "mousedown"].includes(event.type)) return;
    let currentValue = key ? key.currentValue : event.key || "";
    const textArea = this.domElements.textArea;
    let selection = {
      start: textArea.selectionStart || 0,
      end: textArea.selectionEnd || 0,
      whole: textArea.value,
      beforeSel:
        textArea.value.substring(0, textArea.selectionStart) || textArea.value,
      afterSel:
        textArea.value.substring(
          textArea.selectionEnd,
          textArea.value.length
        ) || "",
    };
    textArea.value = `${selection.beforeSel}${currentValue}${selection.afterSel}`;
    textArea.selectionStart = selection.start + currentValue.length;
    textArea.selectionEnd = textArea.selectionStart;
    //console.log(typeof currentValue.length);
  };
  capsLockHandler = (event, key) => {};

  shiftHandler = (event, key) => {
    if (["mousedown", "keydown"].includes(event.type)) {
      // if already pressed CTRL - flip locale
      if (this.isCtrl) {
        this.switchInputLanguage();
      }
      this.isShift = true;
      // keep it pressed if pressed with mouse
      // if (event.type === "mousedown") {
      //   if (!this.isMouseClicked) {
      //     this.isMouseClicked = key;
      //   } else if (this.isMouseClicked === key) {
      //     this.isMouseClicked = false;
      //     this.isShift = false;
      //   }
      // }
    } else if (["mouseup", "keyup", "mouseout"].includes(event.type)) {
      //if (this.isMouseClicked !== key) {
        this.isShift = false;
      //}
    }
    this.setKeysText();
    key.renderEvent(event, this.isMouseClicked === key);
  };

  controlHandler = (event, key) => {
    if (["mousedown", "keydown"].includes(event.type)) {
      // if already pressed Shift - flip locale
      if (this.isShift) {
        this.switchInputLanguage();
        this.setKeysText();
      }
      this.isCtrl = true;
      // keep it pressed if pressed with mouse
      // if (event.type === "mousedown") {
      //   if (!this.isMouseClicked) {
      //     this.isMouseClicked = key;
      //   } else if (this.isMouseClicked === key) {
      //     this.isMouseClicked = false;
      //     this.isShift = false;
      //   }
      // }
    } else if (["mouseup", "keyup", "mouseout"].includes(event.type)) {
      //if (this.isMouseClicked !== key) {
        this.isCtrl = false;
      //}
    }
    key.renderEvent(event, this.isMouseClicked === key);
  };

  switchInputLanguage = () => {
    this.lang = this.lang === "en" ? "ru" : "en";
    localStorage.setItem("lang", this.lang);
    this.isShift = false;
    this.isCtrl = false;
  };
}
