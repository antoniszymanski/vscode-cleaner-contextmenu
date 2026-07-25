// SPDX-FileCopyrightText: 2026 Antoni Szymański
// SPDX-License-Identifier: MPL-2.0

import menuStyle from "./style.css"

// oxlint-disable-next-line typescript/unbound-method
const attachShadow = Element.prototype.attachShadow
Element.prototype.attachShadow = function () {
	const shadowRoot = attachShadow.call(this, { mode: "open" })
	observeRoot(shadowRoot)
	return shadowRoot
}

// new MutationObserver(mutations => {
// 	for (const mutation of mutations) {
// 		for (const node of mutation.addedNodes) {
// 			if (node instanceof Element && node.shadowRoot) {
// 				observeRoot(node.shadowRoot)
// 			}
// 		}
// 	}
// }).observe(document.body, { childList: true, subtree: true })

const observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		for (const node of mutation.addedNodes) {
			processNode(node)
		}
	}
})
function observeRoot(root: ShadowRoot) {
	observer.observe(root, { childList: true, subtree: true })
}

function processNode(node: Node) {
	if (
		!(node instanceof HTMLElement) || //
		!node.matches(":host > .monaco-menu-container > .monaco-scrollable-element")
	) {
		return
	}
	const menu = node.parentElement
	if (!menu) {
		return
	}
	const actions = node.querySelector(":scope > .monaco-menu > .monaco-action-bar > .actions-container")
	if (!actions) {
		return
	}

	const menuStyleId = "menu-style"
	if (!menu.matches(`:has(> style#${menuStyleId})`)) {
		const style = document.createElement("style")
		style.id = menuStyleId
		style.textContent = menuStyle
		menu.appendChild(style)
	}

	const actionItems = []
	for (let child = actions.firstElementChild; child; child = child.nextElementSibling) {
		if (child instanceof HTMLElement && child.checkVisibility()) {
			actionItems.push(child)
		}
	}
	const isSeparator = (actionItem: HTMLElement) => actionItem.matches(":has(> .separator)")
	for (const [index, actionItem] of actionItems.entries()) {
		const nextItem = actionItems[index + 1]
		if (
			((index === 0 || index === actionItems.length - 1) && isSeparator(actionItem)) ||
			(nextItem && isSeparator(actionItem) && isSeparator(nextItem))
		) {
			actionItem.style.display = "none"
		}
	}

	let menuTop = menu.offsetTop
	const menuHeight = menu.clientHeight
	const titlebarHeight = 40
	const windowHeight = window.innerHeight
	if (menuTop < titlebarHeight && menuHeight < 90) {
		mouseY = menuTop
	} else {
		if (mouseY < windowHeight / 2) {
			menuTop = mouseY
			if (menuTop + menuHeight > windowHeight) {
				menuTop = windowHeight - menuHeight
			}
		} else {
			menuTop = mouseY - menuHeight
			if (menuTop < titlebarHeight) {
				menuTop = titlebarHeight
			}
		}
		menu.style.top = `${menuTop}px`
	}
}

let mouseY = 0
document.addEventListener("mousedown", ev => {
	if (ev.button === 2 /* right button */) {
		mouseY = ev.clientY
	}
})
