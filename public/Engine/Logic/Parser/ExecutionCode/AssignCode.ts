/// <reference path="ExecutionCode.ts" />

class AssignCode implements ExecutionCode
{
    public Name: string;
    public Index: boolean = false;

    constructor(name: string, index: boolean = false)
    {
        this.Name = name;
        this.Index = index;
    }

    public Execute(env: CodeEnvironement)
    {
        if (this.Index == false)
        {
            var a = env.Pop();
            env.SetVariable(this.Name, a);
        }
        else
        {
            var idx = env.Pop().GetNumber();
            var a = env.Pop();
            var v = env.GetVariable(this.Name);
            v.Value[idx] = a;
        }
        env.CodeLine++;
    }
}