import type { DataGridPaginationState, DataGridSortingState } from "mantine-data-grid";
import {
    DataGrid,
    dateFilterFn,
    highlightFilterValue,
    numberFilterFn,
    stringFilterFn,
    useDataGrid,
} from "mantine-data-grid";
import { startTransition, useState } from "react";

import type { DatabaseTable } from "@/db-client";
import { useDbQuery } from "@/db-client";

import { getTableQuery } from "./TableGrid";
import { usePaginator } from "./usePaginator";

export const TableGridWithPaginator = ({ table }: { table: DatabaseTable }) => {
    const [textToSearch, setTextToSearch] = useState("");
    const [sort, setSort] = useState<DataGridSortingState>();

    const [pageSize, setPageSize] = useState(100);
    const paginator = usePaginator(getTableQuery({ table, textToSearch, sort: sort ?? [] }), pageSize);

    const pagination: DataGridPaginationState = { pageIndex: paginator.page - 1, pageSize };
    const rows = useDbQuery(paginator.query);

    const [tableRef, setTable] = useDataGrid<DatabaseTable>();
    // console.log(pagination, paginator);
    return (
        <DataGrid<any>
            tableRef={setTable}
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
            total={paginator.count}
            onPageChange={(pagination) => {
                paginator.setPage(pagination.pageIndex + 1);
                setPageSize(pagination.pageSize);
            }}
            onSearch={(text) => {
                startTransition(() => {
                    setTextToSearch(text);
                    if (tableRef?.getState().pagination.pageIndex !== 1) tableRef!.resetPageIndex();
                });
            }}
            onSort={(sort) => {
                setSort(sort);
                tableRef!.resetPageIndex();
            }}
            initialState={{ pagination: { pageSize } }}
            state={{ pagination }}
            pageSizes={[100, 250, 500, 1000].map(String)}
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
