/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Return'] = { help: "Exits the current function and pass an optional returning value.", params: [{ name: 'Statement', type: 'CodeStatement' }] };
@TopBlockStatementClass
@StatementClass
class ReturnStatement extends CodeStatement
{
    public Statement: CodeStatement;

    constructor(statement: CodeStatement)
    {
        super();
        this.Statement = statement;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(new FlushVariableStackCode());
        if (this.Statement)
            this.Statement.Compile(code);
        code.Code.push(new ReturnCode());
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
        if (this.Statement)
            this.Statement.Verify(env);
    }

    public ToCode(indent: number)
    {
        if (this.Statement)
            return "return " + this.Statement.ToCode(0);
        else
            return "return";
    }
}