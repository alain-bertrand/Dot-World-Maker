/// <reference path="../CodeParser.ts" />

@Token
class TokenName extends CodeToken
{
    private allowedChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
    private secondChar = "0123456789";

    CanBeUsed(parser: CodeParser): boolean
    {
        parser.SkipSpaces();
        return this.allowedChar.indexOf(parser.PeekChar()) != -1;
    }

    Extract(parser: CodeParser): string
    {
        var extracted = "";
        parser.SkipSpaces();

        while (parser.HasChar())
        {
            if (extracted.length > 0 && this.allowedChar.indexOf(parser.PeekChar()) == -1 && this.secondChar.indexOf(parser.PeekChar()) == -1)
                break;
            else if (extracted.length == 0 && this.allowedChar.indexOf(parser.PeekChar()) == -1)
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    }
}