const { GraphQLClient } = require("graphql-request");

require("dotenv").config();

const client = new GraphQLClient(process.env.HASURA_URL, {
	headers: {
		"x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
	},
});

module.exports = { client };
