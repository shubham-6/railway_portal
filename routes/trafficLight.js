const { Router } = require("express");
const { client } = require("../lib/apollo");
const jwt = require("jsonwebtoken");

const router = Router();
const apiRouter = Router();
const protectedRoutes = Router();
const apiProtectedRoutes = Router();

// Routes
apiProtectedRoutes.get("/", async function (req, res) {
	const { traffic_light: trafficLights } =
		await client.request(`query get_traffic_light {
      traffic_light(order_by: {updated_at: desc_nulls_last}) {
        id
        location
        name
        status
        created_at
        updated_at
      }
    }`);

	res.send({ trafficLights });
});

apiProtectedRoutes.post("/:id", async function (req, res) {
	const { id } = req.params;
	const { status } = req.body;
	console.log("==> ", id, status, typeof id, typeof status);
	if (!["red", "yellow", "green"].includes(status.toLowerCase())) {
		return res.status(400).send({ error: "Invalid status" });
	}

	// Call to hardware to check the status and wait for its response

	const { update_traffic_light_by_pk: trafficLight } = await client.request(
		`mutation update_traffic_light($id: Int!, $status: String!) {
      update_traffic_light_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
        id
        status
        updated_at
      }
    }`,
		{ id: parseInt(id), status: status.toUpperCase() }
	);

	res.send({ trafficLight });
});

apiProtectedRoutes.get("/status", async function (req, res) {
	const { trafficLightId: id } = req.user;

	const { trafficLight } = await client.request(
		`query get_traffic_light_status($id: Int!) {
      trafficLight: traffic_light_by_pk(id: $id) {
        status
		  isOnline
      }
    }
    `,
		{ id: parseInt(id) }
	);

	res.send({ trafficLight });
});

module.exports = { router, protectedRoutes, apiRouter, apiProtectedRoutes };
