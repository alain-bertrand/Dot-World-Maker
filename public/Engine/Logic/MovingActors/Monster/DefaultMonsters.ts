var monsterCodes = ["/// Name: DefaultMonster,string\n\
/// Speed: 2,number\n\
/// BaseDamage: 5,number\n\
/// AttackSpeed: 2,number\n\
/// ProximityAttack: 40,number\n\
\n\
// Default monster behavior. If not re-written on the monster code, this default code will be used.\n\
// Function called on each game loop to run monster attacks, or others.\n\
function Handle(monster)\n\
{\n\
    // If the player is in a NPC dialog the monster should just randomly walk around.\n\
    if(Player.IsInDialog() == true)\n\
    {\n\
        Monster.RandomWalk(monster);\n\
        return true;\n\
    }\n\
    \n\
    // If the monster is near the player, he shall try to attack.\n\
    if(Actor.DistanceToPlayer(monster) <= Monster.RetreiveSetting(monster,'ProximityAttack'))\n\
    {\n\
        Attack(monster);\n\
        return true;\n\
    }\n\
    \n\
    // Moves toward the player if it's nearer than 10 tiles.\n\
    Monster.HuntWalk(monster, 10);\n\
    \n\
    // If we returns false the engine would handle it for us.\n\
    return true;\n\
}\n\
\n\
// Handle Monster attacks.\n\
function Attack(monster)\n\
{\n\
    if(Actor.DistanceToPlayer(monster) > Monster.RetreiveSetting(monster,'ProximityAttack'))\n\
        return false;\n\
    if(Actor.IsAnimationRunning(monster))\n\
        return false;\n\
    // Check if at least @BaseRechargeSpeed@ sec passed between the attacks. If not skip the attack.\n\
    if(Actor.TimerRunning(monster, 'Attack'))\n\
        return false;\n\
    // Starts the Attack timer, to avoid to attack too frequently.\n\
    Actor.StartTimer(monster, 'Attack', Monster.RetreiveSetting(monster,'AttackSpeed'));\n\
	Actor.SetAnimation(monster, 'attack');\n\
    Actor.ExecuteWhenAnimationDone(monster, 'AttackAnimationDone');\n\
    return true;\n\
}\n\
\n\
// Attack after the animation is done\n\
function AttackAnimationDone(monster)\n\
{\n\
    damage = Monster.RetreiveSetting(monster, 'BaseDamage'); \n\
    damage = damage - Inventory.GetWearedEffect('Protection');\n\
    if(damage <= 0)\n\
        return true;\n\
    Player.ReduceStat('Life',damage);\n\
    Player.SetAnimation('damage');\n\
    return true;\n\
}",
    "// A simple rat.\n\
/// Name: Rat,string\n\
/// Speed: 2,number\n\
/// BaseDamage: 2,number\n\
/// AttackSpeed: 2,number\n\
/// ProximityAttack: 40,number\n\
/// Art: rat_1,monster_art\n\
/// Life: 10,number\n\
/// StatDrop: [{'Name':'Experience','Quantity':5,'Probability':100},{'Name':'Money','Quantity':2,'Probability':50}],string\n\
",
    "// A simple bear.\n\
/// Name: Brown bear,string\n\
/// Speed: 1,number\n\
/// BaseDamage: 10,number\n\
/// AttackSpeed: 3,number\n\
/// ProximityAttack: 40,number\n\
/// Art: bear_1,monster_art\n\
/// Life: 50,number\n\
/// StatDrop: [{'Name':'Experience','Quantity':25,'Probability':100},{'Name':'Money','Quantity':50,'Probability':50}],string\n\
"];

class DefaultMonsters
{
    static Generate(game: World)
    {
        var defaultMonster = null;
        game.Monsters = [];

        for (var i = 0; i < monsterCodes.length; i++)
        {
            var comments = CodeParser.GetAllTokens(monsterCodes[i], "TokenComment");

            var monster = new KnownMonster();
            monster.Parse(monsterCodes[i], false);
            if (!monster.Code.CodeVariables["name"])
                continue;
            monster.Name = monster.Code.CodeVariables["name"].value;
            if (monster.Code.CodeVariables["art"])
                monster.Art = monster.Code.CodeVariables["art"].value;

            if (monster.Name.toLowerCase() == "defaultmonster")
                defaultMonster = monster;

            if (monster.Code.CodeVariables["statdrop"])
            {
                monster.StatDrop = JSON.parse(monster.Code.CodeVariables["statdrop"].value.replace(/'/g, "\""));
                delete monster.Code.CodeVariables["statdrop"];
            }
            if (monster.Code.CodeVariables["itemdrop"])
            {
                monster.ItemDrop = JSON.parse(monster.Code.CodeVariables["itemdrop"].value.replace(/'/g, "\""));
                delete monster.Code.CodeVariables["itemdrop"];
            }

            game.Monsters.push(monster);
        }

        for (var i = 0; i < game.Monsters.length; i++)
            game.Monsters[i].DefaultMonster = defaultMonster;
    }
}