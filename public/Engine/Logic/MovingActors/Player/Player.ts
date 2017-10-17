///<reference path="../MovingActor.ts" />

interface QuestVariables
{
    [s: string]: any;
}

var playerEffects = new (class
{
    public emotes: HTMLImageElement;
});

enum EmotesArt
{
    sml,
    yay,
    wee,
    sad,
    orz,
    oo,
    meh,
    lv,
    hurr,
    huh,
    hmm,
    guu,
    grr,
    ah
}

interface StatSerialization
{
    Name: string;
    MaxValue: number;
    Value: number;
}

interface SkillSerialization
{
    Name: string;
    Level: number;
}


interface PlayerSerialization
{
    name: string
    questVariables: QuestVariables;
    inventory: InventoryObject[];
    equipedObjects: EquipedObject;
    currentSkill: string;
    quickslots: string[];
    stats: StatSerialization[];
    skills: SkillSerialization[];
    temporaryEffects: RunningEffect[]
    respawnPoint: ZonedPoint;
    kills: MonsterKill[];
    quests?: Quest[];
    chests?: string[];
    mapobjects?: string[];
    saveId: string;
    chatMutedTill: Date;
    chatBannedTill: Date;
}

interface MonsterKill
{
    MonsterId: string;
    KilledOn: Date;
    Name: string;
}

interface KillCache
{
    [s: string]: number;
}

class Player extends MovingActor
{
    public Username: string;
    public InDialog: boolean = false;
    public Zone: string = "Base";
    public AX: number = 0;
    public AY: number = 0;

    private lastSentUpdate: Date = null;
    private initializedReceiver = false;
    private saveTimeout: number = null;
    private questVariables: QuestVariables = {};

    public Inventory: InventoryObject[] = [];
    public EquipedObjects: EquipedObject = {};
    public TemporaryEffects: RunningEffect[] = [];
    public RespawnPoint: ZonedPoint = null;
    public Quests: Quest[] = [];

    public Kills: MonsterKill[] = [];
    private killCache: KillCache = null;
    public VisitedChests: string[] = [];
    public VisitedMapObjects: string[] = [];

    public CurrentSkill: string = "Attack";
    public QuickSlot: string[] = [null, null, null, null, null, null, null, null, null, null];

    public CurrentEmote: EmotesArt = null;
    public EmoteTimer: number = 0;

    public ChatMutedTill: Date = null;
    public ChatBannedTill: Date = null;

    public StoredCompare: string = null;

    private SaveId: string;

    constructor(world: World)
    {
        super(world);
    }

    public Initialize(whenFinished: () => void)
    {
        if (world.Id == 1 && framework.Preferences['token'] == "demo")
        {
            this.DefaultInit(whenFinished);
            return;
        }

        if (Main.CheckNW())
        {
            var saves = {};
            if (framework.Preferences['gameSaves'])
                saves = JSON.parse(framework.Preferences['gameSaves']);
            if (!saves["S" + world.Id])
            {
                this.DefaultInit(whenFinished);
                return;
            }
            try
            {
                var p: ZonedPoint = saves["S" + world.Id].position;
                var result = {
                    x: p.X, y: p.Y, zone: p.Zone, data: saves["S" + world.Id].data
                };
                this.PostLoad(JSON.stringify(result), whenFinished);
            }
            catch (ex)
            {
                this.DefaultInit(whenFinished);
            }
            return;
        }
        if (game)
        {
            Framework.ReloadPreferences();
            if (!framework.Preferences['gamePlayer'])
            {
                this.DefaultInit(whenFinished);
                return;
            }
            try
            {
                var p: ZonedPoint = JSON.parse(framework.Preferences['gamePlayerPos']);
                var result = {
                    x: p.X, y: p.Y, zone: p.Zone, data: framework.Preferences['gamePlayer']
                };
                this.PostLoad(JSON.stringify(result), whenFinished);
            }
            catch (ex)
            {
                this.DefaultInit(whenFinished);
            }
            return;
        }

        if (!framework.Preferences['token'])
        {
            this.DefaultInit(whenFinished);
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/LoadPlayer',
            data: {
                game: this.World.Id,
                token: framework.Preferences['token']
            },
            success: (msg) =>
            {
                this.PostLoad(msg, whenFinished);
            },
            error: function (msg, textStatus)
            {
                framework.Preferences['token'] = null;
                Framework.SavePreferences();
                document.location.reload();
                return;
            }
        });
    }

    private PostLoad(msg: string, whenFinished: () => void)
    {
        var result = TryParse(msg);
        if (!result)
        {
            this.DefaultInit(whenFinished);
            return;
        }

        try
        {
            this.RestoreJSON(result.data);
            world.Player.StoredCompare = world.Player.JSON();
        }
        catch (ex)
        {
            console.log(ex);
            this.DefaultInit(whenFinished);
            return;
        }
        Teleport.Teleport(result.x, result.y, result.zone);
        whenFinished();
    }

    private DefaultInit(whenFinished: () => void)
    {
        for (var i = 0; i < this.World.Stats.length; i++)
        {
            var stat = new Stat();
            stat.Name = this.World.Stats[i].Name;
            stat.BaseStat = this.World.Stats[i];
            stat.Value = this.World.Stats[i].DefaultValue;
            this.Stats.push(stat);
        }

        for (var i = 0; i < this.World.Skills.length; i++)
        {
            if (!this.World.Skills[i].AutoReceive)
                continue;
            var skill = new Skill();
            skill.Name = this.World.Skills[i].Name;
            skill.BaseSkill = this.World.Skills[i];
            if (this.Skills.length < 10)
            {
                this.QuickSlot[this.Skills.length] = "S/" + skill.Name;
            }
            this.Skills.push(skill);
        }

        if (this.World.InitializeSteps)
            for (var i = 0; i < this.World.InitializeSteps.length; i++)
                dialogAction.code[this.World.InitializeSteps[i].Name].Execute(this.World.InitializeSteps[i].Values);

        this.SetStat('Life', this.GetStatMaxValue('Life'));
        this.SetStat('Energy', this.GetStatMaxValue('Energy'));

        Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);

        this.StoredCompare = this.JSON();
        whenFinished();
    }

    public CanReachArea(x: number, y: number): boolean
    {
        return true;
    }

    public Handle(): void
    {
        if (this.ParticleEffectDuration && this.ParticleEffectDuration.getTime() < new Date().getTime())
        {
            this.ParticleEffect = null;
            this.ParticleEffectDuration = null;
        }

        var j = this.JSON();
        if (j != this.StoredCompare)
        {
            play.devTools = true;
            this.InformServer();
        }

        this.HandleEffects();

        if (this.CurrentArea)
        {
            this.AX = this.CurrentArea.X;
            this.AY = this.CurrentArea.Y;
        }

        var now = new Date();
        if (chat.socket && (this.lastSentUpdate == null || (now.valueOf() - this.lastSentUpdate.valueOf()) >= 500))
        {
            chat.socket.emit('position', this.Zone,
                this.X + this.AX * world.areaWidth * world.art.background.width,
                this.Y + this.AY * world.areaHeight * world.art.background.height,
                this.Name, this.CurrentEmote, this.EmoteTimer, this.Direction);
            this.lastSentUpdate = now;
        }

        if (!this.initializedReceiver && chat.socket)
        {
            this.initializedReceiver = true;
            chat.socket.on('remove', (name: string) =>
            {
                var otherPlayer = OtherPlayer.FindPlayer(name)
                if (otherPlayer)
                {
                    for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++)
                    {
                        if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer)
                        {
                            otherPlayer.CurrentArea.otherPlayers.splice(i, 1);
                            break;
                        }
                    }
                }
                return;
            });

            chat.socket.on('reset', () =>
            {
                document.location.reload();
            });

            chat.socket.on('recall', () =>
            {
                if (world.Player.RespawnPoint)
                    Teleport.Teleport(world.Player.RespawnPoint.X, world.Player.RespawnPoint.Y, world.Player.RespawnPoint.Zone);
                else
                    Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);
            });

            chat.socket.on('position', (zone: string, x: number, y: number, name: string, look: string, emote: number, emoteTimer: number, direction: number) =>
            {
                var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
                var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
                var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
                var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
                if (ax < 0)
                    mx = (world.areaWidth - 0) * world.art.background.width - mx;
                if (ay < 0)
                    my = (world.areaHeight - 0) * world.art.background.height - my;

                // no need to handle if it's outside of the current region
                if (this.Zone != zone || Math.abs(ax - this.AX) > 1 || Math.abs(ay - this.AY) > 1 || name == this.Username)
                {
                    var otherPlayer = OtherPlayer.FindPlayer(name)
                    if (otherPlayer)
                    {
                        for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++)
                        {
                            if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer)
                            {
                                otherPlayer.CurrentArea.otherPlayers.splice(i, 1);
                                break;
                            }
                        }
                    }
                    return;
                }

                var area = world.GetArea(ax, ay, zone);
                if (area)
                    area.AddPlayer(mx, my, name, look, emote, emoteTimer, direction);
            });
        }
    }

    public InformServer()
    {
        Framework.Alert("Cheat detected... Server has been informed.");
    }

    public InvokeSkillFunction(skillName: string, functionName: string, values: VariableValue[]): VariableValue
    {
        var name = skillName.toLowerCase();
        for (var i = 0; i < this.Skills.length; i++)
            if (this.Skills[i].Name.toLowerCase() == name)
                return this.Skills[i].BaseSkill.InvokeFunction(functionName, values);
        return null;
    }

    public Draw(renderEngine: WorldRender, ctx: CanvasRenderingContext2D, x: number, y: number)
    {
        if (!playerEffects.emotes)
        {
            playerEffects.emotes = new Image();
            playerEffects.emotes.src = "art/tileset2/emotes.png";
        }

        var img = renderEngine.GetActorImage(this.Name);
        if (!img)
            return;
        if (img.width)
        {
            var actorArtInfo = renderEngine.world.art.characters[this.Name];
            var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            var fz = 1;
            var d = this.Direction;

            switch (this.ActionAnimation)
            {
                case ACTION_ANIMATION.ATTACK:

                    var ox = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].x;
                    var oy = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].y;
                    switch (this.Direction)
                    {
                        case 0: // Down
                            iy -= ox;
                            break;
                        case 1: // Left
                            ix += ox;
                            iy -= oy;
                            break;
                        case 2: // Right
                            ix -= ox;
                            iy -= oy;
                            break;
                        case 3: // Up
                            iy += ox;
                            break;
                        default:
                            break;
                    }
                    f += Math.floor(this.ActionAnimationStep / actorArtInfo.imageFrameDivider);

                    this.ActionAnimationStep++;
                    if (this.ActionAnimationStep >= 40)
                    {
                        this.ActionAnimation = ACTION_ANIMATION.NONE;
                        this.ActionAnimationStep = 0;
                        if (this.ActionAnimationDone)
                            this.ActionAnimationDone();
                        this.ActionAnimationDone = null;
                    }
                    break;
                case ACTION_ANIMATION.DAMAGED:
                    iy += Math.round(Math.sin(this.ActionAnimationStep * Math.PI / 6) * 6);
                    fz = Math.cos(this.ActionAnimationStep * Math.PI / 6) / 4 + 0.75;


                    this.ActionAnimationStep++;
                    if (this.ActionAnimationStep >= 6)
                    {
                        this.ActionAnimation = ACTION_ANIMATION.NONE;
                        this.ActionAnimationStep = 0;
                        if (this.ActionAnimationDone)
                            this.ActionAnimationDone();
                        this.ActionAnimationDone = null;
                    }
                    break;
                default:
                    break;
            }
            if (actorArtInfo.animationCycle != "simple")
            {
                f = f % (actorArtInfo.frames + 1);
                if (f == actorArtInfo.frames)
                    f = Math.floor(f / 2);
            }
            else
                f = f % actorArtInfo.frames;

            ctx.drawImage(img, Math.floor(w * f), Math.floor(h * d), w, h, Math.floor(ix + (1 - fz) * w / 2), Math.floor(iy + (1 - fz) * h / 2), w * fz, h * fz);

            if (this.CurrentEmote != null)
            {
                if (this.EmoteTimer > 160)
                    ctx.globalAlpha = (180 - this.EmoteTimer) / 20;
                ctx.drawImage(playerEffects.emotes, this.CurrentEmote * 24, 0, 24, 24, ix + w / 2, iy + (Math.sin(this.EmoteTimer / 10) * 5) + (1 - fz) * h / 2 - 28, 24, 24);
                ctx.globalAlpha = 1;
                this.EmoteTimer++;
                if (this.EmoteTimer > 180)
                {
                    this.EmoteTimer = 0;
                    this.CurrentEmote = null;
                }
            }
        }

        if (this.ParticleEffect)
        {
            ctx.save();
            ctx.translate(x, y);
            this.ParticleEffect.Draw(ctx);
            ctx.restore();
        }
    }

    public PlayerInteract(ax: number, ay: number)
    {
    }

    public PlayerMouseInteract(ax: number, ay: number): boolean
    {
        return false;
    }

    public GetQuestVariable(name: string): any
    {
        if (this.questVariables[name] == null || this.questVariables[name] == undefined)
            return null;
        return this.questVariables[name];
    }

    public SetQuestVariable(name: string, value: any): void
    {
        if (!this.SetQuestVariable.caller)
        {
            play.devTools = true;
            return;
        }

        this.questVariables[name] = value;
        this.StoredCompare = this.JSON();
        world.Player.Save();
    }

    public AddItem(name: string, quantity: number = 1): void
    {
        if (isNaN(quantity) || quantity <= 0)
        {
            Main.AddErrorMessage("Can't add item '" + name + "' quantity " + quantity);
            return;
        }

        if (!this.AddItem.caller)
        {
            play.devTools = true;
            return;
        }

        for (var i = 0; i < this.Inventory.length; i++)
        {
            if (this.Inventory[i].Name == name)
            {
                this.Inventory[i].Count += quantity;
                InventoryMenu.Update();
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return;
            }
        }
        this.Inventory.push(new InventoryObject(name, quantity));
        this.StoredCompare = this.JSON();
        world.Player.Save();
        InventoryMenu.Update();
    }

    public RemoveItem(name: string, quantity: number = 1): void
    {
        if (isNaN(quantity) || quantity <= 0)
        {
            Main.AddErrorMessage("Can't remove item '" + name + "' quantity " + quantity);
            return;
        }

        if (!this.RemoveItem.caller)
        {
            play.devTools = true;
            return;
        }

        for (var i = 0; i < this.Inventory.length; i++)
        {
            if (this.Inventory[i].Name == name)
            {
                this.Inventory[i].Count -= quantity;
                if (this.Inventory[i].Count <= 0)
                    this.Inventory.splice(i, 1);
                InventoryMenu.Update();
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return;
            }
        }
    }

    public GetInventoryQuantity(name: string): number
    {
        for (var i = 0; i < this.Inventory.length; i++)
            if (this.Inventory[i].Name == name)
                return this.Inventory[i].Count;
        return null;
    }

    public Wear(itemName: string)
    {
        if (!this.Wear.caller)
        {
            play.devTools = true;
            return;
        }

        if (!this.GetInventoryQuantity(itemName))
            return;
        var toWear = new InventoryObject(itemName);

        var slots = toWear.GetDetails().Slots;
        if (!slots || !slots.length)
            return;

        this.RemoveItem(itemName);
        for (var i = 0; i < slots.length; i++)
            if (this.EquipedObjects[slots[i]])
                this.Unwear(slots[i]);

        for (var i = 0; i < slots.length; i++)
            this.EquipedObjects[slots[i]] = toWear;
        this.StoredCompare = this.JSON();
        world.Player.Save();
        InventoryMenu.Update();
    }

    public Unwear(slot: string)
    {
        if (!this.Unwear.caller)
        {
            play.devTools = true;
            return;
        }

        if (!this.EquipedObjects[slot])
            return;
        var toRemove = this.EquipedObjects[slot];
        var slots = toRemove.GetDetails().Slots;
        if (!slots || !slots.length)
            return;
        for (var i = 0; i < slots.length; i++)
            delete this.EquipedObjects[slots[i]];
        this.AddItem(toRemove.Name);
        this.StoredCompare = this.JSON();
        world.Player.Save();
        InventoryMenu.Update();
    }

    public GiveSkill(name: string)
    {
        for (var i = 0; i < this.Skills.length; i++)
            if (this.Skills[i].Name.toLowerCase() == name.toLowerCase())
                return;

        var baseSkill = world.GetSkill(name);

        this.Skills.push({
            Name: baseSkill.Name,
            BaseSkill: baseSkill,
            Level: null
        });

        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    }

    public StartTemporaryEffect(name: string)
    {
        var effect = world.GetTemporaryEffect(name);

        // If the effect can be started only once we need to check if there is already one running.
        if (effect.MultipleInstance === false)
            for (var i = 0; i < this.TemporaryEffects.length; i++)
                if (this.TemporaryEffects[i].Name == effect.Name)
                    return;

        this.TemporaryEffects.push({
            Name: effect.Name,
            //LastEvaluate: null,
            LastEvaluate: new Date(),
            EndTime: new Date(new Date().getTime() + 1000 * effect.Timer)
        });

        var effect = world.GetTemporaryEffect(name);

        for (var j = 0; j < effect.StartActions.length; j++)
            dialogAction.code[effect.StartActions[j].Name].Execute(effect.StartActions[j].Values);

        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    }

    public RemoveTemporaryEffect(name: string)
    {
        for (var i = 0; i < this.TemporaryEffects.length;)
        {
            if (this.TemporaryEffects[i].Name.toLowerCase() == name.toLowerCase())
                this.TemporaryEffects.splice(i, 1);
            else
                i++;
        }
        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    }

    public ClearTemporaryEffects()
    {
        this.TemporaryEffects = [];
        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    }

    private HandleEffects()
    {
        var modified = false;
        var now = new Date().getTime();
        for (var i = 0; i < this.TemporaryEffects.length;)
        {
            if (typeof this.TemporaryEffects[i].LastEvaluate == "string")
                this.TemporaryEffects[i].LastEvaluate = new Date(<any>this.TemporaryEffects[i].LastEvaluate);
            if (typeof this.TemporaryEffects[i].EndTime == "string")
                this.TemporaryEffects[i].EndTime = new Date(<any>this.TemporaryEffects[i].EndTime);

            var effect = world.GetTemporaryEffect(this.TemporaryEffects[i].Name);

            // Shall we have a recuring effect?
            if (effect.RecurringTimer > 0 && effect.RecurringActions && effect.RecurringActions.length > 0)
            {
                while (this.TemporaryEffects[i] && this.TemporaryEffects[i].LastEvaluate.getTime() + effect.RecurringTimer * 1000 < now && this.TemporaryEffects[i].LastEvaluate.getTime() + effect.RecurringTimer < this.TemporaryEffects[i].EndTime.getTime())
                //while (this.TemporaryEffects[i].LastEvaluate === null || this.TemporaryEffects[i].LastEvaluate.getTime() + effect.RecurringTimer * 1000 < now)
                {
                    if (!this.TemporaryEffects[i].LastEvaluate)
                        this.TemporaryEffects[i].LastEvaluate = new Date(now + effect.RecurringTimer * 1000);
                    else
                        this.TemporaryEffects[i].LastEvaluate = new Date(this.TemporaryEffects[i].LastEvaluate.getTime() + effect.RecurringTimer * 1000);

                    for (var j = 0; j < effect.RecurringActions.length; j++)
                        dialogAction.code[effect.RecurringActions[j].Name].Execute(effect.RecurringActions[j].Values);
                    modified = true;
                }
            }

            if (!this.TemporaryEffects[i])
                break;

            // The Effect is over? Let's remove it
            if (now > this.TemporaryEffects[i].EndTime.getTime())
            {
                this.TemporaryEffects.splice(i, 1);
                for (var j = 0; j < effect.EndActions.length; j++)
                    dialogAction.code[effect.EndActions[j].Name].Execute(effect.EndActions[j].Values);
                modified = true;
            }
            else
                i++;
        }

        if (modified)
        {
            this.StoredCompare = this.JSON();
            world.Player.Save();
            ProfileMenu.Update();
        }
    }

    public RecordKill(monsterId: string, name: string)
    {
        if (!this.RecordKill.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        this.Kills.push({ KilledOn: new Date, MonsterId: monsterId, Name: name });
        if (this.killCache)
            this.killCache[monsterId] = this.Kills.length - 1;
        this.StoredCompare = this.JSON();
        world.Player.Save();
    }

    public CanRespawn(monsterId: string, respawnTime: number): boolean
    {
        if (window['MapEditor'] && window['MapEditor'].IsOpen())
            return true;
        if (!this.killCache)
        {
            this.killCache = {};
            for (var i = 0; i < this.Kills.length; i++)
                this.killCache[this.Kills[i].MonsterId] = i;
        }

        if (this.killCache[monsterId])
        {
            var i = this.killCache[monsterId];

            if (respawnTime === null || respawnTime === undefined)
                return false;
            var now = new Date();
            if (this.Kills[i] && this.Kills[i].KilledOn && (now.getTime() - this.Kills[i].KilledOn.getTime()) / 60000 > respawnTime)
            {
                this.Kills.splice(i, 1);
                delete this.killCache[monsterId];

                this.StoredCompare = this.JSON();
                world.Player.Save();
                return true;
            }
            return false;
        }

        return true;
    }

    public StartQuest(name: string)
    {
        if (!this.StartQuest.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var quest = world.GetQuest(name);
        if (!quest)
            return;

        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return;

        this.Quests.push({ Name: quest.Name, Started: new Date(), JournalEntries: [], Completed: null });
        this.StoredCompare = this.JSON();
        world.Player.Save();
    }

    public IsQuestStarted(name: string): boolean
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return true;
        return false;
    }

    public IsQuestCompleted(name: string): boolean
    {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return this.Quests[i].Completed != null;
        return false;
    }

    public AddQuestJournalEntry(questName: string, journalEntry: number)
    {
        if (!this.AddQuestJournalEntry.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var quest = world.GetQuest(questName);
        if (!quest)
            return;

        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++)
        {
            if (quest.JournalEntries[i].Id == journalEntry)
            {
                found = true;
                break;
            }
        }

        if (!found)
            return;

        if (!this.IsQuestStarted(questName))
            this.StartQuest(questName);

        var lname = questName.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
        {
            if (this.Quests[i].Name.toLowerCase() == lname)
            {
                this.Quests[i].JournalEntries.push({ EntryId: journalEntry, ReceivedOn: new Date() });
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return;
            }
        }
    }

    public HaveQuestJournalEntry(questName: string, journalEntry: number): boolean
    {
        var lname = questName.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
        {
            if (this.Quests[i].Name.toLowerCase() == lname)
            {
                for (var j = 0; j < this.Quests[i].JournalEntries.length; j++)
                    if (this.Quests[i].JournalEntries[j].EntryId == journalEntry)
                        return true;
                return false;
            }
        }
        return false;
    }

    public CompleteQuest(name: string)
    {
        if (!this.CompleteQuest.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
        {
            if (this.Quests[i].Name.toLowerCase() == lname)
            {
                if (!this.Quests[i].Completed)
                {
                    this.Quests[i].Completed = new Date();
                    this.StoredCompare = this.JSON();
                    world.Player.Save();
                }
                return;
            }
        }
    }

    public HasVisitedChest(id: string): boolean
    {
        return this.VisitedChests.indexOf(id) != -1;
    }

    public VisitChest(id: string)
    {
        if (this.HasVisitedChest(id))
            return;
        this.VisitedChests.push(id);
        this.StoredCompare = this.JSON();
        world.Player.Save();
    }

    public HasVisitedMapObject(id: string): boolean
    {
        return this.VisitedMapObjects.indexOf(id) != -1;
    }

    public VisitMapObject(id: string)
    {
        if (this.HasVisitedMapObject(id))
            return;
        this.VisitedMapObjects.push(id);
        this.StoredCompare = this.JSON();
        world.Player.Save();
    }

    public JSON(): string
    {
        if (!this.JSON.caller)
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }

        return JSON.stringify(<PlayerSerialization>{
            name: this.Name,
            saveId: this.SaveId,
            questVariables: this.questVariables,
            inventory: this.Inventory,
            equipedObjects: this.EquipedObjects,
            currentSkill: this.CurrentSkill,
            quickslots: this.QuickSlot,
            stats: this.Stats.map((c) =>
            {
                return { Name: c.Name, MaxValue: c.MaxValue, Value: c.Value };
            }),
            skills: this.Skills.map((c) =>
            {
                return { Name: c.Name, Level: c.Level };
            }),
            temporaryEffects: this.TemporaryEffects,
            respawnPoint: this.RespawnPoint,
            kills: this.Kills,
            quests: this.Quests,
            chests: this.VisitedChests,
            mapobjects: this.VisitedMapObjects,
            chatBannedTill: this.ChatBannedTill,
            chatMutedTill: this.ChatMutedTill
        });
    }

    public RestoreJSON(json: string)
    {
        var data: PlayerSerialization = JSON.parse(json);
        this.SaveId = data.saveId;
        this.Name = data.name;
        this.questVariables = data.questVariables;
        this.QuickSlot = data.quickslots;
        this.CurrentSkill = data.currentSkill;
        this.Inventory = data.inventory ? data.inventory.map((c) => new InventoryObject(c.Name, c.Count, c.UsageLevel)) : [];
        this.EquipedObjects = {};
        for (var item in data.equipedObjects)
            this.EquipedObjects[item] = new InventoryObject(data.equipedObjects[item].Name, data.equipedObjects[item].Count, data.equipedObjects[item].UsageLevel);
        this.Quests = (data.quests ? data.quests : []);
        this.Stats = data.stats.map((c) =>
        {
            var res = new Stat();
            res.Name = c.Name;
            res.MaxValue = c.MaxValue;
            res.Value = c.Value;
            res.BaseStat = world.GetStat(c.Name);
            return res;
        });

        this.Skills = data.skills.map((c) =>
        {
            var res = new Skill();
            res.Name = c.Name;
            res.Level = c.Level;
            res.BaseSkill = world.GetSkill(c.Name);
            return res;
        });
        this.Kills = (data.kills ? data.kills : []);
        for (var i = 0; i < this.Kills.length; i++)
            this.Kills[i].KilledOn = new Date(<any>this.Kills[i].KilledOn);
        this.killCache = null;
        this.VisitedChests = (data.chests ? data.chests : []);
        this.VisitedMapObjects = (data.mapobjects ? data.mapobjects : []);

        this.TemporaryEffects = data.temporaryEffects ? data.temporaryEffects : [];
        this.RespawnPoint = (data.respawnPoint ? data.respawnPoint : null);
        this.ChatBannedTill = new Date(<any>data.chatBannedTill);
        this.ChatMutedTill = new Date(<any>data.chatMutedTill);
    }

    public Save()
    {
        if (world.Id == -1)
            return;
        if (play.devTools)
            return;

        if (this.saveTimeout)
            clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() =>
        {
            this.DoSave();
        }, 100);
    }

    private onGoingSave: number = null;
    private DoSave()
    {
        if (this.onGoingSave)
            return;
        var x = this.X + this.AX * world.areaWidth * world.art.background.width;
        var y = this.Y + this.AY * world.areaHeight * world.art.background.height;

        if (Main.CheckNW())
        {
            var save = {
                data: this.JSON(),
                position: { Zone: this.Zone, X: x, Y: y }
            };
            var saves = {};
            if (framework.Preferences['gameSaves'])
                saves = JSON.parse(framework.Preferences['gameSaves']);
            saves["S" + world.Id] = save;
            framework.Preferences['gameSaves'] = JSON.stringify(saves);
            Framework.SavePreferences();
            return;
        }
        if (game)
        {
            framework.Preferences['gamePlayer'] = this.JSON();
            var p: ZonedPoint = { Zone: this.Zone, X: x, Y: y };
            framework.Preferences['gamePlayerPos'] = JSON.stringify(p);
            Framework.SavePreferences();
            return;
        }

        if (!framework.Preferences['token'] || framework.Preferences['token'] == "demo")
            return;

        this.saveTimeout = null;
        if (play.devTools)
            return;

        this.onGoingSave = $.ajax({
            type: 'POST',
            url: '/backend/SavePlayer',
            data: {
                game: this.World.Id,
                token: framework.Preferences['token'],
                x: x,
                y: y,
                zone: this.Zone,
                data: this.JSON()
            },
            success: (msg) =>
            {
                this.onGoingSave = null;
                this.SaveId = TryParse(msg);
                this.StoredCompare = this.JSON();
            },
            error: function (msg, textStatus)
            {
                this.onGoingSave = null;
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });
    }
}