/// <reference path="../CodeStatement.ts" />

statementEditorInfo['If'] = { help: "If the condition is matched the \"true\" code will be run, otherwise the \"false\" code will be.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'TrueStatement', type: 'CodeStatement' }, { name: 'FalseStatement', type: 'CodeStatement' }] };
@TopBlockStatementClass
@StatementClass
class IfStatement extends CodeStatement
{
    public Condition: CodeStatement;
    public TrueStatement: CodeStatement;
    public FalseStatement: CodeStatement;

    static Parse(parser: CodeParser): CodeStatement
    {
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken(0, true).Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken(0, true).Line + ":" + parser.PeekToken(0, true).Column;
        parser.NextToken(true);

        var okStatement = CodeStatement.Top(parser);
        var elseStatement = null;

        if (parser.HasToken() && parser.PeekToken(0, true).Type == "TokenName" && parser.PeekToken(0, true).Value == "else")
        {
            parser.NextToken(true);
            elseStatement = CodeStatement.Top(parser);
        }

        return new IfStatement(condition, okStatement, elseStatement);
    }

    constructor(condition: CodeStatement, statement: CodeStatement, elseStatement: CodeStatement)
    {
        super();
        this.Condition = condition;
        this.FalseStatement = (elseStatement ? elseStatement : new BlockStatement([]));
        this.TrueStatement = (statement ? statement : new BlockStatement([]));

        // For single line statements convert them as block
        if (this.TrueStatement.constructor !== BlockStatement)
            this.TrueStatement = new BlockStatement([this.TrueStatement]);
        if (this.FalseStatement.constructor !== BlockStatement)
            this.FalseStatement = new BlockStatement([this.FalseStatement]);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.Condition.Compile(code);
        var ifCode = new IfCode(code.Code.length + 1, null);
        code.Code.push(ifCode);
        this.TrueStatement.Compile(code);
        if (this.FalseStatement && !(this.FalseStatement.constructor == BlockStatement && (<BlockStatement>this.FalseStatement).Statements.length == 0))
        {
            var jmpEnd = new JumpCode(null);
            code.Code.push(jmpEnd);
            ifCode.FalseJump = code.Code.length;
            this.FalseStatement.Compile(code);
            jmpEnd.JumpLine = code.Code.length;
        }
        else
            ifCode.FalseJump = code.Code.length;
    }

    public BlockVerify(): boolean
    {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    }

    public Verify(env: CodeEnvironement)
    {
        this.Condition.Verify(env);
        this.TrueStatement.Verify(env);
        if (this.FalseStatement)
            this.FalseStatement.Verify(env);
    }

    public ToCode(indent: number)
    {
        var code = "if(" + this.Condition.ToCode(0) + ")\n";
        if ((<BlockStatement>this.TrueStatement).Statements.length == 0)
            code += this.Indent(indent) + "{\n" + this.Indent(indent) + "}\n";
        else
            code += this.TrueStatement.ToCode(indent);
        if (this.FalseStatement && !(this.FalseStatement.constructor == BlockStatement && (<BlockStatement>this.FalseStatement).Statements.length == 0))
        {
            /*if (code[code.length - 1] != "}")
                code += ";";*/
            code += "\n";
            code += "else " + this.FalseStatement.ToCode(indent);
        }
        return code;
    }
}