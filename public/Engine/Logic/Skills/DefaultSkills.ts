var skillCodes = ["// Default attack skill. Will be invoked while clicking on a monster.\n\
\n\
/// Name: Attack,string\n\
/// DisplayName: Attack,string\n\
/// AutoReceive: true,boolean\n\
/// Icon: /art/tileset2/fast_attack.png,image_upload\n\
/// Quickslot: true,boolean\n\
/// QuickslotEditable: false,boolean\n\
/// BaseRechargeSpeed: 0.5,number\n\
/// BaseDamage: 5,number\n\
/// DamageMultiplier: 1,number\n\
/// Proximity: 40,number\n\
\n\
function Action(onActor)\n\
{\n\
    if(!Actor.IsMonster(onActor))\n\
        return false;\n\
    // If too far, simply skip\n\
    if(Actor.DistanceToPlayer(onActor) > Skill.RetreiveSetting('Proximity'))\n\
        return false;\n\
    if(Player.IsAnimationRunning())\n\
        return false;\n\
    // Check if at least @BaseRechargeSpeed@ sec passed between the attacks. If not skip the attack.\n\
    if(Player.TimerRunning(Player.GetCurrentSkill()))\n\
        return false;\n\
    // Starts the Attack timer, to avoid to attack too frequently.\n\
    Player.StartTimer(Player.GetCurrentSkill(), Skill.RetreiveSetting('BaseRechargeSpeed'));\n\
\n\
    damage = (Skill.RetreiveSetting('BaseDamage') + Inventory.GetWearedEffect('Base Damage')) * Skill.RetreiveSetting('DamageMultiplier') * (((Player.GetStat('Strength') - 1) / 5) + 1);\n\
    damage = Math.Ceil(damage * (Math.Rnd() / 2 + 0.5));\n\
    Player.SetVariable('attackDamage', damage);\n\
\n\
    Player.SetAnimation('attack');\n\
    Player.ExecuteWhenAnimationDone('AttackAnimationDone');\n\
    Player.SetVariable('attackActor', onActor);\n\
    return true;\n\
}\n\
\n\
// Attack after the animation is done\n\
function AttackAnimationDone()\n\
{\n\
    damage = Player.GetVariable('attackDamage');\n\
    onActor = Player.GetVariable('attackActor');\n\
    Actor.ReduceStat(onActor, 'Life', damage);\n\
    Actor.SetAnimation(onActor, 'damage');\n\
}",
    "// Strong (slow) attack skill. Will be invoked while clicking on a monster.\n\
\n\
/// Name: StrongAttack,string\n\
/// DisplayName: Strong Attack,string\n\
/// AutoReceive: true,boolean\n\
/// Icon: /art/tileset2/fist_icon.png,image_upload\n\
/// Quickslot: true,boolean\n\
/// QuickslotEditable: true,boolean\n\
/// BaseRechargeSpeed: 2,number\n\
/// BaseDamage: 20,number\n\
/// DamageMultiplier: 4,number\n\
/// Proximity: 40,number\n\
",
    "// Heal skill.\n\
/// Name: Heal,string\n\
/// DisplayName: Heal,string\n\
/// AutoReceive: true,boolean\n\
/// Icon: /art/tileset2/heal.png,image_upload\n\
/// Quickslot: true,boolean\n\
/// QuickslotEditable: true,boolean\n\
/// BaseRechargeSpeed: 10,number\n\
/// LifeGained: 20,number\n\
function Activate()\n\
{\n\
    if(Player.TimerRunning(Player.GetCurrentSkill()))\n\
        return false;\n\
    Player.StartTimer(Player.GetCurrentSkill(), @BaseRechargeSpeed@);\n\
\n\
    Display.AddMapMessage(Player.GetX(), Player.GetY(), 'Healed !');\n\
    Player.SetStat('Life', Player.GetStat('Life') + @LifeGained@);\n\
    return false;\n\
}\n\
"];

class DefaultSkills
{
    static Generate(game: World)
    {
        game.Skills = [];
        var baseSkill = null;
        for (var i = 0; i < skillCodes.length; i++)
        {
            var skill = new KnownSkill();
            skill.Parse(skillCodes[i], false);

            skill.Name = skill.Code.CodeVariables["name"].value;
            skill.AutoReceive = (skill.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
            if (skill.Name.toLowerCase() == "attack")
                baseSkill = skill;

            game.Skills.push(skill);
        }

        for (var i = 0; i < game.Skills.length; i++)
        {
            if (game.Skills[i].Name.toLowerCase() != "attack")
                game.Skills[i].BaseSkill = baseSkill;
        }
    }
}