/// <reference path="../CodeEnvironement.ts" />
var gp = 0;
@ApiClass
class EngineGame
{

    @ApiMethod([{ name: "statisticName", description: "The statistic type to add ('monster_kill', 'level_up', 'player_kill')." }], "Increment the statistic counter (visible in the \"Admin\" =&gt; \"Game Stat\" menu).")
    AddStatistic(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (Main.CheckNW())
            return;
        /*if ((this['Game'] && this['Game'].AddStatistic && !this['Game'].AddStatistic.caller) || (this.AddStatistic && !this.AddStatistic.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var stat = values[0].GetString();
        EngineGame.IncreaseStatistic(stat);
        return null;
    }

    Verify_AddStatistic(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        switch (values[0].toLowerCase())
        {
            case "monster_kill":
            case "level_up":
            case "player_kill":
                break;
            default:
                throw "The statistic name '" + values[0] + "' is unknown at " + line + ":" + column;
        }
    }

    public static IncreaseStatistic(stat: string)
    {
        if (Main.CheckNW())
            return;
        if (game)
            return;
        /*if (EngineGame.IncreaseStatistic && !EngineGame.IncreaseStatistic.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var statId = 0;
        switch (stat.toLowerCase())
        {
            case "monster_kill":
                statId = 100;
                break;
            case "level_up":
                statId = 101;
                break;
            case "player_kill":
                statId = 102;
                break;
            default:
                throw "Unkown stat type '" + stat + "'";
        }

        $.ajax({
            type: 'POST',
            url: '/backend/AddStat',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                stat: statId
            },
            success: (msg) =>
            {
            },
            error: function (msg, textStatus)
            {
            }
        });
        return null;
    }

    @ApiMethod([{ name: "time", description: "Time in millisecond to pause the execution." }], "Pause the execution of the scripts and then continues.")
    Pause(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var toWait = 1000;
        if (values.length > 0)
            toWait = values[0].GetNumber();
        env.StoreStack(() =>
        {
            setTimeout(() =>
            {
                env.RebuildStack();
            }, toWait);
        });
        return null;
    }

    @ApiMethod([], "Returns the date as string format (YYYY/MM/DD).")
    GetDateString(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(Main.FormatDate(new Date()));
    }

    @ApiMethod([{ name: "key", description: "Key to bind." }, { name: "callback", description: "The function to call back once the key is pressed." }], "Hook a function to a key binding. Can be placed in the \"AutoRun\" function of your generic code to have it always set.")
    AddKeyBinding(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        play.keyHook[values[0].GetString()] = values[1].GetString();
        return null;
    }
}