import { createDomNode } from './keyboardHelpers.js';
import { KEY_CODES } from './keysData.js';

export default class KeyBuilder {
  constructor(keyId) {
    this.keyId = keyId;
    this.keyData = KEY_CODES[keyId];
    this.node = this.setMarkup();
    this.currentValue = '';
    this.type = '';
  }

  setMarkup = () => {
    const classList = ['key', ...(this.keyData.classes || [])];
    const keyNode = createDomNode('div', '', classList);
    if (this.keyData.canShift) {
      keyNode.dataset.ru = this.keyData.ru.normal;
      keyNode.dataset.en = this.keyData.en.normal;
      keyNode.dataset.ruShifted = this.keyData.ru.shifted;
      keyNode.dataset.enShifted = this.keyData.en.shifted;
      this.type = 'letter';
    } else if (this.keyData.isSystem) {
      keyNode.innerText = this.keyData.label;
      this.currentValue = this.keyData.currentValue;
      this.type = 'system';
    }
    keyNode.dataset.keyId = this.keyId;
    return keyNode;
  };

  getNode = () => this.node;

  setContent = (lang, shifted = 'normal', isCaps = false) => {
    let currentValue = this.keyData[`${lang}`][`${shifted}`];
    if (isCaps) {
      currentValue = currentValue.toUpperCase();
      if (shifted === 'shifted') {
        currentValue = currentValue.toLowerCase();
      }
    }
    // currentValue = isCaps ? currentValue.toUpperCase() : currentValue.toLowerCase();
    let resultContent = `<div class="key__block-normal">${currentValue}</div>`;
    this.currentValue = currentValue;
    if (!/(Key|Arrow)\.?/.test(this.keyId) && !(/(Bracket|Semicolon|Quote|Comma|Period|Back)\.?/.test(this.keyId) && lang === 'ru')) {
      const unshifted = shifted === 'normal' ? 'shifted' : 'normal';
      resultContent += `<div class="key__block-shifted">${this.keyData[lang][unshifted]}</div>`;
    }
    this.getNode().innerHTML = resultContent;
  };

  renderEvent = (event) => {
    if (['keydown', 'mousedown'].includes(event.type)) {
      this.getNode().classList.add('pressed');
    } else if (['keyup', 'mouseup', 'mouseout'].includes(event.type)) {
      this.getNode().classList.remove('pressed');
    }
  };

  simulateKeyPress = () => {
    this.getNode().dispatchEvent(new KeyboardEvent('keypress', { code: this.keyId }));
  };
}
