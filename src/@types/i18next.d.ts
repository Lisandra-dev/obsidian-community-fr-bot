import { resources } from "../localizations/init";

declare module "i18next" {
    interface CustomTypeOptions {
        readonly resources: typeof resources["en"];
        readonly returnNull: false
    }
}