// Copyright (c) 2019 Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


import { TypeAssertion,
         TypeAssertionMap,
         TypeAssertionSetValue,
         AssertionSymlink,
         SymbolResolverOperators,
         SymbolResolverContext } from '../types';
import * as operators            from '../operators';



function mergeTypeAndSymlink(ty: TypeAssertion, link: AssertionSymlink): TypeAssertion {
    const link2 = {...link};
    delete link2.kind;
    delete link2.symlinkTargetName;
    return ({...ty, ...link2} as any as TypeAssertion);
}


function updateSchema(original: TypeAssertion, schema: TypeAssertionMap, ty: TypeAssertion, typeName: string | undefined) {
    if (typeName && schema.has(typeName)) {
        const z: TypeAssertionSetValue = schema.get(typeName) as TypeAssertionSetValue;
        if (z.ty === original) {
            schema.set(typeName, {...z, ty, resolved: true});
        }
    }
    return ty;
}


export function resolveSymbols(schema: TypeAssertionMap, ty: TypeAssertion, ctx: SymbolResolverContext): TypeAssertion {
    const ctx2 = {...ctx, nestLevel: ctx.nestLevel + 1};
    switch (ty.kind) {
    case 'symlink':
        {
            const x = schema.get(ty.symlinkTargetName);
            if (! x) {
                throw new Error(`Undefined symbol '${ty.symlinkTargetName}' is referred.`);
            }
            if (0 <= ctx.symlinkStack.findIndex(s => s === ty.symlinkTargetName)) {
                return ty;
            }
            return (
                resolveSymbols(
                    schema,
                    mergeTypeAndSymlink(x.ty, ty),
                    {...ctx2, symlinkStack: [...ctx2.symlinkStack, ty.symlinkTargetName]},
                )
            );
        }
    case 'repeated':
        return updateSchema(ty, schema, {
            ...ty,
            repeated: resolveSymbols(schema, ty.repeated, ctx2),
        }, ty.typeName);
    case 'spread':
        return updateSchema(ty, schema, {
            ...ty,
            spread: resolveSymbols(schema, ty.spread, ctx2),
        }, ty.typeName);
    case 'sequence':
        return updateSchema(ty, schema, {
            ...ty,
            sequence: ty.sequence.map(x => resolveSymbols(schema, x, ctx2)),
        }, ty.typeName);
    case 'one-of':
        return updateSchema(ty, schema, {
            ...ty,
            oneOf: ty.oneOf.map(x => resolveSymbols(schema, x, ctx2)),
        }, ty.typeName);
    case 'optional':
        return updateSchema(ty, schema, {
            ...ty,
            optional: resolveSymbols(schema, ty.optional, ctx2),
        }, ty.typeName);
    case 'object':
        {
            if (0 < ctx.nestLevel && ty.typeName && 0 <= ctx.symlinkStack.findIndex(s => s === ty.typeName)) {
                if (schema.has(ty.typeName)) {
                    const z = schema.get(ty.typeName) as TypeAssertionSetValue;
                    if (z.resolved) {
                        return z.ty;
                    }
                }
            }

            const baseSymlinks = ty.baseTypes?.filter(x => x.kind === 'symlink') as AssertionSymlink[];
            if (baseSymlinks && baseSymlinks.length > 0) {
                const exts = baseSymlinks
                    .map(x => resolveSymbols(schema, x, ctx2))
                    .filter(x => x.kind === 'object');
                // TODO: if x.kind !== 'object' items exist -> error?
                const d2 = resolveSymbols(
                    schema,
                    operators.derived({
                        ...ty,
                        ...(ty.baseTypes ? {
                            baseTypes: ty.baseTypes.filter(x => x.kind !== 'symlink'),
                        } : {}),
                    }, ...exts),
                    ty.typeName ?
                        {...ctx2, symlinkStack: [...ctx2.symlinkStack, ty.typeName]} : ctx2,
                );
                return updateSchema(ty, schema, {
                    ...ty,
                    ...d2,
                }, ty.typeName);
            } else {
                return updateSchema(ty, schema, {
                    ...{
                        ...ty,
                        members: ty.members
                            .map(x => [
                                x[0],
                                resolveSymbols(schema, x[1], ty.typeName ?
                                    {...ctx2, symlinkStack: [...ctx2.symlinkStack, ty.typeName]} : ctx2),
                                ...x.slice(2),
                            ] as any),
                    },
                    ...(ty.additionalProps && 0 < ty.additionalProps.length ? {
                        additionalProps: ty.additionalProps
                            .map(x => [
                                x[0],
                                resolveSymbols(schema, x[1], ty.typeName ?
                                    {...ctx2, symlinkStack: [...ctx2.symlinkStack, ty.typeName]} : ctx2),
                                ...x.slice(2),
                            ] as any),
                    } : {}),
                }, ty.typeName);
            }
        }
    case 'operator':
        if (ctx2.operators) {
            const ctx3 = ty.typeName ?
                {...ctx2, symlinkStack: [...ctx2.symlinkStack, ty.typeName]} : ctx2;
            const operands = ty.operands.map(x => {
                if (typeof x === 'object' && x.kind) {
                    return resolveSymbols(schema, x, ctx3);
                }
                return x;
            });
            if (0 < operands.filter(x => x && typeof x === 'object' &&
                    (x.kind === 'symlink' || x.kind === 'operator')).length) {
                throw new Error(`Unresolved type operator is found: ${ty.operator}`);
            }
            if (! ctx2.operators[ty.operator]) {
                throw new Error(`Undefined type operator is found: ${ty.operator}`);
            }
            const ty2 = {...ty};
            delete ty2.operator;
            delete ty2.operands;
            return updateSchema(
                ty, schema,
                {
                    ...ty2,
                    ...resolveSymbols(schema, ctx2.operators[ty.operator](...operands), ctx3),
                },
                ty.typeName,
            );
        } else {
            return ty;
        }
    default:
        return ty;
    }
}


const resolverOps: SymbolResolverOperators = {
    picked: operators.picked,
    omit: operators.omit,
    partial: operators.partial,
    intersect: operators.intersect,
    subtract: operators.subtract,
};


export function resolveSchema(schema: TypeAssertionMap): TypeAssertionMap {
    for (const ent of schema.entries()) {
        const ty = resolveSymbols(schema, ent[1].ty, {nestLevel: 0, symlinkStack: [ent[0]], operators: resolverOps});
        ent[1].ty = ty;
    }

    return schema;
}
