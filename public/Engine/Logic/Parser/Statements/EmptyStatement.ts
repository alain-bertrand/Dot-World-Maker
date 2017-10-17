/// <reference path="../CodeStatement.ts" />

@StatementClass
class EmptyStatement extends CodeStatement
{
    constructor()
    {
        super();
    }

    public Compile(code: FunctionDefinitionCode): void
    {
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
        return "";
    }
}