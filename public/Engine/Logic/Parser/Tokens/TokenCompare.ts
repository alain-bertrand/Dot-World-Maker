/// <reference path="../CodeParser.ts" />

@Token
class TokenCompare extends CodeToken
{
    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return ((parser.PeekChar() == "=" && parser.PeekChar(1) == "=") ||
            parser.PeekChar() == "<" ||
            parser.PeekChar() == ">" ||
            (parser.PeekChar() == "!" && parser.PeekChar(1) == "="));
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        if ((parser.PeekChar() == "<" || parser.PeekChar() == ">") && parser.PeekChar(1) != "=")
            return parser.NextChar();
        return parser.NextChar() + parser.NextChar();
    }
}