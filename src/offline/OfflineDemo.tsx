import { useRunQuery } from "@kikko-land/react";
import { Button } from "@mantine/core";

import { schemaHelper } from "@/db-client";

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
    // const query = useDbQuery(queryBuilder.selectFrom("note").selectAll());
    // console.log(query.data);

    // const textToSearch = "aaa";
    // console.log(
    //     queryBuilder
    //         .selectFrom("note")
    //         .selectAll()
    //         .if(Boolean(textToSearch), (q) => q.where("content", "like", `%${textToSearch}%`))
    //         .if(!textToSearch, (q) => q.where("content", "is", ""))
    //         .toOperationNode()
    // );

    const [getTableMetadata, tableMetadata] = useRunQuery((db) => () => schemaHelper.getTableMetadata(db, "note"));
    const [getTables, tables] = useRunQuery((db) => () => schemaHelper.getTables(db));
    console.log(tableMetadata.data);

    return (
        <>
            {/* <Benchmark /> */}
            <Button>save db</Button>
            <Button onClick={getTableMetadata}>getTableMetadata: note {tableMetadata.type}</Button>
            <Button onClick={getTables}>getTables {tables.type}</Button>
            <List />
            {/* <Notes /> */}
        </>
    );
};
