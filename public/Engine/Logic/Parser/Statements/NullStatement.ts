/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Null'] = { help: "Returns an (empty) or (null) value.", params: [] };
@StatementClass
class NullStatement extends CodeStatement
{
    private value: VariableValue;

    constructor()
    {
        super();
        this.value = new VariableValue(null);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(new PushCode(new VariableValue(null)));
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
        return "null";
    }
}