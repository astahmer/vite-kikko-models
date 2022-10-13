import type { IPrimitiveValue, ISql } from "@kikko-land/react";
import { sql } from "@kikko-land/react";
import type { IdentifierNode, OperationNode, RootOperationNode, TableExpressionNode, WithNode } from "kysely";
import { AliasNode, TableNode } from "kysely";

import type { AnyQueryBuilder } from "./types";

/** Adapted from https://github.com/astahmer/kikko/blob/46f2b81958420b549b1bf3097faec3b95973ea04/packages/sql/src/sql.ts */
export const kyselyToKikkoISql = (query: AnyQueryBuilder): ISql => {
    const compiled = query.compile();
    const node = query.toOperationNode();

    // TODO try with dependsOnTables
    const tableNames = kyselyAdapter.getTables(node);
    const tables = [...tableNames].map((table) => sql.table(table));
    // console.log({ sql: compiled.sql, tableNames, tables, node });
    return {
        _strings: [compiled.sql],
        _values: compiled.parameters as IPrimitiveValue[],
        tables,

        get isModifyQuery() {
            return (
                node.kind === "InsertQueryNode" || node.kind === "UpdateQueryNode" || node.kind === "DeleteQueryNode"
            );
        },
        get isReadQuery() {
            return !this.isModifyQuery;
        },
        get isEmpty() {
            return this.preparedQuery.text.trim().length === 0;
        },

        get hash() {
            if (!this._hash) {
                this._hash = this._strings.join(",") + this._values.join(",");
            }

            return this._hash;
        },

        get raw() {
            return (
                this._strings[0] +
                this._strings
                    .slice(1)
                    .map(
                        (val, i) =>
                            `${
                                (typeof this._values[i] === "string"
                                    ? `'${this._values[i] as string}'`
                                    : this._values[i]
                                )?.toString() ?? "NULL"
                            }${val}`
                    )
                    .join("")
            );
        },

        get preparedQuery() {
            if (!this._cachedText) {
                this._cachedText = (
                    this._strings[0] +
                    this._strings
                        .slice(1)
                        .map((val, i) => `?${val}`)
                        .join("")
                ).trim();
            }

            return {
                values: this._values,
                text: this._cachedText,
            };
        },

        inspect() {
            return {
                preparedQuery: this.preparedQuery,
                tables: this.tables,
            };
        },

        toSql() {
            return this;
        },

        toString() {
            const { values, text } = this.preparedQuery;

            return `${text} - [${values.join(", ")}]`;
        },
    };
};

type SchemableIdentifierNode = {
    readonly kind: "SchemableIdentifierNode";
    readonly schema?: IdentifierNode;
    readonly identifier: IdentifierNode;
} & OperationNode;
const isSchemableIdentifierNode = (node: OperationNode): node is SchemableIdentifierNode => {
    return node.kind === "SchemableIdentifierNode";
};

/** Adapated from https://github.dev/koskimas/kysely/blob/d8c730b4ab866cab69baa174e156355ee7bb8004/src/plugin/with-schema/with-schema-transformer.ts#L55 */
class KyselyKikkAdapter {
    readonly #schemableIds = new Set<string>();

    getTables(node: RootOperationNode) {
        const tables = this.#collectSchemableIds(node);

        for (const table of tables) {
            this.#schemableIds.add(table);
        }

        return this.#schemableIds;
    }

    #collectSchemableIds(node: RootOperationNode): Set<string> {
        const schemableIds = new Set<string>();

        if ("name" in node && node.name && isSchemableIdentifierNode(node.name)) {
            this.#collectSchemableId(node.name, schemableIds);
        }

        if ("from" in node && node.from) {
            for (const from of node.from.froms) {
                this.#collectSchemableIdsFromTableExpr(from, schemableIds);
            }
        }

        if ("into" in node && node.into) {
            this.#collectSchemableIdsFromTableExpr(node.into, schemableIds);
        }

        if ("table" in node && node.table) {
            this.#collectSchemableIdsFromTableExpr(node.table, schemableIds);
        }

        if ("joins" in node && node.joins) {
            for (const join of node.joins) {
                this.#collectSchemableIdsFromTableExpr(join.table, schemableIds);
            }
        }

        if ("with" in node && node.with) {
            this.#removeCommonTableExpressionTables(node.with, schemableIds);
        }

        return schemableIds;
    }

    #collectSchemableIdsFromTableExpr(node: TableExpressionNode, schemableIds: Set<string>): void {
        const table = TableNode.is(node) ? node : AliasNode.is(node) && TableNode.is(node.node) ? node.node : null;

        if (table) {
            this.#collectSchemableId(table.table, schemableIds);
        }
    }

    #collectSchemableId(node: SchemableIdentifierNode, schemableIds: Set<string>): void {
        if (!this.#schemableIds.has(node.identifier.name)) {
            schemableIds.add(node.identifier.name);
        }
    }

    #removeCommonTableExpressionTables(node: WithNode, schemableIds: Set<string>) {
        for (const expr of node.expressions) {
            schemableIds.delete(expr.name.table.table.identifier.name);
        }
    }
}
const kyselyAdapter = new KyselyKikkAdapter();
