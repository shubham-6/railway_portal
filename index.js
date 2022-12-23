const express = require("express");
var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

const {
	authRouters,
	dashboardRouters,
	trafficLightRouters,
	loggerRouters,
} = require("./routes");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function authMiddlewareWrapper(type) {
	return function authMiddleware(req, res, next) {
		if (
			req.headers["hasura_server_common_secret"] ===
			process.env.HASURA_SERVER_COMMON_SECRET
		) {
			// Auth for Hasura Actions
			return next();
		}
		const token = req.cookies.token || req.headers["authorization"];
		try {
			const { employeeId, trafficLightId } = jwt.verify(
				token,
				process.env.JWT_SECRET
			);
			if (!employeeId && !trafficLightId) {
				if (type === "api") {
					res.status(401).send({ message: "Unauthorized User" });
				} else {
					return res.redirect("/");
				}
			} else {
				req.user = {
					...(employeeId && { employeeId }),
					...(trafficLightId && { trafficLightId }),
				};
			}
			next();
		} catch (err) {
			if (
				err instanceof jwt.JsonWebTokenError ||
				err instanceof jwt.TokenExpiredError
			) {
				if (type === "api") {
					res.status(401).send({ message: "Unauthorized User" });
				} else {
					return res.redirect("/");
				}
			}
		}
	};
}

const authMiddleware = authMiddlewareWrapper();
const apiAuthMiddleware = authMiddlewareWrapper("api");

// Index Router
app.get("/", function (req, res) {
	if (req.cookies.token) return res.redirect("/dashboard");
	res.render("login");
});

// View Routers
app.use("/auth", authRouters.router);
app.use("/auth", authMiddleware, authRouters.protectedRoutes);

app.use("/dashboard", dashboardRouters.router);
app.use("/dashboard", authMiddleware, dashboardRouters.protectedRoutes);

// API Routers
const apiRouter = express.Router();
apiRouter.use("/auth", authRouters.apiRouter);
apiRouter.use("/auth", apiAuthMiddleware, authRouters.apiProtectedRoutes);

apiRouter.use("/dashboard", dashboardRouters.apiRouter);
apiRouter.use(
	"/dashboard",
	apiAuthMiddleware,
	dashboardRouters.apiProtectedRoutes
);

apiRouter.use("/traffic-lights", trafficLightRouters.apiRouter);
apiRouter.use(
	"/traffic-lights",
	apiAuthMiddleware,
	trafficLightRouters.apiProtectedRoutes
);

apiRouter.use("/logs", loggerRouters.apiRouter);
apiRouter.use("/logs", apiAuthMiddleware, loggerRouters.apiProtectedRoutes);

app.use("/api", apiRouter);

app.listen(8080, () => {
	console.log("Server is running on port 8080");
});
