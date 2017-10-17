/// <reference path="../CodeStatement.ts" />

statementEditorInfo['Comment'] = { help: "Allows to put a comment on the code. It doesn't influence the logic otherwise.", params: [{ name: 'Comment', type: 'string', display: 'embed' }] };
@TopBlockStatementClass
@StatementClass
class CommentStatement extends CodeStatement
{
    public Comment: string;

    constructor(comment: string)
    {
        super();
        this.Comment = comment;
    }

    public Compile(code: FunctionDefinitionCode)
    {
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
        return "/* " + this.Comment + " */";
    }
}