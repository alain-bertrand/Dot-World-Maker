class KnownObject implements KnownObjectInterface
{
    public Name: string;
    public ObjectType: string;
    public Slots: string[];
    public Parameters: ObjectParameter[];
    public Image: string;
    public Weight: number;
    public MaxStack: number;
    public Price: number;
    public Description: string;
    public Action: string;
    public ActionCode: string;
    public UsageConditions: DialogCondition[] = [];
    public UnwearConditions: DialogCondition[] = [];
    public WearConditions: DialogCondition[] = [];
    public DropConditions: DialogCondition[] = [];
    public UsageActions: DialogAction[] = [];

    public constructor(name?: string, objectType?: string, slots?: string[], weight?: number, price?: number, description?: string, maxStack?: number, action?: string, actionCode?: string, parameters?: ObjectParameter[])
    {
        this.Name = name;
        this.ObjectType = objectType;
        this.Slots = slots ? slots : [];
        this.Weight = weight ? weight : 0;
        this.Price = price ? price : 0;
        this.Description = description ? description : "";
        this.MaxStack = maxStack ? maxStack : 0;
        this.Action = action;
        this.ActionCode = actionCode;
        this.Parameters = parameters ? parameters : [];
        this.Image = '/art/tileset2/inventory_object.png';
    }

    public static DefaultObjects(): KnownObject[]
    {
        var result: KnownObject[] = [
            new KnownObject("Wood Stick", "Weapon", ["RightHand"], 2, 2, "A simple wood stick to defend yourself", 1, null, null, [new ObjectParameter("Base Damage", "5"), new ObjectParameter("Attack Speed", "0.5")]),
            new KnownObject("Apple", "Food", [], 1, 1, "A red apple", 10, null, null, [new ObjectParameter("Life Recover", "3")])
        ];
        return result;
    }

    public GetType(): ObjectType
    {
        for (var i = 0; i < world.InventoryObjectTypes.length; i++)
            if (world.InventoryObjectTypes[i].Name == this.ObjectType)
                return world.InventoryObjectTypes[i];
        return null;
    }

    public GetParameter(statName: string): string
    {
        // Checks within the object properties
        for (var prop in this)
            if (prop.toLowerCase() == statName.toLowerCase())
                return "" + this[prop];

        // Checks within the additional parameters
        for (var i = 0; i < this.Parameters.length; i++)
            if (this.Parameters[i].Name.toLowerCase() == statName.toLowerCase())
                return this.Parameters[i].Value;
        return null;
    }


    public CanUnwear(): boolean
    {
        if (world.SimplifiedObjectLogic)
        {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (!this.UnwearConditions)
                this.UnwearConditions = [];
            if (this.UnwearConditions.length)
                for (var i = 0; i < this.UnwearConditions.length; i++)
                {
                    if (!dialogCondition.code[this.UnwearConditions[i].Name].Check(this.UnwearConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().UnwearConditions.length; i++)
                {
                    if (!dialogCondition.code[this.GetType().UnwearConditions[i].Name].Check(this.GetType().DropConditions[i].Values, env))
                        return false;
                }
            return true;
        }

        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanUnwear"))
            return code.ExecuteFunction("CanUnwear", [new VariableValue(this.Name)]).GetBoolean();

        return true;
    }

    public CanWear(): boolean
    {
        if (this.Slots.length == 0)
            return false;

        if (world.SimplifiedObjectLogic)
        {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.WearConditions.length)
                for (var i = 0; i < this.WearConditions.length; i++)
                {
                    if (!dialogCondition.code[this.WearConditions[i].Name].Check(this.WearConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().WearConditions.length; i++)
                {
                    if (!dialogCondition.code[this.GetType().WearConditions[i].Name].Check(this.GetType().WearConditions[i].Values, env))
                        return false;
                }
            return true;
        }

        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanWear"))
            return code.ExecuteFunction("CanWear", [new VariableValue(this.Name)]).GetBoolean();

        return true;
    }

    public CanUse(): boolean
    {
        if (world.SimplifiedObjectLogic)
        {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.UsageConditions.length)
                for (var i = 0; i < this.UsageConditions.length; i++)
                {
                    if (!dialogCondition.code[this.UsageConditions[i].Name].Check(this.UsageConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().UsageConditions.length; i++)
                {
                    if (!dialogCondition.code[this.GetType().UsageConditions[i].Name].Check(this.GetType().UsageConditions[i].Values, env))
                        return false;
                }
            return true;
        }

        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanUse"))
            return code.ExecuteFunction("CanUse", [new VariableValue(this.Name)]).GetBoolean();

        return true;
    }

    public CanDrop(): boolean
    {
        if (world.SimplifiedObjectLogic)
        {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.DropConditions.length)
                for (var i = 0; i < this.DropConditions.length; i++)
                {
                    if (!dialogCondition.code[this.DropConditions[i].Name].Check(this.DropConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().DropConditions.length; i++)
                {
                    if (!dialogCondition.code[this.GetType().DropConditions[i].Name].Check(this.GetType().DropConditions[i].Values, env))
                        return false;
                }
            return true;
        }

        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanDrop"))
            return code.ExecuteFunction("CanDrop", [new VariableValue(this.Name)]).GetBoolean();

        return true;
    }

    public Use()
    {
        if (world.SimplifiedObjectLogic)
        {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.UsageActions.length)
                for (var i = 0; i < this.UsageActions.length; i++)
                    dialogAction.code[this.UsageActions[i].Name].Execute(this.UsageActions[i].Values, env);
            else
                for (var i = 0; i < this.GetType().UsageActions.length; i++)
                    dialogAction.code[this.GetType().UsageActions[i].Name].Execute(this.GetType().UsageActions[i].Values, env);
            return;
        }

        var code = this.GetObjectCode();
        if (code.HasFunction("Use"))
            code.ExecuteFunction("Use", [new VariableValue(this.Name)]);
    }

    public GetObjectCode(): CodeEnvironement
    {
        var code: CodeEnvironement;
        if (this.Action && this.ActionCode && this.ActionCode.trim() != "")
        {
            if (this.ActionCode.indexOf("function") == -1)
                return CodeParser.Parse("function Use() { " + this.ActionCode + ";}");
            return CodeParser.Parse(this.ActionCode);
        }
        else if (this.GetType().Action)
        {
            if (this.GetType().ActionCode.indexOf("function") == -1)
                return CodeParser.Parse("function Use() { " + this.GetType().ActionCode + ";}");
            return CodeParser.Parse(this.GetType().ActionCode);
        }
        return code;
    }

    public ActionLabel(): string
    {
        if (this.Action)
            return this.Action;
        else if (this.GetType().Action)
            return this.GetType().Action;
        return null;
    }
}