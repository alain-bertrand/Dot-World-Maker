/// <reference path="../CodeStatement.ts" />

@StatementClass
class BlockStatement extends CodeStatement
{
    public Statements: CodeStatement[];

    constructor(statements: CodeStatement[])
    {
        super();
        this.Statements = statements;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        for (var i = 0; i < this.Statements.length; i++)
            this.Statements[i].Compile(code);
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
        for (var i = 0; i < this.Statements.length; i++)
            this.Statements[i].Verify(env);
    }

    public ToCode(indent: number)
    {
        var code = "";
        if (this.Statements.length > 1)
            code += this.Indent(indent) + "{\n";
        for (var i = 0; i < this.Statements.length; i++)
        {
            var line = this.Statements[i].ToCode(indent + 1);
            if (line == ";")
                line = "";
            if (line.length > 0 && line[line.length - 1] == "\n")
                code += this.Indent(indent + 1) + line;
            else if (line == "" || (line.length > 0 && (line[line.length - 1] == "}" || line[line.length - 1] == "{")) || (line.length > 1 && line.substr(line.length - 2) == "*/"))
                code += this.Indent(indent + 1) + line + "\n";
            else
                code += this.Indent(indent + 1) + line + ";\n";
        }
        if (this.Statements.length > 1)
            code += this.Indent(indent) + "}";
        return code;
    }

    public HTMLBlocks(path: string, codeStatements: CodeStatement[]): string
    {
        var html = "";
        for (var i = 0; i < this.Statements.length; i++)
            html += this.Statements[i].HTMLBlocks(path + "." + i, codeStatements);
        html += "<span class='emptyBlock' path='" + path + "'>Empty</span>";
        return html;
    }
}