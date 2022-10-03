import { Utils } from "@mikro-orm/core";
import { TSMigrationGenerator } from "@mikro-orm/migrations";
import { ensureDir, writeFile } from "fs-extra";
import { type Options, resolveConfig } from "prettier";

import { maybePretty } from "./maybePretty";
import { MemoryMigrationGenerator } from "./MemoryMigrationGenerator";

export class KikkoInMemoryMigrationGenerator extends MemoryMigrationGenerator {
    override generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
        return generateMigrationFile(className, diff);
    }
}

/** Generates 2 migrations file: 1) the original MikroORM, 2) the RawArrayMigration file (for @kikko-land/migrations-plugin) */
export class KikkoAndOriginalMigrationGenerator extends TSMigrationGenerator {
    prettierConfig: Options | null = null;

    override async generate(
        diff: { up: string[]; down: string[] },
        path?: string | undefined
    ): Promise<[string, string]> {
        this.prettierConfig = await resolveConfig("./");

        // taken/adapted from https://github.dev/mikro-orm/mikro-orm/blob/15de5b8a5153a18807a07c3cd72767db20f483b3/packages/migrations/src/MigrationGenerator.ts#L35
        const defaultPath =
            this.options.emit === "ts" && this.options.pathTs ? this.options.pathTs : this.options.path!;
        path = Utils.normalizePath(this.driver.config.get("baseDir"), path ?? defaultPath);
        const kikkoMigrationPath = Utils.normalizePath(path, "../migrations-kikko");

        await Promise.all([ensureDir(path), ensureDir(kikkoMigrationPath)]);
        const timestamp = new Date().toISOString().replace(/[:t-]|\.\d{3}z$/gi, "");
        const className = this.namingStrategy.classToMigrationName(timestamp);
        const fileName = `${this.options.fileName!(timestamp)}.${this.options.emit}`;
        const ret = this.generateMigrationFile(className, diff);

        await Promise.all([
            writeFile(path + "/" + fileName, ret),
            writeFile(
                kikkoMigrationPath + "/" + fileName,
                maybePretty(generateMigrationFile(className, diff), this.prettierConfig)
            ),
        ]);

        return [ret, fileName];
    }
}

function generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
    const timestamp = className.split("Migration")[1];

    return `
    import type { IMigration } from "@kikko-land/react";
    import { runQuery, sql } from "@kikko-land/react";

    export const ${className}: IMigration = {
        up: async (db) => {
            const statements = [${
                "\n" +
                diff.up
                    .filter(Boolean)
                    .map((sql) => "`" + sql.replace(/`/g, "'") + "`")
                    .join(",\n")
            }];
            for (const migration of statements) {
                await runQuery(db, sql([migration]));
            }
        },
        id: ${timestamp},
        name: "TODO-${className}",
    };`;
}
