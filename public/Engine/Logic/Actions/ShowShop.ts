/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class ShowShop extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        return html;
    }

    public Execute(values: string[], env?: CodeEnvironement): void
    {
        if (!this.Execute.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        npc.canJump = false;
        NPCActor.ShowShop();
    }
}