import { DatabaseTable, queryBuilder, useDbQuery } from "@/db-client";
import { schemaHelper } from "@/db-helper";

import { useDbStrict } from "@kikko-land/react";
import { Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";
import { List } from "./List";
import { sortCompareFn } from "./sortCompareFn";
import { WithDb } from "./WithDb";
import Highlighter from "react-highlight-words";

export const OfflineDemo = () => {
    return (
        <WithDb>
            <DemoContent />
        </WithDb>
    );
};

const DemoContent = () => {
    const db = useDbStrict();
    const query = useQuery(["tables"], () => schemaHelper.getTables(db));
    const tableRows = query.data ?? [];
    const tableData =
        tableRows.flatMap((metadata) => metadata.columns.map((c) => ({ ...c, tableName: metadata.name }))) ?? [];

    const [activeTab, setActiveTab] = useState<"tables" | DatabaseTable>("tables");
    const rows = useDbQuery(activeTab === "tables" ? null : queryBuilder.selectFrom(activeTab).selectAll());
    // console.log(tableRows);

    const [textToSearch, setTextToSearch] = useState("");
    console.log({ textToSearch });

    return (
        <>
            {/* <Benchmark /> */}
            {/* <Button>save db</Button> */}
            <Tabs value={activeTab} onTabChange={(tab) => setActiveTab(tab as DatabaseTable)}>
                <Tabs.List pb="xs">
                    <Tabs.Tab value="tables">Tables</Tabs.Tab>
                    {tableRows.map((row) => (
                        <Tabs.Tab key={row.name} value={row.name}>
                            {row.name}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

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
                {tableRows.map((row, index) => (
                    <Tabs.Panel key={row.name} value={row.name}>
                        <DataGrid<any>
                            data={rows.data ?? []}
                            columns={tableRows[index]!.columns.map((col) => ({
                                header: col.name,
                                sortingFn: (rowA, rowB, colId) => sortCompareFn(rowA.original, rowB.original, colId),
                                accessorFn: (row) =>
                                    col.dataType === "datetime"
                                        ? new Date(row[col.name]).toLocaleString()
                                        : row[col.name],
                                cell: (cell) => (
                                    <Highlighter
                                        searchWords={[textToSearch]}
                                        autoEscape={true}
                                        textToHighlight={"" + cell.getValue<string>()}
                                    />
                                ),
                            }))}
                            onSearch={(text) => setTextToSearch(text)}
                            initialState={{ pagination: { pageSize: 20 } }}
                            pageSizes={[20, 50, 100, 500].map(String)}
                            loading={rows.type === "loading"}
                            height="500"
                            styles={{
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
                        />
                    </Tabs.Panel>
                ))}

                <Tabs.Panel value="messages" pt="xs">
                    Messages tab content
                </Tabs.Panel>
            </Tabs>
            <List />
        </>
    );
};
