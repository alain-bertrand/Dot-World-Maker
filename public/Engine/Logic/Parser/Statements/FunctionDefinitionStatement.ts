/// <reference path="../CodeStatement.ts" />

statementEditorInfo['FunctionDefinition'] = { help: "Defines a new function which will can be used by yourself or can be invoked by the engine.", params: [{ name: 'Name', display: 'embed' }, { name: 'Variables', type: 'string[]', display: 'Parameter Names' }, { name: 'Statement', type: 'CodeStatement' }] };
@StatementClass
class FunctionDefinitionStatement extends CodeStatement
{
    public Name: string;
    public Variables: string[];
    public Statement: CodeStatement;

    static Parse(name: string, parser: CodeParser): CodeStatement
    {
        var variables: string[] = [];
        parser.NextToken();
        while (parser.HasToken() && parser.PeekToken().Type != "TokenCloseParenthesis")
        {
            if (!parser.HasToken())
                throw "Unexpected end of script.";
            if (parser.PeekToken().Type != "TokenName")
                throw "Was expecting a variable name at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            variables.push(parser.NextToken().Value);
            if (!parser.HasToken())
                throw "Unexpected end of script.";
            if (parser.PeekToken().Type == "TokenCloseParenthesis")
                continue;
            if (parser.PeekToken().Type != "TokenSplitParameter")
                throw "Was expecting a , at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            parser.NextToken();
        }
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;

        parser.NextToken();
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        if (parser.PeekToken().Type != "TokenStartBlock")
            throw "Was expecting a { at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        var statement = this.Top(parser);
        return new FunctionDefinitionStatement(name, variables, statement);
    }

    constructor(name: string, variables: string[], statement: CodeStatement)
    {
        super();
        this.Name = (name ? name : "MyFunction");
        this.Variables = (variables ? variables : []);
        this.Statement = (statement ? statement : new BlockStatement([]));
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        // Recover variables values
        for (var i = this.Variables.length - 1; i >= 0; i--)
            code.Code.push(new AssignCode(this.Variables[i]));

        this.Statement.Compile(code);
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
        for (var i = 0; i < this.Variables.length; i++)
            env.SetVariable(this.Variables[i], new VariableValue(null));
        if (this.Statement)
            this.Statement.Verify(env);
    }

    public ToCode(indent: number)
    {
        var code = "function " + this.Name + "(";
        code += this.Variables.join(",");
        code += ")\n";
        if (this.Statement && (<BlockStatement>this.Statement).Statements.length > 0)
        {
            var sub = this.Statement.ToCode(indent);
            if (sub[0] == "{")
                code += sub;
            else
                code += "{\n" + sub + "}";
        }
        else
            code += "{\n}\n";
        return code + "\n";
    }

}