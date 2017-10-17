/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Number'] = { help: "Returns a number.", params: [{ name: 'Value', display: 'embed', type: 'VariableValue', valueType: 'number' }] };
@StatementClass
class NumberStatement extends CodeStatement
{
    public Value: VariableValue;

    constructor(stringValue: string, startLine: number, startColumn: number)
    {
        super();
        stringValue = (stringValue ? stringValue : "0").replace(/^\+/, "").replace(/(\.[0-9]*)0+$/, "$1").replace(/^[0]+/, "").replace(/^\./, "0.").replace(/\.$/, "");
        if (stringValue == "" || stringValue == "-0")
            stringValue = "0";
        this.Value = new VariableValue(parseFloat(stringValue));
        if (this.Value.GetNumber().toString() != stringValue)
            throw "Number is not correct " + startLine + ":" + startColumn;
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
        return "" + this.Value.GetNumber();
    }
}