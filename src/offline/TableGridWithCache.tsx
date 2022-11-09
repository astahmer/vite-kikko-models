import { useDbStrict } from "@kikko-land/react";
import { useQuery } from "@tanstack/react-query";
import type { DataGridSortingState } from "mantine-data-grid";
import { DataGrid, dateFilterFn, highlightFilterValue, numberFilterFn, stringFilterFn } from "mantine-data-grid";
import { startTransition, useState } from "react";

import type { DatabaseTable } from "@/db-client";
import { runDbQuery } from "@/db-client";

import { getTableQuery } from "./TableGrid";

export const TableGridWithCache = ({ table }: { table: DatabaseTable }) => {
    const [textToSearch, setTextToSearch] = useState("");
    const [sort, setSort] = useState<DataGridSortingState>();

    const db = useDbStrict();
    const rows = useQuery(["table", table.name, { textToSearch, sort }], () =>
        runDbQuery(db, getTableQuery({ table, textToSearch, sort: sort ?? [] }))
    );

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
            loading={rows.isLoading}
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
