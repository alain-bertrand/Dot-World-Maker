/// <reference path="../CodeStatement.ts" />

statementEditorInfo['CodeVariable'] = { help: "Allows to create a parameter for extensions or stat / skills.", params: [{ name: 'Name', type: 'string' }] };
@StatementClass
class CodeVariableStatement extends CodeStatement
{
    public Name: string;

    constructor(name: string, startLine: number, startColumn: number)
    {
        super();
        this.Name = name;
    }

    public Compile(code: FunctionDefinitionCode)
    {
        throw "Code variable @" + this.Name + "@ has not been set.";
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
        return "@" + this.Name + "@";
    }
}