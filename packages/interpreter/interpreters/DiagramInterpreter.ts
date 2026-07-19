import { Diagram } from "../../core";
import { DiagramBuilder } from "../../builder";

/**
 * Represents a parser that processes API source code and generates a corresponding diagram.
 * 
 * @remarks
 * The DiagramInterpreter class is responsible for parsing the API source code and constructing a corresponding diagram using the DiagramBuilder.
 * 
 * @public
 */
export class DiagramInterpreter {
    parse(source: string): Diagram {
        const builder = new DiagramBuilder("diagram", "Untitled diagram");
        const lines = source.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        let x = 100;

        for (const line of lines) {
            builder.node(line, line).position(x, 100).size(200, 100).end();

            x += 180;
        }
        
        return builder.build();
    }
}