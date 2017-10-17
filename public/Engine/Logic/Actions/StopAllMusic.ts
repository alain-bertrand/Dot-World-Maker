/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class StopAllMusic extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        return "";
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        Sounds.ClearSound();
    }
}