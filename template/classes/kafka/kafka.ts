"use strict";

import { Modules, ModelModules } from "../../modules/modules";


const { Kafka, logLevel } = require("kafkajs");
const uuid = require("uuid/v4");

export class KafkaDriver {
	private static _instance: KafkaDriver;
	private cli: any;
	private clientId: string;
	private brokers: string[];
	private topics: string[];
	private consumer: any;
	private producer: any;
	public groupId: string;
	private cc: ModelModules;
	private molecular_broker: any;
	private service: string;



	constructor() {
		this.groupId = process.env.APP_NAME +'-'+ process.env.POSTE_ID || `service-$service-name$-${process.env.POST_ID}`;
		this.clientId = `${this.groupId}-${process.env.POST_ID}-${uuid()}`;
		this.service = '$service-name$'


		try {
			this.brokers = process.env.KAFKA_URI.split(",");
			this.topics = process.env.KAFKA_TOPICS.split(",");
		} catch (error) {
			this.brokers = ["localhost:9092"];
			this.topics = ["update_channel"];
		}


		/**Definition du client Kafka */
		this.cli = new Kafka({
			clientId: this.clientId,
			brokers: this.brokers,
			logLevel: logLevel.ERROR
		});

		/**Definition du producer Kafka */
		this.producer = this.cli.producer();
		/**Definition du consumer Kafka */
		this.consumer = this.cli.consumer({
			groupId: this.groupId
		});
	}





	public static getInstance(): KafkaDriver {
		return this._instance || (this._instance = new this());
	}

	/**Récupère le broker molécular pour éffectuer les appels sur les services */
	public push_broker(molecular_broker: any) {
		this.molecular_broker = molecular_broker
	}


	public async connexion() {
		this.cc = Modules.get()

		await this.consumer.connect();
		await this.producer.connect();

		/**Abonnement aux topics */
		this.topics.map(async y => await this.consumer.subscribe({ topic: y }));
		this.receive();
	}

	public async deconnexion() {
		await this.consumer.disconnect();
		await this.producer.disconnect();
	}

	public async send(action: string, ctx: any) {
		let message = {
			/** Header du message */
			headers: {
				groupId: this.groupId,
				clientId: this.clientId,
				service: this.service,
				sender: ctx.service.name,
				crud_action: action
			},
			/** Les data du message */
			data: ctx.params
		}

		await this.producer.send({
			topic: "update_channel",
			messages: [
				{
					value: Buffer.from(JSON.stringify(message))
				}
			]
		});
	}


	public receive() {
		this.consumer
			.run({

				/**Lecture de tous les messages du/des topics abonnées */
				eachMessage: async ({ topic, partition, message }: any) => {
					let mess = JSON.parse(message.value.toString())

					/**Filtre les message consernant les $service-name$s et ne venant pas de ce groupe de service */
					if (mess.headers.groupId != this.groupId && mess.headers.service == this.service) {

						this.molecular_broker.logger.info(
							`Demande de modification de ${mess.headers.kind} venant d'une autre caisse :
							Topic : ${topic}
							Type de donnée : ${mess.headers.kind}
							Action effectuée : ${mess.headers.crud_action}
							Provient du client : ${mess.headers.clientId}
							Le client provient du groupe : ${mess.headers.groupId}
							Provient du service : ${mess.headers.sender}
							Data : ${mess.data}`);

						/**CRUD Routes */
						switch (mess.headers.crud_action) {
							case "CREATE":
								this.molecular_broker.call(`${mess.headers.sender}.create`, mess.data)
								break;
							case "UPDATE":
								break;
							case "DELETE":
								break;
							default:
								break;
						}
					}
				}
			});
	}
}
