import type { DataGridSortingState } from "mantine-data-grid";
import { DataGrid, dateFilterFn, highlightFilterValue, numberFilterFn, stringFilterFn } from "mantine-data-grid";
import { startTransition, useState } from "react";

import type { DatabaseTable } from "@/db-client";
import { queryBuilder, useDbQuery } from "@/db-client";

export const TableGrid = ({ table }: { table: DatabaseTable }) => {
    const [textToSearch, setTextToSearch] = useState("");
    const [sort, setSort] = useState<DataGridSortingState>();

    const rows = useDbQuery(getTableQuery({ table, textToSearch, sort: sort ?? [] }));

    return (
        <DataGrid<any>
            data={rows.data ?? []}
            columns={table.columns.map((col) => {
                const dataType = col.dataType.toLowerCase();
                return {
                    header: col.name,
                    accessorFn: (rowData) => {
                        return dataType === "datetime" ? new Date(rowData[col.name]) : rowData[col.name] ?? "";
                    },
                    cell: (cell) =>
                        (highlightFilterValue as any)({
                            renderValue: () =>
                                "" +
                                (dataType === "datetime"
                                    ? cell.getValue<Date>().toLocaleString()
                                    : cell.getValue<string>()),
                            column: cell.column,
                            table: cell.table,
                        }),
                    filterFn:
                        dataType === "datetime"
                            ? dateFilterFn
                            : dataType === "integer"
                            ? numberFilterFn
                            : stringFilterFn,
                };
            })}
            onSearch={(text) => {
                startTransition(() => {
                    setTextToSearch(text);
                });
            }}
            onSort={(sort) => {
                setSort(sort);
            }}
            initialState={{ pagination: { pageSize: 20 } }}
            pageSizes={[20, 50, 100, 500].map(String)}
            loading={rows.type === "loading"}
            height="500"
            styles={{
                scrollArea: { height: "100%" },
                pagination: {
                    justifyContent: "space-between",
                },
                pagination_info: { display: "initial" },
                pagination_size: {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginRight: "20px",
                },
            }}
            withPagination
            withSorting
            withGlobalFilter
            withFixedHeader
            fontSize="xs"
            striped
            highlightOnHover
            onRow={(row) => ({ onClick: () => console.log(row.original) })}
        />
    );
};

export const getTableQuery = ({
    table,
    textToSearch,
    sort,
}: {
    table: DatabaseTable;
    textToSearch: string;
    sort: DataGridSortingState;
}) => {
    return queryBuilder
        .selectFrom(table.name)
        .selectAll()
        .if(Boolean(textToSearch), (q) => {
            const searchableColumns = table.columns.filter((c) => {
                const dataType = c.dataType.toLowerCase();
                return dataType === "text" || dataType.includes("char");
            });
            let query = q;
            searchableColumns.forEach(
                (col) => (query = query.orWhere(col.name as unknown as any, "like", `%${textToSearch}%`))
            );
            return query;
        })
        .if(sort.length > 0, (q) => q.orderBy(sort[0]!.id as any, sort[0]!.desc ? "desc" : "asc"));
};
