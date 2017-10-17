/// <reference path="../CodeStatement.ts" />

statementEditorInfo['String'] = { help: "Returns a constant string value.", params: [{ name: 'Value', display: 'embed', type: 'VariableValue' }] };
@StatementClass
class StringStatement extends CodeStatement
{
    public Value: VariableValue;

    constructor(value: string)
    {
        super();
        this.Value = new VariableValue((value ? value : "").replace(/\\n/g, "\n"));
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(new PushCode(this.Value));
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
        return "\"" + this.Value.GetString().replace(/"/g, "\\\"") + "\"";
    }
}