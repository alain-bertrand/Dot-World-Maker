enum ValueType
{
    Number,
    String,
    Boolean,
    Null,
    Array
}

class VariableValue
{
    public Value: any;
    public Type: ValueType;

    public constructor(source: any)
    {
        if (source === null)
        {
            this.Value = null;
            this.Type = ValueType.Null;
        }
        else if (typeof source == "string")
        {
            this.Value = source;
            this.Type = ValueType.String;
        }
        else if (typeof source == "number")
        {
            this.Value = source;
            this.Type = ValueType.Number;
        }
        else if (typeof source == "boolean")
        {
            this.Value = source;
            this.Type = ValueType.Boolean;
        }
        else if (source instanceof Array)
        {
            this.Value = source;
            this.Type = ValueType.Array;
        }
        else if (source instanceof VariableValue)
        {
            this.Value = source.Value;
            this.Type = source.Type;
        }
        // Convert from a CodeVariable
        else if (source.name && source.value && source.type)
        {
            switch (source.type)
            {
                case "number":
                    return new VariableValue(parseFloat(source.value));
                case "string":
                    return new VariableValue(source.value);
                case "boolean":
                    return new VariableValue(source.value.trim().toLowerCase() == "true" ? true : false);
                default:
                    return new VariableValue(source.value);
            }
        }
        else
            throw "Cannot convert this type (" + (typeof source) + ") to a VariableValue";
    }

    public GetNumber(): number
    {
        switch (this.Type)
        {
            case ValueType.String:
                return parseFloat(this.Value);
            case ValueType.Boolean:
                return (this.Value ? 1 : 0);
            case ValueType.Number:
                return this.Value;
        }
    }

    public GetString(): string
    {
        switch (this.Type)
        {
            case ValueType.String:
                return this.Value;
            case ValueType.Boolean:
                return "" + this.Value;
            case ValueType.Number:
                return "" + this.Value;
            case ValueType.Null:
                return "";
        }
    }

    public GetBoolean(): boolean
    {
        switch (this.Type)
        {
            case ValueType.String:
                return (this.Value.toLower() == "true" ? true : false);
            case ValueType.Boolean:
                return this.Value;
            case ValueType.Number:
                return (this.Value == 0 ? false : true);
        }
    }
}