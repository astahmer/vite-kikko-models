import { type Options, MikroORM, Utils } from "@mikro-orm/core";
import { ensureDir, move, remove } from "fs-extra";
import { Cli } from "kysely-codegen";

import { KikkoAndOriginalMigrationGenerator } from "./KikkoMigrationGenerator";

/**
 * - Generates MikroORM original migrations in `./migrations` (to populate the sqlite db file) and Kikko migrations in `./migrations-kikko`
 * - Temporarily persist to disk a sqlite `tmp.db` file so that the `kysely-codegen` can generate the query builder client
 * - Remove the `tmp.db` file & the MikroORM migrations files, then move the Kikko migrations into the `./migrations` folder
 */
export const generateQueryBuilderClientAndMigrations = async (options?: Options) => {
    // TODO get migrationpath from MikroORM's ConfigurationLoader
    const mikroPath = Utils.normalizePath(process.cwd(), "./migrations");
    await ensureDir(mikroPath);

    const tmpDbPath = Utils.normalizePath(mikroPath, "./tmp.db");
    await remove(tmpDbPath);

    console.log({ mikroPath, tmpDbPath });

    const orm = await MikroORM.init({
        debug: ["info", "discovery"],
        // https://mikro-orm.io/docs/configuration#using-environment-variables
        ...options,
        // dbName: "./migrations/mikro/tmp.db",
        dbName: tmpDbPath,
        type: "sqlite",
        migrations: {
            path: mikroPath,
            generator: KikkoAndOriginalMigrationGenerator,
        },
    });

    const migrator = orm.getMigrator();
    await migrator.createMigration();
    await migrator.up();
    await orm.close(true);

    const cli = new Cli();
    // TODO allow passing the out-file path
    await cli.run(["--url", tmpDbPath, "--dialect", "sqlite", "--out-file", "./src/query-builder.ts"]);

    await remove(mikroPath);
    await move(Utils.normalizePath(mikroPath, "../migrations-kikko"), mikroPath);
};
