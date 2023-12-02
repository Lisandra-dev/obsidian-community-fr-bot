import { Client } from "discord.js";
import dotenv from "dotenv";
import process from "process";
import { VERSION } from "src";

dotenv.config({ path: ".env" });

//const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? "0");

export default (client: Client): void => {
	client.on("ready", async () => {
		if (!client.user || !client.application || !process.env.CLIENT_ID) {
			return;
		}

		console.info(`${client.user.username} is online; v.${VERSION}`);
	});
};