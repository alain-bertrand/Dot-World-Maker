/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Compare'] = { help: "Compares two values and if the comparison is correct returns true, otherwise returns false.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'Operator', type: 'string' }, { name: 'BStatement', type: 'CodeStatement' }] };
@StatementClass
class CompareStatement extends CodeStatement
{
    public AStatement: CodeStatement;
    public Operator: string;
    public BStatement: CodeStatement;

    constructor(statementA: CodeStatement, operator: string, statementB: CodeStatement)
    {
        super();
        this.AStatement = statementA;
        this.Operator = (operator ? operator : "==");
        this.BStatement = statementB;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new CompareCode(this.Operator));
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
        return this.AStatement.ToCode(0) + " " + this.Operator + " " + this.BStatement.ToCode(0);
    }
}