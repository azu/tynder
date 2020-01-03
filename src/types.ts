// Copyright (c) 2019 Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


export type PrimitiveValueTypes = number | bigint | string | boolean | null | undefined;                               // TODO: function
export type PrimitiveValueTypeNames = 'number' | 'bigint' | 'string' | 'boolean' | 'null' | 'undefined';               // TODO: function
export type OptionalPrimitiveValueTypeNames = 'number?' | 'bigint?' | 'string?' | 'boolean?' | 'null?' | 'undefined?'; // TODO: function
export type PlaceholderTypeNames = 'never' | 'any' | 'unknown';
export type OptionalPlaceholderTypeNames = 'never?' | 'any?' | 'unknown?';



export enum ErrorTypes {
    InvalidDefinition = 1,
    Required,              // (all)
    TypeUnmatched,         // Never/Unknown/Primitive/Object
    RepeatQtyUnmatched,    // Repeated/Spread
    SequenceUnmatched,     // Sequence
    ValueRangeUnmatched,   // Primitive: minValue, maxValue, greaterThanValue, lessThanValue
    ValuePatternUnmatched, // Primitive: pattern
    ValueLengthUnmatched,  // Primitive: minLength, maxLength
    ValueUnmatched,        // PrimitiveValue
}


export type ErrorMessages = Partial<{
    invalidDefinition: string,
    required: string,
    typeUnmatched: string,
    repeatQtyUnmatched: string,
    sequenceUnmatched: string,
    valueRangeUnmatched: string,
    valuePatternUnmatched: string,
    valueLengthUnmatched: string,
    valueUnmatched: string,
}>;


export interface TypeAssertionErrorMessage {
    code?: string;
    message: string;
}


export interface TypeAssertionBase {
    messageId?: string;
    message?: string;
    messages?: ErrorMessages;
    name?: string;              // member name or 'typeName' below
    typeName?: string;          // named user defined 'type' or 'interface' name
    docComment?: string;        // doc comment
    passThruCodeBlock?: string; // store a pass thru code block (e.g. import statement). use it with kind===never
    noOutput?: boolean;         // skip code generation if true
}


export interface NeverTypeAssertion extends TypeAssertionBase {
    kind: 'never';
}


export interface AnyTypeAssertion extends TypeAssertionBase {
    kind: 'any';
}


export interface UnknownTypeAssertion extends TypeAssertionBase {
    kind: 'unknown';
}


export interface PrimitiveTypeAssertion extends TypeAssertionBase {
    kind: 'primitive';
    primitiveName: PrimitiveValueTypeNames;
    minValue?: number | string | null; // TODO: bigint
    maxValue?: number | string | null; // TODO: bigint
    greaterThanValue?: number | string | null;
    lessThanValue?: number | string | null;
    minLength?: number | null;
    maxLength?: number | null;
    pattern?: RegExp | null;
}


export interface PrimitiveValueTypeAssertion extends TypeAssertionBase {
    kind: 'primitive-value';
    value: PrimitiveValueTypes;
}


export interface RepeatedAssertion extends TypeAssertionBase {
    kind: 'repeated';
    repeated: TypeAssertion;
    min: number | null;
    max: number | null;
}


export interface SpreadAssertion extends TypeAssertionBase {
    kind: 'spread';
    spread: TypeAssertion;
    min: number | null;
    max: number | null;
}


export interface SequenceAssertion extends TypeAssertionBase {
    kind: 'sequence';
    sequence: TypeAssertion[];
}


export interface OneOfAssertion extends TypeAssertionBase {
    kind: 'one-of';
    oneOf: TypeAssertion[];
}


export interface OptionalAssertion extends TypeAssertionBase {
    kind: 'optional';
    optional: TypeAssertion;
}


export interface EnumAssertion extends TypeAssertionBase {
    kind: 'enum';
    values: Array<[
        string,           // enum key
        number | string,  // enum value
        string?,          // doc comment
    ]>;
}


export type ObjectAssertionMember = [
    string,         // name
    TypeAssertion,  // type
] | [
    string,         // name
    TypeAssertion,  // type
    boolean,        // If true, defined by ancestor types
];


export interface ObjectAssertion extends TypeAssertionBase {
    kind: 'object';
    members: ObjectAssertionMember[];
    baseTypes?: ObjectAssertion[];
}


// TODO: ObjectRefAssertion (for recursive typedef)


export type TypeAssertion =
    NeverTypeAssertion |
    AnyTypeAssertion |
    UnknownTypeAssertion |
    PrimitiveTypeAssertion |
    PrimitiveValueTypeAssertion |
    RepeatedAssertion |
    SpreadAssertion |
    SequenceAssertion |
    OneOfAssertion |
    OptionalAssertion |
    EnumAssertion |
    ObjectAssertion;


export interface ValidationContext {
    checkAll?: boolean;
    // maxDepth: number;
    // depth: number;
    mapper?: (value: any, ty: TypeAssertion) => any;

    // === returned values ===
    errors: TypeAssertionErrorMessage[];

    // === internal use ===
    typeStack: TypeAssertion[];
}


export interface TypeAssertionSetValue {
    ty: TypeAssertion;
    exported: boolean;
}


export type TypeAssertionMap = Map<string, TypeAssertionSetValue>;


export interface CodegenContext {
    nestLevel: number;
}
