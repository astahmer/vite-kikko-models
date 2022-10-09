import * as qb from "@kikko-land/query-builder";
import { sql, useQueries } from "@kikko-land/react";
import { Button } from "@mantine/core";

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
    const notesColumns = useQueries([
        sql.raw("PRAGMA table_info(notes);"),
        sql.raw("PRAGMA table_info(post);"),
        sql.raw("PRAGMA table_info(author);"),
        qb.select().from("migrations"),
        sql.raw("PRAGMA table_info(migrations);"),
    ]);
    console.log(notesColumns.data);
    // const db = useDbStrict();

    return (
        <>
            {/* <Benchmark /> */}
            <Button>save db</Button>
            <List />
            {/* <Notes /> */}
        </>
    );
};
