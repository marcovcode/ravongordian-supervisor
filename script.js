if (document.getElementById("ravongordianSupervisorToggle")) {
	const toggle = document.getElementById("ravongordianSupervisorToggle");

	chrome.storage.local.get(
		"ravongordianSupervisorEnabled",
		({ ravongordianSupervisorEnabled = true }) => {
			toggle.textContent = ravongordianSupervisorEnabled
				? "Disable Ravongordian supervisor"
				: "Enable Ravongordian supervisor";
		}
	);

	toggle.addEventListener("click", () => {
		chrome.storage.local.get(
			"ravongordianSupervisorEnabled",
			({ ravongordianSupervisorEnabled = true }) => {
				const newState = !ravongordianSupervisorEnabled;
				chrome.storage.local.set({
					ravongordianSupervisorEnabled: newState,
				});
				toggle.textContent = newState
					? "Disable Ravongordian supervisor"
					: "Enable Ravongordian supervisor";
			}
		);
	});
} else {
	const ravongordianSupervisor = document.createElement("img");
	ravongordianSupervisor.id = "ravongordianSupervisor";
	ravongordianSupervisor.src = chrome.runtime.getURL(
		"assets/ravongordian-supervisor.png"
	);

	const quackSound = new Audio(chrome.runtime.getURL("assets/quack.mp3"));

	ravongordianSupervisor.addEventListener("click", () => {
		quackSound.play();
	});

	document.body.appendChild(ravongordianSupervisor);

	chrome.storage.local.get(
		"ravongordianSupervisorEnabled",
		({ ravongordianSupervisorEnabled = true }) => {
			ravongordianSupervisor.style.display = ravongordianSupervisorEnabled
				? "block"
				: "none";
			if (ravongordianSupervisorEnabled) {
				setInitialPosition();
			}
		}
	);

	chrome.storage.onChanged.addListener((changes, namespace) => {
		if (namespace === "local" && changes.ravongordianSupervisorEnabled) {
			ravongordianSupervisor.style.display = changes
				.ravongordianSupervisorEnabled.newValue
				? "block"
				: "none";
			if (!changes.ravongordianSupervisorEnabled.newValue) {
				clearTimeout(moveTimeout);
			} else {
				moveTimeout = setTimeout(moveRavongordianSupervisor, timer);
			}
		}
	});
}

const speed = 100;
const minDuration = 2;
const timer = 5000;
let moveTimeout;

function setInitialPosition() {
	const startX =
		Math.random() *
		(window.innerWidth - ravongordianSupervisor.clientWidth);
	const startY =
		Math.random() *
		(window.innerHeight - ravongordianSupervisor.clientHeight);

	ravongordianSupervisor.style.left = `${startX}px`;
	ravongordianSupervisor.style.top = `${startY}px`;

	moveTimeout = setTimeout(moveRavongordianSupervisor, timer);
}

function moveRavongordianSupervisor() {
	const maxX = window.innerWidth - ravongordianSupervisor.clientWidth;
	const maxY = window.innerHeight - ravongordianSupervisor.clientHeight;

	let randomX, randomY, duration;
	const currentX =
		parseFloat(getComputedStyle(ravongordianSupervisor).left) || 0;

	do {
		randomX = Math.random() * maxX;
		randomY = Math.random() * maxY;

		const deltaX = randomX - currentX;
		const deltaY =
			randomY -
				parseFloat(getComputedStyle(ravongordianSupervisor).top) || 0;
		const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

		duration = distance / speed;
	} while (duration < minDuration);

	if (randomX < currentX) {
		ravongordianSupervisor.style.transform = "scaleX(-1)";
	} else {
		ravongordianSupervisor.style.transform = "scaleX(1)";
	}

	ravongordianSupervisor.style.transition = `left ${duration}s linear, top ${duration}s linear`;
	ravongordianSupervisor.style.left = `${randomX}px`;
	ravongordianSupervisor.style.top = `${randomY}px`;

	clearTimeout(moveTimeout);
	moveTimeout = setTimeout(
		moveRavongordianSupervisor,
		duration * 1000 + timer
	);
}

setInitialPosition();
