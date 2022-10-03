import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import type { DB } from "kysely-codegen";

// pnpm kysely-codegen --url ./mikro-server.db --dialect sqlite --output ./src/db-client.ts
export const qb = new Kysely<DB>({
    dialect: {
        createAdapter() {
            return new SqliteAdapter();
        },
        createDriver() {
            return new DummyDriver();
        },
        createIntrospector(db: Kysely<unknown>) {
            return new SqliteIntrospector(db);
        },
        createQueryCompiler() {
            return new SqliteQueryCompiler();
        },
    },
});
