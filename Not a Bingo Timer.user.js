// ==UserScript==
// @name         Not a Bingo Timer
// @namespace    http://tampermonkey.net/
// @version      2026-07-20
// @updateURL    https://raw.githubusercontent.com/Dzverry/Not-a-Bingo-Timer/refs/heads/main/Not%20a%20Bingo%20Timer.meta.js
// @downloadURL  https://raw.githubusercontent.com/Dzverry/Not-a-Bingo-Timer/refs/heads/main/Not%20a%20Bingo%20Timer.user.js
// @description  I mean, it's a timer... I wonder what it could do?? 🤔
// @author       Dzverry
// @match        https://bingopp-com-flash.bfcdl.com/bingo/web/*/app/chat_moderator/index.html
// @match        https://www.zebrabingo.com/bingo/
// @match        https://www.jazzycat.com/bingo/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bingo.paddypower.com
// @grant        none
// ==/UserScript==

(() => {
    function waitForElement(selector) {
        return new Promise(resolve => {
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
                return;
            }

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        });
    }

    (async () => {
        const root = await waitForElement(
            '#bingo-chat-moderator-panel > [class^="bingo-wrapper"] > [class^="chat-moderator"] > [class^="chat-column"]'
        );

        // =========================================================
		const CONTAINER_SELECTOR = '.chat-column__view.chat-column__view--full.flex.flex-col';
		const TEXTAREA_SELECTOR = 'textarea[name="send-message"]';
		const BUTTON_SELECTOR = '.send-message-button';

		const timers = new WeakMap();

		function format(seconds) {
			const m = Math.floor(seconds / 60);
			const s = seconds % 60;
			return `${m}:${String(s).padStart(2, '0')}`;
		}

		function resetTimer(container) {
			const timer = timers.get(container);
			if (!timer) return;
			timer.seconds = 0;
			timer.el.textContent = format(0);
		}

		function attach(container) {
			if (timers.has(container)) return;

			if (getComputedStyle(container).position === "static") {
				container.style.position = "relative";
			}

			const el = document.createElement("div");
			el.textContent = "0:00";

			Object.assign(el.style, {
				position: "absolute",
				left: "-22px",
				top: "50%",
				transform: "translateY(-50%)",
				fontSize: "14px",
				fontFamily: "monospace",
				color: "#000",
				background: "rgba(255,255,255,0.9)",
				padding: "0px 5px",
				borderRadius: "3px",
				border: "1px solid #ccc",
				zIndex: 9999,
				userSelect: "none",
				pointerEvents: "none"
			});

			container.appendChild(el);

			const timer = {
				el,
				seconds: 0,
				interval: setInterval(() => {
					timer.seconds++;
					el.textContent = format(timer.seconds);
				}, 1000)
			};

			timers.set(container, timer);

			document.addEventListener("keydown", e => {
				if (e.key !== "Enter") return;

				const textarea = e.target.closest(TEXTAREA_SELECTOR);
				if (!textarea) return;

				const container = textarea.closest(CONTAINER_SELECTOR);
				if (container) {
					resetTimer(container);
				}
			}, true);

			document.addEventListener("click", e => {
				const button = e.target.closest(BUTTON_SELECTOR);
				if (!button) return;

				const container = button.closest(CONTAINER_SELECTOR);
				if (container) {
					resetTimer(container);
				}
			}, true);
		}

		function detach(container) {
			const timer = timers.get(container);
			if (!timer) return;

			clearInterval(timer.interval);
			timer.el.remove();
			timers.delete(container);
		}

		function scan() {
			document.querySelectorAll(CONTAINER_SELECTOR).forEach(attach);

			const existing = new Set(document.querySelectorAll(CONTAINER_SELECTOR));

			document.querySelectorAll(CONTAINER_SELECTOR).forEach(container => {
				if (!existing.has(container)) {
					detach(container);
				}
			});
		}

		scan();

		const observer = new MutationObserver(() => {
			document.querySelectorAll(CONTAINER_SELECTOR).forEach(attach);

			for (const [container, timer] of (() => {
				const arr = [];
				document.querySelectorAll(CONTAINER_SELECTOR);
				return {
					[Symbol.iterator]: function* () {
						document.querySelectorAll(CONTAINER_SELECTOR);
						const all = Array.from(document.querySelectorAll(CONTAINER_SELECTOR));
						timers.forEach?.(() => {});
					}
				};
			})()) {}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		const removalObserver = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				mutation.removedNodes.forEach(node => {
					if (!(node instanceof Element)) return;

					if (node.matches?.(CONTAINER_SELECTOR)) {
						detach(node);
					}

					node.querySelectorAll?.(CONTAINER_SELECTOR).forEach(detach);
				});

				mutation.addedNodes.forEach(node => {
					if (!(node instanceof Element)) return;

					if (node.matches?.(CONTAINER_SELECTOR)) {
						attach(node);
					}

					node.querySelectorAll?.(CONTAINER_SELECTOR).forEach(attach);
				});
			}
		});

		removalObserver.observe(document.body, {
			childList: true,
			subtree: true
		});
        // =========================================================

    })();
})();