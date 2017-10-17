/// <reference path="../CodeParser.ts" />

@Token
class TokenOpenSquareBracket extends CodeToken
{
    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return (parser.PeekChar() == "[");
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        return parser.NextChar();
    }
}