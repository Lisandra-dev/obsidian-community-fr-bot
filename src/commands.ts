import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	Locale,
	SlashCommandBuilder
} from "discord.js";
import i18next from "i18next";

import { cmdLn, ln } from "./localizations";
import { getPlugin, main } from "./plugins";

const t = i18next.getFixedT("fr");

export const newPlugins = {
	data: new SlashCommandBuilder()
		.setName(t("new"))
		.setNameLocalizations(cmdLn("new"))
		.setDescription(t("newDesc"))
		.setDescriptionLocalizations(cmdLn("newDesc")),
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
		.setName(t("search.title"))
		.setNameLocalizations(cmdLn("search.title"))
		.setDescription(t("search.desc"))
		.setDescriptionLocalizations(cmdLn("search.desc"))
		.addStringOption(option => option
			.setName(t("search.name"))
			.setDescription(t("search.moduleDesc"))
			.setRequired(true)), 
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) {
			return;
		}
		const channel = interaction.channel;
		if (!channel) {
			return;
		}
		const ul = ln(interaction.locale as Locale);
		const options = interaction.options as CommandInteractionOptionResolver;
		const pluginName = options.getString(t("search.name"))?.toLowerCase();
		if (!pluginName) {
			return interaction.reply({content: "Le nom du module n'est pas valide", ephemeral: true});
		}
		const plugin = await getPlugin(pluginName);
		if (!plugin) {
			return interaction.reply({content: ul("notFound"), ephemeral: true});
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