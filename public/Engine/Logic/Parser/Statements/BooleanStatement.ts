/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Boolean'] = { help: "A boolean value which can be either true or false. Click on the node to change from true to false and reverse.", params: [] };
@StatementClass
class BooleanStatement extends CodeStatement
{
    private value: VariableValue;

    constructor(value: boolean = true)
    {
        super();
        this.value = new VariableValue(value);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        code.Code.push(new PushCode(this.value));
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
        return (this.value.GetBoolean() ? "true" : "false");
    }

    public HTMLBlocks(path: string, codeStatements: CodeStatement[]): string
    {
        var html = "";
        html += "<div class='codeBlock' id='bl_" + path.replace(/\./g, "_") + "'><span class='simpleBlockType' block='boolean'>Boolean: " + (this.value.GetBoolean() ? "True" : "False") + "</span>";
        html += "</div>";
        return html;
    }
}