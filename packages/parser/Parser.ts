import { Diagram } from "../core";
import { DiagramParser } from "./parsers";

/**
 * Represents a parser that processes API source code and generates a corresponding diagram.
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