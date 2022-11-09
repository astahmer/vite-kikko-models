import { runQuery } from "@kikko-land/react";
import type { NumberInputHandlers, NumberInputProps } from "@mantine/core";
import { ActionIcon, Box, Button, Group, Input, NumberInput, Pagination, Table } from "@mantine/core";
import humanId from "human-id";
import type { Selectable } from "kysely";
import { chunk } from "pastable";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";

import type { DatabaseSchema } from "@/db-client";
import { queryBuilder, runDbQuery, useDbQuery, useRunDbQuery } from "@/db-client";
import { getSql } from "@/lib/getSql";

import { usePaginator } from "./usePaginator";

const Row = ({ row, textToSearch }: { row: Selectable<DatabaseSchema["note"]>; textToSearch: string }) => {
    const [deleteRecord, deleteRecordState] = useRunDbQuery((db) => async () => {
        await runQuery(db, getSql(queryBuilder.deleteFrom("note").where("id", "=", row.id)));
    });

    const [updateRecord, updateRecordState] = useRunDbQuery((db) => async () => {
        const oui = await runDbQuery(
            db,
            queryBuilder
                .updateTable("note")
                .set({
                    title: row.title + " updated!",
                    content: row.content + " updated!",
                    updated_at: new Date().toString(),
                })
                .where("id", "=", row.id)
        );
        console.log(oui);
        return oui;
    });

    return (
        <tr key={row.id}>
            <td>{row.title}</td>
            <td>
                <Highlighter searchWords={[textToSearch]} autoEscape={true} textToHighlight={row.content} />
            </td>
            <td>{new Date(row.created_at).toLocaleString()}</td>
            <td>{new Date(row.updated_at).toLocaleString()}</td>
            <td>
                <Button.Group orientation="vertical">
                    <Button
                        variant="light"
                        onClick={() => void deleteRecord()}
                        disabled={deleteRecordState.type !== "idle"}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => void updateRecord()}
                        disabled={
                            updateRecordState.type !== "running" &&
                            updateRecordState.type !== "idle" &&
                            updateRecordState.type !== "done"
                        }
                    >
                        Update {updateRecordState.type}
                    </Button>
                </Button.Group>
            </td>
        </tr>
    );
};

export const List = () => {
    const [textToSearch, setTextToSearch] = useState<string>("");

    const query = queryBuilder
        .selectFrom("note")
        .selectAll()
        .if(Boolean(textToSearch), (q) => q.where("content", "like", `%${textToSearch}%`));

    const paginator = usePaginator(query, 10);
    const rowsResult = useDbQuery(paginator.query);

    const [createNotes, createNotesState] = useRunDbQuery((db) => async (count: number) => {
        for (const group of chunk(Array.from(Array(count).keys()), 3000)) {
            await runDbQuery(
                db,
                queryBuilder.insertInto("note").values(
                    group.map((i) => ({
                        title: humanId({ separator: "-", capitalize: false }),
                        content: humanId({ adjectiveCount: 10, separator: "-", capitalize: false }),
                        author_id: 1,
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                    }))
                )
            );
        }
    });

    const [deleteAll, deleteAllState] = useRunDbQuery((db) => async () => {
        await runDbQuery(db, queryBuilder.deleteFrom("note"));
    });
    const [count, setCount] = useState(100);

    return (
        <>
            <Group pt="xl">
                <BigNumberInput value={count} onChange={(val) => setCount(val!)} />
                <Button
                    onClick={() => void createNotes(count)}
                    disabled={createNotesState.type === "running" || createNotesState.type === "waitingDb"}
                    loading={createNotesState.type === "running"}
                >
                    {createNotesState.type === "running" ? "Loading..." : `Add  ${nbFormat.format(count)} notes!`}
                </Button>
                <Button
                    onClick={() => void deleteAll()}
                    disabled={deleteAllState.type === "running" || deleteAllState.type === "waitingDb"}
                    color="red"
                    variant="outline"
                    loading={deleteAllState.type === "running"}
                >
                    {deleteAllState.type === "running" ? "Loading..." : "Delete all notes!"}
                </Button>
            </Group>

            <Box mt="xl" />

            <Input
                value={textToSearch}
                onChange={(e) => {
                    setTextToSearch(e.target.value);
                }}
                placeholder="Search content"
            />

            <Box mt="xl" />

            <div>Total found records: {paginator.count !== undefined ? paginator.count : "Loading..."}</div>

            <Box mt="xl" />

            <Table>
                <thead>
                    <tr>
                        <td>Title</td>
                        <td>Content</td>
                        <td>Created At</td>
                        <td>Updated At</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {rowsResult.type === "loaded" &&
                        rowsResult.data.map((r) => <Row row={r} textToSearch={textToSearch} key={r.id} />)}
                </tbody>
            </Table>

            <Box mt="xl" />
            <Pagination ml="auto" total={paginator.totalPages} onChange={paginator.setPage} />
        </>
    );
};

const nbFormat = new Intl.NumberFormat("en-US");

const BigNumberInput = (props: NumberInputProps) => {
    const handlers = useRef<NumberInputHandlers>();

    return (
        <Group spacing={5}>
            <ActionIcon size={36} variant="default" onClick={() => handlers.current!.decrement()}>
                –
            </ActionIcon>

            <NumberInput
                {...props}
                hideControls
                handlersRef={handlers}
                min={0}
                max={100_000}
                step={50}
                styles={{ input: { width: 54, textAlign: "center" } }}
            />

            <ActionIcon size={36} variant="default" onClick={() => handlers.current!.increment()}>
                +
            </ActionIcon>
        </Group>
    );
};
