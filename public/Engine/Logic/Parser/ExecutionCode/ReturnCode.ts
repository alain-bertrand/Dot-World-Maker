/// <reference path="ExecutionCode.ts" />

class ReturnCode implements ExecutionCode
{
    public Execute(env: CodeEnvironement)
    {
        env.CodeLine = -1;
    }
}