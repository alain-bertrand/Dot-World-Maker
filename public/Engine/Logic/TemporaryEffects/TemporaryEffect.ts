class TemporaryEffect implements TemporaryEffectInterface
{
    public Name: string;
    public MultipleInstance: boolean = true;
    public Timer: number = 30;
    public StartActions: DialogAction[] = [];
    public EndActions: DialogAction[] = [];
    public RecurringTimer: number = 0
    public RecurringActions: DialogAction[] = [];
}