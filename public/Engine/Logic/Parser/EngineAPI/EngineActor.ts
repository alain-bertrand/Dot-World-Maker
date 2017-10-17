/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineActor
{

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the monster to kill." }], "Kills an a monster and remove it from the map.")
    Kill(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].Kill && !this['Actor'].Kill.caller) || (this.Kill && !this.Kill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        if (values[0] === null)
            return null;
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor && actor.Id != world.Player.Id)
            actor.Kill();
        return null;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the monster to evaluate." }], "Distance between the player and the monster.")
    DistanceToPlayer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return new VariableValue(0);
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor)
            return new VariableValue(actor.DistanceTo(world.Player));
        return new VariableValue(0);
    }


    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to check." }], "Returns true if the actor's stat has a maximum value.")
    HasMaxValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return new VariableValue(false);
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        var stat = actor.FindStat(statName);
        return new VariableValue(stat.MaxValue ? true : false);
    }

    Verify_HasMaxValue(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to check." }], "Returns the maximum the given stat of the checked actor is.")
    GetMaxValue(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        if (values[0] === null)
            return null;
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        var stat = actor.FindStat(statName);
        return new VariableValue(stat.MaxValue);
    }

    Verify_GetMaxValue(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to increase." }, { name: "value", description: "Quantity to increase." }], "Increase the actor stat by the given value.")
    IncreaseStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].IncreaseStat && !this['Actor'].IncreaseStat.caller) || (this.IncreaseStat && !this.IncreaseStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        if (values[0] === null)
            return;
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        var value = values[2].GetNumber();
        actor.SetStat(statName, actor.GetStat(statName) + value);

        return null;
    }

    Verify_IncreaseStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }], "Reduce the actor stat by the given value.")
    ReduceStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].ReduceStat && !this['Actor'].ReduceStat.caller) || (this.ReduceStat && !this.ReduceStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        if (values[0] === null)
            return;
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        var value = values[2].GetNumber();
        actor.SetStat(statName, actor.GetStat(statName) - value);

        return null;
    }

    Verify_ReduceStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "x", description: "X coordinate of the center of effect." }, { name: "y", description: "Y coordinate of the center of effect." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }, { name: "radius", description: "Area of effect." }], "Reduce all the actor (non player) within the radius stat by the given value.")
    RadiusReduceStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].RadiusReduceStat && !this['Actor'].RadiusReduceStat.caller) || (this.RadiusReduceStat && !this.RadiusReduceStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var x = values[0].GetNumber();
        var y = values[1].GetNumber();
        var statName = values[2].GetString();
        var value = values[3].GetNumber();
        var radius = values[4].GetNumber();

        var actors: MovingActor[] = [];
        for (var a = -1; a < 2; a++)
        {
            for (var b = -1; b < 2; b++)
            {
                var area = world.GetArea(world.Player.AX + a, world.Player.AY + b, world.Player.Zone);
                if (!area)
                    continue;
                actors = actors.concat(area.actors);
            }
        }

        for (var i = 0; i < actors.length; i++)
        {
            if (actors[i].Id == world.Player.Id)
                continue;
            var a = actors[i].X + actors[i].CurrentArea.X * world.areaWidth * world.art.background.width;
            var b = actors[i].Y + actors[i].CurrentArea.Y * world.areaHeight * world.art.background.height;
            a = x - a;
            b = y - b;
            if (Math.sqrt(a * a + b * b) > radius)
                continue;
            actors[i].SetStat(statName, actors[i].GetStat(statName) - value);
        }
        return null;
    }

    Verify_RadiusReduceStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetStat(values[2]))
            throw "The stat '" + values[2] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "x", description: "X coordinate of the center of effect." }, { name: "y", description: "Y coordinate of the center of effect." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }, { name: "radius", description: "Area of effect." }], "Increase all the actor (non player) within the radius stat by the given value.")
    RadiusIncreaseStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].RadiusIncreaseStat && !this['Actor'].RadiusIncreaseStat.caller) || (this.RadiusIncreaseStat && !this.RadiusIncreaseStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var x = values[0].GetNumber();
        var y = values[1].GetNumber();
        var statName = values[2].GetString();
        var value = values[3].GetNumber();
        var radius = values[4].GetNumber();

        var actors: MovingActor[] = [];
        for (var a = -1; a < 2; a++)
        {
            for (var b = -1; b < 2; b++)
            {
                var area = world.GetArea(world.Player.AX + a, world.Player.AY + b, world.Player.Zone);
                if (!area)
                    continue;
                actors = actors.concat(area.actors);
            }
        }

        for (var i = 0; i < actors.length; i++)
        {
            if (actors[i].Id == world.Player.Id)
                continue;
            var a = actors[i].X + actors[i].CurrentArea.X * world.areaWidth * world.art.background.width;
            var b = actors[i].Y + actors[i].CurrentArea.Y * world.areaHeight * world.art.background.height;
            a = x - a;
            b = y - b;
            if (Math.sqrt(a * a + b * b) > radius)
                continue;
            actors[i].SetStat(statName, actors[i].GetStat(statName) + value);
        }
        return null;
    }

    Verify_RadiusIncreaseStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetStat(values[2]))
            throw "The stat '" + values[2] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to read." }], "Get the player stat by the given value.")
    public GetStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        return new VariableValue(actor.GetStat(statName));
    }

    Verify_GetStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to modify." }, { name: "value", description: "Value to set." }], "Set the player stat by the given value.")
    public SetStat(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].SetStat && !this['Actor'].SetStat.caller) || (this.SetStat && !this.SetStat.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var statName = values[1].GetString();
        var value = values[2].GetNumber();
        actor.SetStat(statName, value);
        return null;
    }

    Verify_SetStat(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns true if the actor is a monser.")
    IsMonster(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor && actor instanceof Monster && actor.Id != world.Player.Id)
            return new VariableValue(true);
        return new VariableValue(false);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to check." }], "Returns true if the actor's timer is currently running. If it's finished it will return false.")
    TimerRunning(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? !timer.IsOver() : false);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to set." }, { name: "time", description: "The time the actor's timer needs to be set to." }], "Sets a timer which will run till the full time is elapsed.")
    StartTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, length);
        return null;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to stop." }], "Stops a currently actor's running timer.")
    StopTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, 0);
        return null;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to check." }], "Returns the time left or 0 on the given actor's timer.")
    GetTimer(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? (timer.Length - timer.Ellapsed() < 0 ? 0 : timer.Length - timer.Ellapsed()) : 0);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns the X coordinate of the actor.")
    public GetX(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(0);

        return new VariableValue(actor.X + actor.CurrentArea.X * world.areaWidth * world.art.background.width);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns the Y coordinate of the actor.")
    public GetY(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(0);

        return new VariableValue(actor.Y + actor.CurrentArea.Y * world.areaHeight * world.art.background.height);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a variable which can be read from another function or later on.")
    public SetVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        actor.SetVariable(values[1].GetString(), values[2]);
        return null;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The variable to read." }], "Retreives a variable previously stored.")
    public GetVariable(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;

        return actor.GetVariable(values[1].GetString());
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns true if an animation is currently running.")
    public IsAnimationRunning(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(false);
        return new VariableValue(actor.ActionAnimation != ACTION_ANIMATION.NONE);
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The animation effect to set. Can be either 'none', 'attack' or 'damage'." }], "Sets the animation effect.")
    public SetAnimation(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].SetAnimation && !this['Actor'].SetAnimation.caller) || (this.SetAnimation && !this.SetAnimation.caller))
        {
            play.devTools = true;
            return;
        }*/

        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return;

        if (actor.ActionAnimationDone)
            actor.ActionAnimationDone();
        actor.ActionAnimationDone = null;

        var animation = values[1].GetString().toLowerCase();
        switch (animation)
        {
            case "attack":
                actor.ActionAnimation = ACTION_ANIMATION.ATTACK;
                break;
            case "damage":
                actor.ActionAnimation = ACTION_ANIMATION.DAMAGED;
                break;
            default:
                actor.ActionAnimation = ACTION_ANIMATION.NONE;
                break;
        }
        actor.ActionAnimationStep = 0;
        return null;
    }

    Verify_SetAnimation(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (values[1].toLowerCase() != "attack" && values[1].toLowerCase() != "damage")
            throw "The animation '" + values[1] + "' is unknown at " + line + ":" + column;
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The function name to execute when the player animation is over." }], "Will execute the function of the current block when the animation is over.")
    public ExecuteWhenAnimationDone(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        /*if ((this['Actor'] && this['Actor'].ExecuteWhenAnimationDone && !this['Actor'].ExecuteWhenAnimationDone.caller) || (this.ExecuteWhenAnimationDone && !this.ExecuteWhenAnimationDone.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/

        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return;

        actor.ActionAnimationDone = () =>
        {
            actor.ActionAnimationDone = null;
            env.ExecuteFunction(values[1].GetString(), [new VariableValue(id)]);
        };
        return null;
    }

    @ApiMethod([], "Returns the current actor ID.")
    public GetCurrentActor(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return env.GetGlobalVariable('currentActor');
    }

    @ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on an actor for a given time.")
    public AddParticleEffect(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return;

        actor.ParticleEffect = world.GetParticleSystem(values[1].GetString());
        if (actor.ParticleEffect)
            actor.ParticleEffectDuration = new Date(new Date().getTime() + values[2].GetNumber() * 1000);
        return null;
    }

    Verify_AddParticleEffect(line: number, column: number, values: any[]): void
    {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetParticleSystem(values[1]))
            throw "The particle effect '" + values[1] + "' is unknown at " + line + ":" + column;
    }
}