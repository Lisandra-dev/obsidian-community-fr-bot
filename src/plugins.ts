import { CronJob } from "cron";
import { Channel, CommandInteraction, EmbedBuilder, TextBasedChannel } from "discord.js";
import * as fs from "fs";

import { CHANNEL_ID, client, prod } from "./index";
import { DEFAULT_PLUGIN, ObsidianPlugin } from "./interface";

async function fetchPluginsFromGitHub() {
	const url = "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
	const response = await fetch(url);
	const data = await response.json();
	if (!prod) {
		//add a fake plugin
		data.push(DEFAULT_PLUGIN);
	}
	return data as ObsidianPlugin[];
}

async function createPluginList(newPlugins: ObsidianPlugin[] = []) {
	const plugins: ObsidianPlugin[] = newPlugins.length === 0 ? await fetchPluginsFromGitHub() : newPlugins;
	if (!prod) {
		//remove the fake plugin
		plugins.pop();
	}
	const pluginJSON = JSON.stringify(plugins, null, 2);
	fs.writeFileSync("plugins.json", pluginJSON, "utf-8");
	console.log("Plugins list updated");
	return;
}

async function getOldPlugins() {
	const filePath = "plugins.json";
	if (fs.existsSync(filePath)) {
		const file = fs.readFileSync(filePath, "utf-8");
		//read json
		const json = JSON.parse(file);
		return json as ObsidianPlugin[];
	}
	return await fetchPluginsFromGitHub();
}

async function findNewPlugins(oldPlugins: ObsidianPlugin[], newPlugins: ObsidianPlugin[]) {
	const newPluginsArray: ObsidianPlugin[] = [];
	for (const newPlugin of newPlugins) {
		const oldPlugin = oldPlugins.find((oldPlugin) => oldPlugin.id === newPlugin.id);
		if (!oldPlugin) {
			newPluginsArray.push(newPlugin);
		}
	}
	await createPluginList(newPlugins);
	return newPluginsArray;
}

function createDiscordEmbed(newPlugin: ObsidianPlugin) {
	const pluginRepoAuthor = newPlugin.repo.split("/")[0];
	return new EmbedBuilder()
		.setColor("#68228a")
		.setTitle(`Approved plugin: ${newPlugin.name}`)
		.setURL(`https://github.com/${newPlugin.repo}`)
		.setDescription(newPlugin.description)
		.setFooter({
			text: `Created by ${newPlugin.author}`,
			iconURL: `https://github.com/${pluginRepoAuthor}.png?size=32`,
		})
		.setFields([
			{
				name: "View in Obsidian",
				value: `https://obsidian.md/plugins?id=${newPlugin.id}`,
			},
		]);
}

export async function main(channel: string | TextBasedChannel, interaction: CommandInteraction | null = null) {
	const oldPlugins = await getOldPlugins();
	const newPlugins = await fetchPluginsFromGitHub();
	const newPluginsArray = await findNewPlugins(oldPlugins, newPlugins);
	let channelText: TextBasedChannel | null | Channel = null;
	if (typeof channel === "string") {
		channelText = await client.channels.fetch(channel);
		if (!channelText?.isTextBased()) {
			console.error("Channel not found");
			return;
		}
	} else {
		channelText = channel;
	}
	if (!channelText) {
		console.error("Channel not found");
		return;
	}
	if (newPluginsArray.length === 0) {
		//send message to channel
		if (interaction) {
			await interaction.editReply("Aucun nouveau plugin trouvé");
		}
		else channelText.send("Aucun nouveau plugin trouvé");
	}
	const embeds = [];
	//note : limits of the api for sending embed in a single message : 10
	for (const newPlugin of newPluginsArray) {
		embeds.push(createDiscordEmbed(newPlugin));
	}
	//send each 10 to 10 embeds
	for (let i = 0; i < embeds.length; i += 10) {
		if (interaction) {
			await interaction.editReply({embeds: embeds.slice(i, i + 10)});
		} else {
			await channelText.send({embeds: embeds.slice(i, i + 10)});
		}
	}
	return;
}

export async function getPlugin(plugin: string) {
	const plugins = await fetchPluginsFromGitHub();
	const pluginFound = plugins.filter((pluginFound) => pluginFound.id === plugin || pluginFound.name == plugin || pluginFound.repo.includes(plugin) || pluginFound.author === plugin);
	if (!pluginFound) {
		return null;
	}
	if (pluginFound.length === 1) {
		const found = pluginFound[0];
		const pluginRepoAuthor = found.repo.split("/")[0];
		return new EmbedBuilder()
			.setColor("#68228a")
			.setTitle(`Plugin found: ${found.name}`)
			.setURL(`https://github.com/${found.repo}`)
			.setDescription(found.description)
			.setFooter({
				text: `Created by ${found.author}`,
				iconURL: `https://github.com/${pluginRepoAuthor}.png?size=32`,
			})
			.setFields([
				{
					name: "View in Obsidian",
					value: `https://obsidian.md/plugins?id=${found.id}`,
				},
			]);
	}
	const embeds = [];
	for (const found of pluginFound) {
		const pluginRepoAuthor = found.repo.split("/")[0];
		embeds.push(new EmbedBuilder()
			.setColor("#68228a")
			.setTitle(`Plugin found: ${found.name}`)
			.setURL(`https://github.com/${found.repo}`)
			.setDescription(found.description)
			.setFooter({
				text: `Created by ${found.author}`,
				iconURL: `https://github.com/${pluginRepoAuthor}.png?size=32`,
			})
			.setFields([
				{
					name: "View in Obsidian",
					value: `https://obsidian.md/plugins?id=${found.id}`,
				},
			])
		);
	}
	return embeds;
}

export async function autoNews() {
	const channelID = CHANNEL_ID;
	if (!channelID || channelID.trim().length===0) {
		return;
	}
	new CronJob(
		"0 * * * *",
		async () => {
			await main(channelID);
		},
		null,
		true,
		"Europe/Paris"
	);
}