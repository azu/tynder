
import { TypeAssertion,
         ValidationContext } from '../types';
import { validate,
         getType }           from '../validator';
import { compile }           from '../compiler';



describe("compiler-2", function() {
    it("compiler-interface-1", function() {
        const schema = compile(`
            type X = string;
            interface Foo {
                a1: number;
                a2: bigint;
                a3: string;
                a4: boolean;
                a5: null;
                a6: undefined;
                a7: X;
            }
        `);
        {
            expect(Array.from(schema.keys())).toEqual([
                'X', 'Foo',
            ]);
        }
        {
            const rhs: TypeAssertion = {
                name: 'Foo',
                typeName: 'Foo',
                kind: 'object',
                members: [
                    ['a1', {
                        name: 'a1',
                        kind: 'primitive',
                        primitiveName: 'number',
                    }],
                    ['a2', {
                        name: 'a2',
                        kind: 'primitive',
                        primitiveName: 'bigint',
                    }],
                    ['a3', {
                        name: 'a3',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }],
                    ['a4', {
                        name: 'a4',
                        kind: 'primitive',
                        primitiveName: 'boolean',
                    }],
                    ['a5', {
                        name: 'a5',
                        kind: 'primitive',
                        primitiveName: 'null',
                    }],
                    ['a6', {
                        name: 'a6',
                        kind: 'primitive',
                        primitiveName: 'undefined',
                    }],
                    ['a7', {
                        name: 'a7',
                        typeName: 'X',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }],
                ],
            };
            const ty = getType(schema, 'Foo');
            expect(ty).toEqual(rhs);
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual({value: v});
            }
            {
                const v = {
                    // a1
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    // a2
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    // a3
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    // a4
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    // a5
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    // a6
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    // a7
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: BigInt(99), // wrong
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: 99, // wrong
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 7, // wrong
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: '', // wrong
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: void 0, // wrong
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: null, // wrong
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: 99, // wrong
                };
                expect(validate<any>(v, ty)).toEqual(null);
            }
        }
    });
    it("compiler-interface-2 (optional types)", function() {
        const schema = compile(`
            type X = string;
            interface Foo {
                a1?: number;
                a2?: bigint;
                a3?: string;
                a4?: boolean;
                a5?: null;
                a6?: undefined;
                a7?: X;
            }
        `);
        {
            expect(Array.from(schema.keys())).toEqual([
                'X', 'Foo',
            ]);
        }
        {
            const rhs: TypeAssertion = {
                name: 'Foo',
                typeName: 'Foo',
                kind: 'object',
                members: [
                    ['a1', {
                        name: 'a1',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'number',
                        }
                    }],
                    ['a2', {
                        name: 'a2',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'bigint',
                        }
                    }],
                    ['a3', {
                        name: 'a3',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'string',
                        }
                    }],
                    ['a4', {
                        name: 'a4',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'boolean',
                        }
                    }],
                    ['a5', {
                        name: 'a5',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'null',
                        }
                    }],
                    ['a6', {
                        name: 'a6',
                        kind: 'optional',
                        optional: {
                            kind: 'primitive',
                            primitiveName: 'undefined',
                        }
                    }],
                    ['a7', {
                        name: 'a7',
                        typeName: 'X',
                        kind: 'optional',
                        optional: {
                            name: 'X',
                            typeName: 'X',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }
                    }],
                ],
            };
            const ty = getType(schema, 'Foo');
            expect(ty).toEqual(rhs);
            {
                const v = {
                    a1: 3,
                    a2: BigInt(5),
                    a3: 'C',
                    a4: true,
                    a5: null,
                    a6: void 0,
                    a7: '',
                };
                expect(validate<any>(v, ty)).toEqual({value: v});
            }
            {
                const v = {};
                expect(validate<any>(v, ty)).toEqual({value: v});
            }
        }
    });
    it("compiler-interface-3 (extends)", function() {
        const schemas = [compile(`
            type X = string;
            interface P {
                a1: number;
                a2: bigint;
            }
            interface Q {
                a3: string;
                a4: boolean;
            }
            interface R extends Q {
                a5: null;
                a6: undefined;
            }
            interface Foo extends P, R {
                a7: X;
            }
        `), compile(`
            interface Foo extends P, R {
                a7: X;
            }
            interface R extends Q {
                a5: null;
                a6: undefined;
            }
            interface Q {
                a3: string;
                a4: boolean;
            }
            interface P {
                a1: number;
                a2: bigint;
            }
            type X = string;
        `)];
        {
            expect(Array.from(schemas[0].keys())).toEqual([
                'X', 'P', 'Q', 'R', 'Foo',
            ]);
        }
        {
            expect(Array.from(schemas[1].keys())).toEqual([
                'Foo', 'R', 'Q', 'P', 'X',
            ]);
        }
        for (const schema of schemas) {
            {
                const tyP: TypeAssertion = {
                    name: 'P',
                    typeName: 'P',
                    kind: 'object',
                    members: [
                        ['a1', {
                            name: 'a1',
                            kind: 'primitive',
                            primitiveName: 'number',
                        }],
                        ['a2', {
                            name: 'a2',
                            kind: 'primitive',
                            primitiveName: 'bigint',
                        }],
                    ],
                };
                const tyQ: TypeAssertion = {
                    name: 'Q',
                    typeName: 'Q',
                    kind: 'object',
                    members: [
                        ['a3', {
                            name: 'a3',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }],
                        ['a4', {
                            name: 'a4',
                            kind: 'primitive',
                            primitiveName: 'boolean',
                        }],
                    ],
                };
                const tyR: TypeAssertion = {
                    name: 'R',
                    typeName: 'R',
                    kind: 'object',
                    baseTypes: [tyQ],
                    members: [
                        ...([
                            ['a5', {
                                name: 'a5',
                                kind: 'primitive',
                                primitiveName: 'null',
                            }],
                            ['a6', {
                                name: 'a6',
                                kind: 'primitive',
                                primitiveName: 'undefined',
                            }],
                        ] as any[]),
                        ...tyQ.members.map(x => [x[0], x[1], true]),
                    ],
                };
                const rhs: TypeAssertion = {
                    name: 'Foo',
                    typeName: 'Foo',
                    kind: 'object',
                    baseTypes: [tyP, tyR],
                    members: [
                        ...([
                            ['a7', {
                                name: 'a7',
                                typeName: 'X',
                                kind: 'primitive',
                                primitiveName: 'string',
                            }],
                        ] as any[]),
                        ...tyP.members.map(x => [x[0], x[1], true]),
                        ...tyR.members.map(x => [x[0], x[1], true]),
                    ],
                };
                const ty = getType(schema, 'Foo');
                expect(ty).toEqual(rhs);
                {
                    const v = {
                        a1: 3,
                        a2: BigInt(5),
                        a3: 'C',
                        a4: true,
                        a5: null,
                        a6: void 0,
                        a7: '',
                    };
                    expect(validate<any>(v, ty)).toEqual({value: v});
                }
            }
        }
    });
    it("compiler-interface-4 (recursive members (repeated))", function() {
        const schema = compile(`
            interface EntryBase {
                name: string;
            }
            interface File extends EntryBase {
                type: 'file';
            }
            interface Folder extends EntryBase {
                type: 'folder';
                entries: Entry[];
            }
            type Entry = File | Folder;
        `);
        {
            expect(Array.from(schema.keys())).toEqual([
                'EntryBase', 'File', 'Folder', 'Entry',
            ]);
        }
        {
            const tyBase: TypeAssertion = {
                name: 'EntryBase',
                typeName: 'EntryBase',
                kind: 'object',
                members: [
                    ['name', {
                        name: 'name',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }],
                ],
            };
            const tyEntry: TypeAssertion = {
                name: 'Entry',
                typeName: 'Entry',
                kind: 'one-of',
                oneOf: [{
                    name: 'File',
                    typeName: 'File',
                    kind: 'object',
                    baseTypes: [tyBase],
                    members: [
                        ['type', {
                            name: 'type',
                            kind: 'primitive-value',
                            value: 'file',
                        }],
                        ['name', {
                            name: 'name',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }, true],
                    ],
                }, { // replace it by 'rhs' later
                    name: 'Folder',
                    typeName: 'Folder',
                    kind: 'symlink',
                    symlinkTargetName: 'Folder',
                }],
            };
            const rhs: TypeAssertion = {
                name: 'Folder',
                typeName: 'Folder',
                kind: 'object',
                baseTypes: [tyBase],
                members: [
                    ['type', {
                        name: 'type',
                        kind: 'primitive-value',
                        value: 'folder',
                    }],
                    ['entries', {
                        name: 'entries',
                        kind: 'repeated',
                        min: null,
                        max: null,
                        repeated: {
                            name: 'Entry',
                            typeName: 'Entry',
                            kind: 'symlink',
                            symlinkTargetName: 'Entry',
                        }
                    }],
                    ['name', {
                        name: 'name',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }, true],
                ],
            };
            tyEntry.oneOf[1] = rhs;
            const ty = getType(schema, 'Folder');
            expect(ty).toEqual(rhs);
            expect(getType(schema, 'Entry')).toEqual(tyEntry);
            {
                const v = {
                    type: 'folder',
                    name: '/',
                    entries: [{
                        type: 'file',
                        name: 'a',
                    }, {
                        type: 'folder',
                        name: 'b',
                        entries: [{
                            type: 'file',
                            name: 'c',
                        }],
                    }],
                };
                try {
                    validate<any>(v, ty);
                    expect(0).toEqual(1);
                } catch (e) {
                    expect(e.message).toEqual('Unresolved symbol \'Entry\' is appeared.');
                }
                const ctx1: Partial<ValidationContext> = {};
                expect(() => validate<any>(v, ty, ctx1)).toThrow(); // unresolved symlink 'Entry'
                expect(ctx1.errors).toEqual([{
                    code: 'InvalidDefinition',
                    message: '"entries" of "Folder" type definition is invalid.',
                    dataPath: 'Folder.entries.(0:repeated).Entry',
                    constraints: {}
                }]);
                expect(validate<any>(v, ty, {schema})).toEqual({value: v});
            }
        }
    });
    it("compiler-interface-5 (recursive members (spread))", function() {
        const schema = compile(`
            interface EntryBase {
                name: string;
            }
            interface File extends EntryBase {
                type: 'file';
            }
            interface Folder extends EntryBase {
                type: 'folder';
                entries: [...<Entry>];
            }
            type Entry = File | Folder;
        `);
        {
            expect(Array.from(schema.keys())).toEqual([
                'EntryBase', 'File', 'Folder', 'Entry',
            ]);
        }
        {
            const tyBase: TypeAssertion = {
                name: 'EntryBase',
                typeName: 'EntryBase',
                kind: 'object',
                members: [
                    ['name', {
                        name: 'name',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }],
                ],
            };
            const tyEntry: TypeAssertion = {
                name: 'Entry',
                typeName: 'Entry',
                kind: 'one-of',
                oneOf: [{
                    name: 'File',
                    typeName: 'File',
                    kind: 'object',
                    baseTypes: [tyBase],
                    members: [
                        ['type', {
                            name: 'type',
                            kind: 'primitive-value',
                            value: 'file',
                        }],
                        ['name', {
                            name: 'name',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }, true],
                    ],
                }, { // replace it by 'rhs' later
                    name: 'Folder',
                    typeName: 'Folder',
                    kind: 'symlink',
                    symlinkTargetName: 'Folder',
                }],
            };
            const rhs: TypeAssertion = {
                name: 'Folder',
                typeName: 'Folder',
                kind: 'object',
                baseTypes: [tyBase],
                members: [
                    ['type', {
                        name: 'type',
                        kind: 'primitive-value',
                        value: 'folder',
                    }],
                    ['entries', {
                        name: 'entries',
                        kind: 'sequence',
                        sequence: [{
                            kind: 'spread',
                            min: null,
                            max: null,
                            spread: {
                                name: 'Entry',
                                typeName: 'Entry',
                                kind: 'symlink',
                                symlinkTargetName: 'Entry',
                            },
                        }]
                    }],
                    ['name', {
                        name: 'name',
                        kind: 'primitive',
                        primitiveName: 'string',
                    }, true],
                ],
            };
            tyEntry.oneOf[1] = rhs;
            const ty = getType(schema, 'Folder');
            expect(ty).toEqual(rhs);
            expect(getType(schema, 'Entry')).toEqual(tyEntry);
            {
                const v = {
                    type: 'folder',
                    name: '/',
                    entries: [{
                        type: 'file',
                        name: 'a',
                    }, {
                        type: 'folder',
                        name: 'b',
                        entries: [{
                            type: 'file',
                            name: 'c',
                        }],
                    }],
                };
                try {
                    validate<any>(v, ty);
                    expect(0).toEqual(1);
                } catch (e) {
                    expect(e.message).toEqual('Unresolved symbol \'Entry\' is appeared.');
                }
                const ctx1: Partial<ValidationContext> = {};
                expect(() => validate<any>(v, ty, ctx1)).toThrow(); // unresolved symlink 'Entry'
                expect(ctx1.errors).toEqual([{
                    code: 'InvalidDefinition',
                    message: '"entries" of "Folder" type definition is invalid.',
                    dataPath: 'Folder.entries.(0:sequence).Entry',
                    constraints: {}
                }]);
                expect(validate<any>(v, ty, {schema})).toEqual({value: v});
            }
        }
    });
    it("compiler-op-intersection-1", function() {
        const schemas = [compile(`
            interface A {
                a: string;
            }
            interface B extends A {
                b: number;
            }
            interface C {
                c: boolean;
            }
            type D = B & C;
        `), compile(`
            type D = B & C;
            interface C {
                c: boolean;
            }
            interface B extends A {
                b: number;
            }
            interface A {
                a: string;
            }
        `)];
        {
            expect(Array.from(schemas[0].keys())).toEqual([
                'A', 'B', 'C', 'D',
            ]);
            expect(Array.from(schemas[1].keys())).toEqual([
                'D', 'C', 'B', 'A',
            ]);
        }
        for (const schema of schemas) {
            {
                const rhs: TypeAssertion = {
                    name: 'D',
                    typeName: 'D',
                    kind: 'object',
                    members: [
                        ['b', {
                            name: 'b',
                            kind: 'primitive',
                            primitiveName: 'number',
                        }],
                        ['a', {
                            name: 'a',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }],
                        ['c', {
                            name: 'c',
                            kind: 'primitive',
                            primitiveName: 'boolean',
                        }],
                    ],
                };
                const ty = getType(schema, 'D');
                expect(ty).toEqual(rhs);
                {
                    const v = {
                        a: '',
                        b: 0,
                        c: false,
                    };
                    expect(validate<any>(v, ty, {schema})).toEqual({value: v});
                }
            }
        }
    });
    it("compiler-op-subtract+omit-1", function() {
        const schemas = [compile(`
            interface A {
                a: string;
            }
            interface B extends A {
                b: number;
            }
            interface C {
                b: bigint;
                c: boolean;
            }
            type D = B - C;
        `), compile(`
            type D = B - C;
            interface C {
                b: bigint;
                c: boolean;
            }
            interface B extends A {
                b: number;
            }
            interface A {
                a: string;
            }
        `), compile(`
            type D = Omit<B, 'b' | 'c'>;
            interface C {
                b: bigint;
                c: boolean;
            }
            interface B extends A {
                b: number;
            }
            interface A {
                a: string;
            }
        `)];
        {
            expect(Array.from(schemas[0].keys())).toEqual([
                'A', 'B', 'C', 'D',
            ]);
            expect(Array.from(schemas[1].keys())).toEqual([
                'D', 'C', 'B', 'A',
            ]);
            expect(Array.from(schemas[2].keys())).toEqual([
                'D', 'C', 'B', 'A',
            ]);
        }
        for (const schema of schemas) {
            {
                const rhs: TypeAssertion = {
                    name: 'D',
                    typeName: 'D',
                    kind: 'object',
                    members: [
                        ['a', {
                            name: 'a',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }],
                    ],
                };
                const ty = getType(schema, 'D');
                expect(ty).toEqual(rhs);
                {
                    const v = {
                        a: '',
                    };
                    expect(validate<any>(v, ty, {schema, noAdditionalProps: true})).toEqual({value: v});
                }
                {
                    const v = {
                        a: '',
                        b: 0,
                        c: false,
                    };
                    expect(validate<any>(v, ty, {schema, noAdditionalProps: true})).toEqual(null);
                }
            }
        }
    });
    it("compiler-op-pick-1", function() {
        const schemas = [compile(`
            interface A {
                a: string;
                b: number;
            }
            interface B extends A {
                c: boolean;
                d: bigint;
            }
            type C = Pick<B, 'a' | 'c'>;
        `), compile(`
            type C = Pick<B, 'a' | 'c'>;
            interface B extends A {
                c: boolean;
                d: bigint;
            }
            interface A {
                a: string;
                b: number;
            }
        `)];
        {
            expect(Array.from(schemas[0].keys())).toEqual([
                'A', 'B', 'C',
            ]);
            expect(Array.from(schemas[1].keys())).toEqual([
                'C', 'B', 'A',
            ]);
        }
        for (const schema of schemas) {
            {
                const rhs: TypeAssertion = {
                    name: 'C',
                    typeName: 'C',
                    kind: 'object',
                    members: [
                        ['a', {
                            name: 'a',
                            kind: 'primitive',
                            primitiveName: 'string',
                        }],
                        ['c', {
                            name: 'c',
                            kind: 'primitive',
                            primitiveName: 'boolean',
                        }],
                    ],
                };
                const ty = getType(schema, 'C');
                expect(ty).toEqual(rhs);
                {
                    const v = {
                        a: '',
                        c: false,
                    };
                    expect(validate<any>(v, ty, {schema, noAdditionalProps: true})).toEqual({value: v});
                }
                {
                    const v = {
                        a: '',
                        b: 0,
                        c: false,
                        d: BigInt(5),
                    };
                    expect(validate<any>(v, ty, {schema, noAdditionalProps: true})).toEqual(null);
                }
            }
        }
    });
});
