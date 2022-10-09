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

export const defineZodEntity = <Schema extends z.AnyZodObject>(
    name: string,
    schema: Schema,
    metadata?: Omit<EntityMetadata<Schema["shape"]>, "name" | "properties">
) => {
    return new ZodEntity<Schema>(name, schema, metadata);
};

export class ZodEntity<Schema extends z.AnyZodObject> {
    public readonly metadata: EntityMetadata<Schema["shape"]>;

    constructor(
        public name: string,
        public schema: Schema,
        metadata?: Omit<EntityMetadata<Schema["shape"]>, "name" | "properties"> &
            Pick<Partial<EntityMetadata<Schema["shape"]>>, "properties">
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

        this.updateProperty(propName, { ...options, reference: "1:m", entity: relation.name } as OneToManyProp<
            Relation["schema"]["shape"],
            Options
        >);
        return this as unknown as ZodEntity<
            z.ZodObject<Schema["shape"] & { [K in PropName]: z.ZodArray<Relation["schema"]> }>
        >;
    }
}
