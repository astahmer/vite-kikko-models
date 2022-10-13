import type { CompiledQuery } from "kysely";

import { kyselyToKikkoISql } from "./kyselyToKikkoISql";
import type { AnyQueryBuilder } from "./types";

const replaceSqlParameters = (sql: string, parameters: readonly unknown[] | any[]) => {
    let i = 0;
    return sql.replace(/\?/g, () => {
        const param = parameters[i++];
        return typeof param === "number" ? String(param) : `"${param}"`;
    });
};

const toSqlString = (query: CompiledQuery) =>
    query.parameters.length > 0 ? replaceSqlParameters(query.sql, query.parameters) : query.sql;

export const printSql = <Builder extends AnyQueryBuilder>(builder: Builder) => toSqlString(builder.compile());
export const getSql = <Builder extends AnyQueryBuilder>(builder: Builder) => kyselyToKikkoISql(builder);
