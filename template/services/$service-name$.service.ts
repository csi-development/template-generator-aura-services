"use strict";

import { ServiceSchema, Errors } from "moleculer";
import { Modules, ModelModules } from "../modules/modules";


const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");



const articleservice: ServiceSchema = {
	/**
	 * Name of service
	 */
	name: "$service-name$",
	mixins: [DbService],

	/**
	 * Mongo settings
	 */
	adapter: new MongoAdapter(process.env.MONGO_URI, { useNewUrlParser: true }),
	collection: "$service-name$",

	/**
	 * Actions
	 */
	actions: {
		create: {
			params: {

			}
		},

		// Heartbeat for kubernetes
		health() {
			return true;
		},


	},




	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		/** Récuperation des autres classes dans le CallClass */
		this.cc = Modules.get()
	},

	/**
	 * Service stoped lifecycle event handler
	 */
	async stopped() {},

	
	entityCreated(json: {}, ctx: any) {
		let object = {
			header:{
				action: "CREATE"
			},
			data: json
		}
		// ctx.call('famArticles.update_propagation', object);
	},

	entityUpdated(json: {}, ctx: any) {
		let object = {
			header:{
				action: "UPDATE"
			},
			data: json
		}
		// ctx.call('famArticles.update_propagation', object);
	},

	entityRemoved(json: {}, ctx: any) {
	}
};

export = articleservice;
