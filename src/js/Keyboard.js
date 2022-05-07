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
    this.lang = "en";
    this.domElements = {};
    this.domElements.keys = [];
  }
  initKeyboard = () => {
    this.createWrapper();
    this.createInput();
    this.createKeyboard();
    this.setKeysText();
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
      this.domElements.keys.push(newKeyObj);
      lineWrapper.append(newKeyObj.getNode());
    });
    return lineWrapper;
  };
  setKeysText = () => {
    this.domElements.keys.forEach( key => {
      if (!key.keyData.en) return;
      console.log(key.node);
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
}
