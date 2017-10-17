class KnownStat
{
    public Name: string;
    public SourceCode: string;
    public DefaultValue: number;
    public MonsterStat: boolean = false;
    public Code: CodeEnvironement;

    public Parse(sourceCode: string, withVerify: boolean = true)
    {
        this.SourceCode = sourceCode.replace(/^\/\/\/.*$/mg, "").replace(/(\s*\r?\n){3,}/g, "\n\n");
        this.Code = CodeParser.Parse(sourceCode, withVerify);
    }

    public Verify()
    {
        var c = CodeParser.Parse(this.FullCode(), true);
    }

    public CodeVariable(name: string): string
    {
        var result = this.Code.CodeVariables[name.toLowerCase()];
        if (result)
            return result.value;
        return null;
    }

    public CodeVariables(): string
    {
        var code = "";

        for (var i in this.Code.CodeVariables)
            code += "/// " + this.Code.CodeVariables[i].name + ": " + this.Code.CodeVariables[i].value + "," + this.Code.CodeVariables[i].type + "\n";
        return code;
    }

    public FullCode(): string
    {
        return this.CodeVariables() + this.SourceCode;
    }

    public UpdateCodeVariables()
    {
        this.Parse(this.FullCode());

        if (this.Code.CodeVariables["name"])
            this.Name = this.Code.CodeVariables["name"].value;
        if (this.Code.CodeVariables["defaultvalue"])
            this.DefaultValue = parseFloat(this.Code.CodeVariables["defaultvalue"].value);
        if (this.Code.CodeVariables["monsterstat"])
            this.MonsterStat = (this.Code.CodeVariables["monsterstat"].value.trim().toLowerCase() == "true" ? true : false);
    }

    public InvokeFunction(functionName: string, values: VariableValue[]): VariableValue
    {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        return null;
    }

    public Store(): SerializedStat
    {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            DefaultValue: this.DefaultValue,
            MonsterStat: this.MonsterStat
        }
    }

    public static Rebuild(source: SerializedStat, alertWhileParsing?: boolean): KnownStat;

    public static Rebuild(source: string, alertWhileParsing?: boolean): KnownStat;

    public static Rebuild(source: any, alertWhileParsing: boolean = true): KnownStat
    {
        if (typeof source == "string")
        {
            var result = new KnownStat();
            try
            {
                result.Parse(source, false);
                if (result.Code.CodeVariables["name"])
                    result.Name = result.Code.CodeVariables["name"].value;
                if (result.Code.CodeVariables["defaultvalue"])
                    result.DefaultValue = parseFloat(result.Code.CodeVariables["defaultvalue"].value);
                if (result.Code.CodeVariables["monsterstat"])
                    result.MonsterStat = (result.Code.CodeVariables["monsterstat"].value.trim().toLowerCase() == "true" ? true : false);
            }
            catch (ex)
            {
                Framework.Alert("Error while parsing stat " + ex);
            }

            return result;
        }
        else
        {
            var result = new KnownStat();
            if (alertWhileParsing)
            {
                try
                {
                    result.Parse(source.Source, false);
                }
                catch (ex)
                {
                    Framework.Alert("Error while rebuilding stat '" + source.Name + "':" + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false);
            result.Name = source.Name;
            result.MonsterStat = source.MonsterStat;
            result.DefaultValue = source.DefaultValue;
            return result;
        }
    }
}