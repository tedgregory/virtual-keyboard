export function getLetter(ruNorm, ruShifted, enNorm, enShifted, classes, noCaps = false) {
  return {
    ru: { normal: ruNorm, shifted: ruShifted },
    en: { normal: enNorm, shifted: enShifted },
    classes,
    canShift: true,
    noCaps,
  };
}
export function getSpecial(label, classes, value = false) {
  return {
    label,
    currentValue: value,
    isSystem: true,
    classes,
  };
}
export function createDomNode(tagName = 'div', innerText = false, classNames = []) {
  const newElement = document.createElement(tagName);
  if (innerText) {
    newElement.innerText = innerText;
  }
  classNames.length && newElement.classList.add(...classNames);
  return newElement;
}
