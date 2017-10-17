/// <reference path="CodeParser.ts" />

interface CodeStatementInfo
{
    help: string;
    params: CodeStatementParameter[];
}

interface CodeStatementParameter
{
    name: string;
    display?: string;
    type?: string;
    valueType?: string;
}

interface CodeStatementInfoContainer
{
    [key: string]: CodeStatementInfo;
}

var statementEditorInfo: CodeStatementInfoContainer = {};

var knownStatements: string[] = [];
// Class decorator for statements.
function StatementClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownStatements.push(className);
}

var topBlockStatements: string[] = [];
// Class decorator defining top block statement level.
function TopBlockStatementClass(target)
{
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    topBlockStatements.push(className);
}

abstract class CodeStatement
{
    // Static Members
    static ExtractName(parser: CodeParser): CodeTokenResult
    {
        var result = parser.NextToken();
        while (parser.PeekToken() !== null && parser.PeekToken() !== undefined && parser.PeekToken().Type == "TokenDot")
        {
            result.Value += parser.NextToken().Value;
            if (parser.PeekToken().Type != "TokenName")
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            result.Value += parser.NextToken().Value;
        }
        return result;
    }

    static Top(parser: CodeParser): CodeStatement
    {
        return CodeStatement.Expression(parser);
    }

    static Expression(parser: CodeParser, mustCheckEnd: boolean = true): CodeStatement
    {
        // Skip comments
        if (parser.HasToken() && parser.PeekToken().Type == "TokenComment")
        {
            var comment = new CommentStatement(parser.NextToken().Value);
            var pos = parser.TokenPosition;
            if (parser.HasToken() && (parser.PeekToken(0, true) ? parser.PeekToken(0, true).Type : null) == "TokenStartBlock")
            {
                parser.NextToken(true);
                var statements: CodeStatement[] = [comment];
                while (parser.HasToken() && parser.PeekToken().Type != "TokenEndBlock")
                    statements.push(CodeStatement.Top(parser));
                if (!parser.HasToken())
                    throw "Missing a }";
                if (parser.PeekToken().Type != "TokenEndBlock")
                    throw "Was expecting a } at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new BlockStatement(statements);
            }
            parser.TokenPosition = pos;
            return comment;
        }
        if (!parser.HasToken())
            return null;

        // End Line (no code)
        if (parser.PeekToken().Type == "TokenEndLine")
        {
            parser.NextToken();
            return new EmptyStatement();
        }

        if (parser.PeekToken().Type == "TokenStartBlock")
        {
            parser.NextToken();
            var statements: CodeStatement[] = [];
            while (parser.HasToken() && parser.PeekToken().Type != "TokenEndBlock")
                statements.push(CodeStatement.Top(parser));
            if (!parser.HasToken())
                throw "Missing a }";
            if (parser.PeekToken().Type != "TokenEndBlock")
                throw "Was expecting a } at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            parser.NextToken();
            return new BlockStatement(statements);
        }

        var token = CodeStatement.ExtractName(parser);
        // Skip assignement var keywork which is currently not used.
        if (token.Value.toLowerCase() == "var")
            token = CodeStatement.ExtractName(parser);
        var node: CodeStatement = null;
        switch (token.Value.toLowerCase())
        {
            case "if":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenOpenParenthesis")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                return IfStatement.Parse(parser);
            case "else":
                throw "else statement without the if statement found at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "for":
                //throw "for loops are not yet implemented.";
                return ForStatement.Parse(parser);
            case "foreach":
                throw "foreach loops are not yet implemented.";
            case "do":
                return DoWhileStatement.Parse(parser);
            case "while":
                return WhileStatement.Parse(parser);
            case "break":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenEndLine")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new BreakStatement();
            case "try":
            case "catch":
                throw "try/catch blocks are not yet implemented.";
            case "return":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type == "TokenEndLine")
                {
                    parser.NextToken();
                    return <CodeStatement>new ReturnStatement(null);
                }
                var node = <CodeStatement>new ReturnStatement(CodeStatement.Element(parser));
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenEndLine")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return node;
            case "function":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                var name = parser.NextToken().Value;
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenOpenParenthesis")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                return FunctionDefinitionStatement.Parse(name, parser);
            default:
                var index: CodeStatement = null;
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type == "TokenOpenSquareBracket")
                {
                    parser.NextToken();
                    index = CodeStatement.Additive(parser);
                    if (parser.PeekToken().Type != "TokenCloseSquareBracket")
                        throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    parser.NextToken();
                }

                if (parser.PeekToken().Type == "TokenAssign")
                {
                    parser.NextToken();
                    node = <CodeStatement>new AssignStatement(token.Value, CodeStatement.Element(parser));
                    if (index)
                        (<AssignStatement>node).index = index;
                    if (parser.PeekToken().Type != "TokenEndLine")
                    {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenOperatorAssign")
                {
                    var node: CodeStatement = null;
                    var col = parser.PeekToken().Column;
                    var line = parser.PeekToken().Line;
                    var op = parser.PeekToken().Value.charAt(0);
                    parser.NextToken();
                    switch (op)
                    {
                        case "+":
                            node = new AssignStatement(token.Value, new AddStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "-":
                            node = new AssignStatement(token.Value, new SubstractStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "*":
                            node = new AssignStatement(token.Value, new MultiplyStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "/":
                            node = new AssignStatement(token.Value, new DivideStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        default:
                            throw "Unexpected operator " + op + " at " + line + ":" + col;
                    }
                    if (index)
                        (<AssignStatement>node).index = index;
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenOpenParenthesis")
                {
                    var node = FunctionCallStatement.Parse(token.Value, parser);
                    if (parser.PeekToken().Type != "TokenEndLine")
                    {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenIncrement")
                {
                    parser.NextToken();
                    if (parser.PeekToken().Type != "TokenEndLine")
                    {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    var node: CodeStatement = new AssignStatement(token.Value, new AddStatement(new VariableStatement(token.Value, token.Line, token.Column, index), new NumberStatement("1", 0, 0)));
                    if (index)
                        (<AssignStatement>node).index = index;
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenDecrement")
                {
                    parser.NextToken();
                    if (parser.PeekToken().Type != "TokenEndLine")
                    {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    var node: CodeStatement = new AssignStatement(token.Value, new SubstractStatement(new VariableStatement(token.Value, token.Line, token.Column, index), new NumberStatement("1", 0, 0)));
                    if (index)
                        (<AssignStatement>node).index = index;
                    return node;
                }
                else
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        }
    }

    static Element(parser: CodeParser): CodeStatement
    {
        return CodeStatement.And(parser);
    }

    static And(parser: CodeParser): CodeStatement
    {
        var node = CodeStatement.Or(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenAnd")
        {
            parser.NextToken();
            return new AndStatement(node, CodeStatement.Element(parser));
        }
        return node;
    }

    static Or(parser: CodeParser): CodeStatement
    {
        var node = CodeStatement.Compare(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenOr")
        {
            parser.NextToken();
            return new OrStatement(node, CodeStatement.Element(parser));
        }
        return node;
    }

    static Compare(parser: CodeParser): CodeStatement
    {
        var node = CodeStatement.Additive(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenCompare")
            return new CompareStatement(node, parser.NextToken().Value, CodeStatement.Additive(parser));
        return node;
    }

    static Additive(parser: CodeParser): CodeStatement
    {
        var node = CodeStatement.Multiplicative(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "+")
        {
            parser.NextToken();
            return new AddStatement(node, CodeStatement.Additive(parser));
        }
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "-")
        {
            parser.NextToken();
            return new SubstractStatement(node, CodeStatement.Additive(parser));
        }
        return node;
    }

    static Multiplicative(parser: CodeParser): CodeStatement
    {
        var node = CodeStatement.BaseStatement(parser);
        if (!parser.HasToken())
            return node;
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "*")
        {
            parser.NextToken();
            return new MultiplyStatement(node, CodeStatement.Multiplicative(parser));
        }
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "/")
        {
            parser.NextToken();
            return new DivideStatement(node, CodeStatement.Multiplicative(parser));
        }
        return node;
    }

    static BaseStatement(parser: CodeParser): CodeStatement
    {
        if (!parser.HasToken())
            throw "Formula not finished correctly.";
        switch (parser.PeekToken().Type)
        {
            case "TokenOpenSquareBracket":
                var t = parser.NextToken();
                if (parser.PeekToken().Type != "TokenCloseSquareBracket")
                    throw "Missing close square bracket at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new EmptyArrayStatement(t.Line, t.Column);
            case "TokenCloseParenthesis":
                throw "Found close parenthesis at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "TokenOpenParenthesis":
                parser.NextToken();
                var node = CodeStatement.Element(parser);
                if (!parser.HasToken())
                    throw "Missing close parenthesis.";
                else if (parser.PeekToken().Type != "TokenCloseParenthesis")
                    throw "Missing close parenthesis at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return node;
            case "TokenNot":
                parser.NextToken();
                return new NotStatement(CodeStatement.BaseStatement(parser));
            case "TokenNumber":
                var t = parser.NextToken();
                return new NumberStatement(t.Value, t.Line, t.Column);
            case "TokenCodeVariable":
                var t = parser.NextToken();
                return new CodeVariableStatement(t.Value, t.Line, t.Column);
            case "TokenName":
                var name = CodeStatement.ExtractName(parser);
                // A function call
                if (parser.HasToken() && parser.PeekToken().Type == "TokenOpenParenthesis")
                    return FunctionCallStatement.Parse(name.Value, parser);
                else if (parser.HasToken() && parser.PeekToken().Type == "TokenOpenSquareBracket")
                {
                    parser.NextToken();
                    var index = CodeStatement.Additive(parser);
                    if (parser.HasToken() && parser.PeekToken().Type != "TokenCloseSquareBracket")
                        throw "Missing close square bracket at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    parser.NextToken();
                    var res = new VariableStatement(name.Value, name.Line, name.Column);
                    res.index = index;
                    return res;
                }
                // A variable
                else
                {
                    switch (name.Value)
                    {
                        case "true":
                            return new BooleanStatement(true);
                        case "false":
                            return new BooleanStatement(false);
                        case "null":
                            return new NullStatement();
                        default:
                            return new VariableStatement(name.Value, name.Line, name.Column);
                    }
                }
            case "TokenString":
                return new StringStatement(parser.NextToken().Value);
            case "TokenOperator":
                if (parser.PeekToken().Value == "-" || parser.PeekToken().Value == "+")
                {
                    var t = parser.NextToken();
                    return new NumberStatement(t.Value + parser.NextToken().Value, t.Line, t.Column);
                }
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "TokenCodeVariable":
                throw "Code variable @" + parser.PeekToken().Value + "@ unknown at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            default:
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        }
    }

    abstract ToCode(indent: number): string;

    abstract Compile(code: FunctionDefinitionCode): void;

    abstract BlockVerify(): boolean;

    abstract Verify(env: CodeEnvironement): void;

    protected ExtractConstants(values: CodeStatement[]): any[]
    {
        var result = [];
        for (var i = 0; i < values.length; i++)
        {
            if (values[i] instanceof NumberStatement)
                result.push((<NumberStatement>values[i]).Value.GetNumber());
            else if (values[i] instanceof StringStatement)
                result.push((<StringStatement>values[i]).Value.GetString());
            else
                result.push(null);
        }
        return result;
    }

    public HTMLBlocks(path: string, codeStatements: CodeStatement[]): string
    {
        var html = "";
        var name = ("" + this.constructor).match(/function ([a-z]+)Statement\(/i)[1];
        var info = statementEditorInfo[name];
        var propInfo: CodeStatementParameter = null;
        var nbParams = 0;
        if (info) for (var i = 0; i < info.params.length; i++)
        {
            if (info.params[i].display == "embed")
                propInfo = info.params[i];
            else
                nbParams++;
        }
        else
        {
            for (var prop in this)
            {
                var propName = "" + prop;
                var propInfo: CodeStatementParameter = null;
                if (typeof this[propName] == "function")
                    continue;
                // private variable
                if (propName[0] != propName[0].toUpperCase())
                    continue;
                nbParams++;
            }
        }

        var isOk = this.BlockVerify();

        if (propInfo)
        {
            html += "<div class='codeBlock" + (isOk ? "" : " blockOnError") + "' id='bl_" + path.replace(/\./g, "_") + "'>";
            html += "<span class='" + (nbParams > 0 ? "blockType" : "simpleBlockType") + "'>" + name.title() + " <input type='text' value='" + (propInfo.type == "VariableValue" ? this[propInfo.name].GetString() : this[propInfo.name]).htmlEntities() + "' path='" + path + "." + propInfo.name + "'></span>";
        }
        else
        {
            html += "<div class='codeBlock" + (isOk ? "" : " blockOnError") + "' id='bl_" + path.replace(/\./g, "_") + "'>";
            html += "<span class='" + (nbParams > 0 ? "blockType" : "simpleBlockType") + "'>" + name.title() + "</span>";

        }

        if (info)
        {
            for (var i = 0; i < info.params.length; i++)
            {
                var propInfo = info.params[i];
                if (propInfo.display == "embed")
                    continue;
                html += this.RenderBlockField(propInfo.name, path, codeStatements, propInfo);
            }
        }
        else
        {
            for (var prop in this)
            {
                var propName = "" + prop;
                var propInfo: CodeStatementParameter = null;
                if (typeof this[propName] == "function")
                    continue;
                // private variable
                if (propName[0] != propName[0].toUpperCase())
                    continue;
                html += this.RenderBlockField(propName, path, codeStatements);
            }
        }
        if (nbParams > 0)
            html += "<span class='endBlock'></span>";
        html += "</div>";
        return html;
    }

    private RenderBlockField(propName: string, path: string, statements: CodeStatement[], propInfo: CodeStatementParameter = null)
    {
        var html = "";
        var title = propName.replace(/Statement$/, "").title();
        if (propInfo && propInfo.display && propInfo.display != "embed")
            title = propInfo.display;
        // private variable
        if ((this[propName] && typeof (<any>this[propName]).HTMLBlocks == "function") || (propInfo && propInfo.type == "CodeStatement"))
        {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='subBlock'>" + (this[propName] ? (<CodeStatement>(<any>this[propName])).HTMLBlocks(path + "." + propName, statements) : "<span class='emptyBlock' path='" + (path + "." + propName) + "'>Empty</span>") + "</span>";
            html += "</div>";
        }
        else if (this[propName] && <any>this[propName] instanceof VariableValue || (propInfo && propInfo.type == "VariableValue"))
        {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='blockValue'><input type='text' value='" + (<VariableValue>(<any>this[propName])).GetString().htmlEntities() + "' path='" + path + "." + propName + "'></span>";
            html += "</div>";
        }
        else if (propInfo && propInfo.type == "string[]")
        {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            var values: string[] = <any>this[propName];
            for (var i = 0; i < values.length; i++)
            {
                html += "<span class='blockValue'>";
                html += "<input type='text' value='" + values[i].htmlEntities(true) + "' path='" + path + "." + propName + "." + i + "' class='blockArrayEntry'>";
                html += "<span class='blockDeleteArrayEntry' path='" + path + "." + propName + "." + i + "'>x</span>";
                html += "</span>";
            }
            html += "<span class='blockValue'><span class='button blockAddArrayEntry' path='" + path + "." + propName + "'>Add</span></span>";
            html += "</div>";
        }
        else
        {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='blockValue'><input type='text' value='" + ("" + this[propName]).htmlEntities() + "' path='" + path + "." + propName + "'></span>";
            html += "</div>";
        }
        return html;
    }

    protected Indent(nb: number): string
    {
        var res = "";
        for (var i = 0; i < nb; i++)
            res += "    ";
        return res;
    }
}