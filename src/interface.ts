export interface ObsidianPlugin {
	id: string;
	name: string;
	author: string;
	description: string;
	repo: string;
}

export const DEFAULT_PLUGIN: ObsidianPlugin = {
	id: "default-test",
	name: "Doesn't exists",
	description: "This plugin doesn't exists. if you see this, please report it to the developer",
	repo: "not-found/not-found",
	author: "not-found",
};
