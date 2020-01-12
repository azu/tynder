// Copyright (c) 2019 Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


import { TypeAssertion,
         TypeAssertionMap } from '../types';
import * as JsonSchema      from '../types/json-schema-types';



function addMetaInfo(a: JsonSchema.JsonSchemaAssertion, ty: TypeAssertion) {
    if (ty.docComment) {
        a.description = ty.docComment;
    }
    return a;
}

function generateJsonSchemaInner(ty: TypeAssertion, nestLevel: number): JsonSchema.JsonSchemaAssertion {
    if (0 < nestLevel && ty.typeName) {
        return addMetaInfo({
            $ref: `#/definitions/${ty.typeName}`,
            // TODO: preserve informations (doc comments, name, typeName, ...)
        }, ty);
    }

    // const ret: TypeAssertion = {...ty};
    switch (ty.kind) {
    case 'symlink':
        {
            const ret: JsonSchema.JsonSchemaRefAssertion = {
                $ref: `#/definitions/${ty.symlinkTargetName}`,
            };
            return addMetaInfo(ret, ty);
        }
    case 'repeated':
        {
            const ret: JsonSchema.JsonSchemaArrayAssertion = {
                type: 'array',
                items: generateJsonSchemaInner(ty.repeated, nestLevel + 1),
            };
            if (typeof ty.min === 'number') {
                ret.minItems = ty.min;
            }
            if (typeof ty.max === 'number') {
                ret.maxItems = ty.max;
            }
            return addMetaInfo(ret, ty);
        }
    case 'sequence':
        {
            const ret: JsonSchema.JsonSchemaArrayAssertion = {
                type: 'array',
                items: { anyOf: ty.sequence.map(x => generateJsonSchemaInner(x, nestLevel + 1)) },
            };
            return addMetaInfo(ret, ty);
        }
    case 'spread':
        {
            return generateJsonSchemaInner(ty.spread, nestLevel + 1);
        }
    case 'one-of':
        {
            const ret: JsonSchema.JsonSchemaAnyOfAssertion = {
                anyOf: ty.oneOf.map(x => generateJsonSchemaInner(x, nestLevel + 1)),
            };
            return addMetaInfo(ret, ty);
        }
    case 'optional':
        {
            const ret: JsonSchema.JsonSchemaOneOfAssertion = {
                oneOf: [
                    generateJsonSchemaInner(ty.optional, nestLevel + 1),
                    {type: 'null'},
                ],
            };
            return addMetaInfo(ret, ty);
        }
    case 'enum':
        {
            const ret: JsonSchema.JsonSchemaTsEnumAssertion = {
                type: ['string', 'number'],
                enum: ty.values.map(x => x[1]),
            };
            return addMetaInfo(ret, ty);
        }
    case 'object':
        {
            const properties: JsonSchema.JsonSchemaObjectPropertyAssertion = {};
            for (const m of ty.members) {
                properties[m[0]] = generateJsonSchemaInner(m[1], nestLevel + 1);
            }
            const ret: JsonSchema.JsonSchemaObjectAssertion = {
                type: 'object',
                properties,
            };
            return addMetaInfo(ret, ty);
        }
    case 'primitive':
        {
            switch (ty.primitiveName) {
            case 'null': case 'undefined':
                {
                    const ret: JsonSchema.JsonSchemaNullAssertion = {
                        type: 'null',
                    };
                    return addMetaInfo(ret, ty);
                }
            case 'number': case 'bigint':
                {
                    const ret: JsonSchema.JsonSchemaNumberAssertion = {
                        type: 'number',
                    };
                    if (typeof ty.minValue === 'number') {
                        ret.minimum = ty.minValue;
                    }
                    if (typeof ty.maxValue === 'number') {
                        ret.maximum = ty.maxValue;
                    }
                    if (typeof ty.greaterThanValue === 'number') {
                        ret.exclusiveMinimum = ty.greaterThanValue;
                    }
                    if (typeof ty.lessThanValue === 'number') {
                        ret.exclusiveMaximum = ty.lessThanValue;
                    }
                    return addMetaInfo(ret, ty);
                }
            case 'string':
                {
                    const ret: JsonSchema.JsonSchemaStringAssertion = {
                        type: 'string',
                    };
                    if (typeof ty.minLength === 'number') {
                        ret.minLength = ty.minLength;
                    }
                    if (typeof ty.maxLength === 'number') {
                        ret.maxLength = ty.maxLength;
                    }
                    if (ty.pattern) {
                        ret.pattern = ty.pattern.source;
                    }
                    return addMetaInfo(ret, ty);
                }
            case 'boolean':
                {
                    const ret: JsonSchema.JsonSchemaBooleanAssertion = {
                        type: 'boolean',
                    };
                    return addMetaInfo(ret, ty);
                }
            }
        }
    case 'primitive-value':
        {
            switch (typeof ty.value) {
            case 'number':
                {
                    const ret: JsonSchema.JsonSchemaNumberValueAssertion = {
                        type: 'number',
                        enum: [ty.value],
                    };
                    return addMetaInfo(ret, ty);
                }
            case 'bigint':
                {
                    const ret: JsonSchema.JsonSchemaBigintNumberValueAssertion = {
                        type: 'number',
                        enum: [ty.value.toString()],
                    };
                    return addMetaInfo(ret, ty);
                }
            case 'string':
                {
                    const ret: JsonSchema.JsonSchemaStringValueAssertion = {
                        type: 'string',
                        enum: [ty.value],
                    };
                    return addMetaInfo(ret, ty);
                }
            case 'boolean':
                {
                    const ret: JsonSchema.JsonSchemaBooleanValueAssertion = {
                        type: 'boolean',
                        enum: [ty.value],
                    };
                    return addMetaInfo(ret, ty);
                }
            default:
                throw new Error(`Unknown primitive-value assertion: ${typeof ty.value}`);
            }
        }
    case 'never':
        {
            const ret: JsonSchema.JsonSchemaNullAssertion = {
                type: 'null',
            };
            return addMetaInfo(ret, ty);
        }
    case 'any':
        {
            const ret: JsonSchema.JsonSchemaAnyAssertion = {
                type: ['null', 'number', 'string', 'boolean', 'array', 'object'],
            };
            return addMetaInfo(ret, ty);
        }
    case 'unknown':
        {
            const ret: JsonSchema.JsonSchemaUnknownAssertion = {
                type: ['number', 'string', 'boolean', 'array', 'object'],
            };
            return addMetaInfo(ret, ty);
        }
    default:
        throw new Error(`Unknown type assertion: ${(ty as any).kind}`);
    }
}


export function generateJsonSchema(types: TypeAssertionMap, asTs?: boolean): string {
    const ret: JsonSchema.JsonSchemaRootAssertion = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        definitions: {},
    };
    for (const ty of types.entries()) {
        if (ty[1].ty.noOutput) {
            continue;
        }
        (ret.definitions as object)[ty[0]] = generateJsonSchemaInner(ty[1].ty, 0);
    }

    if (asTs) {
        return `\nconst schema = ${JSON.stringify(ret, null, 2)};\nexport default schema;\n`;
    } else {
        return JSON.stringify(ret, null, 2);
    }
}
