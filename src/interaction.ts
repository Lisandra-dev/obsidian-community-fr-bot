import { BaseInteraction, Client } from "discord.js";

import { commandsList } from "./commands";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const interactionEvent: any = (client: Client): void => {
	client.on("interactionCreate", async (interaction: BaseInteraction) => {
		if (interaction.isCommand()) {
			const command = commandsList.find(
				(cmd) => cmd.data.name === interaction.commandName
			);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.log(error);
			}
		}
	}
	);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const joinEvent: any = (client: Client): void => {
	client.on("guildCreate", async (guild) => {
		try {
			for (const command of commandsList) {
				await guild.commands.create(command.data);
				console.log(`Command ${command.data.name} created in ${guild.name}`);
			}
		} catch (error) {
			console.error(error);
		}
	});
};
