class ActorTimer
{
    public Name: string;
    public StartTime: Date;
    public Length: number;

    constructor(name: string, length?: number)
    {
        this.StartTime = new Date();
        this.Length = length;
        this.Name = name;
    }

    public IsOver(): boolean
    {
        return (this.Ellapsed() >= this.Length);
    }

    public Ellapsed(): number
    {
        var now = new Date();
        return (now.getTime() - this.StartTime.getTime()) / 1000;
    }

    public Reset(length?: number): void
    {
        this.StartTime = new Date();
        this.Length = length;
    }
}