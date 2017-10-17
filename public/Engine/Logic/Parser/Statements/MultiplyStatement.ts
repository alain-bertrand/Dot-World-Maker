/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Multiply'] = { help: "Returns the multiplication of A by B.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
@StatementClass
class MultiplyStatement extends CodeStatement
{
    public AStatement: CodeStatement;
    public BStatement: CodeStatement;

    constructor(statementA: CodeStatement, statementB: CodeStatement)
    {
        super();
        this.AStatement = statementA;
        this.BStatement = statementB;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new MultiplyCode());
    }

    public BlockVerify(): boolean
    {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    }

    public Verify(env: CodeEnvironement)
    {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    }

    public ToCode(indent: number)
    {
        return this.AStatement.ToCode(0) + " * " + this.BStatement.ToCode(0);
    }

}