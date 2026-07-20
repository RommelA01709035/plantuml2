export interface Interpreter<TInput, TResult> {
    interpret(imput: TInput): TResult;
}