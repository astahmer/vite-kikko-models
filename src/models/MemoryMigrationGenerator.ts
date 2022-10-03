import { TSMigrationGenerator } from "@mikro-orm/migrations";
import prettier, { type Options, resolveConfig } from "prettier";
import parserTypescript from "prettier/parser-typescript";

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

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch {
        return input; // assume it's invalid syntax and ignore
    }
}
