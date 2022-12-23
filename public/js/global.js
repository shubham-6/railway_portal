const BASE_URL = "http://13.115.102.68";
// const BASE_URL = "http://localhost:8080";

async function request({ url, method, body, headers }) {
	const response = await fetch(`${BASE_URL}${url}`, {
		method,
		body: typeof body === "string" ? body : JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	});
	return { response, data: await response.json() };
}

async function redirect({ redirectURL }) {
	if (redirectURL) {
		window.location.href = redirectURL;
	}
}

function getElementByTemplate(templateString) {
	const template = document.createElement("template");
	template.innerHTML = templateString.trim();
	return template.content.firstElementChild;
}

function changeLoaderState(state) {
	return function (selector) {
		let main;
		if (selector) {
			main = document.querySelector(selector);
		} else {
			main = document.getElementById("main");
		}
		let loader = main && main.querySelector("#loader");
		if (loader) {
			loader.style.display = state === "show" ? "flex" : "none";
		} else {
			loader = getElementByTemplate(
				`<div id="loader"><img src="/assets/image/loader.webp" alt='Loading...'></div>`
			);
			loader.style.display = state === "show" ? "flex" : "none";
			main && main.appendChild(loader);
		}
	};
}

const showLoader = changeLoaderState("show");
const hideLoader = changeLoaderState("hide");

window.onload = async function () {};
