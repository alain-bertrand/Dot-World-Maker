/// <reference path="../Dialogs/DialogAction.ts" />

var lastMapMessageTimeout = null;

@DialogActionClass
class ShowMapMessage extends ActionClass
{
    public Display(id: number, values: string[], updateFunction?: string): string
    {
        var html = "";
        html += this.Label("Message");
        html += this.Input(id, 0, values[0], updateFunction);
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
            throw "The action 'ShowMapMessage' requires a message.";

        if (lastMapMessageTimeout)
            clearTimeout(lastMapMessageTimeout);

        $("#mapMessage").show();
        $("#mapMessage .gamePanelContentNoHeader").html("<center>" + values[0].htmlEntities() + "</center>")
        lastMapMessageTimeout = setTimeout(() =>
        {
            lastMapMessageTimeout = null;
            $("#mapMessage").hide();
        }, 3000);
    }
}