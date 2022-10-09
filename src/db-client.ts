import type { CompiledQuery } from "kysely";
import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

import type { DB } from "./db-interface";

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

const replaceSqlParameters = (sql: string, parameters: readonly unknown[] | any[]) => {
    let i = 0;
    return sql.replace(/\?/g, () => String(parameters[i++]));
};

export const getSqlFromCompiledQuery = (query: CompiledQuery) => replaceSqlParameters(query.sql, query.parameters);
