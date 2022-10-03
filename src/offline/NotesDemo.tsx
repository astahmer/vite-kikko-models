/* eslint-disable import/no-unused-modules */
import { insert, select, sql } from "@kikko-land/query-builder";
import { runQuery, useQuery, useQueryFirstRow, useRunQuery } from "@kikko-land/react";
import { getRandomString } from "pastable";

// import * as qb from "@kikko-land/query-builder";

export type Note = { id: string; title: string };
export const NotesDemo = () => {
    const notes = useQuery<Note>(select().from("notes"));
    const notesCount = useQueryFirstRow<{ count: number }>(select({ count: sql`COUNT(*)` }).from("notes"));

    const [addNote, state] = useRunQuery((db) => async () => {
        const id = getRandomString();

        const oui = await runQuery(
            db,
            insert({
                id,
                title: `Note#${id}`,
                content: "example",
            }).into("notes")
        );
        console.log({ oui });
    });

    console.log({ addNote, state });

    return (
        <div style={{ maxWidth: 600, overflow: "auto", maxHeight: 500 }}>
            <button onClick={() => addNote()}>Add note</button>
            <div>Add note result: {state.type}</div>
            <div>Query result (total notes count: {notesCount.data?.count})</div>
            <pre>{JSON.stringify(notes, undefined, 4)}</pre>
        </div>
    );
};
