/// <reference path="../Dialogs/DialogCondition.ts" />

@DialogConditionClass
class CheckMinimapIsVisible extends ConditionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        return html;
    }

    public Check(values: string[], env?: CodeEnvironement): boolean
    {
        return play.showMinimap;
    }
}