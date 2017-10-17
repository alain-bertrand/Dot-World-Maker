/// <reference path="../CodeParser.ts" />

@Token
class TokenOperator extends CodeToken
{
    private allowedChar = "+-*/";

    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return (this.allowedChar.indexOf(parser.PeekChar()) != -1 && this.allowedChar.indexOf(parser.PeekChar(1)) == -1 && parser.PeekChar(1) != "=" );
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        return parser.NextChar();
    }
}