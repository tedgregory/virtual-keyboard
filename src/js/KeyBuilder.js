import { createDomNode } from "./keyboardHelpers.js";
import { KEY_CODES } from "./keysData.js";

export class KeyBuilder {
  constructor(keyCode) {
    this.keyCode = keyCode;
    this.keyData = KEY_CODES[keyCode];
    this.node = this.setMarkup();
    this.currentValue = '';
    this.type = '';
  }
  setMarkup = () => {
    let classList = ["key", ...(this.keyData.classes || [])];
    let keyNode = createDomNode("div", "", classList);
    if (this.keyData.canShift) {
      keyNode.dataset.ru = this.keyData.ru.normal;
      keyNode.dataset.en = this.keyData.en.normal;
      keyNode.dataset.ruShifted = this.keyData.ru.shifted;
      keyNode.dataset.enShifted = this.keyData.en.shifted;
      this.type = "letter";
    } else if (this.keyData.isSystem) {
      keyNode.innerText = this.keyData.label;
      this.type = "system";
    }
    keyNode.dataset.keyCode = this.keyCode;
    return keyNode;
  };
  getNode = () => {
    return this.node;
  };
  setContent = (lang, shifted = "normal") => {
    let resultContent = `<div class="key__block-normal">${this.keyData[lang][shifted]}</div>`;
    this.currentValue = this.keyData[`${lang}`][`${shifted}`];
    if (!/(Key|Arline)\.?/.test(this.keyCode)) {
      let unshifted = shifted === "normal" ? "shifted" : "normal";
      resultContent += `<div class="key__block-shifted">${
        this.keyData[lang][unshifted]
      }</div>`;
    }
    this.getNode().innerHTML = resultContent;
  };
  renderEvent = (event, keep = false) => {
    if (["keydown", "mousedown"].includes(event.type)) {
      this.getNode().classList.add("pressed");
    } else if (["keyup", "mouseup", "mouseout"].includes(event.type)) {
      if (!keep) {
        this.getNode().classList.remove("pressed");
      } 
    }
  }
}
