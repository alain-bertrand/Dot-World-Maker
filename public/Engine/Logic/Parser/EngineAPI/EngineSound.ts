/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineSound
{

    @ApiMethod([{ name: "soundName", description: "The unique ID of the sound to be played." }, { name: "volume", description: "(optional) The volume at which to play the sound." }], "Plays a sound once at the specified level.")
    Play(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        Sounds.Play(values[0].GetString(), values[1] ? values[1].GetNumber() : 0.6);
        return null;
    }

    Verify_Play(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world || !world.art || !world.art.sounds)
            return;
        if (typeof values[0] != "string")
            return;
        for (var item in world.art.sounds)
            if (item.toLowerCase() == values[0].toLowerCase())
                return;
        throw "The sound '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Stops all the currently played music and sounds.")
    StopAll(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        Sounds.ClearSound();
        return null;
    }
}