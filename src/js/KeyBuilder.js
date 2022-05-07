import { createDomNode } from "./keyboardHelpers.js";
import { KEY_CODES } from "./keysData.js";

export class KeyBuilder {
  constructor(keyCode) {
    this.keyCode = keyCode;
    this.keyData = KEY_CODES[keyCode];
    this.node = this.setMarkup();
  }
  setMarkup = () => {
    let classList = ["key", ...(this.keyData.classes || [])];
    let keyNode = createDomNode("div", "", classList);
    if (this.keyData.canShift) {
      keyNode.dataset.ru = this.keyData.ru.norm;
      keyNode.dataset.en = this.keyData.en.norm;
      keyNode.dataset.ruShifted = this.keyData.ru.shifted;
      keyNode.dataset.enShifted = this.keyData.en.shifted;
      keyNode.dataset.role = "letter";
    } else {
      keyNode.innerText = this.keyData.label;
      keyNode.dataset.role = "system";
    }
    keyNode.dataset.keyCode = this.keyCode;
    return keyNode;
  };
  getNode = () => {
    return this.node;
  };
}
