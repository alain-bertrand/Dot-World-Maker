class Answer implements AnswerInterface
{
    public Text: string = "Ok";
    public Actions: DialogAction[] = [];
    public Conditions: DialogCondition[] = [];
    public JumpTo: number = -1;
}