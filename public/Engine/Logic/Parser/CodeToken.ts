abstract class CodeToken
{
    abstract CanBeUsed(parser: CodeParser): boolean;
    abstract Extract(parser: CodeParser): string;
}