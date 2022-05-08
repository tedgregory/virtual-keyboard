export function getLetter(ruNorm, ruShifted, enNorm, enShifted, classes, noCaps = false) {
  return {
    ru: { normal: ruNorm, shifted: ruShifted },
    en: { normal: enNorm, shifted: enShifted },
    classes: classes,
    canShift: true,
    noCaps: noCaps
  };
}
export function getSpecial(label, value = false, classes) {
  return {
    label: label,
    currentValue: value,
    isSystem : true,
    classes: classes,
  };
}
export function createDomNode(tagName = "div", innerText = false, classNames = []) {
  let newElement = document.createElement(tagName);
  if (innerText) {
    newElement.innerText = innerText;
  }
  newElement.classList.add(...classNames);
  return newElement;
}
