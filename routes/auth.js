const { Router } = require("express");
const { client } = require("../lib/apollo");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const router = Router();
const apiRouter = Router();
const protectedRoutes = Router();
const apiProtectedRoutes = Router();

// Routes
apiRouter.post("/login", async function (req, res) {
	const { employeeId, password } = req.body;

	const { employee_by_pk: employee } = await client.request(
		`query employee_one($id: Int!) {
            employee_by_pk(id: $id) {
            password
            }
         }`,
		{ id: parseInt(employeeId) }
	);

	console.log("employees:", employee);
	if (!employee || password !== employee.password) {
		return res
			.status(401)
			.send({ success: false, message: "Invalid Credentials" });
	}

	const token = jwt.sign({ employeeId }, process.env.JWT_SECRET);

	res.cookie("token", token, {
		httpOnly: true,
	});

	res.send({ success: true, redirectURL: "/dashboard" });
});

router.get("/logout", function (req, res) {
	res.clearCookie("token");
	res.redirect("/auth/login");
});

apiProtectedRoutes.post("/getToken", async function (req, res) {
	const { id } = req.body.input;

	const token = jwt.sign(
		{ trafficLightId: parseInt(id), timestamp: Date.now() },
		process.env.JWT_SECRET
	);

	res.send({ success: true, token });
});

module.exports = { router, protectedRoutes, apiRouter, apiProtectedRoutes };
