/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Not'] = { help: "If the statement is true returns false otherwise returns true.", params: [{ name: 'Statement', type: 'CodeStatement' }] };
@StatementClass
class NotStatement extends CodeStatement
{
    public Statement: CodeStatement;

    constructor(statement: CodeStatement)
    {
        super();
        this.Statement = statement;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.Statement.Compile(code);
        code.Code.push(new NotCode());
    }

    public BlockVerify(): boolean
    {
        return (this.Statement !== null && this.Statement !== undefined ? true : false);
    }

    public Verify(env: CodeEnvironement)
    {
        if (!this.Statement)
            throw "Missing statement";
        this.Statement.Verify(env);
    }

    public ToCode(indent: number)
    {
        return "!" + this.Statement.ToCode(0);
    }
}