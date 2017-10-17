/// <reference path="../CodeParser.ts" />

@Token
class TokenNumber extends CodeToken
{
    private allowedChar = "0123456789";

    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        if (parser.PeekChar() == "." && this.allowedChar.indexOf(parser.PeekChar(1)) != -1)
            return true;
        return this.allowedChar.indexOf(parser.PeekChar()) != -1 && parser.PeekChar() != ".";
    }

    Extract(parser: CodeParser): string
    {
        var extracted = "";
        parser.SkipSpaces();

        while (parser.HasChar())
        {
            if (this.allowedChar.indexOf(parser.PeekChar()) == -1 && parser.PeekChar() != ".")
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    }
}