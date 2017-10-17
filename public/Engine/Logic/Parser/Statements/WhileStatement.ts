/// <reference path="../CodeStatement.ts" />

statementEditorInfo['While'] = { help: "Repeat the code as long as the condition is matched may never run the code if the condition is not matched at the begining.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] };
@TopBlockStatementClass
@StatementClass
class WhileStatement extends CodeStatement
{
    public Condition: CodeStatement;
    public BlockStatement: CodeStatement;

    static Parse(parser: CodeParser): CodeStatement
    {
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();

        var blockStatement = CodeStatement.Top(parser);
        return new WhileStatement(condition, blockStatement);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.Condition.Compile(code);
        var condition = new IfCode(code.Code.length + 1, null);
        code.Code.push(condition);
        this.BlockStatement.Compile(code);
        code.Code.push(new JumpCode(startLine));
        condition.FalseJump = code.Code.length;
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
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

    public BlockVerify(): boolean
    {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    }

    public Verify(env: CodeEnvironement)
    {
        this.Condition.Verify(env);
        this.BlockStatement.Verify(env);
    }

    public ToCode(indent: number)
    {
        return "while(" + this.Condition.ToCode(0) + ") " + this.BlockStatement.ToCode(indent);
    }
}