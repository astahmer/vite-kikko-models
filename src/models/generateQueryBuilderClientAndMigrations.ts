import { type Options, MikroORM, Utils } from "@mikro-orm/core";
import { Cli } from "kysely-codegen";

import { AuthorEntitySchema, NoteEntitySchema } from "./entities";
import { KikkoAndOriginalMigrationGenerator } from "./KikkoMigrationGenerator";
// import fg from "fast-glob";

/**
 * - Generates MikroORM original migrations (to populate the sqlite db file) and Kikko migrations in given path
 * - Persist to disk a sqlite db file so that the `kysely-codegen` can generate the query builder client
 * @see https://mikro-orm.io/
 * @see https://github.com/RobinBlomberg/kysely-codegen
 */
export const generateQueryBuilderClientAndMigrations = async (options?: Options) => {
    // https://mikro-orm.io/docs/configuration#using-environment-variables
    const orm = await MikroORM.init({
        debug: ["info", "discovery"],
        dbName: "mikro.db",
        type: "sqlite",
        migrations: {
            path: Utils.normalizePath(process.cwd(), "./src/migrations"),
            generator: KikkoAndOriginalMigrationGenerator,
        },
        entities: [AuthorEntitySchema, NoteEntitySchema],
        ...options,
    });

    // const dbPath = Utils.normalizePath(orm.config.get("migrations").path, "./migrations.db");

    const migrator = orm.getMigrator();
    await migrator.createMigration();
    await migrator.up();
    await orm.close(true);

    const cli = new Cli();
    // TODO allow passing the out-file path
    await cli.run(["--url", orm.config.get("dbName"), "--dialect", "sqlite", "--out-file", "./src/db-interface.ts"]);
};

// const entitiesPath = Utils.normalizePath(process.cwd(), "./src/entities");
// const glob = entitiesPath + "/**/*.entity.ts";
// const entities = await fg(glob);

void generateQueryBuilderClientAndMigrations();
