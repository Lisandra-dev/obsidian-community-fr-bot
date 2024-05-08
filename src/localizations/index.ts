import { BaseInteraction, Locale, LocalizationMap } from "discord.js";
import {default as i18next} from "i18next";

import { resources } from "./init";


export function ln(userLang: Locale) {
	const localeName = Object.entries(Locale).find(([name, abbr],) => {
		return name === userLang || abbr === userLang;
	});
	return i18next.getFixedT(localeName?.[1] ?? "en");
}

export function lError(error: Error, interaction?: BaseInteraction, userLang?: Locale) {
	let errorMessage = error.message;
	let errors: string[] = [];
	//check if errorMessage is a list
	const errorList = /\[(.*)\]/gi.exec(errorMessage);
	if (errorList) {
		errors = errorList?.[1].split(",");
		errorMessage = errorMessage.replace(/\[(.*)\]/, "");
	}
	//get key from translation
	const ul = ln(interaction?.locale ?? userLang ?? Locale.EnglishUS);
	let msgError = "";
	for (const error of errors) {
		// @ts-ignore
		msgError += ul(error.trim());
	}
	
	errorMessage = errorMessage.trim().length > 0 ? `\`\`\`\n${errorMessage}\n\`\`\`` : "";
	return `${msgError}\n${errorMessage}`;

}

/**
 * Create an object with all the translations for a specific key
 * @example
 * ```ts
 * cmdLn("hello"):
 * {
 * 	"en": "Hello",
 * 	"fr": "Bonjour"
 * }
 * ```
 * @param key i18n key
 * @returns 
 */
export function cmdLn(key: string) {
	const localized: LocalizationMap = {};
	const allValidLocale = Object.entries(Locale);
	const allTranslatedLanguages = Object.keys(resources).filter((lang) => !lang.includes("en"));
	for (const [name, locale] of allValidLocale) {
		if (allTranslatedLanguages.includes(locale)) {
			const ul = ln(name as Locale);
			// @ts-ignore
			localized[locale as Locale] = ul(key);
		}
	}
	return localized;
}