/// <refe/rence path="ExecutionCode.ts" />

class FunctionCallCode implements ExecutionCode
{
    public Name: string;
    public ParametersCount: number;
    private type: string;

    constructor(name: string, parametersCount: number)
    {
        this.Name = name;
        this.ParametersCount = parametersCount;
    }

    public Execute(env: CodeEnvironement)
    {
        var values: VariableValue[] = [];
        for (var i = this.ParametersCount - 1; i >= 0; i--)
            values[i] = env.Pop();

        env.CodeLine++;

        if (!this.type)
        {
            var parts = this.Name.split('.');
            if (parts.length == 2 && env.HasWrapper(this.Name))
                this.type = "wrapper";
            else if (parts.length == 1 || parts.length == 3)
                this.type = "sub";
            else
                this.type = "api";
        }

        switch (this.type)
        {
            case "wrapper":
                env.ExecuteWrapperFunctionCode(this.Name, values);
                break;
            case "sub":
                env.ExecuteSubFunctionCode(this.Name, values);
                break;
            case "api":
                var a = env.ExecuteFunction(this.Name, values);
                if (a !== null)
                    env.Push(a);
                break;
        }
    }
}