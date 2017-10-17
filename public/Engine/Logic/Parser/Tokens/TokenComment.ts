/// <reference path="../CodeToken.ts" />
/// <reference path="../CodeParser.ts" />

@Token
class TokenComment extends CodeToken
{
    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();

        if (parser.PeekChar() == "/" && parser.PeekChar(1) == "/")
            return true;
        if (parser.PeekChar() == "/" && parser.PeekChar(1) == "*")
            return true;
    }

    Extract(parser: CodeParser): string
    {
        parser.SkipSpaces();
        // Skip the two slashes
        parser.SkipChar();
        var secondChar = parser.NextChar();

        var extracted: string = "";

        // Multi line comment
        if (secondChar == "*")
        {
            while (parser.HasChar())
            {
                if (parser.PeekChar() == "*" && parser.PeekChar(1) == "/")
                {
                    parser.NextChar();
                    parser.NextChar();
                    return extracted;
                }
                extracted += parser.NextChar();
            }
        }

        // Single line comment
        while (parser.HasChar())
        {
            if (parser.PeekChar() == "\n" || parser.PeekChar() == "\r")
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    }
}