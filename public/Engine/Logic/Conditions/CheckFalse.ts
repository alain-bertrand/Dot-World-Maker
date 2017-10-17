/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckFalse extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        return false;
    }
}