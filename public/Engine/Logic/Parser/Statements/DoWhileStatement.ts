/// <reference path="../CodeStatement.ts" />

statementEditorInfo['DoWhile'] = { help: "Repeat the code as long as the condition is matched but runs at least once the code.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] };
@TopBlockStatementClass
@StatementClass
class DoWhileStatement extends CodeStatement
{
    public Condition: CodeStatement;
    public BlockStatement: CodeStatement;

    static Parse(parser: CodeParser): CodeStatement
    {
        var blockStatement = CodeStatement.Top(parser);
        if (!(parser.HasToken() && parser.PeekToken().Type == "TokenName" && parser.PeekToken().Value == "while"))
            throw "Was expecting a 'while' at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;

        parser.NextToken();
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        if (parser.PeekToken().Type != "TokenEndLine")
            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        return new DoWhileStatement(condition, blockStatement);
    }

    constructor(condition: CodeStatement, blockStatement: CodeStatement)
    {
        super();
        this.Condition = condition;
        this.BlockStatement = (blockStatement ? blockStatement : new BlockStatement([]));

        // For single line statements convert them as block
        if (this.BlockStatement.constructor !== BlockStatement)
            this.BlockStatement = new BlockStatement([this.BlockStatement]);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.BlockStatement.Compile(code);
        this.Condition.Compile(code);
        code.Code.push(new IfCode(startLine, code.Code.length + 1));
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
    }

    public BlockVerify(): boolean
    {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    }

    public Verify(env: CodeEnvironement)
    {
        this.BlockStatement.Verify(env);
        this.Condition.Verify(env);
    }

    public ToCode(indent: number)
    {
        return "do\n" + this.BlockStatement.ToCode(indent) + " while(" + this.Condition.ToCode(0) + ")";
    }

}