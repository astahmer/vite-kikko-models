import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Utils } from "@mikro-orm/core";
import cac from "cac";
import fg from "fast-glob";
import { safeJSONParse } from "pastable/server";
import type { PackageJson } from "type-fest";

import { generateQueryBuilderClientAndMigrations } from "./generateQueryBuilderClientAndMigrations";

const cli = cac("kikko-gen");
// eslint-disable-next-line unicorn/prefer-module
const packageJson = safeJSONParse<PackageJson>(readFileSync(resolve(__dirname, "../../package.json"), "utf8"));

cli.version(packageJson.version!);
cli.help();

cli.parse();

const run = async () => {
    console.log("Generating query builder client and migrations");
    const entitiesPath = Utils.normalizePath(process.cwd(), "./src/entities");
    const glob = entitiesPath + "/**/*.entity.ts";
    const entities = await fg(glob);
    console.log({ entities, entitiesPath, glob });
    await generateQueryBuilderClientAndMigrations({
        // entities: ["./src/entities/*/*.entity.ts"],
        entities,
    });
    console.log("Done");
};

void run();
