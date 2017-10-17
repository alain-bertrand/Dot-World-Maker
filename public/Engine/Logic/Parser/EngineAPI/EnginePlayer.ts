/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EnginePlayer
{
    @ApiMethod([{ name: "playerName", description: "The player to check." }], "Checks if a player is online.")
    public IsOnline(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var username = values[0].GetString().toLowerCase();
        for (var i = 0; i < chat.channels['#global'].users.length; i++)
        {
            if (chat.channels['#global'].users[i].toLowerCase() == username)
                return new VariableValue(true);
        }

        return new VariableValue(false);
    }

    @ApiMethod([{ name: "role", description: "The role to check." }], "Checks if the current player has a given role.")
    public HasRole(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        switch (values[0].GetString().toLowerCase())
        {
            case "admin":
            case "game admin":
                return new VariableValue(userRoles.contains(1000) || userRoles.contains(100));
            case "moderator":
            case "chat moderator":
                return new VariableValue(userRoles.contains(1000) || userRoles.contains(100) || userRoles.contains(10));
        }
        return new VariableValue(false);
    }

    Verify_HasRole(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            throw "The role '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!["admin", "game admin", "moderator", "chat moderator"].contains(values[0].toLowerCase()))
            throw "The role '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to increase." }, { name: "value", description: "Quantity to increase." }], "Increase the player stat by the given value.")
    public IncreaseStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].IncreaseStat && !this['Player'].IncreaseStat.caller) || (this.IncreaseStat && !this.IncreaseStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var statName = values[0].GetString();
        var value = values[1].GetNumber();
        world.Player.SetStat(statName, world.Player.GetStat(statName) + value);

        return null;
    }

    Verify_IncreaseStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to decrease." }, { name: "value", description: "Quantity to decrease." }], "Decrease the player stat by the given value.")
    public ReduceStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].ReduceStat && !this['Player'].ReduceStat.caller) || (this.ReduceStat && !this.ReduceStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var statName = values[0].GetString();
        var value = values[1].GetNumber();
        world.Player.SetStat(statName, world.Player.GetStat(statName) - value);

        return null;
    }

    Verify_ReduceStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to read." }], "Get the player stat by the given value.")
    public GetStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var statName = values[0].GetString();
        return new VariableValue(world.Player.GetStat(statName));
    }

    Verify_GetStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to check." }], "Returns true if the player's stat has a maximum value.")
    HasMaxValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var statName = values[0].GetString();
        var stat = world.Player.FindStat(statName);
        return new VariableValue(stat.MaxValue ? true : false);
    }

    Verify_HasMaxValue(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to read." }], "Get the player stat max value by the given value.")
    public GetStatMaxValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var statName = values[0].GetString();
        var result = world.Player.GetStatMaxValue(statName);
        if (isNaN(result))
            return new VariableValue(0);
        return new VariableValue(result);
    }

    Verify_GetStatMaxValue(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "statName", description: "The STAT to modify." }, { name: "value", description: "Value to set." }], "Set the player stat by the given value.")
    public SetStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetStat && !this['Player'].SetStat.caller) || (this.SetStat && !this.SetStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var statName = values[0].GetString();
        var value = values[1].GetNumber();
        world.Player.SetStat(statName, value);
        return null;
    }

    Verify_SetStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "timerName", description: "The name of the timer to check." }], "Returns true if the player's timer is currently running. If it's finished it will return false.")
    public TimerRunning(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var name = values[0].GetString().toLowerCase();
        var timer = world.Player.GetTimer(name);
        return new VariableValue(timer ? !timer.IsOver() : false);
    }

    @ApiMethod([{ name: "timerName", description: "The name of the timer to set." }, { name: "time", description: "The time the player's timer needs to be set to." }], "Sets a timer which will run till the full time is elapsed.")
    public StartTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var name = values[0].GetString().toLowerCase();
        var length = (values[1] ? values[1].GetNumber() : null);
        world.Player.SetTimer(name, length);
        return null;
    }

    @ApiMethod([{ name: "timerName", description: "The name of the timer to stop." }], "Stops a currently player's running timer.")
    StopTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var actor = world.Player;
        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, 0);
        return null;
    }

    @ApiMethod([{ name: "timerName", description: "The name of the timer to check." }], "Returns the time left or 0 on the given player's timer.")
    GetTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var actor = world.Player;
        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? (timer.Length - timer.Ellapsed() < 0 ? 0 : timer.Length - timer.Ellapsed()) : 0);
    }

    @ApiMethod([], "Respawn the player to the initial position.")
    public Respawn()
    {
        /*if ((this['Player'] && this['Player'].Respawn && !this['Player'].Respawn.caller) || (this.Respawn && !this.Respawn.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        if (world.Player.RespawnPoint)
            Teleport.Teleport(world.Player.RespawnPoint.X, world.Player.RespawnPoint.Y, world.Player.RespawnPoint.Zone);
        else
            Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);
        return null;
    }

    @ApiMethod([{ name: "x", description: "The X coordinate where to place the player." }, { name: "y", description: "The Y coordinate where to place the player." }, { name: "zone", description: "The Zone where to place the player." }], "Set the respawn point of the player.")
    public SetRespawn(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetRespawn && !this['Player'].SetRespawn.caller) || (this.SetRespawn && !this.SetRespawn.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.RespawnPoint = { X: values[0].GetNumber(), Y: values[1].GetNumber(), Zone: values[2].GetString() };
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        return null;
    }

    Verify_SetRespawn(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetZone(values[2]))
            throw "The zone '" + values[2] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "x", description: "The X coordinate where to place the player." }, { name: "y", description: "The Y coordinate where to place the player." }, { name: "zone", description: "The Zone where to place the player." }], "Place the player on another position on the same map or on another one.")
    public Teleport(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].Teleport && !this['Player'].Teleport.caller) || (this.Teleport && !this.Teleport.caller))
        {
            play.devTools = true;
            return;
        }*/

        Teleport.Teleport(values[0].GetNumber(), values[1].GetNumber(), values[2].GetString());
        return null;
    }

    Verify_Teleport(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetZone(values[2]))
            throw "The zone '" + values[2] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Returns the X coordinate of the player.")
    public GetX(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.X + world.Player.AX * world.areaWidth * world.art.background.width);
    }

    @ApiMethod([], "Returns the Y coordinate of the player.")
    public GetY(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.Y + world.Player.AY * world.areaHeight * world.art.background.height);
    }

    @ApiMethod([], "Returns true if an animation is currently running.")
    public IsAnimationRunning(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.ActionAnimation != ACTION_ANIMATION.NONE);
    }

    @ApiMethod([{ name: "name", description: "The animation effect to set. Can be either 'none', 'attack' or 'damage'." }], "Sets the animation effect.")
    public SetAnimation(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetAnimation && !this['Player'].SetAnimation.caller) || (this.SetAnimation && !this.SetAnimation.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        if (world.Player.ActionAnimationDone)
            world.Player.ActionAnimationDone();
        world.Player.ActionAnimationDone = null;

        var animation = values[0].GetString().toLowerCase();
        switch (animation)
        {
            case "attack":
                world.Player.ActionAnimation = ACTION_ANIMATION.ATTACK;
                break;
            case "damage":
                world.Player.ActionAnimation = ACTION_ANIMATION.DAMAGED;
                break;
            default:
                world.Player.ActionAnimation = ACTION_ANIMATION.NONE;
                break;
        }
        world.Player.ActionAnimationStep = 0;
        return null;
    }

    Verify_SetAnimation(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (values[0].toLowerCase() != "attack" && values[0].toLowerCase() != "damage")
            throw "The animation '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "name", description: "The function name to execute when the player animation is over." }], "Will execute the function of the current block when the animation is over.")
    public ExecuteWhenAnimationDone(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].ExecuteWhenAnimationDone && !this['Player'].ExecuteWhenAnimationDone.caller) || (this.ExecuteWhenAnimationDone && !this.ExecuteWhenAnimationDone.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.ActionAnimationDone = () =>
        {
            world.Player.ActionAnimationDone = null;
            //console.log("Execute player after animation");
            env.ExecuteFunction(values[0].GetString(), []);
        };
        return null;
    }

    @ApiMethod([{ name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a variable which can be read from another function or later on.")
    public SetVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetVariable && !this['Player'].SetVariable.caller) || (this.SetVariable && !this.SetVariable.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.SetVariable(values[0].GetString(), values[1]);
        return null;
    }

    @ApiMethod([{ name: "name", description: "The variable to read." }], "Retreives a variable previously stored.")
    public GetVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return world.Player.GetVariable(values[0].GetString());
    }

    @ApiMethod([{ name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a quest variable which can be read from another function or later on.")
    public SetQuestVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetQuestVariable && !this['Player'].SetQuestVariable.caller) || (this.SetQuestVariable && !this.SetQuestVariable.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.SetQuestVariable(values[0].GetString(), values[1].GetNumber());
        return null;
    }

    @ApiMethod([{ name: "name", description: "The variable to read." }], "Retreives a quest variable previously stored.")
    public GetQuestVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.GetQuestVariable(values[0].GetString()));
    }

    @ApiMethod([{ name: "name", description: "The name of the character art to use." }], "Set the player look to the wished character art.")
    public SetLook(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].SetLook && !this['Player'].SetLook.caller) || (this.SetLook && !this.SetLook.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.Name = values[0].GetString();
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        return null;
    }

    Verify_SetLook(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.art.characters[values[0]])
            throw "The charcter '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Returns the player the current character art used by the player.")
    public GetLook(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.Name);
    }

    @ApiMethod([], "Returns the currently player selected skill.")
    public GetCurrentSkill(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.CurrentSkill);
    }

    @ApiMethod([], "Returns the true if the player is currently within a NPC dialog / shop.")
    public IsInDialog(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.InDialog);
    }

    @ApiMethod([{ name: "name", description: "The name of the temporary effect to add." }], "Adds a temporary effect.")
    public StartTemporaryEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].StartTemporaryEffect && !this['Player'].StartTemporaryEffect.caller) || (this.StartTemporaryEffect && !this.StartTemporaryEffect.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.StartTemporaryEffect(values[0].GetString());
        return null;
    }

    Verify_StartTemporaryEffect(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetTemporaryEffect(values[0]))
            throw "The temporary effect '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "name", description: "The name of the temporary effect to remove." }], "Removes the player temporary effects.")
    public RemoveTemporaryEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].RemoveTemporaryEffect && !this['Player'].RemoveTemporaryEffect.caller) || (this.RemoveTemporaryEffect && !this.RemoveTemporaryEffect.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.RemoveTemporaryEffect(values[0].GetString());
        return null;
    }

    Verify_RemoveTemporaryEffect(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetTemporaryEffect(values[0]))
            throw "The temporary effect '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Removes all the player temporary effects.")
    public RemoveAllTemporaryEffects(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].RemoveAllTemporaryEffects && !this['Player'].RemoveAllTemporaryEffects.caller) || (this.RemoveAllTemporaryEffects && !this.RemoveAllTemporaryEffects.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.ClearTemporaryEffects();
        return null;
    }

    @ApiMethod([], "Stores the current player look.")
    public StorePlayerLook(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].StorePlayerLook && !this['Player'].StorePlayerLook.caller) || (this.StorePlayerLook && !this.StorePlayerLook.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.SetQuestVariable("__PlayerLook", world.Player.Name);
        return null;
    }

    @ApiMethod([], "Restores the current player look.")
    public RestorePlayerLook(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Player'] && this['Player'].RestorePlayerLook && !this['Player'].RestorePlayerLook.caller) || (this.RestorePlayerLook && !this.RestorePlayerLook.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        world.Player.Name = world.Player.GetQuestVariable("__PlayerLook");
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        return null;
    }

    @ApiMethod([{ name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on the player for a given time.")
    public AddParticleEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        world.Player.ParticleEffect = world.GetParticleSystem(values[0].GetString());
        if (world.Player.ParticleEffect)
            world.Player.ParticleEffectDuration = new Date(new Date().getTime() + values[1].GetNumber() * 1000);
        return null;
    }

    Verify_AddParticleEffect(line: number, column: number, values: any[]): void
    {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetParticleSystem(values[0]))
            throw "The particle effect '" + values[0] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([], "Returns the player name.")
    public GetName(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return new VariableValue(world.Player.Username);
    }
}