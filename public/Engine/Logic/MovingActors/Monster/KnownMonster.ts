class KnownMonster
{
    public Name: string;
    public SourceCode: string;
    public Code: CodeEnvironement;
    public Art: string;
    public DefaultMonster: KnownMonster;
    public StatDrop: MonsterDrop[] = [];
    public ItemDrop: MonsterDrop[] = [];

    public Parse(sourceCode: string, withVerify: boolean = true)
    {
        this.SourceCode = sourceCode.replace(/^\/\/\/.*$/mg, "").replace(/(\s*\r?\n){3,}/g, "\n\n");
        this.Code = CodeParser.Parse(sourceCode, withVerify);
    }

    public Verify()
    {
        var c = CodeParser.Parse(this.FullCode(), true);
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

        this.Name = this.Code.CodeVariables["name"].value;
        if (this.Code.CodeVariables["art"])
            this.Art = this.Code.CodeVariables["art"].value;
    }

    public HasFunction(functionName): boolean
    {
        return this.Code.HasFunction(functionName);
    }

    public InvokeFunction(functionName: string, values: VariableValue[]): VariableValue
    {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        return null;
    }

    public Store(): SerializedMonster
    {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            Art: this.Art,
            StatDrop: this.StatDrop,
            ItemDrop: this.ItemDrop
        }
    }

    public static Rebuild(source: SerializedMonster, alertWhileParsing?: boolean): KnownMonster;

    public static Rebuild(source: string, alertWhileParsing?: boolean): KnownMonster;

    public static Rebuild(source: any, alertWhileParsing: boolean = true)
    {
        if (typeof source == "string")
        {
            var result = new KnownMonster();
            result.Parse(source, false);
            result.Name = result.Code.CodeVariables["name"].value;
            if (result.Code.CodeVariables["art"])
                result.Art = result.Code.CodeVariables["art"].value;
            if (result.Code.CodeVariables["statdrop"])
            {
                result.StatDrop = JSON.parse(result.Code.CodeVariables["statdrop"].value.replace(/'/g, "\""));
                delete result.Code.CodeVariables["statdrop"];
            }
            if (result.Code.CodeVariables["itemdrop"])
            {
                result.ItemDrop = JSON.parse(result.Code.CodeVariables["itemdrop"].value.replace(/'/g, "\""));
                delete result.Code.CodeVariables["itemdrop"];
            }
            return result;
        }
        else
        {
            var result = new KnownMonster();
            if (alertWhileParsing)
            {
                try
                {
                    result.Parse(source.Source, false);
                }
                catch (ex)
                {
                    Framework.Alert("Error while rebuilding monster '" + source.Name + "': " + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false);
            result.Name = source.Name;
            result.Art = source.Art;
            result.StatDrop = (source.StatDrop ? source.StatDrop : []);
            result.ItemDrop = (source.ItemDrop ? source.ItemDrop : []);
            return result;
        }
    }
}