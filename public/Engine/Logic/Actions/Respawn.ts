/// <reference path="../Dialogs/DialogAction.ts" />

@DialogActionClass
class Respawn extends ActionClass
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

        if (world.Player.RespawnPoint)
            Teleport.Teleport(world.Player.RespawnPoint.X, world.Player.RespawnPoint.Y, world.Player.RespawnPoint.Zone);
        else
            Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);
    }
}