import { TSMigrationGenerator } from "@mikro-orm/migrations";
import { resolveConfig } from "prettier";

import { maybePretty } from "./maybePretty";

export class MemoryMigrationGenerator extends TSMigrationGenerator {
    override async generate(
        diff: { up: string[]; down: string[] },
        path?: string | undefined
    ): Promise<[string, string]> {
        const prettierConfig = await resolveConfig("./");

        const timestamp = new Date().toISOString().replace(/[:t-]|\.\d{3}z$/gi, "");
        const className = this.namingStrategy.classToMigrationName(timestamp);
        const fileName = `${this.options.fileName!(timestamp)}.${this.options.emit}`;
        const ret = this.generateMigrationFile(className, diff);

        return [maybePretty(ret, prettierConfig), fileName];
    }
}
