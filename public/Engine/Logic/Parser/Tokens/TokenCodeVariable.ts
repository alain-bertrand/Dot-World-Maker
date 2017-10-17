/// <reference path="../CodeParser.ts" />

@Token
class TokenCodeVariable extends CodeToken
{
    CanBeUsed(parser: CodeParser)
    {
        parser.SkipSpaces();
        return (parser.PeekChar() == "@");
    }

    Extract(parser: CodeParser)
    {
        var extracted = parser.NextChar();
        while (parser.HasChar())
        {
            var c = parser.NextChar();
            extracted += c;
            if (c == extracted.charAt(0))
                break;
        }
        return extracted.substr(1, extracted.length - 2);
    };
}