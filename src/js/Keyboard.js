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
      if (!key.keyData.en) return;
      if (this.isShift) {
        if (this.isCapsLock && !key.keyData.noCaps) {
          key.node.innerText = key.keyData[`${this.lang}`].normal;
        } else {
          key.node.innerText = key.keyData[`${this.lang}`].shifted;
        }
      } else {
        if (this.isCapsLock && !key.keyData.noCaps) {
          key.node.innerText = key.keyData[`${this.lang}`].shifted;
        } else {
          key.node.innerText = key.keyData[`${this.lang}`].normal;
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
    let currentKey = this.domElements.keyBase[`${(event.code || event.target.dataset.keyCode)}`].getNode();
    if (["keydown","mousedown"].includes(event.type)) {
      currentKey.classList.add("pressed");
    } else if (["keyup","mouseup","mouseout"].includes(event.type)) {
      currentKey.classList.remove("pressed");
    }
    //if phisical key pressed
    if (event.code) {
      //let currentKey = this.domElements.keyBase[event.code].getNode();
      this.domElements.textArea.value = currentKey.toString();
    }
    this.domElements.textArea.value = currentKey.classList;
  }

  capslockHandler = () => {};

  switchInputLanguage = () => {
    this.lang = this.lang === "en" ? "ru" : "en";
    localStorage.setItem("lang", this.lang);
  };
}
