import { Diagram } from "../core";
import { DiagramInterpreter } from "./interpreters";

/**
 * Represents an interpreter that processes API source code and generates a corresponding diagram.
 * 
 * @remarks
 * This class is a wrapper around the {@link DiagramInterpreter} class, which is responsible for the actual parsing of the PlantUML source code.
 */
export class Interpreter {
    private readonly parser = new DiagramInterpreter();

    public parse(source: string): Diagram {
        return this.parser.parse(source);
    }
}