import type { Generated } from "kysely";
import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

// TODO zod
type Person = {
    id: Generated<number>;
    first_name: string;
    last_name: string | null;
};

type Database = {
    person: Person;
};

export const builder = new Kysely<Database>({
    dialect: {
        createAdapter() {
            return new SqliteAdapter();
        },
        createDriver() {
            return new DummyDriver();
        },
        createIntrospector(db: Kysely<unknown>) {
            return new SqliteIntrospector(db);
        },
        createQueryCompiler() {
            return new SqliteQueryCompiler();
        },
    },
});
console.log(builder.selectFrom("person").select("id").compile().sql);
