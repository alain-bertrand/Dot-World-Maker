class ObjectDefinedParameter implements ObjectDefinedParameterInterface
{
    public Name: string;
    public DefaultValue: string;

    public constructor(name?: string, defaultValue?: string)
    {
        this.Name = name;
        this.DefaultValue = defaultValue;
    }
}