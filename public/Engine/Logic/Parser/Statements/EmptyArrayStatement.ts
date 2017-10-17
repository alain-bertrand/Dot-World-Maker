/// <reference path="../CodeStatement.ts" />

@StatementClass
class EmptyArrayStatement extends CodeStatement
{
    constructor(startLine: number, startColumn: number)
    {
        super();
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(new NewArrayCode());
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {        
    }

    public ToCode(indent: number)
    {
        return "[]";
    }
}