import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	SlashCommandBuilder
} from "discord.js";

import { getPlugin, main } from "./plugins";

export const newPlugins = {
	data: new SlashCommandBuilder()
		.setName("nouveaux")
		.setDescription("Envoie un message avec les nouveaux modules"),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) {
			return;
		}
		const channel = interaction.channel;
		if (!channel) {
			return;
		}
		//defer
		await interaction.deferReply();
		await main(channel, interaction);
	},

};

export const getPlugins = {
	data : new SlashCommandBuilder()
		.setName("rechercher")
		.setDescription("Permet d'obtenir les informations à propos d'un module")
		.addStringOption(option => option.setName("module").setDescription("Nom du module").setRequired(true)), //je pourrais faire la liste des plugins, mais avec 1200 plugins, ça risque de faire beaucoup à afficher, autant faire une simple recherche
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) {
			return;
		}
		const channel = interaction.channel;
		if (!channel) {
			return;
		}
		const options = interaction.options as CommandInteractionOptionResolver;
		const pluginName = options.getString("module")?.toLowerCase();
		if (!pluginName) {
			return interaction.reply({content: "Le nom du module n'est pas valide", ephemeral: true});
		}
		const plugin = await getPlugin(pluginName);
		if (!plugin) {
			return interaction.reply({content: "Le module n'a pas été trouvé", ephemeral: true});
		}
		if (Array.isArray(plugin)) {
			//send each 10 to 10 embeds
			for (let i = 0; i < plugin.length; i += 10) {
				await interaction.reply({embeds: plugin.slice(i, i + 10)});
			}
		} else {
			return interaction.reply({embeds: [plugin]});
		}
	}
};

export const commandsList = [newPlugins, getPlugins];