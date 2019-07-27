"use strict";

import { Modules } from "../modules/modules";
Modules.init()


import { ServiceSchema } from "moleculer";
import ApiGateway = require("moleculer-web");


const ApiService: ServiceSchema = {
	name: "api",

	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/api",
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"$service-name$.list",
				"$service-name$.get",
				"$service-name$.create",
				"$service-name$.update",
				"$service-name$.remove"

			],
			aliases: {
				// "REST $service-name$": "$service-name$",
				"GET $service-name$": "$service-name$.list",
                "GET $service-name$/:id": "$service-name$.get",
                "POST $service-name$": "$service-name$.create",
                "PUT $service-name$/:id": "$service-name$.update",
				"DELETE $service-name$/:id": "$service-name$.remove"

			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public",
		},


		cors: {
			origin: "*",
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			allowedHeaders: "*",
			//exposedHeaders: "*",
			credentials: true,
			maxAge: null
		},
		
	},
};

export = ApiService;
