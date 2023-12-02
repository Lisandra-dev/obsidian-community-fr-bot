import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	SlashCommandBuilder
} from "discord.js";

import { getPlugin, main } from "./plugins";

export const newPlugins = {
	data: new SlashCommandBuilder()
		.setName("Nouveaux modules")
		.setDescription("Envoie un message avec les nouveaux modules"),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) {
			return;
		}
		const channel = interaction.channel;
		if (!channel) {
			return;
		}
		await main(channel);

	},

};

export const getPlugins = {
	data : new SlashCommandBuilder()
		.setName("obtenir")
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
		const pluginName = options.getString("module");
		if (!pluginName) {
			return interaction.reply({content: "Le nom du module n'est pas valide", ephemeral: true});
		}
		const plugin = await getPlugin(pluginName);
		if (!plugin) {
			return interaction.reply({content: "Le module n'a pas été trouvé", ephemeral: true});
		}
		await interaction.reply({embeds: [plugin]});
	}
};