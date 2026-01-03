// SPDX-FileCopyrightText: 2026 Antoni Szymański
// SPDX-License-Identifier: MPL-2.0

import menuStyle from "./style.css";

// @ts-expect-error
Element.prototype._attachShadow = Element.prototype.attachShadow;
Element.prototype.attachShadow = function () {
  // @ts-expect-error
  const shadowRoot = this._attachShadow({ mode: "open" });
  observeRoot(shadowRoot);
  return shadowRoot;
};

// new MutationObserver((mutations) => {
//   for (const mutation of mutations) {
//     for (const node of mutation.addedNodes) {
//       if (node instanceof Element && node.shadowRoot != null) {
//         observeRoot(node.shadowRoot);
//       }
//     }
//   }
// }).observe(document.body, { childList: true, subtree: true });

function observeRoot(root: ShadowRoot) {
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processNode(node);
      }
    }
  }).observe(root, { childList: true, subtree: true });
}

function processNode(node: Node) {
  if (
    !(node instanceof HTMLElement) || //
    !node.matches(":host > .monaco-menu-container > .monaco-scrollable-element")
  ) {
    return;
  }
  const menu = node.parentElement;
  if (menu === null) {
    return;
  }
  const actions = node.querySelector(":scope > .monaco-menu > .monaco-action-bar > .actions-container");
  if (actions === null) {
    return;
  }

  if (!menu.matches(`:has(> style#${menuStyleId})`)) {
    const style = document.createElement("style");
    style.id = menuStyleId;
    style.textContent = menuStyle;
    menu.appendChild(style);
  }

  const actionItems = [];
  for (let child = actions.firstElementChild; child !== null; child = child.nextElementSibling) {
    if (child instanceof HTMLElement && child.checkVisibility()) {
      actionItems.push(child);
    }
  }
  for (const [index, actionItem] of actionItems.entries()) {
    if (
      ((index === 0 || index === actionItems.length - 1) && isSeparator(actionItem)) ||
      (index < actionItems.length - 1 && isSeparator(actionItem) && isSeparator(actionItems[index + 1]))
    ) {
      actionItem.style.display = "none";
    }
  }

  let menuTop = parseInt(menu.style.top);
  const menuHeight = menu.clientHeight;
  const titlebarHeight = 40;
  const windowHeight = window.innerHeight;
  if (menuTop < titlebarHeight && menuHeight < 90) {
    mouseY = menuTop;
  } else {
    if (mouseY < windowHeight / 2) {
      menuTop = mouseY;
      if (menuTop + menuHeight > windowHeight) {
        menuTop = windowHeight - menuHeight;
      }
    } else {
      menuTop = mouseY - menuHeight;
      if (menuTop < titlebarHeight) {
        menuTop = titlebarHeight;
      }
    }
    menu.style.top = `${menuTop}px`;
  }
}

const menuStyleId = "menu-style";

function isSeparator(actionItem: HTMLElement) {
  return actionItem.matches(":has(> .separator)");
}

let mouseY = 0;
document.addEventListener("mousedown", (ev) => {
  if (ev.button === 2) {
    mouseY = ev.clientY;
  }
});
