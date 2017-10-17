class ObjectParameter implements ObjectParameterInterface
{
    public Name: string;
    public Value: string;

    public constructor(name?: string, value?: string)
    {
        this.Name = name;
        this.Value = value;
    }
}