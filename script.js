if (document.getElementById("rsToggle")) {
	const toggle = document.getElementById("rsToggle");

	chrome.storage.local.get("rsEnabled", ({ rsEnabled = true }) => {
		toggle.textContent = rsEnabled
			? "Disable Ravongordian supervisor"
			: "Enable Ravongordian supervisor";
	});

	toggle.addEventListener("click", () => {
		chrome.storage.local.get("rsEnabled", ({ rsEnabled = true }) => {
			const newState = !rsEnabled;
			chrome.storage.local.set({
				rsEnabled: newState,
			});
			toggle.textContent = newState
				? "Disable Ravongordian supervisor"
				: "Enable Ravongordian supervisor";
		});
	});
} else {
	const rs = document.createElement("img");
	rs.id = "rs";
	rs.src = chrome.runtime.getURL("assets/ravongordian-supervisor.png");

	const quackSound = new Audio(chrome.runtime.getURL("assets/quack.mp3"));

	rs.addEventListener("click", () => {
		quackSound.play();
	});

	document.body.appendChild(rs);

	chrome.storage.local.get("rsEnabled", ({ rsEnabled = true }) => {
		rs.style.display = rsEnabled ? "block" : "none";
		if (rsEnabled) {
			setInitialPosition();
		}
	});

	chrome.storage.onChanged.addListener((changes, namespace) => {
		if (namespace === "local" && changes.rsEnabled) {
			rs.style.display = changes.rsEnabled.newValue ? "block" : "none";
			if (!changes.rsEnabled.newValue) {
				clearTimeout(moveTimeout);
			} else {
				moveTimeout = setTimeout(moveRs, timer);
			}
		}
	});
}

const speed = 100;
const minDuration = 2;
const timer = 5000;
let moveTimeout;

function setInitialPosition() {
	const startX = Math.random() * (window.innerWidth - rs.clientWidth);
	const startY = Math.random() * (window.innerHeight - rs.clientHeight);

	rs.style.left = `${startX}px`;
	rs.style.top = `${startY}px`;

	moveTimeout = setTimeout(moveRs, timer);
}

function moveRs() {
	const maxX = window.innerWidth - rs.clientWidth;
	const maxY = window.innerHeight - rs.clientHeight;

	let randomX, randomY, duration;
	const currentX = parseFloat(getComputedStyle(rs).left) || 0;

	do {
		randomX = Math.random() * maxX;
		randomY = Math.random() * maxY;

		const deltaX = randomX - currentX;
		const deltaY = randomY - parseFloat(getComputedStyle(rs).top) || 0;
		const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

		duration = distance / speed;
	} while (duration < minDuration);

	if (randomX < currentX) {
		rs.style.transform = "scaleX(-1)";
	} else {
		rs.style.transform = "scaleX(1)";
	}

	rs.style.transition = `left ${duration}s linear, top ${duration}s linear`;
	rs.style.left = `${randomX}px`;
	rs.style.top = `${randomY}px`;

	clearTimeout(moveTimeout);
	moveTimeout = setTimeout(moveRs, duration * 1000 + timer);
}

setInitialPosition();
