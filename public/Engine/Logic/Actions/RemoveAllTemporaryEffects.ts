/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class RemoveAllTemporaryEffects extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        return "";
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!this.Execute.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        world.Player.ClearTemporaryEffects();
    }
}