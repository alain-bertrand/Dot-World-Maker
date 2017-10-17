/// <reference path="../CodeEnvironement.ts" />

@ApiClass
class EngineMonster
{
    @ApiMethod([{ name: "monsterId", description: "Monster ID to check." }, { name: "parameterName", description: "Monster parameter to read." }], "Returns the value of the monster parameter.")
    RetreiveSetting(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var name = values[1].GetString().toLowerCase();

        var actor = MovingActor.FindActorById(id);
        if (actor && actor instanceof Monster)
        {
            var monster = <Monster>actor;
            if (monster.MonsterEnv.Code.CodeVariables[name])
                return new VariableValue(monster.MonsterEnv.Code.CodeVariables[name]);
            if (monster.MonsterEnv.DefaultMonster.Code.CodeVariables[name])
                return new VariableValue(monster.MonsterEnv.DefaultMonster.Code.CodeVariables[name]);
        }
        return new VariableValue(null);
    }

    @ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }, { name: "maxDistance", description: "Max distance in tiles before we use a random walk (must be between 5 and 20)." }], "Moves the monster toward the player if possible.")
    HuntWalk(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = <Monster>MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var dist = values[1].GetNumber();
        actor.HuntWalk(dist);
        return null;
    }

    @ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }], "Moves the monster randomly.")
    RandomWalk(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = <Monster>MovingActor.FindActorById(id);
        if(actor)
            actor.RandomWalk();
        return null;
    }

    @ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }], "Returns the name of the monster.")
    GetName(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();
        var actor = <Monster>MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue("");

        return new VariableValue(actor.Name);
    }
}