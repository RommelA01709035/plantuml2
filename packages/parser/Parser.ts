import { Diagram } from "../core";
import { DiagramParser } from "./parsers";

/**
 * Parses PlantUML source code into a diagram.
 * 
 * @remarks
 * This class is a wrapper around the {@link DiagramParser} class, which is responsible for the actual parsing of the PlantUML source code.
 */
export class Parser {
    private readonly parser = new DiagramParser();

    public parse(source: string): Diagram {
        return this.parser.parse(source);
    }
}