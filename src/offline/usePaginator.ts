import type { AnySelectQueryBuilder, SelectQueryBuilder } from "kysely";
import { useCallback, useEffect, useState } from "react";

import type { DatabaseSchema } from "@/db-client";
import { queryBuilder, useDbQuery } from "@/db-client";

const getFromTableName = (query: AnySelectQueryBuilder) => {
    const from = query.toOperationNode().from.froms.at(0);
    if (from?.kind === "TableNode") {
        return from.table.identifier.name;
    }

    throw new Error("Unsupported from type");
};

export const usePaginator = <DB, Output, Builder extends SelectQueryBuilder<DB, keyof DB, Output>>({
    perPage,
    baseQuery,
}: {
    perPage: number;
    baseQuery: Builder;
}) => {
    const tableName = queryBuilder.dynamic.ref<keyof DatabaseSchema>(getFromTableName(baseQuery));
    const countResult = useDbQuery(
        queryBuilder.selectFrom(tableName as any).select(queryBuilder.fn.count<number>("id").as("count")),
        { shouldTakeFirst: true }
    );
    const totalCount = countResult.data?.count;
    const totalPages = totalCount !== undefined ? Math.ceil(totalCount / perPage) || 1 : undefined;

    const [currentPage, setPage] = useState(1);

    useEffect(() => {
        if (totalPages === undefined) return;
        if (totalPages === 0) {
            setPage(1);

            return;
        }

        if (currentPage > totalPages) {
            setPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const isNextPageAvailable = totalPages !== undefined ? currentPage < totalPages : false;
    const isPrevPageAvailable = currentPage > 1;

    const nextPage = useCallback(() => {
        if (isNextPageAvailable) {
            setPage(currentPage + 1);
        }
    }, [currentPage, isNextPageAvailable]);

    const prevPage = useCallback(() => {
        if (isPrevPageAvailable) {
            setPage(currentPage - 1);
        }
    }, [currentPage, isPrevPageAvailable]);

    return {
        paginatedQuery: baseQuery.limit(perPage).offset(perPage * (currentPage - 1)) as typeof baseQuery,
        totalPages,
        currentPage,
        totalCount,
        isNextPageAvailable,
        isPrevPageAvailable,
        nextPage,
        prevPage,
    };
};
