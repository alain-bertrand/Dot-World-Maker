/// <reference path="../CodeParser.ts" />

@Token
class TokenDot extends CodeToken
{
    private numberChar = "0123456789";

    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return (parser.PeekChar() == "." && this.numberChar.indexOf(parser.PeekChar(1)) == -1);
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        return parser.NextChar();
    }
}