import { Parser } from "../Parser";
import { DiagramAst } from "../ast";

/**
 * Represents a parser that processes API source code and generates a corresponding diagram.
 * 
 * @remarks
 * The DiagramParser class is responsible for parsing the API source code and constructing a corresponding diagram using the DiagramBuilder.
 * 
 * @public
 */
export class DiagramParser implements Parser<DiagramAst> {
    parse(source: string): DiagramAst {
        // Converts text -> Ast
        return source as unknown as DiagramAst;
    }
}