import { useRunQuery } from "@kikko-land/react";
import { Button } from "@mantine/core";

import { queryBuilder, useDbQuery } from "@/db-client";
import { schemaHelper } from "@/db-helper";

import { List } from "./List";
import { WithDb } from "./WithDb";

export const OfflineDemo = () => {
    return (
        <WithDb>
            <DemoContent />
        </WithDb>
    );
};

const DemoContent = () => {
    const migrations = useDbQuery(queryBuilder.selectFrom("migrations").selectAll());
    console.log(migrations.data);

    const [getTableMetadata, tableMetadata] = useRunQuery((db) => () => schemaHelper.getTableMetadata(db, "note"));
    const [getTables, tables] = useRunQuery((db) => () => schemaHelper.getTables(db));
    console.log(tableMetadata);

    return (
        <>
            {/* <Benchmark /> */}
            {/* <Button>save db</Button> */}
            <Button.Group>
                <Button onClick={getTableMetadata}>getTableMetadata: note {tableMetadata.type}</Button>
                <Button onClick={getTables}>getTables {tables.type}</Button>
            </Button.Group>
            <List />
        </>
    );
};
