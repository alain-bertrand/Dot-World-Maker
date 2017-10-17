/// <reference path="../CodeParser.ts" />

@Token
class TokenAssign extends CodeToken
{
    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return (parser.PeekChar() == "=" && parser.PeekChar(1) != "=");
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        return parser.NextChar();
    }
}