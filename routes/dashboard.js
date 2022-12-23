const { Router } = require("express");
const { client } = require("../lib/apollo");
const jwt = require("jsonwebtoken");

const router = Router();
const apiRouter = Router();
const protectedRoutes = Router();
const apiProtectedRoutes = Router();

// Routes

protectedRoutes.get("/", function (req, res) {
	res.render("dashboard", { user: req.user });
});

module.exports = { router, protectedRoutes, apiRouter, apiProtectedRoutes };
