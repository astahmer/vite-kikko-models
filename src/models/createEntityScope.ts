/* eslint-disable import/no-unused-modules */
import type { ManyToManyOptions, ManyToOneOptions, OneToManyOptions, OneToOneOptions } from "@mikro-orm/core";
import { type EntityMetadata, type EntityProperty } from "@mikro-orm/core";
import { z } from "zod";

import type {
    BasicProp,
    ManyToManyProp,
    ManyToOneProp,
    OneToManyProp,
    OneToOneProp,
    Property,
} from "./zodModelToMikroOrmEntitySchema";

export const createEntityScope = () => {
    const entityMap = new Map<string, any>();
    const relationshipsMap = new Map<string, string>();
    const ctx = { entityMap, relationshipsMap } as ZodEntityContext;

    // TODO extract + delete unused ctx
    const defineZodEntity = <Schema extends z.AnyZodObject>(
        name: string,
        schema: Schema,
        metadata?: Omit<EntityMetadata<Schema["shape"]>, "name" | "properties">
    ) => {
        entityMap.set(name, schema);

        return new ZodEntity<Schema>(name, schema, metadata, ctx);
    };

    return { defineZodEntity, ctx };
};

export class ZodEntity<Schema extends z.AnyZodObject> {
    public readonly metadata: EntityMetadata<Schema["shape"]>;

    constructor(
        public name: string,
        public schema: Schema,
        metadata?: Omit<EntityMetadata<Schema["shape"]>, "name" | "properties"> &
            Pick<Partial<EntityMetadata<Schema["shape"]>>, "properties">,
        public readonly ctx?: ZodEntityContext
    ) {
        this.metadata = { ...metadata, name, properties: metadata?.properties ?? {} } as EntityMetadata<
            Schema["shape"]
        >;
    }

    updateProperty<
        PropName extends keyof typeof this.metadata.properties,
        Options extends Partial<Property<Schema["shape"], any>> = Partial<BasicProp<Schema["shape"], any>>
    >(propName: PropName, options: Options) {
        this.metadata.properties[propName] = { ...this.metadata.properties[propName], ...options };

        return this;
    }

    updateProperties<OptionMap extends Partial<Record<keyof typeof this.metadata.properties, Partial<EntityProperty>>>>(
        options: OptionMap
    ) {
        Object.entries(options).forEach(([propName, options]) => {
            this.updateProperty(propName as keyof typeof this.metadata.properties, options as Partial<EntityProperty>);
        });

        return this;
    }

    // ZodEntity<Schema & { [K in PropName]: Relation["schema"] }>
    oneToOne<
        PropName extends string,
        Relation extends ZodEntity<any>,
        Options extends Partial<OneToOneOptions<Relation["schema"]["shape"], any>>
    >(propName: PropName, relation: Relation, options?: Options) {
        // @ts-expect-error
        this.schema = this.schema.extend({ [propName]: relation.schema });

        if (this.ctx) {
            this.ctx.relationshipsMap.set(`${this.name}.${propName}`, relation.name);
        }

        this.updateProperty(propName, { ...options, reference: "1:1", entity: relation.name } as OneToOneProp<
            Relation["schema"]["shape"],
            Options
        >);
        return this as unknown as ZodEntity<z.ZodObject<Schema["shape"] & { [K in PropName]: Relation["schema"] }>>;
    }

    manyToOne<
        PropName extends string,
        Relation extends ZodEntity<any>,
        Options extends Partial<ManyToOneOptions<Relation["schema"]["shape"], any>>
    >(propName: PropName, relation: Relation, options?: Options) {
        // @ts-expect-error
        this.schema = this.schema.extend({ [propName]: relation.schema });

        if (this.ctx) {
            this.ctx.relationshipsMap.set(`${this.name}.${propName}`, relation.name);
        }

        this.updateProperty(propName, { ...options, reference: "m:1", entity: relation.name } as ManyToOneProp<
            Relation["schema"]["shape"],
            Options
        >);
        return this as unknown as ZodEntity<z.ZodObject<Schema["shape"] & { [K in PropName]: Relation["schema"] }>>;
    }

    manyToMany<
        PropName extends string,
        Relation extends ZodEntity<any>,
        Options extends Partial<ManyToManyOptions<Relation["schema"]["shape"], any>>
    >(propName: PropName, relation: Relation, options?: Options) {
        // @ts-expect-error
        this.schema = this.schema.extend({ [propName]: z.array(relation.schema) });

        if (this.ctx) {
            this.ctx.relationshipsMap.set(`${this.name}.${propName}`, relation.name);
        }

        this.updateProperty(propName, { ...options, reference: "m:n", entity: relation.name } as ManyToManyProp<
            Relation["schema"]["shape"],
            Options
        >);
        return this as unknown as ZodEntity<
            z.ZodObject<Schema["shape"] & { [K in PropName]: z.ZodArray<Relation["schema"]> }>
        >;
    }

    oneToMany<
        PropName extends string,
        Relation extends ZodEntity<any>,
        Options extends Partial<OneToManyOptions<Relation["schema"]["shape"], any>>
    >(propName: PropName, relation: Relation, options?: Options) {
        // @ts-expect-error
        this.schema = this.schema.extend({ [propName]: z.array(relation.schema) });

        if (this.ctx) {
            this.ctx.relationshipsMap.set(`${this.name}.${propName}`, relation.name);
        }

        this.updateProperty(propName, { ...options, reference: "1:m", entity: relation.name } as OneToManyProp<
            Relation["schema"]["shape"],
            Options
        >);
        return this as unknown as ZodEntity<
            z.ZodObject<Schema["shape"] & { [K in PropName]: z.ZodArray<Relation["schema"]> }>
        >;
    }
}

const user = new ZodEntity("user", z.object({ id: z.number(), name: z.string() }));
const note = new ZodEntity("note", z.object({ id: z.number(), title: z.string(), content: z.string() }));

const withNotes = user.oneToMany("notes", note);
// withNotes.schema.shape.notes._def.type.shape.title

user.updateProperty("id", { primary: true });
// oui.updateProperties({ id: { primary: true }, name: { nullable: true } });
const updated = user.updateProperties({ id: { primary: true } }).manyToMany("notes", note, { nullable: true });
// updated.schema.shape.notes._def.type.title;ce
const withRelation = updated.oneToMany("notes", note);
// withRelation.schema
// const aaa: ZodEntity<z.ZodObject<{ notes: z.ZodArray<z.ZodString> }>> = withRelation;
// const bbbb: ZodEntity<{ notes: z.ZodArray<z.ZodString> }> = withRelation;
// bbbb.schema.shape.notes
// aaa.schema.shape.notes

export type EntityScope = ReturnType<typeof createEntityScope>;

type ZodEntityContext = {
    entityMap: Map<string, any>;
    relationshipsMap: Map<string, string>;
};
