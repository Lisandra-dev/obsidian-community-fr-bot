import { Channel, EmbedBuilder, TextBasedChannel } from "discord.js";
import * as fs from "fs";
import { client } from "src";

import { ObsidianPlugin } from "./interface";

async function fetchPluginsFromGitHub() {
	const url = "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
	const response = await fetch(url);
	const data = await response.json();
	return data as ObsidianPlugin[];

}

async function getOldPlugins() {
	const filePath = fs.realpathSync("../plugins.ts");
	if (!fs.existsSync(filePath)) {
		return await fetchPluginsFromGitHub();
	} else {
		const file = fs.readFileSync(filePath, "utf-8");
		//read json
		const json = JSON.parse(file);
		return json as ObsidianPlugin[];
	}
}

function findNewPlugins(oldPlugins: ObsidianPlugin[], newPlugins: ObsidianPlugin[]) {
	const newPluginsArray: ObsidianPlugin[] = [];
	for (const newPlugin of newPlugins) {
		const oldPlugin = oldPlugins.find((oldPlugin) => oldPlugin.id === newPlugin.id);
		if (!oldPlugin) {
			newPluginsArray.push(newPlugin);
		}
	}
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

export async function main(channel: string | TextBasedChannel) {
	const oldPlugins = await getOldPlugins();
	const newPlugins = await fetchPluginsFromGitHub();
	const newPluginsArray = findNewPlugins(oldPlugins, newPlugins);
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
		channelText.send("No new plugins");
	}
	const embeds = [];
	//note : limits of the api for sending embed in a single message : 10
	for (const newPlugin of newPluginsArray) {
		embeds.push(createDiscordEmbed(newPlugin));
	}
	//send each 10 to 10 embeds
	for (let i = 0; i < embeds.length; i += 10) {
		channelText.send({ embeds: embeds.slice(i, i + 10) });
	}
	return;
}

export async function getPlugin(plugin: string) {
	const plugins = await fetchPluginsFromGitHub();
	const pluginFound = plugins.find((pluginFound) => pluginFound.id === plugin || pluginFound.name == plugin || pluginFound.repo.includes(plugin) || pluginFound.author === plugin);
	if (!pluginFound) {
		return null;
	}

	const pluginRepoAuthor = pluginFound.repo.split("/")[0];
	return new EmbedBuilder()
		.setColor("#68228a")
		.setTitle(`Plugin found: ${pluginFound.name}`)
		.setURL(`https://github.com/${pluginFound.repo}`)
		.setDescription(pluginFound.description)
		.setFooter({
			text: `Created by ${pluginFound.author}`,
			iconURL: `https://github.com/${pluginRepoAuthor}.png?size=32`,
		})
		.setFields([
			{
				name: "View in Obsidian",
				value: `https://obsidian.md/plugins?id=${pluginFound.id}`,
			},
		]);
}
