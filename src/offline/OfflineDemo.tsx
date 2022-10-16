import { DatabaseTable, DatabaseTableName, queryBuilder, useDbQuery } from "@/db-client";
import { schemaHelper } from "@/db-helper";

import { useDbStrict } from "@kikko-land/react";
import { Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
    DataGrid,
    DataGridPaginationState,
    DataGridSortingState,
    dateFilterFn,
    highlightFilterValue,
    numberFilterFn,
    stringFilterFn,
    useDataGrid,
} from "mantine-data-grid";
import { startTransition, useState } from "react";
import { List } from "./List";
import { WithDb } from "./WithDb";
import { usePaginator } from "./usePaginator";
import { match } from "ts-pattern";

export const OfflineDemo = () => {
    return (
        <WithDb>
            <DemoContent />
        </WithDb>
    );
};

const DemoContent = () => {
    const db = useDbStrict();
    const query = useQuery(["tables"], () => schemaHelper.getTables(db), { refetchOnWindowFocus: false });
    const tableRows = query.data ?? [];
    const tableData =
        tableRows.flatMap((metadata) => metadata.columns.map((c) => ({ ...c, tableName: metadata.name }))) ?? [];

    const [activeTab, setActiveTab] = useState<"tables" | DatabaseTableName>("tables");
    // const rows = useDbQuery(activeTab === "tables" ? null : queryBuilder.selectFrom(activeTab).selectAll());

    // console.log(tableRows);

    return (
        <>
            {/* <Benchmark /> */}
            {/* <Button>save db</Button> */}
            <Tabs value={activeTab} onTabChange={(tab) => setActiveTab(tab as DatabaseTableName)}>
                <Tabs.List pb="xs">
                    <Tabs.Tab value="tables">Tables</Tabs.Tab>
                    {tableRows.map((row) => (
                        <Tabs.Tab key={row.name} value={row.name}>
                            {row.name}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                {match(activeTab)
                    .with("tables", () => (
                        <Tabs.Panel value="tables">
                            <DataGrid
                                data={tableData}
                                columns={[
                                    { header: "tableName", accessorFn: (row) => row.tableName },
                                    { header: "name", accessorFn: (row) => row.name },
                                    { header: "dataType", accessorFn: (row) => row.dataType },
                                    { header: "isNullable", accessorFn: (row) => row.isNullable },
                                    { header: "isAutoIncrementing", accessorFn: (row) => row.isAutoIncrementing },
                                    { header: "hasDefaultValue", accessorFn: (row) => row.hasDefaultValue },
                                ]}
                                initialState={{ pagination: { pageSize: 20 } }}
                                pageSizes={[20, 50, 100, 500].map(String)}
                                loading={query.isLoading}
                                withPagination
                                withSorting
                                withGlobalFilter
                            />
                        </Tabs.Panel>
                    ))
                    .otherwise((tableName) => {
                        const table = tableRows.find((t) => t.name === tableName)!;
                        return (
                            <Tabs.Panel key={table.name} value={table.name}>
                                <TableGrid table={table} />
                            </Tabs.Panel>
                        );
                    })}

                <Tabs.Panel value="messages" pt="xs">
                    Messages tab content
                </Tabs.Panel>
            </Tabs>
            <List />
        </>
    );
};

const TableGrid = ({ table }: { table: DatabaseTable }) => {
    const [textToSearch, setTextToSearch] = useState("");
    const [sort, setSort] = useState<DataGridSortingState>();

    const baseQuery = queryBuilder
        .selectFrom(table.name)
        .selectAll()
        .if(Boolean(textToSearch), (q) => {
            const searchableColumns = table.columns.filter((c) => {
                const dataType = c.dataType.toLowerCase();
                return dataType === "text" || dataType.includes("char");
            });
            let query = q;
            searchableColumns.forEach((col) => (query = query.orWhere(col.name as any, "like", `%${textToSearch}%`)));
            return query;
        })
        .if(Boolean(sort?.length), (q) => q.orderBy(sort![0]!.id as any, sort![0]!.desc ? "desc" : "asc"));

    const [pageSize, setPageSize] = useState(20);
    const paginator = usePaginator(baseQuery, pageSize);
    const pagination: DataGridPaginationState = { pageIndex: paginator.page - 1, pageSize };
    const rows = useDbQuery(paginator.query);
    const [tableRef, setTable] = useDataGrid<DatabaseTable>();

    return (
        <DataGrid<any>
            tableRef={setTable}
            data={rows.data ?? []}
            columns={table.columns.map((col) => {
                const dataType = col.dataType.toLowerCase();
                return {
                    header: col.name,
                    // sortingFn: (rowA, rowB, colId) => sortCompareFn(rowA.original, rowB.original, colId),
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
