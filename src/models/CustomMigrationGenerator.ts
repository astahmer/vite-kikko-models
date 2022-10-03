import { MemoryMigrationGenerator } from "./MemoryMigrationGenerator";

export class CustomMigrationGenerator extends MemoryMigrationGenerator {
    override generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
        return `export default {
          id: '${className}',
          up: [${
              "\n" +
              diff.up
                  .filter(Boolean)
                  .map((sql) => "`" + sql.replace(/`/g, "'") + "`")
                  .join(",\n")
          }],
      }`;
    }
}
