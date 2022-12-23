const { Router } = require("express");
const { client } = require("../lib/apollo");
const jwt = require("jsonwebtoken");

const router = Router();
const apiRouter = Router();
const protectedRoutes = Router();
const apiProtectedRoutes = Router();

// Routes
apiProtectedRoutes.put("/status", async function (req, res) {
	// Hardware will call this api to update its status in DB
	const { status, isOnline } = req.body;
	const { trafficLightId } = req.user;
	if (status && !["red", "yellow", "green"].includes(status.toLowerCase())) {
		return res.status(400).send({ error: "Invalid status" });
	}

	const object = {
		traffic_light_id: parseInt(trafficLightId),
		payload: req.body,
		ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
	};

	try {
		const { status_change_log, update_response } = await client.request(
			`mutation insert_log($object: traffic_light_status_change_logs_insert_input!, $_set: traffic_light_set_input = {}, $id: Int!) {
         status_change_log: insert_traffic_light_status_change_logs_one(object: $object){
            id
         }
         update_traffic_light_by_pk(pk_columns: {id: $id}, _set: $_set) {
				id
				isOnline
				status
			}
      }`,
			{
				object: object,
				id: parseInt(trafficLightId),
				_set: {
					...(isOnline !== undefined && { isOnline }),
					...(status && { status }),
				},
			}
		);
	} catch (err) {
		console.log("[Error in inserting status change log]", err);
		return res.status(500).send({ success: false });
	}

	res.send({ success: true });
});

apiProtectedRoutes.get("/", async function (req, res) {
	let { createdAfter } = req.query;
	try {
		createdAfter = createdAfter ? new Date(createdAfter) : null;
		if (createdAfter) createdAfter.setSeconds(createdAfter.getSeconds() + 1);
	} catch (err) {
		return res.send({ error: "Invalid date format" });
	}
	const { logs } = await client.request(
		`query get_status_change_logs($where: traffic_light_status_change_logs_bool_exp = {}) {
         logs: traffic_light_status_change_logs(where: $where, order_by: {created_at: asc}) {
           id
           ip
           payload
			  created_at
           traffic_light {
             name
             location
             id
           }
         }
       }`,
		{
			where: {
				payload: { _contains: { isOnline: false } },
				...(createdAfter && {
					created_at: { _gt: createdAfter.toUTCString() },
				}),
			},
		}
	);

	return res.send({ logs });
});

module.exports = { router, protectedRoutes, apiRouter, apiProtectedRoutes };
