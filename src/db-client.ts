import type { Falsy, IDbState, IRunQueryHookResult } from "@kikko-land/react";
import { runQuery, useQuery, useQueryFirstRow, useRunQuery } from "@kikko-land/react";
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
export type DatabaseTable = keyof DatabaseSchema;

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

type QueryBuilderResult<Builder extends AnyQueryBuilder> = Builder extends SelectQueryBuilder<any, any, infer Output>
    ? Single<Output>
    : Builder extends UpdateQueryBuilder<any, any, any, infer Output>
    ? Output
    : Builder extends DeleteQueryBuilder<any, any, infer Ouput>
    ? Ouput
    : Builder extends InsertQueryBuilder<any, any, infer Ouput>
    ? Ouput
    : never;

export const runDbQuery = <Builder extends AnyQueryBuilder>(state: IDbState, builder: Builder) =>
    runQuery<QueryBuilderResult<Builder>>(state, getSql(builder));

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

export function useRunDbQuery<Return, Args extends any[]>(
    cb: (db: IDbState) => (...args: Args) => Promise<Return>,
    _opts?: UseDbQueryOptions
): readonly [(...args: Args) => Promise<Return>, IRunQueryHookResult<Return>] {
    return useRunQuery<any, any>((db) => cb(db) as any, _opts) as any;
}

type UseDbQueryOptions = {
    suppressLog?: boolean;
    mapToObject?: boolean;
};
