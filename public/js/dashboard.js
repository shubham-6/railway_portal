async function getTrafficLights() {
	try {
		const { response, data } = await request({
			url: "/api/traffic-lights",
			method: "GET",
		});
		if (response.status === 200) {
			return data.trafficLights;
		} else {
			return [];
		}
	} catch (err) {
		console.error("[Error in get traffic light]", err);
		return [];
	}
}

async function loadTrafficLight() {
	// showLoader("#traffic-lights");
	const trafficLights = await getTrafficLights();
	let trafficLightsElements = [];
	for (let trafficLight of trafficLights) {
		const trafficLightTemplateString = `
			<div class="traffic-light" id="traffic-light-${trafficLight.id}">
				<p class="heading">${trafficLight.name}</p>
				<p class="location">${trafficLight.location}</p>
				<div class="indigators">
					<div class="light red"><div class="red"></div></div>
					<div class="light yellow"><div class="yellow"></div></div>
					<div class="light green"><div class="green"></div></div>
				</div>
			</div>
		`;
		const trafficLightElement = getElementByTemplate(
			trafficLightTemplateString
		);
		trafficLightElement
			.querySelector(`.light.${trafficLight.status.toLowerCase()}`)
			.classList.add("active");
		trafficLightsElements.push(trafficLightElement);
	}
	const trafficLightContainer = document.getElementById("traffic-lights");

	for (let ele of Array.from(trafficLightContainer.children)) {
		if (ele.classList.contains("traffic-light")) {
			ele.remove();
		}
	}
	for (let trafficLightElement of trafficLightsElements) {
		trafficLightElement.querySelectorAll(".light").forEach((ele) => {
			ele.addEventListener("click", trafficLightClickHandler);
		});
		trafficLightContainer.appendChild(trafficLightElement);
	}
	// hideLoader("#traffic-lights");
}

async function trafficLightClickHandler(e) {
	if (this.classList.contains("active")) return;
	if (this.parentElement.parentElement.attributes["disabled"]) return;
	this.parentElement.parentElement.attributes["disabled"] = true;
	const trafficLightId = parseInt(
		this.parentElement.parentElement.id.split("-")[2]
	);
	const status = this.firstElementChild.classList[0].toUpperCase();

	try {
		const { response, data } = await request({
			url: `/api/traffic-lights/${trafficLightId}`,
			method: "POST",
			body: { status },
		});

		if (response.status === 200) {
			const trafficLight = data.trafficLight;
			const trafficLightElement = document.getElementById(
				`traffic-light-${trafficLight.id}`
			);
			trafficLightElement
				.querySelector(".light.active")
				.classList.remove("active");
			trafficLightElement
				.querySelector(`.light.${trafficLight.status.toLowerCase()}`)
				.classList.add("active");
		} else {
			console.error(
				`[Error in update traffic light][status: ${response.status}]: ${data}`
			);
		}
	} catch (err) {
		console.error("[Error in update traffic light]", err);
	}

	this.parentElement.parentElement.attributes["disabled"] = false;
}

async function getLogs(createdAfter) {
	try {
		const { response, data } = await request({
			url: `/api/logs?${
				createdAfter ? `createdAfter=${encodeURIComponent(createdAfter)}` : ""
			}`,
			method: "GET",
		});
		if (response.status === 200) {
			return data.logs;
		} else {
			return [];
		}
	} catch (err) {
		console.error("[Error in get logs]", err);
		return [];
	}
}

async function loadLogs() {
	const logsContainer = document.getElementById("logs");
	const createdAfter = logsContainer.attributes["lastFetchAt"];
	const logs = await getLogs(createdAfter);
	const logsElements = [];
	for (let log of logs) {
		let createdAt;
		if (
			new Date(log.created_at).toLocaleDateString() ===
			new Date().toLocaleDateString()
		) {
			createdAt = new Date(log.created_at).toLocaleTimeString();
		} else {
			createdAt = new Date(log.created_at).toLocaleString();
		}
		const logTemplateString = `
		<div class="log">
			<div class="log_time">[${createdAt}]</div>
			<div class="log_message">Traffic Light <b>${log.traffic_light.id}</b> of (${log.traffic_light.location}) is not working</div>
		</div>
		`;
		const logElement = getElementByTemplate(logTemplateString);
		logsElements.push(logElement);
	}
	for (let logElement of logsElements) {
		logsContainer.appendChild(logElement);
	}
	if (logs.length > 0) {
		logsContainer.attributes["lastFetchAt"] = logs[logs.length - 1].created_at;
	}
}

async function main() {
	loadTrafficLight();
	loadLogs();
	window.fetchTrafficLightsInterval = setInterval(async () => {
		loadTrafficLight();
	}, 2000);

	window.fetchLogsInterval = setInterval(async () => {
		loadLogs();
	}, 2000);
}

main();
