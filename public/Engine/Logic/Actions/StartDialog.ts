/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class StartDialog extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("NPC");
        html += this.OptionList(id, 0, world.NPCs.map(c => c.Name).sort(), values[0], updateFunction);
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

        if (!values[0])
            throw "The action 'Start Dialog' requires a NPC name.";

        var npcName = values[0];
        npc.Dialogs = world.GetNPC(npcName).Dialogs;
        npc.currentNPC = world.GetNPC(npcName);

        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(npc.currentNPC.Name);

        NPCActor.ShowDialog(0);
    }
}