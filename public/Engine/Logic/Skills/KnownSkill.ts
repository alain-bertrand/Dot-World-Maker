class KnownSkill
{
    public Name: string;
    public SourceCode: string;
    public AutoReceive: boolean = false;
    public Code: CodeEnvironement;
    public BaseSkill: KnownSkill;

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

        this.Name = this.Code.CodeVariables["name"].value;
        this.AutoReceive = (this.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
    }

    public InvokeFunction(functionName: string, values: VariableValue[]): VariableValue
    {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        if (this.BaseSkill && this.BaseSkill.Code.HasFunction(functionName))
        {
            this.BaseSkill.Code.ParentCode = this.Code;
            return this.BaseSkill.Code.ExecuteFunction(functionName, values);
        }
        return null;
    }

    public Store(): SerializedSkill
    {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            Auto: this.AutoReceive
        }
    }

    public static Rebuild(source: SerializedSkill, alertWhileParsing?: boolean): KnownSkill;

    public static Rebuild(source: string, alertWhileParsing?: boolean): KnownSkill;

    public static Rebuild(source: any, alertWhileParsing: boolean = true): KnownSkill
    {
        if (typeof source == "string")
        {
            var result = new KnownSkill();
            try
            {
                result.Parse(source, false);
                result.Name = result.Code.CodeVariables["name"].value;
                if (result.Code.CodeVariables["quicksloteditable"] === null || result.Code.CodeVariables["quicksloteditable"] === undefined)
                    result.Code.CodeVariables["quicksloteditable"] = {
                        name: "QuickslotEditable",
                        type: "boolean",
                        value: (result.Name == "Attack" ? "false" : "true"),
                    }
                result.AutoReceive = (result.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
            }
            catch (ex)
            {
                Framework.Alert("Error while rebuilding skill: " + ex);
            }
            return result;
        }
        else
        {
            var result = new KnownSkill();
            if (alertWhileParsing)
            {
                try
                {
                    result.Parse(source.Source, false);
                }
                catch (ex)
                {
                    Framework.Alert("Error while rebuilding skill '" + source.Name + "': " + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false)
            result.Name = source.Name;
            if (result.Code.CodeVariables["quicksloteditable"] === null || result.Code.CodeVariables["quicksloteditable"] === undefined)
                result.Code.CodeVariables["quicksloteditable"] = {
                    name: "QuickslotEditable",
                    type: "boolean",
                    value: (result.Name == "Attack" ? "false" : "true"),
                }
            result.AutoReceive = source.Auto;
            return result;
        }
    }
}