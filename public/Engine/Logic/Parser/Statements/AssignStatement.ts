/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Assign'] = { help: "Set the variable to the value passed. A variable is like a box allowing you to store a number or a string inside.", params: [{ name: 'Variable', type: 'string' }, { name: 'Statement', type: 'CodeStatement' }] };
@TopBlockStatementClass
@StatementClass
class AssignStatement extends CodeStatement
{
    public Variable: string;
    private variableId: number = null;
    public Statement: CodeStatement;
    public index: CodeStatement = null;

    constructor(variable: string, statement: CodeStatement)
    {
        super();
        this.Variable = (variable ? variable : "myvar").toLowerCase();
        this.Statement = statement;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.Statement.Compile(code);
        if (this.index)
        {
            this.index.Compile(code);
            code.Code.push(new AssignCode(this.Variable, true));
        }
        else
            code.Code.push(new AssignCode(this.Variable));
    }

    public BlockVerify(): boolean
    {
        return (this.Statement !== null && this.Statement !== undefined ? true : false);
    }

    public Verify(env: CodeEnvironement)
    {
        this.Statement.Verify(env);
        env.SetVariable(this.Variable, new VariableValue(null));
    }

    public ToCode(indent: number)
    {
        return this.Variable + (this.index ? "[" + this.index.ToCode(0) + "]" : "") + " = " + this.Statement.ToCode(0);
    }
}