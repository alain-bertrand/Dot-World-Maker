var statCodes = ["// Default life stat.\n\
\n\
/// Name: Life,string\n\
/// DisplayName:HP,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 10,number\n\
/// MonsterStat: true,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
    diff = wishedValue - oldValue;\n\
    color = '#FFFFFF';\n\
    if(Actor.IsMonster(currentActor))\n\
        color = '#FF0000';\n\
    if(diff < 0)\n\
        Display.AddMapMessage(Actor.GetX(currentActor), Actor.GetY(currentActor) - 40, Math.abs(diff) + ' dmg', color);\n\
    else if(diff > 0)\n\
        Display.AddMapMessage(Actor.GetX(currentActor), Actor.GetY(currentActor) - 40, diff + ' healed', color);\n\
\n\
    // Actor dies...\n\
    if(newValue <= 0)\n\
    {\n\
        // If it's a monster simply destroy it \n\
        if(Actor.IsMonster(currentActor))\n\
        {\n\
            Actor.Kill(currentActor);\n\
            // Increase the game statistics\n\
            Game.AddStatistic('monster_kill');\n\
        }\n\
        // It's the player, reset the life to it's max and respawn it to the initial position.\n\
        else\n\
        {\n\
            Player.SetStat('Life', Player.GetStatMaxValue('Life'));\n\
            // Increase the game statistics\n\
            Game.AddStatistic('player_kill');\n\
            Player.Respawn();\n\
        }\n\
    }\n\
}\n\
\n\
// Max life is the DefaultValue + 10 * strength\n\
function MaxValue(currentActor)\n\
{\n\
    return @DefaultValue@ + Player.GetStat('Strength') * 10;\n\
}",
    "// Default energy / magic stat.\n\
\n\
/// Name: Energy,string\n\
/// DisplayName:Mana,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 10,number\n\
/// MonsterStat: false,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
}\n\
\n\
// Max energy is the DefaultValue + 10 * intelligence\n\
function MaxValue(currentActor)\n\
{\n\
    return @DefaultValue@ + Player.GetStat('Intelligence') * 10;\n\
}",
    "// Default experience stat.\n\
\n\
/// Name: Experience,string\n\
/// DisplayName:Experience,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 0,number\n\
/// MonsterStat: false,boolean\n\
\n\
// We need to handle the expericence change, for example from killing monsters. If the max experience is reach the player gains a new level.\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
    // The stat has been maxed => we reached a new level at least\n\
    if(wishedValue != newValue)\n\
    {\n\
        // Store the wished value and work with it\n\
        tempValue = wishedValue;\n\
        // Runs while we still have to increase the stat\n\
        do\n\
        {\n\
            // Calculate the difference of experience between the levels\n\
            currentLevel = CalcRequiredExperience(Player.GetStat('Level'));\n\
            nextLevel = CalcRequiredExperience(Player.GetStat('Level') + 1); \n\
            diff = nextLevel - currentLevel;\n\
            // Increase the player level\n\
            Player.IncreaseStat('Level', 1);\n\
            // Increase the game statistics\n\
            Game.AddStatistic('level_up');\n\
            // Calculate the remaining experience\n\
            tempValue = tempValue - diff;\n\
\n\
            currentLevel = CalcRequiredExperience(Player.GetStat('Level'));\n\
            nextLevel = CalcRequiredExperience(Player.GetStat('Level') + 1); \n\
            diff = nextLevel - currentLevel;\n\
        } while(diff < tempValue); // If we still are bigger than the new max, then we need to run this loop again.\n\
        // Set the remaining as current experience.\n\
        Player.SetStat('Experience', tempValue);\n\
    }\n\
}\n\
\n\
// Calculates how much experience the player has to gain to be able to level up.\n\
function MaxValue(currentActor)\n\
{\n\
    currentLevel= CalcRequiredExperience(Player.GetStat('Level'));\n\
    nextLevel= CalcRequiredExperience(Player.GetStat('Level') + 1);\n\
    return (nextLevel - currentLevel);\n\
}\n\
\n\
// Calculates the experience needed for each level.\n\
function CalcRequiredExperience(level)\n\
{\n\
    return 100 + 100 * Math.Pow(level - 1, 3);\n\
}\n\
"
    ,
    "// Default Level stat.\n\
\n\
/// Name: Level,string\n\
/// DisplayName:Level,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 1,number\n\
/// MonsterStat: false,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
}\n\
\n\
// Currently the game doesn't allow more than level 1000\n\
function MaxValue(currentActor)\n\
{\n\
    return 1000;\n\
}",
    "// Default Money stat.\n\
\n\
/// Name: Money,string\n\
/// DisplayName:Gold,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 0,number\n\
/// MonsterStat: false,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
}",
    "// Default Strength stat.\n\
\n\
/// Name: Strength,string\n\
/// DisplayName: Strength,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 1,number\n\
/// MonsterStat: false,boolean\n\
\n\
// If the stat changed (normally only going up), we need to reset the life stat.\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
    Player.SetStat('Life',Player.GetStatMaxValue('Life'));\n\
}\n\
\n\
// Checks if the player can add some stats.\n\
// The current rule is total stat points == level * 3 +5, which means for each level gained the player can assign 3 stat points.\n\
function CanUpgrade()\n\
{\n\
    return (Player.GetStat('Level')*3+5)-(Player.GetStat('Strength')+Player.GetStat('Dexterity')+Player.GetStat('Intelligence')) > 0;\n\
}", "// Default Dexterity stat.\n\
\n\
/// Name: Dexterity,string\n\
/// DisplayName: Dexterity,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 1,number\n\
/// MonsterStat: false,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
}\n\
\n\
// Checks if the player can add some stats.\n\
// The current rule is total stat points == level * 3 +5, which means for each level gained the player can assign 3 stat points.\n\
function CanUpgrade()\n\
{\n\
    return (Player.GetStat('Level')*3+5)-(Player.GetStat('Strength')+Player.GetStat('Dexterity')+Player.GetStat('Intelligence')) > 0;\n\
}", "// Default Intelligence stat.\n\
\n\
/// Name: Intelligence,string\n\
/// DisplayName: Intelligence,string\n\
/// PlayerVisible: true,boolean\n\
/// DefaultValue: 1,number\n\
/// MonsterStat: false,boolean\n\
\n\
function ValueChange(currentActor, newValue, wishedValue, oldValue)\n\
{\n\
    Player.SetStat('Energy',Player.GetStatMaxValue('Energy'));\n\
}\n\
\n\
// Checks if the player can add some stats.\n\
// The current rule is total stat points == level * 3 +5, which means for each level gained the player can assign 3 stat points.\n\
function CanUpgrade()\n\
{\n\
    return (Player.GetStat('Level')*3+5)-(Player.GetStat('Strength')+Player.GetStat('Dexterity')+Player.GetStat('Intelligence')) > 0;\n\
}"];

class DefaultStats
{
    static Generate(game: World)
    {
        game.Stats = [];
        for (var i = 0; i < statCodes.length; i++)
        {
            var stat = new KnownStat();
            stat.Parse(statCodes[i], false);

            if (stat.Code.CodeVariables["name"])
                stat.Name = stat.Code.CodeVariables["name"].value;
            if (stat.Code.CodeVariables["defaultvalue"])
                stat.DefaultValue = parseFloat(stat.Code.CodeVariables["defaultvalue"].value);
            if (stat.Code.CodeVariables["monsterstat"])
                stat.MonsterStat = (stat.Code.CodeVariables["monsterstat"].value.trim().toLowerCase() == "true" ? true : false);

            game.Stats.push(stat);
        }
    }
}