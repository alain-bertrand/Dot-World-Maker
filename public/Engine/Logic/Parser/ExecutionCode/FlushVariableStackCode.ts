/// <reference path="ExecutionCode.ts" />

class FlushVariableStackCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        env.Flush();
        env.CodeLine++;
    }
}