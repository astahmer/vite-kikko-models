import type { Falsy, IDbState } from "@kikko-land/react";
import { runQuery, useQuery, useQueryFirstRow } from "@kikko-land/react";
import type { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";
import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

import type { DB, Generated } from "./db-interface";
import { getSql } from "./lib/getSql";
import type { AnyQueryBuilder } from "./lib/types";

type KikkoMigration = {
    id: Generated<number>;
    migrated_at: Generated<number>;
    name: string | null;
};

export type DatabaseSchema = Omit<DB, "mikro_orm_migrations"> & { migrations: KikkoMigration };

export const queryBuilder = new Kysely<DatabaseSchema>({
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

export const runDbQuery = <Builder extends AnyQueryBuilder>(state: IDbState, builder: Builder) =>
    runQuery<
        Builder extends SelectQueryBuilder<any, any, infer Output>
            ? Single<Output>
            : Builder extends UpdateQueryBuilder<any, any, any, infer Output>
            ? Output
            : Builder extends DeleteQueryBuilder<any, any, infer Ouput>
            ? Ouput
            : Builder extends InsertQueryBuilder<any, any, infer Ouput>
            ? Ouput
            : never
    >(state, getSql(builder));

type Single<T> = T extends Array<infer U> ? U : T;

export const useDbQuery = <Builder extends Falsy | SelectQueryBuilder<any, any, any>>(
    builder: Builder | Falsy,
    _opts?: UseDbQueryOptions
) => {
    return useQuery<Builder extends SelectQueryBuilder<any, any, infer Output> ? Output : Falsy>(
        builder ? getSql(builder) : 0,
        _opts
    );
};

export const useDbQueryFirstRow = <Builder extends Falsy | SelectQueryBuilder<any, any, any>>(
    builder: Builder | Falsy,
    _opts?: UseDbQueryOptions
) => {
    return useQueryFirstRow<Builder extends SelectQueryBuilder<any, any, infer Output> ? Output : Falsy>(
        builder ? getSql(builder) : 0,
        _opts
    );
};

type UseDbQueryOptions = {
    suppressLog?: boolean;
    mapToObject?: boolean;
};
