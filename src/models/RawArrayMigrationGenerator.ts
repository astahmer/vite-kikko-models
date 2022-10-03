import { MigrationGenerator } from "@mikro-orm/migrations";
import { type Options, resolveConfig } from "prettier";

import { maybePretty } from "./maybePretty";
import { MemoryMigrationGenerator } from "./MemoryMigrationGenerator";

export class RawArrayInMemoryMigrationGenerator extends MemoryMigrationGenerator {
    override generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
        return generateMigrationFile(className, diff);
    }
}

export class RawArrayMigrationGenerator extends MigrationGenerator {
    prettierConfig: Options | null = null;

    override async generate(
        diff: { up: string[]; down: string[] },
        path?: string | undefined
    ): Promise<[string, string]> {
        this.prettierConfig = await resolveConfig("./");
        return super.generate(diff, path);
    }

    override generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
        return maybePretty(generateMigrationFile(className, diff), this.prettierConfig);
    }
}

function generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
    return `export default {
      id: '${className}',
      up: [${
          "\n" +
          diff.up
              .filter(Boolean)
              .map((sql) => "`" + sql.replace(/`/g, "'") + "`")
              .join(",\n")
      }],
      down: [${
          "\n" +
          diff.down
              .filter(Boolean)
              .map((sql) => "`" + sql.replace(/`/g, "'") + "`")
              .join(",\n")
      }],
  }`;
}
