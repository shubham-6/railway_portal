document.getElementById("submit").addEventListener("click", async function (e) {
	let employeeId = document.querySelector("input[name='employeeId']").value;
	let password = document.querySelector("input[name='password']").value;

	try {
		const { response, data } = await request({
			url: "/api/auth/login",
			method: "POST",
			body: JSON.stringify({ employeeId, password }),
		});
		if (response.status === 200) {
			redirect(data);
		} else {
			alert("Invalid Credentials");
		}
	} catch (err) {
		alert("Something went wrong");
	}
});
