import type { Interpreter } from "./Interpreter";
import { Diagram } from "../core"
import { DiagramBuilder } from "../builder";

/**
 * Converts a textual diagram description into a Diagram.
 *
 * @remarks
 * Currently builds the diagram directly.
 * In the future it will obtain an AST from a parser
 * before constructing the Diagram.
 */
export class DiagramInterpreter implements Interpreter<string, Diagram> {
    interpret(input: string): Diagram {
        const builder = new DiagramBuilder("diagram");

        // TODO:
        // Temporary implementation.

        return builder.build();
    }

}