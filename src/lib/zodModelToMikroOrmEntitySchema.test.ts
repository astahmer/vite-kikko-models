import { MikroORM } from "@mikro-orm/core";
import { expect, it } from "vitest";
import { z } from "zod";
import { defineZodEntity } from "./ZodEntity";
import { zodModelToMikroOrmEntitySchema } from "./zodModelToMikroOrmEntitySchema";

import { KikkoInMemoryMigrationGenerator } from "./KikkoMigrationGenerator";
import { qb, getSqlFromCompiledQuery } from "../db-client";

it("zodModelToMikroOrmEntitySchema", async () => {
    const NoteModel = defineZodEntity(
        "Note",
        z.object({ id: z.number(), title: z.string(), content: z.string() })
    ).updateProperty("id", { primary: true });
    const AuthorModel = defineZodEntity(
        "Author",
        z.object({ id: z.number(), name: z.string(), lastname: z.string() })
    ).updateProperty("id", { primary: true });

    const NoteModelWithRelations = NoteModel.manyToOne("author", AuthorModel);
    const AuthorModelWithRelations = AuthorModel.oneToMany("notes", NoteModel);

    // AuthorModelWithRelations.schema.shape.notes._def
    // AuthorModelWithRelations.schema._def.shape().notes._type.schema
    // AuthorModelWithRelations.schema.shape.notes;
    // AuthorModel.schema._def.shape().

    // expect(NotesModelWithRelations.name).toBe("NotesModelWithRelations")
    // NotesModelWithRelations.shape.relations.shape.author._type.shape.id
    // NotesModelWithRelations.shape.author._type.shape.id

    expect(Object.keys(NoteModelWithRelations.schema.shape)).toMatchInlineSnapshot(`
      [
          "id",
          "title",
          "content",
          "author",
      ]
    `);

    expect(NoteModelWithRelations.metadata).toMatchInlineSnapshot(`
      {
          "name": "Note",
          "properties": {
              "author": {
                  "entity": "Author",
                  "reference": "m:1",
              },
              "id": {
                  "primary": true,
              },
          },
      }
    `);

    const NoteEntitySchema = zodModelToMikroOrmEntitySchema(NoteModelWithRelations);

    expect(NoteEntitySchema.meta.properties).toMatchInlineSnapshot(`
      {
          "author": {
              "entity": "Author",
              "reference": "m:1",
          },
          "content": {
              "type": "string",
          },
          "id": {
              "primary": true,
              "type": "number",
          },
          "title": {
              "type": "string",
          },
      }
    `);

    const AuthorEntitySchema = zodModelToMikroOrmEntitySchema(AuthorModelWithRelations);
    expect(AuthorEntitySchema.meta.properties).toMatchInlineSnapshot(`
      {
          "id": {
              "primary": true,
              "type": "number",
          },
          "lastname": {
              "type": "string",
          },
          "name": {
              "type": "string",
          },
          "notes": {
              "entity": "Note",
              "reference": "1:m",
          },
      }
    `);

    const orm = await MikroORM.init({
        dbName: ":memory:",
        type: "sqlite",
        entities: [NoteEntitySchema, AuthorEntitySchema],
        migrations: {
            generator: KikkoInMemoryMigrationGenerator,
            snapshot: false,
        },
    });

    const migrator = orm.getMigrator();
    const initialMigration = await migrator.createMigration();
    expect(initialMigration.diff).toMatchInlineSnapshot(`
      {
          "down": [],
          "up": [
              "create table \`author\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`lastname\` text not null);",
              "",
              "create table \`note\` (\`id\` integer not null primary key autoincrement, \`title\` text not null, \`content\` text not null, \`author_id\` integer not null, constraint \`note_author_id_foreign\` foreign key(\`author_id\`) references \`author\`(\`id\`) on update cascade);",
              "create index \`note_author_id_index\` on \`note\` (\`author_id\`);",
          ],
      }
    `);
    await orm.close(true);

    const query = qb
        .selectFrom("note")
        .select(["content", "title"])
        .where("author_id", "=", 1)
        .where("content", "like", "123")
        .orWhere("title", "not ilike", "oui")
        .compile();
    expect(query.sql).toMatchInlineSnapshot(
        '"select "content", "title" from "note" where "author_id" = ? and "content" like ? or "title" not ilike ?"'
    );
    expect(query.parameters).toMatchInlineSnapshot(`
      [
          1,
          "123",
          "oui",
      ]
    `);
    expect(getSqlFromCompiledQuery(query)).toMatchInlineSnapshot(
        '"select "content", "title" from "note" where "author_id" = 1 and "content" like 123 or "title" not ilike oui"'
    );
    //   await migrator.createMigration(); // creates file Migration20191019195930.ts
    //   await migrator.up(); // runs migrations up to the latest
    //   await migrator.up('name'); // runs only given migration, up
    //   await migrator.up({ to: 'up-to-name' }); // runs migrations up to given version
    //   await migrator.down(); // migrates one step down
    //   await migrator.down('name'); // runs only given migration, down
    //   await migrator.down({ to: 'down-to-name' }); // runs migrations down to given version
    //   await migrator.down({ to: 0 }); // migrates down to the first version
});
