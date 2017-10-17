/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Substract'] = { help: "Returns the substraction of A by B.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
@StatementClass
class SubstractStatement extends CodeStatement
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
        code.Code.push(new SubstractCode());
    }

    public BlockVerify(): boolean
    {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    }

    public Verify(env: CodeEnvironement)
    {
        if (!this.AStatement || !this.BStatement)
            throw "Missing statement";
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    }

    public ToCode(indent: number)
    {
        return this.AStatement.ToCode(0) + " - " + this.BStatement.ToCode(0);
    }
}