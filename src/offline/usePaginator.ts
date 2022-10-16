import type { SelectQueryBuilder } from "kysely";

import { queryBuilder, useDbQueryFirstRow } from "@/db-client";
import * as pagination from "@zag-js/pagination";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useEffect } from "react";

export const usePaginator = <DB, Output, Builder extends SelectQueryBuilder<DB, keyof DB, Output>>(
    baseQuery: Builder,
    pageSize: number
) => {
    const countResult = useDbQueryFirstRow(
        queryBuilder.selectFrom(baseQuery as any).select(queryBuilder.fn.count<number>("id").as("count"))
    );
    const count = countResult.data?.count ?? 0;
    const [state, send] = useMachine(pagination.machine({ id: "pagination", count, pageSize }));

    const api = pagination.connect(state, send, normalizeProps);

    // Synchronize count query result with pagination machine
    useEffect(() => {
        if (count !== state.context.count) {
            api.setCount(count);
        }
    }, [api, count, state.context.count]);

    // Synchronize pageSize prop option with pagination machine
    useEffect(() => {
        if (pageSize !== state.context.pageSize) {
            api.setPageSize(pageSize);
        }
    }, [api, pageSize, state.context.pageSize]);

    return {
        ...api,
        count,
        pageSize,
        query: baseQuery.limit(pageSize).offset(pageSize * (api.page - 1)) as typeof baseQuery,
    };
};
