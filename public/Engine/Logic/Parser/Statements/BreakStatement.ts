/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Break'] = { help: "Stops the current loop (while, do while or for).", params: [] };
@TopBlockStatementClass
@StatementClass
class BreakStatement extends CodeStatement
{
    constructor()
    {
        super();
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(code.LoopExitStack[code.LoopExitStack.length - 1]);
    }

    public ToCode(indent: number)
    {
        return "break";
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
    }
}