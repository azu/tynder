
import { TypeAssertion,
         ValidationContext } from '../types';
import { validate,
         getType }           from '../validator';
import { compile }           from '../compiler';



describe("compiler-6", function() {
    it("compiler-error-reporting-1", function() {
        expect(0).toEqual(0);
    });
    // TODO: decorators + error reporting
    // TODO: deep cherrypick and patch
    // TODO: directives
    // TODO: import statement
});