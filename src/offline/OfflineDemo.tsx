import { useDbStrict } from "@kikko-land/react";
import { Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";
import { match } from "ts-pattern";

import type { DatabaseTableName } from "@/db-client";
import { schemaHelper } from "@/db-helper";

import { List } from "./List";
import { TableGridWithPaginator } from "./TableGridWithPaginator";
import { WithDb } from "./WithDb";

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
                                initialState={{ pagination: { pageSize: 100 } }}
                                pageSizes={[100, 250, 500, 1000].map(String)}
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
                                <TableGridWithPaginator table={table} />
                            </Tabs.Panel>
                        );
                    })}
            </Tabs>
            <List />
        </>
    );
};
