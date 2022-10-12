import { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Author = {
    id: Generated<number>;
    lastname: string;
    name: string;
};

export type Note = {
    author_id: number;
    content: string;
    created_at: string;
    id: Generated<number>;
    title: string;
    updated_at: string;
};

export type DB = {
    author: Author;
    note: Note;
};
