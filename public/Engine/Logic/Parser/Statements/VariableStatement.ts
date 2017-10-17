/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Variable'] = { help: "Returns the value of the variable. A variable is like a box allowing you to store a number or a string inside.", params: [{ name: 'Name', display: 'embed' }] };
@StatementClass
class VariableStatement extends CodeStatement
{
    public Name: string;
    private line: number;
    private column: number;
    private variableId: number = null;
    public index: CodeStatement = null;

    constructor(name: string, line: number, column: number, index: CodeStatement = null)
    {
        super();
        this.Name = name.toLowerCase();
        this.line = line;
        this.column = column;
        this.index = index;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        if (this.index)
        {
            this.index.Compile(code);
            code.Code.push(new ReadCode(this.Name, true));
        }
        else
            code.Code.push(new ReadCode(this.Name, false));
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
        if (this.Name == "stackresult") // Special variable
            return;
        if (env.HasVariable(this.Name) || this.Name.toLowerCase() == "null" || this.Name.toLocaleLowerCase() == "true" || this.Name.toLocaleLowerCase() == "false")
            //if (env.GetVariablePosition(this.name) != -1 || this.name.toLowerCase() == "null" || this.name.toLocaleLowerCase() == "true" || this.name.toLocaleLowerCase() == "false")        
            return;
        throw "Variable '" + this.Name + "' used before definition at " + this.line + ":" + this.column + ".";
    }

    public ToCode(indent: number)
    {
        return this.Name + (this.index ? "[" + this.index.ToCode(0) + "]" : "");
    }

}