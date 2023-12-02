import { Client, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import process from "process";

import { commandsList } from "./commands";
import { VERSION } from "./index";
import { autoNews } from "./plugins";

dotenv.config({ path: ".env" });

const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? "0");

export default (client: Client): void => {
	client.on("ready", async () => {
		if (!client.user || !client.application || !process.env.CLIENT_ID) {
			return;
		}
		console.info(`${client.user.username} is online; v.${VERSION}`);
		const serializedCommands = commandsList.map(command => command.data.toJSON());
		for (const guild of client.guilds.cache.values()) {
			console.log(`Registering commands for ${guild.name}`);
			guild.client.application.commands.cache.forEach((command) => {
				console.log(`Deleting ${command.name}`);
				command.delete();
			});
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
				{ body: serializedCommands },
			);
		}
		await autoNews();

	});
};