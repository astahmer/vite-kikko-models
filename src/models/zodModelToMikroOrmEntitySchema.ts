/* eslint-disable import/no-unused-modules */
/* eslint-disable sonarjs/no-duplicated-branches */
import type {
    Constructor,
    EmbeddedOptions,
    EntityName,
    EnumOptions,
    ManyToManyOptions,
    ManyToOneOptions,
    OneToManyOptions,
    OneToOneOptions,
    PropertyOptions,
    ReferenceType,
    Type,
} from "@mikro-orm/core";
import { EntitySchema } from "@mikro-orm/core";
import { isType } from "pastable";
import type { ZodDefaultDef, ZodLazyDef, ZodTypeDef } from "zod";
import { ZodFirstPartyTypeKind } from "zod";

import { type ZodEntity } from "./createEntityScope";

export const zodModelToMikroOrmEntitySchema = (entity: ZodEntity<any>): EntitySchema => {
    // console.log(entity.schema._def.shape());
    return new EntitySchema<any>({
        name: entity.name,
        properties: Object.fromEntries(
            Object.entries(entity.schema._def.shape()).map(([propName, propSchema]) => [
                propName,
                {
                    ...parseZodDef({
                        def: (propSchema as any)._def as ZodTypeDef,
                        propName,
                        entity,
                    }),
                    ...entity.metadata.properties[propName],
                },
            ])
        ),
    });
};

// Taken from https://github.com/mikro-orm/mikro-orm/blob/15de5b8a5153a18807a07c3cd72767db20f483b3/packages/core/src/metadata/EntitySchema.ts#L14-L23
type TypeType =
    | string
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | DateConstructor
    | ArrayConstructor
    | Constructor<Type<any>>;
type TypeDef<T> = { type: TypeType } | { customType: Type<any> } | { entity: string | (() => string | EntityName<T>) };

export type ManyToOneProp<T, O> = { reference: ReferenceType.MANY_TO_ONE | "m:1" } & TypeDef<T> &
    ManyToOneOptions<T, O>;
export type OneToOneProp<T, O> = { reference: ReferenceType.ONE_TO_ONE | "1:1" } & TypeDef<T> & OneToOneOptions<T, O>;
export type OneToManyProp<T, O> = { reference: ReferenceType.ONE_TO_MANY | "1:m" } & TypeDef<T> &
    OneToManyOptions<T, O>;
export type ManyToManyProp<T, O> = { reference: ReferenceType.MANY_TO_MANY | "m:n" } & TypeDef<T> &
    ManyToManyOptions<T, O>;
export type RelationProp<T, O> = ManyToOneProp<T, O> | OneToOneProp<T, O> | OneToManyProp<T, O> | ManyToManyProp<T, O>;

type EmbeddedProp<T, O> = { reference: ReferenceType.EMBEDDED | "embedded" } & TypeDef<T> &
    EmbeddedOptions &
    PropertyOptions<O>;
type EnumProp<O> = { enum: true } & EnumOptions<O>;
export type BasicProp<T, O> = TypeDef<T> & PropertyOptions<O>;

export type Property<T, O> = RelationProp<T, O> | EmbeddedProp<T, O> | EnumProp<O> | BasicProp<T, O>;
// end of MikroORM types

const parseString = (): Property<string, any> => ({ type: "string" });
const parseNumber = (): Property<string, any> => ({ type: "number" });
const parseBoolean = (): Property<string, any> => ({ type: "boolean" });
const parseDate = (): Property<string, any> => ({ type: "Date" });
// const parseUnknown = (): Property<string, any> => ({ type: "string", nullable: true });
const parseObject = ({ def, propName, entity }: SelectParserArgs): Property<any, any> => {
    return {
        reference: "1:1",
        entity: entity.ctx!.relationshipsMap.get(`${entity.name}.${propName}`)!,
    };
};

const parseNext = ({ def, propName, entity }: SelectParserArgs) =>
    parseZodDef({ def: (def as any).type._def, propName, entity });
const parseInner = ({ def, propName, entity }: SelectParserArgs) =>
    parseZodDef({ def: (def as ZodDefaultDef).innerType._def, propName, entity });

const parseArray = ({ def, propName, entity }: SelectParserArgs): Property<any[], any> | undefined => {
    const prop = parseZodDef({ def: (def as any).type._def, propName, entity });
    if (!prop) return unsupported((def as any).typeName);

    if (prop.type) {
        return { type: prop.type as any, array: true };
    }

    // if (prop.enum) {
    //     return { enum: prop.enum, items: () => Role, default: [Role.User], array: true };
    // }

    if (isType<RelationProp<any, any>>(prop, "reference" in prop)) {
        // leave reference as is since we can't know if it's a OneToMany or ManyToMany
        return { entity: prop.entity } as RelationProp<any, any>;
    }
};

type SelectParserArgs = {
    def: ZodTypeDef;
    propName: string;
    entity: ZodEntity<any>;
};

const parseZodDef = ({ def, propName, entity }: SelectParserArgs): undefined | Property<any, any> => {
    const typeName = (def as any).typeName as ZodFirstPartyTypeKind;

    switch (typeName) {
        case ZodFirstPartyTypeKind.ZodString:
            return parseString();
        case ZodFirstPartyTypeKind.ZodNumber:
        case ZodFirstPartyTypeKind.ZodBigInt:
            return parseNumber();
        case ZodFirstPartyTypeKind.ZodObject:
        case ZodFirstPartyTypeKind.ZodMap:
            return parseObject({ def, propName, entity });
        case ZodFirstPartyTypeKind.ZodBoolean:
            return parseBoolean();
        case ZodFirstPartyTypeKind.ZodDate:
            return parseDate();
        case ZodFirstPartyTypeKind.ZodArray:
        case ZodFirstPartyTypeKind.ZodSet:
        case ZodFirstPartyTypeKind.ZodTuple:
            // currentPath.push(path);
            return parseArray({ def, propName, entity });
        case ZodFirstPartyTypeKind.ZodUnion:
        case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
            // TODO   return parseUnionDef(def, refs);
            return;
        case ZodFirstPartyTypeKind.ZodIntersection:
            // TODO   return parseIntersectionDef(def, refs);
            return;
        case ZodFirstPartyTypeKind.ZodRecord:
            // TODO   return parseRecordDef(def, refs);
            return;
        case ZodFirstPartyTypeKind.ZodLiteral:
            // TODO   return parseLiteralDef(def, refs);
            return;
        case ZodFirstPartyTypeKind.ZodEnum:
            // TODO   return parseEnumDef(def);
            return;
        case ZodFirstPartyTypeKind.ZodNativeEnum:
            // TODO   return parseNativeEnumDef(def);
            return;
        case ZodFirstPartyTypeKind.ZodLazy:
            return parseZodDef({ def: (def as ZodLazyDef).getter()._def, propName, entity });
        case ZodFirstPartyTypeKind.ZodDefault:
            return parseInner({ def, propName, entity });
        case ZodFirstPartyTypeKind.ZodNullable:
        case ZodFirstPartyTypeKind.ZodOptional:
            return parseInner({ def, propName, entity });
        case ZodFirstPartyTypeKind.ZodBranded:
        case ZodFirstPartyTypeKind.ZodUndefined:
            return parseNext({ def, propName, entity });
        // ignore those
        case ZodFirstPartyTypeKind.ZodNull:
        case ZodFirstPartyTypeKind.ZodNaN:
        case ZodFirstPartyTypeKind.ZodNever:
        case ZodFirstPartyTypeKind.ZodAny:
        case ZodFirstPartyTypeKind.ZodUnknown:
        case ZodFirstPartyTypeKind.ZodVoid:
        case ZodFirstPartyTypeKind.ZodPromise:
        case ZodFirstPartyTypeKind.ZodEffects:
        case ZodFirstPartyTypeKind.ZodFunction:
            return;
        default:
            return;
    }
};

const unsupported = (typeName: string) => {
    throw new UnsupportedTypeError(typeName);
};

class UnsupportedTypeError extends Error {
    constructor(type: string) {
        super(`Unsupported type: ${type}`);
    }
}
