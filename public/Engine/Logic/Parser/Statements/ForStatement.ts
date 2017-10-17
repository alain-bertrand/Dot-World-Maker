/// <reference path="../CodeStatement.ts" />

statementEditorInfo['For'] = { help: "First run the init code, then as long as the condition is matched runs the block code and at every repeatition runs the loop code.", params: [{ name: 'InitCode', type: 'CodeStatement' }, { name: 'Condition', type: 'CodeStatement' }, { name: 'LoopCode', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] }
@TopBlockStatementClass
@StatementClass
class ForStatement extends CodeStatement
{
    public InitCode: CodeStatement;
    public Condition: CodeStatement;
    public LoopCode: CodeStatement;
    public BlockStatement: CodeStatement;

    static Parse(parser: CodeParser): CodeStatement
    {
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();

        var initCode = CodeStatement.Top(parser);
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenEndLine")
            throw "Was expecting a ; at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var loopCode = CodeStatement.Expression(parser, false);

        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();

        var blockStatement = CodeStatement.Top(parser);
        return new ForStatement(initCode, condition, loopCode, blockStatement);
    }

    constructor(initCode: CodeStatement, condition: CodeStatement, loopCode: CodeStatement, blockStatement: CodeStatement)
    {
        super();
        this.InitCode = initCode;
        this.Condition = condition;
        this.LoopCode = loopCode;
        this.BlockStatement = (blockStatement ? blockStatement : new BlockStatement([]));

        // For single line statements convert them as block
        if (this.BlockStatement.constructor !== BlockStatement)
            this.BlockStatement = new BlockStatement([this.BlockStatement]);
    }

    public Compile(code: FunctionDefinitionCode): void
    {
        this.InitCode.Compile(code);
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.Condition.Compile(code);
        var condition = new IfCode(code.Code.length + 1, null);
        code.Code.push(condition);
        this.BlockStatement.Compile(code);
        this.LoopCode.Compile(code);
        code.Code.push(new JumpCode(startLine));
        condition.FalseJump = code.Code.length;
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
    }

    public BlockVerify(): boolean
    {
        return (!(this.InitCode === null || this.InitCode === undefined || this.Condition === null || this.Condition === undefined || this.LoopCode === null || this.LoopCode === undefined));
    }

    public Verify(env: CodeEnvironement)
    {
        this.InitCode.Verify(env);
        this.Condition.Verify(env);
        this.LoopCode.Verify(env);
        this.BlockStatement.Verify(env);
    }

    public ToCode(indent: number)
    {
        return "for(" + this.InitCode.ToCode(0) + ";" + this.Condition.ToCode(0) + ";" + this.LoopCode.ToCode(0) + ")\n" + this.BlockStatement.ToCode(indent);
    }
}