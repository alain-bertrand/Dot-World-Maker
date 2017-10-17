/// <reference path="../CodeStatement.ts" />

statementEditorInfo['FunctionCall'] = { help: "", params: [{ name: 'Name', type: 'string' }, { name: 'values', type: 'any[]' }] };
@TopBlockStatementClass
@StatementClass
class FunctionCallStatement extends CodeStatement
{
    public Name: string;
    private values: CodeStatement[];
    private startLine: number;
    private startColumn: number;
    private function = null;
    private functionType = "local";

    static Parse(name: string, parser: CodeParser): CodeStatement
    {
        var nodes = [];

        if (!parser.HasToken())
            throw "Unexpected end of script.";
        var startToken = parser.NextToken();
        while (parser.HasToken() && parser.PeekToken().Type != "TokenCloseParenthesis")
        {
            nodes.push(CodeStatement.Element(parser));
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
        return new FunctionCallStatement(name, nodes, startToken.Line, startToken.Column);
    }

    constructor(name: string, values: CodeStatement[], startLine, startColumn)
    {
        super();
        this.Name = name.toLowerCase();
        this.values = values;
        this.startLine = startLine;
        this.startColumn = startColumn - name.length;
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        // Parameter calls
        for (var i = 0; i < this.values.length; i++)
            this.values[i].Compile(code);
        code.Code.push(new FunctionCallCode(this.Name, this.values.length));
    }

    public BlockVerify(): boolean
    {
        return true;
    }

    public Verify(env: CodeEnvironement)
    {
        var parts = this.Name.toLowerCase().split('.');
        if (parts.length == 3)
        {
            if (parts[0] != "me")
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            var genericCode = world.GetCode(parts[1]);
            if (!genericCode)
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            if (!genericCode.code)
                genericCode.code = CodeParser.ParseWithParameters(genericCode.Source, genericCode.Parameters, false);
            if (!genericCode.code.HasFunction(parts[2]))
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;

            for (var i = 0; i < this.values.length; i++)
                this.values[i].Verify(env);

            return;
        }
        else if (parts.length != 2)
        {
            if (!env.HasFunction(this.Name))
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            return;
        }
        if (!api[parts[0]])
            throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;

        var lowerCase = parts[1].replace(/^_/, "");
        var correctCase = null;
        for (var funcName in api[parts[0]])
        {
            if (funcName.toLowerCase() == lowerCase)
            {
                correctCase = funcName;
                break;
            }
        }

        if (!correctCase)
            throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;

        var op = 0;

        for (var i = 0; i < apiFunctions.length; i++)
        {
            if (apiFunctions[i].name.toLowerCase() == this.Name.toLowerCase())
            {
                var nb = 0;
                for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                {
                    if (apiFunctions[i].parameters[j].description.indexOf("(...)") == 0)
                        op += 1000;
                    else if (apiFunctions[i].parameters[j].description.indexOf("(optional)") == -1)
                        nb++;
                }
                if (this.values.length < nb || this.values.length > apiFunctions[i].parameters.length + op)
                    throw "Incorrect function call " + this.Name + " (the number of parameters provided don't match the signature of the function) " + this.startLine + ":" + this.startColumn;
                break;
            }
        }

        for (var i = 0; i < this.values.length; i++)
            this.values[i].Verify(env);

        // A verify function exists, let's try to call it
        if (api[parts[0]]["Verify_" + correctCase])
            api[parts[0]]["Verify_" + correctCase](this.startLine, this.startColumn, this.ExtractConstants(this.values));
    }

    public ToCode(indent: number)
    {
        var code = this.Name + "(";
        for (var i = 0; i < this.values.length; i++)
        {
            if (i != 0)
                code += ", ";
            code += this.values[i].ToCode(0);
        }
        return code + ")";
    }

    public HTMLBlocks(path: string, codeStatements: CodeStatement[]): string
    {
        var params: string[] = [];
        var parts = this.Name.toLowerCase().split('.');
        var rightName = this.Name;

        // GenericCode
        if (parts.length == 3)
        {
            for (var i = 0; i < world.Codes.length; i++)
            {
                if (world.Codes[i].Name.toLowerCase() != parts[1].toLowerCase())
                    continue;
                try
                {
                    var parser = new CodeParser(world.Codes[i].Source);
                    var statements = parser.GetAllStatements();

                    for (var j = 0; j < statements.length; j++)
                    {
                        if (statements[j].constructor != FunctionDefinitionStatement || (<FunctionDefinitionStatement>statements[j]).Name.toLowerCase() != parts[2].toLowerCase())
                            continue;
                        var funcDef = (<FunctionDefinitionStatement>statements[j]);
                        for (var k = 0; k < funcDef.Variables.length; k++)
                            params.push(funcDef.Variables[k]);
                        break;
                    }
                }
                catch (ex)
                {
                }
                break;
            }
        }
        else if (parts.length == 2)
        {
            for (var i = 0; i < apiFunctions.length; i++)
            {
                if (apiFunctions[i].name.toLowerCase() == this.Name.toLowerCase())
                {
                    rightName = apiFunctions[i].name;
                    for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                        params.push(apiFunctions[i].parameters[j].name);
                    break;
                }
            }
        }
        else if (parts.length == 1)
        {
            for (var j = 0; j < codeStatements.length; j++)
            {
                if (codeStatements[j].constructor != FunctionDefinitionStatement || (<FunctionDefinitionStatement>codeStatements[j]).Name.toLowerCase() != parts[0].toLowerCase())
                    continue;
                var funcDef = (<FunctionDefinitionStatement>codeStatements[j]);
                for (var k = 0; k < funcDef.Variables.length; k++)
                    params.push(funcDef.Variables[k]);
                break;
            }
        }

        var html = "<div class='codeBlock' id='bl_" + path.replace(/\./g, "_") + "'><span class='" + (params.length == 0 ? "simpleBlockType" : "blockType") + "'>" + rightName + "</span>";
        for (var i = 0; i < params.length; i++)
        {
            html += "<div><span class='blockLabel'>" + (params[i] ? params[i].title() : "Parameter " + (i + 1)) + "</span>";
            html += "<span class='subBlock'>" + (this.values[i] ? this.values[i].HTMLBlocks(path + ".values." + i, codeStatements) : "<span class='emptyBlock' path='" + path + ".values." + i + "'>Empty</span>") + "</span>";
            html += "</div>";
        }
        if (params.length > 0)
            html += "<span class='endBlock'></span>";
        html += "</div>";
        return html;
    }

}