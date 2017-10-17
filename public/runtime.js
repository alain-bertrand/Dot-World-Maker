var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KnownCode = (function () {
    function KnownCode() {
        this.Parameters = {};
        this.Includes = [];
    }
    KnownCode.prototype.Store = function () {
        return {
            Author: this.Author,
            Name: this.Name,
            Source: this.Source,
            Parameters: this.Parameters,
            Description: this.Description,
            Includes: this.Includes,
            Enabled: this.Enabled,
            CodeBrowsing: this.CodeBrowsing,
            AllowEditing: this.AllowEditing,
            Price: this.Price,
            Version: this.Version
        };
    };
    return KnownCode;
}());
var dialogAction = new ((function () {
    function class_1() {
        this.code = {};
        this.currentEditor = "NPCEditor";
    }
    return class_1;
}()));
function DialogActionClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var actionClass = new target();
    if (actionClass instanceof ActionClass)
        dialogAction.code[className] = actionClass;
    else
        throw "Class \"" + className + "\" doesn't extends ActionClass.";
}
var ActionClass = (function () {
    function ActionClass() {
    }
    ActionClass.prototype.OptionList = function (id, position, values, currentValue, updateFunction) {
        var html = "";
        html += "<span class='dialogParam'><select id='" + (updateFunction ? updateFunction : "action") + "_" + id + "_" + position + "' onchange='" + dialogAction.currentEditor + "." + (updateFunction ? updateFunction : "ChangeAction") + "(" + id + "," + position + ")'>";
        var found = false;
        for (var i = 0; i < values.length; i++) {
            if (values[i].Id != undefined) {
                html += "<option" + (values[i].Id == currentValue ? " selected" : "") + " value='" + ("" + values[i].Id).htmlEntities() + "'>" + values[i].Value + "</option>";
                if (values[i].Id == currentValue)
                    found = true;
            }
            else {
                html += "<option" + (values[i] == currentValue ? " selected" : "") + " value='" + ("" + values[i]).htmlEntities() + "'>" + values[i] + "</option>";
                if (values[i] == currentValue)
                    found = true;
            }
        }
        if (!found)
            html += "<option selected>" + (currentValue === undefined ? "" : currentValue) + "</option>";
        html += "</select></span>";
        return html;
    };
    ActionClass.prototype.Input = function (id, position, currentValue, updateFunction) {
        return "<span class='dialogParam'><input id='" + (updateFunction ? updateFunction : "action") + "_" + id + "_" + position + "' type='text' value='" + (currentValue ? currentValue : "").htmlEntities() + "' onkeyup='" + dialogAction.currentEditor + "." + (updateFunction ? updateFunction : "ChangeAction") + "(" + id + "," + position + ")' onfocus='play.inField=true;' onblur='play.inField=false;'></span>";
    };
    ActionClass.prototype.Label = function (label) {
        return "<span class='dialogParamLabel'>" + label + "</span>";
    };
    return ActionClass;
}());
var DialogAction = (function () {
    function DialogAction() {
        this.Values = [];
    }
    return DialogAction;
}());
/// <reference path="../Dialogs/DialogAction.ts" />
var lastMapMessageTimeout = null;
var AddActorParticleEffect = (function (_super) {
    __extends(AddActorParticleEffect, _super);
    function AddActorParticleEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddActorParticleEffect.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Particle Effect");
        var effects = world.ParticleEffects.map(function (c) { return c.Name; }).sort();
        if (!values[0] && effects.length > 0)
            values[0] = effects[0];
        html += this.OptionList(id, 0, effects, values[0], updateFunction);
        html += this.Label("Last (in sec.)");
        if (!values[1])
            values[1] = "5";
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    };
    AddActorParticleEffect.prototype.Execute = function (values, env) {
        if (!values[0])
            throw "The action 'Add Actor Particle Effect' requires a particle name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The action 'Add Actor Particle Effect' requires number of second the particle effect will last.";
        world.Player.ParticleEffect = world.GetParticleSystem(values[0]);
        if (world.Player.ParticleEffect) {
            var now = new Date();
            var ends = new Date(now.getTime() + parseInt(values[1]) * 1000);
            /*console.log("now: " + now.toString());
            console.log("ends: " + ends.toString());*/
            world.Player.ParticleEffectDuration = ends;
        }
        return null;
    };
    return AddActorParticleEffect;
}(ActionClass));
AddActorParticleEffect = __decorate([
    DialogActionClass
], AddActorParticleEffect);
/// <reference path="../Dialogs/DialogAction.ts" />
var AddJournalEntry = (function (_super) {
    __extends(AddJournalEntry, _super);
    function AddJournalEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddJournalEntry.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Journal Entry");
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    };
    AddJournalEntry.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Add Journal Entry' requires a quest name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The action 'Add Journal Entry' requires the id of the journal entry (as number).";
        world.Player.AddQuestJournalEntry(values[0], parseInt(values[1]));
    };
    return AddJournalEntry;
}(ActionClass));
AddJournalEntry = __decorate([
    DialogActionClass
], AddJournalEntry);
/// <reference path="../Dialogs/DialogAction.ts" />
var CompleteQuest = (function (_super) {
    __extends(CompleteQuest, _super);
    function CompleteQuest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CompleteQuest.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CompleteQuest.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Complete Quest' requires a quest name.";
        world.Player.CompleteQuest(values[0]);
    };
    return CompleteQuest;
}(ActionClass));
CompleteQuest = __decorate([
    DialogActionClass
], CompleteQuest);
/// <reference path="../Dialogs/DialogAction.ts" />
var DecreaseStat = (function (_super) {
    __extends(DecreaseStat, _super);
    function DecreaseStat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DecreaseStat.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    };
    DecreaseStat.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Decrease Stat' requires a stat name.";
        if (!values[1])
            throw "The action 'Decrease Stat' requires a quantity expressed either as number or a valid expression.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1]).GetNumber();
            //val = CodeParser.ParseStatement(values[1]).Execute(env).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Decrease Stat' for the quantity is invalid.";
        }
        world.Player.SetStat(values[0], world.Player.GetStat(values[0]) - val);
    };
    return DecreaseStat;
}(ActionClass));
DecreaseStat = __decorate([
    DialogActionClass
], DecreaseStat);
/// <reference path="../Dialogs/DialogAction.ts" />
var ExecuteCodeFunction = ExecuteCodeFunction_1 = (function (_super) {
    __extends(ExecuteCodeFunction, _super);
    function ExecuteCodeFunction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExecuteCodeFunction.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Function");
        html += this.Input(id, 0, values[0], updateFunction);
        return html;
    };
    ExecuteCodeFunction.prototype.Execute = function (values, env) {
        if (!env)
            env = new CodeEnvironement();
        ExecuteCodeFunction_1.ExecuteFunction(values);
    };
    ExecuteCodeFunction.ExecuteFunction = function (values) {
        try {
            var func = values[0];
            if (func.indexOf("(") == -1)
                func += "();";
            if (func.charAt(func.length - 1) != ";")
                func += ";";
            var parse = CodeParser.Parse("function to_exec() { " + func + " }");
            parse.ExecuteFunction("to_exec", []);
        }
        catch (ex) {
            throw "The expression used in 'Execute Code Function' is invalid.";
        }
    };
    return ExecuteCodeFunction;
}(ActionClass));
ExecuteCodeFunction = ExecuteCodeFunction_1 = __decorate([
    DialogActionClass
], ExecuteCodeFunction);
var ExecuteCodeFunction_1;
/// <reference path="../Dialogs/DialogAction.ts" />
var GiveCurrentItem = (function (_super) {
    __extends(GiveCurrentItem, _super);
    function GiveCurrentItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GiveCurrentItem.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quantity");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "1"), updateFunction);
        return html;
    };
    GiveCurrentItem.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Give Current Item' requires a quantity.";
        if (!env || !env.HasVariable('currentItem'))
            return;
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
            //val = CodeParser.ParseStatement(values[0]).Execute(env).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Give Current Item' for the quantity is invalid.";
        }
        world.Player.AddItem(env.GetVariable('currentItem').GetString(), val);
    };
    return GiveCurrentItem;
}(ActionClass));
GiveCurrentItem = __decorate([
    DialogActionClass
], GiveCurrentItem);
/// <reference path="../Dialogs/DialogAction.ts" />
var GiveItem = (function (_super) {
    __extends(GiveItem, _super);
    function GiveItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GiveItem.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Item");
        html += this.OptionList(id, 0, world.InventoryObjects.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    };
    GiveItem.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Give Item' requires a name.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Give Item' for the quantity is invalid.";
        }
        world.Player.AddItem(values[0], val);
    };
    return GiveItem;
}(ActionClass));
GiveItem = __decorate([
    DialogActionClass
], GiveItem);
/// <reference path="../Dialogs/DialogAction.ts" />
var GiveSkill = (function (_super) {
    __extends(GiveSkill, _super);
    function GiveSkill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GiveSkill.prototype.Display = function (id, values, updateFunction) {
        if (!values[0])
            values[0] = world.Skills.map(function (c) { return c.Name; }).sort()[0];
        var html = "";
        html += this.Label("Skill");
        html += this.OptionList(id, 0, world.Skills.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    GiveSkill.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Give Skill' requires a name.";
        world.Player.GiveSkill(values[0]);
    };
    return GiveSkill;
}(ActionClass));
GiveSkill = __decorate([
    DialogActionClass
], GiveSkill);
/// <reference path="../Dialogs/DialogAction.ts" />
var IncreaseStat = (function (_super) {
    __extends(IncreaseStat, _super);
    function IncreaseStat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IncreaseStat.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    };
    IncreaseStat.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Increase Stat' requires a name.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Increase Stat' for the quantity is invalid.";
        }
        world.Player.SetStat(values[0], world.Player.GetStat(values[0]) + val);
    };
    return IncreaseStat;
}(ActionClass));
IncreaseStat = __decorate([
    DialogActionClass
], IncreaseStat);
/// <reference path="../Dialogs/DialogAction.ts" />
var PlayerFloatingMessage = (function (_super) {
    __extends(PlayerFloatingMessage, _super);
    function PlayerFloatingMessage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayerFloatingMessage.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Text");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Color");
        html += this.Input(id, 1, values[1] ? values[1] : "#FFFFFF", updateFunction);
        return html;
    };
    PlayerFloatingMessage.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!env)
            env = new CodeEnvironement();
        if (!values[0])
            throw "The action 'Player Floating Message' requires a text.";
        var val;
        try {
            val = CodeParser.ExecuteStatement(values[0], env.variables).GetString();
        }
        catch (ex) {
            val = values[0];
        }
        var ax = world.Player.AX;
        var ay = world.Player.AY;
        var mx = world.Player.X;
        var my = world.Player.Y;
        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area) {
            area.actors.push(MapMessage.Create(val, values[1] ? values[1] : "#FFFFFF", area, mx, my));
        }
    };
    return PlayerFloatingMessage;
}(ActionClass));
PlayerFloatingMessage = __decorate([
    DialogActionClass
], PlayerFloatingMessage);
/// <reference path="../Dialogs/DialogAction.ts" />
var PlaySound = (function (_super) {
    __extends(PlaySound, _super);
    function PlaySound() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlaySound.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Sound");
        var sounds = [];
        for (var item in world.art.sounds)
            sounds.push(item);
        sounds.sort();
        html += this.OptionList(id, 0, sounds, values[0], updateFunction);
        html += this.Label("Volume");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "0.6"), updateFunction);
        return html;
    };
    PlaySound.prototype.Execute = function (values, env) {
        if (!env)
            env = new CodeEnvironement();
        if (!values[0])
            throw "The action 'Play Sound' requires a sound name.";
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Play Sound' for the volume is invalid.";
        }
        Sounds.Play(values[0], val);
    };
    return PlaySound;
}(ActionClass));
PlaySound = __decorate([
    DialogActionClass
], PlaySound);
/// <reference path="../Dialogs/DialogAction.ts" />
var RemoveAllTemporaryEffects = (function (_super) {
    __extends(RemoveAllTemporaryEffects, _super);
    function RemoveAllTemporaryEffects() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemoveAllTemporaryEffects.prototype.Display = function (id, values, updateFunction) {
        return "";
    };
    RemoveAllTemporaryEffects.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        world.Player.ClearTemporaryEffects();
    };
    return RemoveAllTemporaryEffects;
}(ActionClass));
RemoveAllTemporaryEffects = __decorate([
    DialogActionClass
], RemoveAllTemporaryEffects);
/// <reference path="../Dialogs/DialogAction.ts" />
var RemoveCurrentItem = (function (_super) {
    __extends(RemoveCurrentItem, _super);
    function RemoveCurrentItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemoveCurrentItem.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quantity");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "1"), updateFunction);
        return html;
    };
    RemoveCurrentItem.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!env || !env.HasVariable('currentItem'))
            return;
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Remove Current Item' for the quantity is invalid.";
        }
        world.Player.RemoveItem(env.GetVariable('currentItem').GetString(), val);
    };
    return RemoveCurrentItem;
}(ActionClass));
RemoveCurrentItem = __decorate([
    DialogActionClass
], RemoveCurrentItem);
/// <reference path="../Dialogs/DialogAction.ts" />
var RemoveItem = (function (_super) {
    __extends(RemoveItem, _super);
    function RemoveItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemoveItem.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Item");
        html += this.OptionList(id, 0, world.InventoryObjects.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    };
    RemoveItem.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Remove Item' for the quantity is invalid.";
        }
        world.Player.RemoveItem(values[0], val);
    };
    return RemoveItem;
}(ActionClass));
RemoveItem = __decorate([
    DialogActionClass
], RemoveItem);
/// <reference path="../Dialogs/DialogAction.ts" />
var RemoveTemporaryEffect = (function (_super) {
    __extends(RemoveTemporaryEffect, _super);
    function RemoveTemporaryEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemoveTemporaryEffect.prototype.Display = function (id, values, updateFunction) {
        if (!values[0])
            values[0] = world.TemporaryEffects.map(function (c) { return c.Name; }).sort()[0];
        var html = "";
        html += this.Label("Effect");
        html += this.OptionList(id, 0, world.TemporaryEffects.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    RemoveTemporaryEffect.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Remove Temporary Effect' requires an effect name.";
        world.Player.RemoveTemporaryEffect(values[0]);
    };
    return RemoveTemporaryEffect;
}(ActionClass));
RemoveTemporaryEffect = __decorate([
    DialogActionClass
], RemoveTemporaryEffect);
/// <reference path="../Dialogs/DialogAction.ts" />
var Respawn = (function (_super) {
    __extends(Respawn, _super);
    function Respawn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Respawn.prototype.Display = function (id, values, updateFunction) {
        return "";
    };
    Respawn.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (world.Player.RespawnPoint)
            Teleport.Teleport(world.Player.RespawnPoint.X, world.Player.RespawnPoint.Y, world.Player.RespawnPoint.Zone);
        else
            Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);
    };
    return Respawn;
}(ActionClass));
Respawn = __decorate([
    DialogActionClass
], Respawn);
/// <reference path="../Dialogs/DialogAction.ts" />
var RestorePlayerLook = (function (_super) {
    __extends(RestorePlayerLook, _super);
    function RestorePlayerLook() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RestorePlayerLook.prototype.Display = function (id, values, updateFunction) {
        return "";
    };
    RestorePlayerLook.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        world.Player.Name = world.Player.GetQuestVariable("__PlayerLook");
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
    };
    return RestorePlayerLook;
}(ActionClass));
RestorePlayerLook = __decorate([
    DialogActionClass
], RestorePlayerLook);
/// <reference path="../Dialogs/DialogAction.ts" />
var SetLook = (function (_super) {
    __extends(SetLook, _super);
    function SetLook() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetLook.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Look");
        var names = [];
        for (var item in world.art.characters)
            names.push(item);
        names.sort();
        html += this.OptionList(id, 0, names, values[0], updateFunction);
        return html;
    };
    SetLook.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Set Look' requires a look name.";
        world.Player.Name = values[0];
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
    };
    return SetLook;
}(ActionClass));
SetLook = __decorate([
    DialogActionClass
], SetLook);
/// <reference path="../Dialogs/DialogAction.ts" />
var SetQuestVariable = (function (_super) {
    __extends(SetQuestVariable, _super);
    function SetQuestVariable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetQuestVariable.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest Variable");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Value");
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    };
    SetQuestVariable.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Set Quest Variable' requires a quest variable name.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Remove Current Item' for the quantity is invalid.";
        }
        world.Player.SetQuestVariable(values[0], val);
    };
    return SetQuestVariable;
}(ActionClass));
SetQuestVariable = __decorate([
    DialogActionClass
], SetQuestVariable);
/// <reference path="../Dialogs/DialogAction.ts" />
var SetRespawnPoint = (function (_super) {
    __extends(SetRespawnPoint, _super);
    function SetRespawnPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetRespawnPoint.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Position X");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "0"), updateFunction);
        html += this.Label("Position Y");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "0"), updateFunction);
        html += this.Label("Zone");
        html += this.OptionList(id, 2, world.Zones.map(function (c) { return (c.Name); }).sort(), values[2], updateFunction);
        return html;
    };
    SetRespawnPoint.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[2])
            throw "The action 'Set Respawn Point' requires a zone name.";
        if (!env)
            env = new CodeEnvironement();
        var x = 0;
        var y = 0;
        try {
            x = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Set Respawn Point' for the x position is invalid.";
        }
        try {
            y = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Set Respawn Point' for the y position is invalid.";
        }
        world.Player.RespawnPoint = { X: x, Y: y, Zone: values[2] };
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
    };
    return SetRespawnPoint;
}(ActionClass));
SetRespawnPoint = __decorate([
    DialogActionClass
], SetRespawnPoint);
/// <reference path="../Dialogs/DialogAction.ts" />
var SetStat = (function (_super) {
    __extends(SetStat, _super);
    function SetStat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetStat.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Value");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "1"), updateFunction);
        return html;
    };
    SetStat.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Set Stat' requires a stat name.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Set Stat' for the value is invalid.";
        }
        world.Player.SetStat(values[0], val);
    };
    return SetStat;
}(ActionClass));
SetStat = __decorate([
    DialogActionClass
], SetStat);
/// <reference path="../Dialogs/DialogAction.ts" />
var lastMapMessageTimeout = null;
var ShowMapMessage = (function (_super) {
    __extends(ShowMapMessage, _super);
    function ShowMapMessage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShowMapMessage.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Message");
        html += this.Input(id, 0, values[0], updateFunction);
        return html;
    };
    ShowMapMessage.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'ShowMapMessage' requires a message.";
        if (lastMapMessageTimeout)
            clearTimeout(lastMapMessageTimeout);
        $("#mapMessage").show();
        $("#mapMessage .gamePanelContentNoHeader").html("<center>" + values[0].htmlEntities() + "</center>");
        lastMapMessageTimeout = setTimeout(function () {
            lastMapMessageTimeout = null;
            $("#mapMessage").hide();
        }, 3000);
    };
    return ShowMapMessage;
}(ActionClass));
ShowMapMessage = __decorate([
    DialogActionClass
], ShowMapMessage);
/// <reference path="../Dialogs/DialogAction.ts" />
var ShowShop = (function (_super) {
    __extends(ShowShop, _super);
    function ShowShop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShowShop.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        return html;
    };
    ShowShop.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        npc.canJump = false;
        NPCActor.ShowShop();
    };
    return ShowShop;
}(ActionClass));
ShowShop = __decorate([
    DialogActionClass
], ShowShop);
/// <reference path="../Dialogs/DialogAction.ts" />
var StartDialog = (function (_super) {
    __extends(StartDialog, _super);
    function StartDialog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StartDialog.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("NPC");
        html += this.OptionList(id, 0, world.NPCs.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    StartDialog.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Start Dialog' requires a NPC name.";
        var npcName = values[0];
        npc.Dialogs = world.GetNPC(npcName).Dialogs;
        npc.currentNPC = world.GetNPC(npcName);
        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(npc.currentNPC.Name);
        NPCActor.ShowDialog(0);
    };
    return StartDialog;
}(ActionClass));
StartDialog = __decorate([
    DialogActionClass
], StartDialog);
/// <reference path="../Dialogs/DialogAction.ts" />
var StartQuest = (function (_super) {
    __extends(StartQuest, _super);
    function StartQuest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StartQuest.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    StartQuest.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Start Quest' requires a quest name.";
        world.Player.StartQuest(values[0]);
    };
    return StartQuest;
}(ActionClass));
StartQuest = __decorate([
    DialogActionClass
], StartQuest);
/// <reference path="../Dialogs/DialogAction.ts" />
var StartTemporaryEffect = (function (_super) {
    __extends(StartTemporaryEffect, _super);
    function StartTemporaryEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StartTemporaryEffect.prototype.Display = function (id, values, updateFunction) {
        if (!values[0])
            values[0] = world.TemporaryEffects.map(function (c) { return c.Name; }).sort()[0];
        var html = "";
        html += this.Label("Effect");
        html += this.OptionList(id, 0, world.TemporaryEffects.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    StartTemporaryEffect.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[0])
            throw "The action 'Start Temporary Effect' requires an effect name.";
        world.Player.StartTemporaryEffect(values[0]);
    };
    return StartTemporaryEffect;
}(ActionClass));
StartTemporaryEffect = __decorate([
    DialogActionClass
], StartTemporaryEffect);
/// <reference path="../Dialogs/DialogAction.ts" />
var StopAllMusic = (function (_super) {
    __extends(StopAllMusic, _super);
    function StopAllMusic() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StopAllMusic.prototype.Display = function (id, values, updateFunction) {
        return "";
    };
    StopAllMusic.prototype.Execute = function (values, env) {
        Sounds.ClearSound();
    };
    return StopAllMusic;
}(ActionClass));
StopAllMusic = __decorate([
    DialogActionClass
], StopAllMusic);
/// <reference path="../Dialogs/DialogAction.ts" />
var StorePlayerLook = (function (_super) {
    __extends(StorePlayerLook, _super);
    function StorePlayerLook() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StorePlayerLook.prototype.Display = function (id, values, updateFunction) {
        return "";
    };
    StorePlayerLook.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        world.Player.SetQuestVariable("__PlayerLook", world.Player.Name);
    };
    return StorePlayerLook;
}(ActionClass));
StorePlayerLook = __decorate([
    DialogActionClass
], StorePlayerLook);
/// <reference path="../Dialogs/DialogAction.ts" />
var Teleport = Teleport_1 = (function (_super) {
    __extends(Teleport, _super);
    function Teleport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Teleport.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Position X");
        html += this.Input(id, 0, values[0] = (values[0] || values[0] == "" ? values[0] : "0"), updateFunction);
        html += this.Label("Position Y");
        html += this.Input(id, 1, values[1] = (values[1] || values[1] == "" ? values[1] : "0"), updateFunction);
        html += this.Label("Zone");
        html += this.OptionList(id, 2, world.Zones.map(function (c) { return (c.Name); }).sort(), values[2], updateFunction);
        return html;
    };
    Teleport.prototype.Execute = function (values, env) {
        if (!this.Execute.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (!values[2])
            throw "The action 'Teleport' requires a zone name.";
        if (!env)
            env = new CodeEnvironement();
        var x = 0;
        var y = 0;
        try {
            x = CodeParser.ExecuteStatement(values[0], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Teleport' for the x position is invalid.";
        }
        try {
            y = CodeParser.ExecuteStatement(values[1], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Teleport' for the y position is invalid.";
        }
        Teleport_1.Teleport(x, y, values[2]);
    };
    Teleport.Teleport = function (x, y, zone) {
        if (!Teleport_1.Teleport.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        if (world.Player.CurrentArea)
            for (var i = 0; i < world.Player.CurrentArea.actors.length; i++) {
                if (world.Player.CurrentArea.actors[i] == world.Player) {
                    world.Player.CurrentArea.actors.splice(i, 1);
                    world.Player.CurrentArea.CleanObjectCache();
                    break;
                }
            }
        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            //mx = (world.areaWidth - 1) * world.art.background.width - mx;
            mx = (world.areaWidth) * world.art.background.width - mx;
        if (ay < 0)
            //my = (world.areaHeight - 1) * world.art.background.height - my;
            my = (world.areaHeight) * world.art.background.height - my;
        world.VisibleCenter(ax, ay, zone);
        world.Player.AX = ax;
        world.Player.AY = ay;
        world.Player.Zone = zone;
        world.Player.X = mx;
        world.Player.Y = my;
        play.afterTeleport = true;
        world.Player.CurrentArea = world.GetArea(world.Player.AX, world.Player.AY, world.Player.Zone);
        if (world.Player.CurrentArea) {
            world.Player.CurrentArea.actors.push(world.Player);
            world.Player.CurrentArea.CleanObjectCache();
        }
        play.path = null;
        world.Player.Save();
    };
    return Teleport;
}(ActionClass));
Teleport = Teleport_1 = __decorate([
    DialogActionClass
], Teleport);
var Teleport_1;
var ChatBot = (function () {
    function ChatBot() {
        this.Name = "";
        this.Channel = "*";
        this.Sentences = [];
        this.isFollowUp = false;
    }
    ChatBot.prototype.HandleChat = function (line, callback) {
        var _this = this;
        if (this.isFollowUp === null || this.isFollowUp === undefined)
            this.isFollowUp = false;
        var waitAll = this.Sentences.length;
        var endResult = null;
        for (var i = 0; i < this.Sentences.length; i++) {
            this.Sentences[i].HandleChat(this.Name, this.isFollowUp, line, function (res) {
                waitAll--;
                if (res)
                    endResult = res;
                if (waitAll == 0) {
                    if (endResult)
                        _this.isFollowUp = true;
                    else
                        _this.isFollowUp = false;
                    callback(endResult);
                }
            });
        }
    };
    ChatBot.prototype.ResetLogic = function () {
        for (var i = 0; i < this.Sentences.length; i++) {
            this.Sentences[i].ResetLogic();
        }
    };
    ChatBot.Rebuild = function (source) {
        var res = Object.cast(source, ChatBot);
        res.Sentences = res.Sentences.map(function (m) { return Object.cast(m, ChatBotSentence); });
        return res;
    };
    ChatBot.prototype.Store = function () {
        return {
            Name: this.Name,
            Channel: this.Channel,
            Sentences: this.Sentences.map(function (s) {
                return s.Store();
            })
        };
    };
    return ChatBot;
}());
var ChatBotSentence = (function () {
    function ChatBotSentence() {
        this.Conditions = [];
        this.Trigger = "[hello,@bot@],[hi,@bot@],[hey,@bot@]";
        this.Answer = "Hi @name@";
        this.Code = "// Uncomment the following function if you want to override\n// the answer with an answer generated by code.\n\n// function Answer(line)\n// {\n// \treturn \"Hello\";\n// }";
    }
    ChatBotSentence.prototype.Store = function () {
        return {
            Conditions: this.Conditions,
            Trigger: this.Trigger,
            Answer: this.Answer,
            Code: this.Code,
            FollowUp: this.FollowUp
        };
    };
    ChatBotSentence.prototype.HandleChat = function (botName, followUp, line, callback) {
        if (!this.triggerWords)
            this.triggerWords = this.SplitTrigger();
        var words = ChatBotSentence.SplitLine(line);
        if (followUp && this.FollowUp)
            words.push(botName.toLowerCase());
        if (this.Match(botName.toLowerCase(), words)) {
            this.env = CodeParser.Parse(this.Code);
            if (this.env.HasFunction("Answer")) {
                this.env.ExecuteFunction("Answer", [new VariableValue(line)], function (res) { callback(res.GetString()); });
                return;
            }
            else {
                callback(this.Answer.replace(/@name@/gi, username));
                return;
            }
        }
        callback(null);
    };
    ChatBotSentence.prototype.Match = function (botName, words) {
        for (var i = 0; i < this.triggerWords.length; i++) {
            var nbMatched = 0;
            for (var j = 0; j < this.triggerWords[i].length; j++) {
                for (var k = 0; k < words.length; k++) {
                    if (this.triggerWords[i][j] == "@bot@" && words[k] == botName || this.triggerWords[i][j] == words[k]) {
                        nbMatched++;
                        break;
                    }
                }
            }
            if (nbMatched == this.triggerWords[i].length)
                return true;
        }
        return false;
    };
    ChatBotSentence.SplitLine = function (line) {
        var res = line.toLowerCase().split(/\W+/);
        if (line.indexOf("/") == 0 && res && res.length > 1) {
            res.shift();
            res[0] = "/" + res[0];
        }
        return res;
    };
    ChatBotSentence.prototype.SplitTrigger = function () {
        return ChatBotSentence.SplitRules(this.Trigger);
    };
    ChatBotSentence.SplitRules = function (source) {
        var triggerWords = [];
        var possibleSentence = null;
        var currentWord = "";
        for (var i = 0; i < source.length; i++) {
            var c = source[i].toLowerCase();
            if ((c >= "a" && c <= "z") || c == "@" || (c == "/" && currentWord == "" && triggerWords.length == 0 && possibleSentence == null))
                currentWord += c;
            else if (c == ",") {
                if (!possibleSentence) {
                    if (currentWord && currentWord != "") {
                        triggerWords.push([currentWord]);
                        currentWord = "";
                    }
                }
                else {
                    possibleSentence.push(currentWord);
                    currentWord = "";
                }
            }
            else if (c == "]") {
                possibleSentence.push(currentWord);
                currentWord = "";
                triggerWords.push(possibleSentence);
                possibleSentence = null;
            }
            else if (c == "[") {
                possibleSentence = [];
            }
        }
        if (currentWord != "") {
            if (possibleSentence) {
                possibleSentence.push(currentWord);
                triggerWords.push(possibleSentence);
            }
            else
                triggerWords.push([currentWord]);
        }
        return triggerWords;
    };
    ChatBotSentence.prototype.ResetLogic = function () {
        this.triggerWords = null;
        this.env = null;
    };
    return ChatBotSentence;
}());
var dialogCondition = new ((function () {
    function class_2() {
        this.code = {};
    }
    return class_2;
}()));
function DialogConditionClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var conditionClass = new target();
    if (conditionClass instanceof ConditionClass)
        dialogCondition.code[className] = conditionClass;
    else
        throw "Class \"" + className + "\" doesn't extends ConditionClass.";
}
var ConditionClass = (function () {
    function ConditionClass() {
    }
    ConditionClass.prototype.OptionList = function (id, position, values, currentValue, updateFunction) {
        var html = "";
        html += "<span class='dialogParam'><select id='" + (updateFunction ? updateFunction : "condition") + "_" + id + "_" + position + "' onchange='" + dialogCondition.currentEditor + "." + (updateFunction ? updateFunction : "ChangeCondition") + "(" + id + "," + position + ")'>";
        var found = false;
        for (var i = 0; i < values.length; i++) {
            if (values[i].Id != undefined) {
                html += "<option" + (values[i].Id == currentValue ? " selected" : "") + " value='" + ("" + values[i].Id).htmlEntities() + "'>" + values[i].Value + "</option>";
                if (values[i].Id == currentValue)
                    found = true;
            }
            else {
                html += "<option" + (values[i] == currentValue ? " selected" : "") + " value='" + ("" + values[i]).htmlEntities() + "'>" + values[i] + "</option>";
                if (values[i] == currentValue)
                    found = true;
            }
        }
        if (!found)
            html += "<option selected>" + (currentValue === undefined ? "" : currentValue) + "</option>";
        html += "</select></span>";
        return html;
    };
    ConditionClass.prototype.Input = function (id, position, currentValue, updateFunction) {
        return "<span class='dialogParam'><input id='" + (updateFunction ? updateFunction : "condition") + "_" + id + "_" + position + "' type='text' value='" + (currentValue ? currentValue : "").htmlEntities() + "' onchange='" + dialogCondition.currentEditor + "." + (updateFunction ? updateFunction : "ChangeCondition") + "(" + id + "," + position + ")' onfocus='play.inField=true;' onblur='play.inField=false;'></span>";
    };
    ConditionClass.prototype.Label = function (label) {
        return "<span class='dialogParamLabel'>" + label + "</span>";
    };
    return ConditionClass;
}());
var DialogCondition = (function () {
    function DialogCondition() {
        this.Values = [];
    }
    return DialogCondition;
}());
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckFalse = (function (_super) {
    __extends(CheckFalse, _super);
    function CheckFalse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckFalse.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        return html;
    };
    CheckFalse.prototype.Check = function (values, env) {
        return false;
    };
    return CheckFalse;
}(ConditionClass));
CheckFalse = __decorate([
    DialogConditionClass
], CheckFalse);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckHasSkill = (function (_super) {
    __extends(CheckHasSkill, _super);
    function CheckHasSkill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckHasSkill.prototype.Display = function (id, values, updateFunction) {
        if (!values[0])
            values[0] = world.Skills.map(function (c) { return c.Name; }).sort()[0];
        var html = "";
        html += this.Label("Skill");
        html += this.OptionList(id, 0, world.Skills.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckHasSkill.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Has Skill' requires a skill name.";
        for (var i = 0; i < world.Player.Skills.length; i++)
            if (world.Player.Skills[i].Name.toLowerCase() == values[0].toLowerCase())
                return true;
        return false;
    };
    return CheckHasSkill;
}(ConditionClass));
CheckHasSkill = __decorate([
    DialogConditionClass
], CheckHasSkill);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckInventory = (function (_super) {
    __extends(CheckInventory, _super);
    function CheckInventory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckInventory.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Item");
        html += this.OptionList(id, 0, world.InventoryObjects.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Comparison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Quantity");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    };
    CheckInventory.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Inventory' requires an item name.";
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Check Inventory' for the quantity is invalid.";
        }
        var qt = world.Player.GetInventoryQuantity(values[0]);
        if (qt == null)
            qt = 0;
        switch (values[1]) {
            case "=":
                return (qt == val);
            case "<":
                return (qt < val);
            case ">":
                return (qt > val);
            case "<=":
                return (qt <= val);
            case ">=":
                return (qt >= val);
            case "<>":
                return (qt != val);
        }
        return true;
    };
    return CheckInventory;
}(ConditionClass));
CheckInventory = __decorate([
    DialogConditionClass
], CheckInventory);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckJournalEntryNotReceived = (function (_super) {
    __extends(CheckJournalEntryNotReceived, _super);
    function CheckJournalEntryNotReceived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckJournalEntryNotReceived.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Journal Entry");
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    };
    CheckJournalEntryNotReceived.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Journal Entry Not Received' requires an quest name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The condition 'Check Journal Entry Not Received' requires the id of the journal entry (as number).";
        return !world.Player.HaveQuestJournalEntry(values[0], parseInt(values[1]));
    };
    return CheckJournalEntryNotReceived;
}(ConditionClass));
CheckJournalEntryNotReceived = __decorate([
    DialogConditionClass
], CheckJournalEntryNotReceived);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckJournalEntryReceived = (function (_super) {
    __extends(CheckJournalEntryReceived, _super);
    function CheckJournalEntryReceived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckJournalEntryReceived.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Journal Entry");
        html += this.Input(id, 1, values[1], updateFunction);
        return html;
    };
    CheckJournalEntryReceived.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Journal Entry Received' requires an quest name.";
        if (!values[1] || isNaN(parseInt(values[1])))
            throw "The condition 'Check Journal Entry Received' requires the id of the journal entry (as number).";
        return world.Player.HaveQuestJournalEntry(values[0], parseInt(values[1]));
    };
    return CheckJournalEntryReceived;
}(ConditionClass));
CheckJournalEntryReceived = __decorate([
    DialogConditionClass
], CheckJournalEntryReceived);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckLookIs = (function (_super) {
    __extends(CheckLookIs, _super);
    function CheckLookIs() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckLookIs.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Look");
        var names = [];
        for (var item in world.art.characters)
            names.push(item);
        names.sort();
        html += this.OptionList(id, 0, names, values[0], updateFunction);
        return html;
    };
    CheckLookIs.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Look Is' requires an look name.";
        return world.Player.Name == values[0];
    };
    return CheckLookIs;
}(ConditionClass));
CheckLookIs = __decorate([
    DialogConditionClass
], CheckLookIs);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckLookIsNot = (function (_super) {
    __extends(CheckLookIsNot, _super);
    function CheckLookIsNot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckLookIsNot.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Look");
        var names = [];
        for (var item in world.art.characters)
            names.push(item);
        names.sort();
        html += this.OptionList(id, 0, names, values[0], updateFunction);
        return html;
    };
    CheckLookIsNot.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Look Is Not' requires an look name.";
        return world.Player.Name != values[0];
    };
    return CheckLookIsNot;
}(ConditionClass));
CheckLookIsNot = __decorate([
    DialogConditionClass
], CheckLookIsNot);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckNotHasSkill = (function (_super) {
    __extends(CheckNotHasSkill, _super);
    function CheckNotHasSkill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckNotHasSkill.prototype.Display = function (id, values, updateFunction) {
        if (!values[0])
            values[0] = world.Skills.map(function (c) { return c.Name; }).sort()[0];
        var html = "";
        html += this.Label("Skill");
        html += this.OptionList(id, 0, world.Skills.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckNotHasSkill.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Not Has Skill' requires a skill name.";
        for (var i = 0; i < world.Player.Skills.length; i++)
            if (world.Player.Skills[i].Name.toLowerCase() == values[0].toLowerCase())
                return false;
        return true;
    };
    return CheckNotHasSkill;
}(ConditionClass));
CheckNotHasSkill = __decorate([
    DialogConditionClass
], CheckNotHasSkill);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckQuestCompleted = (function (_super) {
    __extends(CheckQuestCompleted, _super);
    function CheckQuestCompleted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckQuestCompleted.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckQuestCompleted.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Quest Completed' requires a quest name.";
        return world.Player.IsQuestCompleted(values[0]);
    };
    return CheckQuestCompleted;
}(ConditionClass));
CheckQuestCompleted = __decorate([
    DialogConditionClass
], CheckQuestCompleted);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckQuestNotCompleted = (function (_super) {
    __extends(CheckQuestNotCompleted, _super);
    function CheckQuestNotCompleted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckQuestNotCompleted.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckQuestNotCompleted.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Quest Not Completed' requires a quest name.";
        return !world.Player.IsQuestCompleted(values[0]);
    };
    return CheckQuestNotCompleted;
}(ConditionClass));
CheckQuestNotCompleted = __decorate([
    DialogConditionClass
], CheckQuestNotCompleted);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckQuestNotStarted = (function (_super) {
    __extends(CheckQuestNotStarted, _super);
    function CheckQuestNotStarted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckQuestNotStarted.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckQuestNotStarted.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Quest Not Started' requires a quest name.";
        return !world.Player.IsQuestStarted(values[0]);
    };
    return CheckQuestNotStarted;
}(ConditionClass));
CheckQuestNotStarted = __decorate([
    DialogConditionClass
], CheckQuestNotStarted);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckQuestStarted = (function (_super) {
    __extends(CheckQuestStarted, _super);
    function CheckQuestStarted() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckQuestStarted.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest");
        html += this.OptionList(id, 0, world.Quests.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        return html;
    };
    CheckQuestStarted.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Quest Started' requires a quest name.";
        return world.Player.IsQuestStarted(values[0]);
    };
    return CheckQuestStarted;
}(ConditionClass));
CheckQuestStarted = __decorate([
    DialogConditionClass
], CheckQuestStarted);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckQuestVariable = (function (_super) {
    __extends(CheckQuestVariable, _super);
    function CheckQuestVariable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckQuestVariable.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Quest Variable");
        html += this.Input(id, 0, values[0], updateFunction);
        html += this.Label("Compaison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Compare To");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    };
    CheckQuestVariable.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check Quest Variable' requires a quest varibale name.";
        var variable = world.Player.GetQuestVariable(values[0]);
        if (variable == null)
            variable = 0;
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Check Quest Variable' for the value is invalid.";
        }
        switch (values[1]) {
            case "=":
                return (variable == val);
            case "<":
                return (variable < val);
            case ">":
                return (variable > val);
            case "<=":
                return (variable <= val);
            case ">=":
                return (variable >= val);
            case "<>":
                return (variable != val);
        }
        return true;
    };
    return CheckQuestVariable;
}(ConditionClass));
CheckQuestVariable = __decorate([
    DialogConditionClass
], CheckQuestVariable);
/// <reference path="../Dialogs/DialogCondition.ts" />
var CheckUserStat = (function (_super) {
    __extends(CheckUserStat, _super);
    function CheckUserStat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CheckUserStat.prototype.Display = function (id, values, updateFunction) {
        var html = "";
        html += this.Label("Stat");
        html += this.OptionList(id, 0, world.Stats.map(function (c) { return c.Name; }).sort(), values[0], updateFunction);
        html += this.Label("Compaison");
        html += this.OptionList(id, 1, ["=", "<", ">", "<=", ">=", "<>"], values[1], updateFunction);
        html += this.Label("Compare To");
        html += this.Input(id, 2, values[2], updateFunction);
        return html;
    };
    CheckUserStat.prototype.Check = function (values, env) {
        if (!values[0])
            throw "The condition 'Check User Stat' requires a stat name.";
        var stat = world.Player.GetStat(values[0]);
        if (stat == null)
            stat = 0;
        if (!env)
            env = new CodeEnvironement();
        var val = 0;
        try {
            val = CodeParser.ExecuteStatement(values[2], env.variables).GetNumber();
        }
        catch (ex) {
            throw "The expression used in 'Check User Stat' for the value is invalid.";
        }
        //var val = parseFloat(values[2]);
        switch (values[1]) {
            case "=":
                return (stat == val);
            case "<":
                return (stat < val);
            case ">":
                return (stat > val);
            case "<=":
                return (stat <= val);
            case ">=":
                return (stat >= val);
            case "<>":
                return (stat != val);
        }
        return true;
    };
    return CheckUserStat;
}(ConditionClass));
CheckUserStat = __decorate([
    DialogConditionClass
], CheckUserStat);
var Dialog = (function () {
    function Dialog() {
        this.Answers = [];
    }
    return Dialog;
}());
var knownEffects = [];
// Class decorator which will put all the API inside the api variable.
function MapEffectClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownEffects.push(className.substr(0, className.length - 6));
    knownEffects.sort();
}
var MapEffect = (function () {
    function MapEffect() {
    }
    return MapEffect;
}());
/// <reference path="MapEffect.ts" />
var FogEffect = (function (_super) {
    __extends(FogEffect, _super);
    function FogEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gofImage = null;
        return _this;
    }
    FogEffect.prototype.Render = function (ctx, width, height) {
        if (!this.gofImage) {
            this.gofImage = new Image();
            this.gofImage.src = "/Effects/fog.png";
        }
        ctx.fillStyle = "#dcdbeb";
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, 0, Math.floor(width / 2) - 256, height);
        ctx.fillRect(Math.floor(width / 2) + 256, 0, width, height);
        ctx.fillRect(Math.floor(width / 2) - 256, 0, 512, Math.floor(height / 2) - 256);
        ctx.fillRect(Math.floor(width / 2) - 256, Math.floor(height / 2) + 256, 512, height);
        ctx.drawImage(this.gofImage, Math.floor(width / 2) - 256, Math.floor(height / 2) - 256);
        ctx.globalAlpha = 1;
    };
    return FogEffect;
}(MapEffect));
FogEffect = __decorate([
    MapEffectClass
], FogEffect);
/// <reference path="MapEffect.ts" />
var NoneEffect = (function (_super) {
    __extends(NoneEffect, _super);
    function NoneEffect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoneEffect.prototype.Render = function (ctx, width, height) {
    };
    return NoneEffect;
}(MapEffect));
NoneEffect = __decorate([
    MapEffectClass
], NoneEffect);
/// <reference path="MapEffect.ts" />
var SightEffect = (function (_super) {
    __extends(SightEffect, _super);
    function SightEffect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sightImage = null;
        return _this;
    }
    SightEffect.prototype.Render = function (ctx, width, height) {
        if (!this.sightImage) {
            this.sightImage = new Image();
            this.sightImage.src = "/Effects/sight_1.png";
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, Math.floor(width / 2) - 256, height);
        ctx.fillRect(Math.floor(width / 2) + 256, 0, width, height);
        ctx.fillRect(0, 0, width, Math.floor(height / 2) - 256);
        ctx.fillRect(0, Math.floor(height / 2) + 256, width, height);
        ctx.drawImage(this.sightImage, Math.floor(width / 2) - 256, Math.floor(height / 2) - 256);
    };
    return SightEffect;
}(MapEffect));
SightEffect = __decorate([
    MapEffectClass
], SightEffect);
var InventoryObject = (function () {
    function InventoryObject(name, count, usage) {
        if (count === void 0) { count = 1; }
        if (usage === void 0) { usage = null; }
        this.Name = name;
        this.Count = count;
        this.UsageLevel = usage;
    }
    InventoryObject.prototype.GetDetails = function () {
        for (var i = 0; i < world.InventoryObjects.length; i++)
            if (world.InventoryObjects[i].Name == this.Name)
                return world.InventoryObjects[i];
        return null;
    };
    InventoryObject.prototype.GetObjectType = function () {
        return this.GetDetails().GetType();
    };
    return InventoryObject;
}());
var InventorySlot = (function () {
    function InventorySlot(name) {
        this.Name = name;
    }
    InventorySlot.DefaultSlots = function () {
        return [
            new InventorySlot('Head'),
            new InventorySlot('Body'),
            new InventorySlot('LeftHand'),
            new InventorySlot('RightHand'),
            new InventorySlot('Legs'),
            new InventorySlot('Feet'),
            new InventorySlot('Neck'),
            new InventorySlot('LeftHandFinger'),
            new InventorySlot('RightHandFinger')
        ];
    };
    return InventorySlot;
}());
var KnownObject = (function () {
    function KnownObject(name, objectType, slots, weight, price, description, maxStack, action, actionCode, parameters) {
        this.UsageConditions = [];
        this.UnwearConditions = [];
        this.WearConditions = [];
        this.DropConditions = [];
        this.UsageActions = [];
        this.Name = name;
        this.ObjectType = objectType;
        this.Slots = slots ? slots : [];
        this.Weight = weight ? weight : 0;
        this.Price = price ? price : 0;
        this.Description = description ? description : "";
        this.MaxStack = maxStack ? maxStack : 0;
        this.Action = action;
        this.ActionCode = actionCode;
        this.Parameters = parameters ? parameters : [];
        this.Image = '/art/tileset2/inventory_object.png';
    }
    KnownObject.DefaultObjects = function () {
        var result = [
            new KnownObject("Wood Stick", "Weapon", ["RightHand"], 2, 2, "A simple wood stick to defend yourself", 1, null, null, [new ObjectParameter("Base Damage", "5"), new ObjectParameter("Attack Speed", "0.5")]),
            new KnownObject("Apple", "Food", [], 1, 1, "A red apple", 10, null, null, [new ObjectParameter("Life Recover", "3")])
        ];
        return result;
    };
    KnownObject.prototype.GetType = function () {
        for (var i = 0; i < world.InventoryObjectTypes.length; i++)
            if (world.InventoryObjectTypes[i].Name == this.ObjectType)
                return world.InventoryObjectTypes[i];
        return null;
    };
    KnownObject.prototype.GetParameter = function (statName) {
        // Checks within the object properties
        for (var prop in this)
            if (prop.toLowerCase() == statName.toLowerCase())
                return "" + this[prop];
        // Checks within the additional parameters
        for (var i = 0; i < this.Parameters.length; i++)
            if (this.Parameters[i].Name.toLowerCase() == statName.toLowerCase())
                return this.Parameters[i].Value;
        return null;
    };
    KnownObject.prototype.CanUnwear = function () {
        if (world.SimplifiedObjectLogic) {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (!this.UnwearConditions)
                this.UnwearConditions = [];
            if (this.UnwearConditions.length)
                for (var i = 0; i < this.UnwearConditions.length; i++) {
                    if (!dialogCondition.code[this.UnwearConditions[i].Name].Check(this.UnwearConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().UnwearConditions.length; i++) {
                    if (!dialogCondition.code[this.GetType().UnwearConditions[i].Name].Check(this.GetType().DropConditions[i].Values, env))
                        return false;
                }
            return true;
        }
        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanUnwear"))
            return code.ExecuteFunction("CanUnwear", [new VariableValue(this.Name)]).GetBoolean();
        return true;
    };
    KnownObject.prototype.CanWear = function () {
        if (this.Slots.length == 0)
            return false;
        if (world.SimplifiedObjectLogic) {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.WearConditions.length)
                for (var i = 0; i < this.WearConditions.length; i++) {
                    if (!dialogCondition.code[this.WearConditions[i].Name].Check(this.WearConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().WearConditions.length; i++) {
                    if (!dialogCondition.code[this.GetType().WearConditions[i].Name].Check(this.GetType().WearConditions[i].Values, env))
                        return false;
                }
            return true;
        }
        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanWear"))
            return code.ExecuteFunction("CanWear", [new VariableValue(this.Name)]).GetBoolean();
        return true;
    };
    KnownObject.prototype.CanUse = function () {
        if (world.SimplifiedObjectLogic) {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.UsageConditions.length)
                for (var i = 0; i < this.UsageConditions.length; i++) {
                    if (!dialogCondition.code[this.UsageConditions[i].Name].Check(this.UsageConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().UsageConditions.length; i++) {
                    if (!dialogCondition.code[this.GetType().UsageConditions[i].Name].Check(this.GetType().UsageConditions[i].Values, env))
                        return false;
                }
            return true;
        }
        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanUse"))
            return code.ExecuteFunction("CanUse", [new VariableValue(this.Name)]).GetBoolean();
        return true;
    };
    KnownObject.prototype.CanDrop = function () {
        if (world.SimplifiedObjectLogic) {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.DropConditions.length)
                for (var i = 0; i < this.DropConditions.length; i++) {
                    if (!dialogCondition.code[this.DropConditions[i].Name].Check(this.DropConditions[i].Values, env))
                        return false;
                }
            else
                for (var i = 0; i < this.GetType().DropConditions.length; i++) {
                    if (!dialogCondition.code[this.GetType().DropConditions[i].Name].Check(this.GetType().DropConditions[i].Values, env))
                        return false;
                }
            return true;
        }
        var code = this.GetObjectCode();
        if (code && code.HasFunction("CanDrop"))
            return code.ExecuteFunction("CanDrop", [new VariableValue(this.Name)]).GetBoolean();
        return true;
    };
    KnownObject.prototype.Use = function () {
        if (world.SimplifiedObjectLogic) {
            var env = new CodeEnvironement();
            env.SetVariable('currentItem', new VariableValue(this.Name));
            if (this.UsageActions.length)
                for (var i = 0; i < this.UsageActions.length; i++)
                    dialogAction.code[this.UsageActions[i].Name].Execute(this.UsageActions[i].Values, env);
            else
                for (var i = 0; i < this.GetType().UsageActions.length; i++)
                    dialogAction.code[this.GetType().UsageActions[i].Name].Execute(this.GetType().UsageActions[i].Values, env);
            return;
        }
        var code = this.GetObjectCode();
        if (code.HasFunction("Use"))
            code.ExecuteFunction("Use", [new VariableValue(this.Name)]);
    };
    KnownObject.prototype.GetObjectCode = function () {
        var code;
        if (this.Action && this.ActionCode && this.ActionCode.trim() != "") {
            if (this.ActionCode.indexOf("function") == -1)
                return CodeParser.Parse("function Use() { " + this.ActionCode + ";}");
            return CodeParser.Parse(this.ActionCode);
        }
        else if (this.GetType().Action) {
            if (this.GetType().ActionCode.indexOf("function") == -1)
                return CodeParser.Parse("function Use() { " + this.GetType().ActionCode + ";}");
            return CodeParser.Parse(this.GetType().ActionCode);
        }
        return code;
    };
    KnownObject.prototype.ActionLabel = function () {
        if (this.Action)
            return this.Action;
        else if (this.GetType().Action)
            return this.GetType().Action;
        return null;
    };
    return KnownObject;
}());
var ObjectDefinedParameter = (function () {
    function ObjectDefinedParameter(name, defaultValue) {
        this.Name = name;
        this.DefaultValue = defaultValue;
    }
    return ObjectDefinedParameter;
}());
var ObjectParameter = (function () {
    function ObjectParameter(name, value) {
        this.Name = name;
        this.Value = value;
    }
    return ObjectParameter;
}());
var ObjectType = (function () {
    function ObjectType(name, group, action, actionCode, parameters) {
        this.UsageConditions = [];
        this.WearConditions = [];
        this.UnwearConditions = [];
        this.DropConditions = [];
        this.UsageActions = [];
        this.Name = name;
        this.Group = group;
        this.Action = action;
        this.ActionCode = actionCode;
        this.Parameters = parameters ? parameters : [];
    }
    ObjectType.DefaultObjectType = function () {
        var result = [
            new ObjectType("Head Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Body Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Leg Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Feet Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Hand Armor", "Armor", null, null, [new ObjectDefinedParameter("Protection", "1")]),
            new ObjectType("Weapon", "Weapon", null, null, [new ObjectDefinedParameter("Base Damage", "1"), new ObjectDefinedParameter("Attack Speed", "1")]),
            new ObjectType("Potion", "Aid", "Drink", "function Use(currentItem)\n{\n\tInventory.RemoveItem(currentItem);\n\tif(Inventory.ObjectParameterExists(currentItem,'Life Recover'))\n\t\tPlayer.IncreaseStat('Life',Inventory.ObjectParameter(currentItem,'Life Recover'));\n}", [new ObjectDefinedParameter("Life Recover", "1")]),
            new ObjectType("Food", "Aid", "Eat", "function Use(currentItem)\n{\n\tInventory.RemoveItem(currentItem);\n\tif(Inventory.ObjectParameterExists(currentItem,'Life Recover'))\n\t\tPlayer.IncreaseStat('Life',Inventory.ObjectParameter(currentItem,'Life Recover'));\n}", [new ObjectDefinedParameter("Life Recover", "0")])
        ];
        result[6].UsageActions = [{ "Name": "IncreaseStat", "Values": ["Life", "Inventory.ObjectParameter(currentItem, 'Life Recover')"] }, { "Name": "RemoveCurrentItem", "Values": ["1"] }];
        result[7].UsageActions = [{ "Name": "IncreaseStat", "Values": ["Life", "Inventory.ObjectParameter(currentItem, 'Life Recover')"] }, { "Name": "RemoveCurrentItem", "Values": ["1"] }];
        return result;
    };
    return ObjectType;
}());
var mapBag = new ((function () {
    function class_3() {
    }
    return class_3;
}()));
var MapBag = (function () {
    function MapBag() {
    }
    MapBag.ShowBag = function (obj) {
        mapBag.currentBag = obj;
        mapBag.content = mapBag.currentBag.LinkedData;
        setTimeout(Play.MouseUp, 100);
        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html("Bag");
        MapBag.ShowContent();
        return true;
    };
    MapBag.ShowContent = function () {
        var html = "";
        html += "<table>";
        for (var i = 0; i < mapBag.content.Items.length; i++) {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='MapBag.GetItem(" + i + ")'>Get</div></td>";
            html += "<td>" + mapBag.content.Items[i].Name + "</td>";
            html += "<td>" + mapBag.content.Items[i].Quantity + "</td>";
            html += "</tr>";
        }
        for (var i = 0; i < mapBag.content.Stats.length; i++) {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='MapBag.GetStat(" + i + ")'>Get</div></td>";
            var stat = world.GetStat(mapBag.content.Stats[i].Name);
            html += "<td>" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : mapBag.content.Stats[i].Name) + "</td>";
            html += "<td>" + mapBag.content.Stats[i].Quantity + "</td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#dialogSentence").html(html);
        play.onDialogPaint = [];
        html = "";
        html += "<div onclick='MapBag.TakeAll();' class='gameButton'>Take All</div>";
        html += "<div onclick='MapBag.Close();' class='gameButton'>Close</div>";
        $("#dialogAnswers").html(html);
    };
    MapBag.GetItem = function (rowId) {
        var v = parseFloat("" + mapBag.content.Items[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.AddItem(mapBag.content.Items[rowId].Name, v);
        mapBag.content.Items.splice(rowId, 1);
        if (mapBag.content.Items.length == 0 && mapBag.content.Stats.length == 0)
            MapBag.Close();
        else
            MapBag.ShowContent();
    };
    MapBag.GetStat = function (rowId) {
        var v = parseFloat("" + mapBag.content.Stats[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.SetStat(mapBag.content.Stats[rowId].Name, world.Player.GetStat(mapBag.content.Stats[rowId].Name) + v);
        mapBag.content.Stats.splice(rowId, 1);
        if (mapBag.content.Items.length == 0 && mapBag.content.Stats.length == 0)
            MapBag.Close();
        else
            MapBag.ShowContent();
    };
    MapBag.TakeAll = function () {
        for (var i = 0; i < mapBag.content.Stats.length; i++) {
            var v = parseFloat("" + mapBag.content.Stats[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.SetStat(mapBag.content.Stats[i].Name, world.Player.GetStat(mapBag.content.Stats[i].Name) + v);
        }
        for (var i = 0; i < mapBag.content.Items.length; i++) {
            var v = parseFloat("" + mapBag.content.Items[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.AddItem(mapBag.content.Items[i].Name, v);
        }
        MapBag.Close();
    };
    MapBag.Close = function () {
        mapBag.currentBag.EndOfLife = new Date();
        world.Player.InDialog = false;
        $("#npcDialog").hide();
    };
    return MapBag;
}());
var numberCompressionPossibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var NumberCompression = (function () {
    function NumberCompression() {
    }
    NumberCompression.StringToNumber = function (source, position, nbChar) {
        var result = 0;
        for (var i = 0; i < nbChar; i++) {
            var c = source.charAt(i + position);
            result += numberCompressionPossibleChars.indexOf(c) * Math.pow(numberCompressionPossibleChars.length, i);
        }
        return result;
    };
    NumberCompression.StringToArray = function (source) {
        var result = [];
        var strNb = "";
        var i = 0;
        for (; i < source.length; i++) {
            var c = source.charAt(i);
            if (c == "-")
                break;
            strNb += c;
        }
        i++;
        var nbChar = parseInt(strNb);
        strNb = "";
        for (; i < source.length; i++) {
            var k = source.charCodeAt(i);
            if (k >= 48 && k <= 57)
                strNb += source.charAt(i);
            else {
                var nb = NumberCompression.StringToNumber(source, i, nbChar);
                i += nbChar - 1;
                if (strNb == "")
                    result.push(nb);
                else {
                    var n = parseInt(strNb);
                    for (var j = 0; j < n; j++)
                        result.push(nb);
                    strNb = "";
                }
            }
        }
        return result;
    };
    // Numbers must be positive!
    NumberCompression.NumberToString = function (source, nbChar) {
        var result = "";
        var rest = source;
        for (var i = 0; i < nbChar; i++) {
            result += numberCompressionPossibleChars.charAt(rest % numberCompressionPossibleChars.length);
            rest = Math.floor(rest / numberCompressionPossibleChars.length);
        }
        return result;
    };
    // Numbers must be positive!
    NumberCompression.ArrayToString = function (source) {
        var result = "";
        var m = Math.max.apply(null, source);
        // Calculate how many characters we need to encode the numbers
        var nbChar = Math.max(1, Math.ceil(Math.log(Math.max.apply(null, source)) / Math.log(numberCompressionPossibleChars.length - 1)));
        result += "" + nbChar + "-";
        var last = null;
        var count = 0;
        for (var i = 0; i < source.length; i++) {
            var n = NumberCompression.NumberToString(source[i], nbChar);
            if (n == last)
                count++;
            else {
                if (last != null) {
                    if (count > 1)
                        result += "" + count + last;
                    else
                        result += last;
                }
                last = n;
                count = 1;
            }
        }
        if (count > 1)
            result += "" + count + last;
        else
            result += last;
        return result;
    };
    return NumberCompression;
}());
///<reference path="../../Libs/NumberCompression.ts" />
var WorldArea = (function () {
    function WorldArea() {
        this.objects = [];
        this.actors = [];
        this.houses = [];
        this.tempObjects = [];
        this.storedMonsters = [];
        this.storedNPC = [];
        this.storedMap = false;
        this.mapActions = [];
        this.edited = false;
    }
    WorldArea.prototype.GetTile = function (x, y, zone) {
        var ax = this.X;
        var ay = this.Y;
        if (x < 0) {
            x += this.world.areaWidth;
            ax--;
        }
        if (y < 0) {
            y += this.world.areaHeight;
            ay--;
        }
        if (x >= this.world.areaWidth) {
            x -= this.world.areaWidth;
            ax++;
        }
        if (y >= this.world.areaHeight) {
            y -= this.world.areaHeight;
            ay++;
        }
        var a = this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return null;
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.backgroundTiles && this.currentFragment.backgroundTiles[x + y * this.world.areaWidth] !== null && this.currentFragment.backgroundTiles[x + y * this.world.areaWidth] !== undefined)
            return this.currentFragment.backgroundTiles[x + y * this.world.areaWidth];
        return a.backgroundTiles[x + y * this.world.areaWidth];
    };
    WorldArea.prototype.HitHouse = function (x, y, zone) {
        var result = [];
        for (var i = 0; i < this.houses.length; i++) {
            var obj = this.houses[i];
            var house = world.GetHouse(obj.Name);
            if (x >= obj.X - (house.collisionX + house.collisionWidth / 2) && x <= obj.X + house.collisionWidth / 2 &&
                y >= obj.Y - (house.collisionY + house.collisionHeight / 2) && y <= obj.Y + house.collisionHeight / 2)
                result.push(obj);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.houses) {
            for (var i = 0; i < this.currentFragment.houses.length; i++) {
                var obj = this.currentFragment.houses[i];
                var house = world.GetHouse(obj.Name);
                if (x >= obj.X - (house.collisionX + house.collisionWidth / 2) && x <= obj.X + house.collisionWidth / 2 &&
                    y >= obj.Y - (house.collisionY + house.collisionHeight / 2) && y <= obj.Y + house.collisionHeight / 2)
                    result.push(obj);
            }
        }
        result.sort(function (a, b) { return a.Y - b.Y; });
        return result;
    };
    WorldArea.prototype.HitNpc = function (x, y, zone) {
        var result = [];
        for (var i = 0; i < this.storedNPC.length; i++) {
            var obj = this.storedNPC[i];
            var npc = world.GetNPC(obj.Name);
            if (!npc) {
                this.storedNPC.splice(i, 1);
                this.edited = true;
                i--;
                continue;
            }
            var objInfo = world.art.characters[npc.Look];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.actors) {
            for (var i = 0; i < this.currentFragment.actors.length; i++) {
                var obj = this.currentFragment.actors[i];
                var npc = world.GetNPC(obj.Name);
                if (!npc) {
                    this.storedNPC.splice(i, 1);
                    this.edited = true;
                    i--;
                    continue;
                }
                var objInfo = world.art.characters[npc.Look];
                if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                    y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                    result.push(obj);
            }
        }
        result.sort(function (a, b) { return a.Y - b.Y; });
        return result;
    };
    WorldArea.prototype.HitMonster = function (x, y, zone) {
        var result = [];
        for (var i = 0; i < this.storedMonsters.length; i++) {
            var obj = this.storedMonsters[i];
            var monster = world.GetMonster(obj.Name);
            var objInfo = world.art.characters[monster.Art];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width / objInfo.frames - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height / objInfo.directions - objInfo.groundY)
                result.push(obj);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        for (var i = 0; i < this.currentFragment.monsters.length; i++) {
            var obj = this.currentFragment.monsters[i];
            var monster = world.GetMonster(obj.Name);
            var objInfo = world.art.characters[monster.Art];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width / objInfo.frames - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height / objInfo.directions - objInfo.groundY)
                result.push(obj);
        }
        result.sort(function (a, b) { return a.Y - b.Y; });
        return result;
    };
    WorldArea.prototype.HitObjects = function (x, y, zone) {
        var result = [];
        for (var i = 0; i < this.objects.length; i++) {
            var objInfo = world.art.objects[this.objects[i].Name];
            if (!objInfo)
                continue;
            var obj = this.objects[i];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }
        for (var i = 0; i < this.tempObjects.length; i++) {
            var objInfo = world.art.objects[this.tempObjects[i].Name];
            if (!objInfo)
                continue;
            var obj = this.tempObjects[i];
            if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                result.push(obj);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.objects) {
            for (var i = 0; i < this.currentFragment.objects.length; i++) {
                var objInfo = world.art.objects[this.currentFragment.objects[i].Name];
                if (!objInfo)
                    continue;
                var obj = this.currentFragment.objects[i];
                if (x >= obj.X - objInfo.groundX && x <= obj.X + objInfo.width - objInfo.groundX &&
                    y >= obj.Y - objInfo.groundY && y <= obj.Y + objInfo.height - objInfo.groundY)
                    result.push(obj);
            }
        }
        result.sort(function (a, b) { return a.Y - b.Y; });
        return result;
    };
    WorldArea.prototype.GetObjects = function (x, y, zone, compensate, includeOtherPlayers) {
        if (compensate === void 0) { compensate = false; }
        if (includeOtherPlayers === void 0) { includeOtherPlayers = true; }
        var ax = this.X;
        var ay = this.Y;
        var cx = 0;
        var cy = 0;
        if (x < 0) {
            x += this.world.areaWidth;
            cx = -this.world.areaWidth;
            ax--;
        }
        if (y < 0) {
            y += this.world.areaHeight;
            cy = -this.world.areaHeight;
            ay--;
        }
        if (x >= this.world.areaWidth) {
            x -= this.world.areaWidth;
            cx = this.world.areaWidth;
            ax++;
        }
        if (y >= this.world.areaHeight) {
            y -= this.world.areaHeight;
            cy = this.world.areaHeight;
            ay++;
        }
        var a = this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return [];
        // We don't have the grid cache of the objects, let's create it
        if (!a.cacheWorldObject)
            a.RebuildCache();
        var result = a.cacheWorldObject[x + y * this.world.areaWidth].slice();
        var w = world.art.background.width;
        var h = world.art.background.height;
        if (this.otherPlayers)
            for (var i = 0; i < this.otherPlayers.length; i++)
                if (Math.floor(this.otherPlayers[i].X / w) == x && Math.floor(this.otherPlayers[i].Y / h) == y)
                    result.push(this.otherPlayers[i]);
        if (compensate && (cx != 0 || cy != 0)) {
            var compensatedResult = [];
            for (var i = 0; i < result.length; i++) {
                if (!result[i]['__type'])
                    result[i]['__type'] = ("" + result[i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];
                var n = {
                    Name: result[i].Name,
                    Draw: result[i].Draw,
                    PlayerInteract: result[i].PlayerInteract,
                    PlayerMouseInteract: result[i].PlayerMouseInteract,
                    X: result[i].X + cx * w,
                    Y: result[i].Y + cy * h,
                    Type: result[i]['__type']
                };
                n['__type'] = n['Type'];
                // Crap workaround to pass the right information. We should find a better implementation
                switch (n.Type) {
                    case "Monster":
                        n.Name = result[i].MonsterEnv.Art;
                        break;
                    case "NPCActor":
                        n.Name = result[i].baseNpc.Look;
                        break;
                    default:
                        break;
                }
                compensatedResult.push(n);
            }
            return compensatedResult;
        }
        return result;
    };
    WorldArea.prototype.GetActions = function (x, y, zone, roundPosition) {
        if (roundPosition === void 0) { roundPosition = false; }
        var ax = this.X;
        var ay = this.Y;
        if (x < 0) {
            x += this.world.areaWidth * world.art.background.width;
            ax--;
        }
        if (y < 0) {
            y += this.world.areaHeight * world.art.background.height;
            ay--;
        }
        if (x >= this.world.areaWidth * world.art.background.width) {
            x -= this.world.areaWidth * world.art.background.width;
            ax++;
        }
        if (y >= this.world.areaHeight * world.art.background.height) {
            y -= this.world.areaHeight * world.art.background.height;
            ay++;
        }
        var a = this;
        if (ax != this.X || ay != this.Y || zone != this.Zone)
            a = this.world.GetArea(ax, ay, zone);
        if (!a)
            return null;
        if (roundPosition) {
            x = Math.floor(x / world.art.background.width);
            y = Math.floor(y / world.art.background.height);
        }
        var sizes = [0.5, 1, 2];
        for (var i = 0; i < a.mapActions.length; i++) {
            var collisionSize = world.art.background.width * sizes[a.mapActions[i].Size === null || a.mapActions[i].Size === undefined ? 1 : a.mapActions[i].Size];
            if (roundPosition) {
                var tx = Math.floor(a.mapActions[i].X / world.art.background.width);
                var ty = Math.floor(a.mapActions[i].Y / world.art.background.height);
                if (tx == x && ty == y)
                    return a.mapActions[i];
            }
            else {
                if (x > a.mapActions[i].X - collisionSize
                    && x < a.mapActions[i].X + collisionSize
                    && y > a.mapActions[i].Y - collisionSize
                    && y < a.mapActions[i].Y + collisionSize)
                    return a.mapActions[i];
            }
        }
        return null;
    };
    WorldArea.SortActors = function (oa, ob) {
        if ((oa.Y - ob.Y) > 0)
            return 1;
        if ((oa.Y - ob.Y) < 0)
            return -1;
        return 0;
    };
    WorldArea.prototype.RemoveVisitedObjects = function () {
        if (!(this.world && this.world.Player && this.world.Player.HasVisitedMapObject))
            return;
        for (var i = 0; i < this.objects.length;) {
            var objInfo = world.art.objects[this.objects[i].Name];
            if (!objInfo) {
                i++;
                continue;
            }
            var mustBeRemoved = false;
            if (objInfo.disappearOnClick === true && this.world.Player.HasVisitedMapObject("click," + this.objects[i].GetId(this.X, this.Y, this.world.Player.Zone)))
                mustBeRemoved = true;
            else if (objInfo.disappearOnWalk === true && this.world.Player.HasVisitedMapObject("walk," + this.objects[i].GetId(this.X, this.Y, this.world.Player.Zone)))
                mustBeRemoved = true;
            if (mustBeRemoved)
                this.objects.splice(i, 1);
            else
                i++;
        }
        this.CleanObjectCache();
    };
    WorldArea.prototype.RebuildCache = function () {
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        this.cacheWorldObject = [];
        // Prepares the empty cache
        var totCells = this.world.areaWidth * this.world.areaHeight;
        for (var i = 0; i < totCells; i++)
            this.cacheWorldObject[i] = [];
        var toPlace = ["objects", "actors", "houses", "tempObjects"];
        for (var j = 0; j < toPlace.length; j++) {
            for (var i = 0; i < this[toPlace[j]].length; i++) {
                if (!this[toPlace[j]][i]['__type'])
                    this[toPlace[j]][i]['__type'] = ("" + this[toPlace[j]][i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];
                var a = Math.min(Math.floor(this[toPlace[j]][i].X / tileWidth), this.world.areaWidth - 1);
                var b = Math.min(Math.floor(this[toPlace[j]][i].Y / tileHeight), this.world.areaHeight - 1);
                this.cacheWorldObject[a + b * this.world.areaWidth].push(this[toPlace[j]][i]);
            }
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.objects) {
            var toPlace = ["objects", "actors", "houses"];
            for (var j = 0; j < toPlace.length; j++) {
                for (var i = 0; i < this.currentFragment[toPlace[j]].length; i++) {
                    if (!this.currentFragment[toPlace[j]][i]['__type'])
                        this.currentFragment[toPlace[j]][i]['__type'] = ("" + this.currentFragment[toPlace[j]][i].constructor).match(/function ([a-z0-9_]+)\(/i)[1];
                    var a = Math.min(Math.floor(this.currentFragment[toPlace[j]][i].X / tileWidth), this.world.areaWidth - 1);
                    var b = Math.min(Math.floor(this.currentFragment[toPlace[j]][i].Y / tileHeight), this.world.areaHeight - 1);
                    this.cacheWorldObject[a + b * this.world.areaWidth].push(this.currentFragment[toPlace[j]][i]);
                }
            }
        }
        // Resort each grid cell based on Y
        for (var i = 0; i < totCells; i++)
            this.cacheWorldObject[i].sort(WorldArea.SortActors);
    };
    WorldArea.prototype.CleanObjectCache = function () {
        this.cacheWorldObject = null;
    };
    WorldArea.prototype.RemoveFromCache = function (actor, x, y) {
        if (!this.cacheWorldObject)
            return;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var pos = Math.min(Math.floor(x / tileWidth), this.world.areaWidth - 1) + Math.min(Math.floor(y / tileHeight), this.world.areaHeight - 1) * this.world.areaWidth;
        if (pos < 0 || pos >= this.cacheWorldObject.length) {
            this.CleanObjectCache();
            return;
        }
        for (var i = 0; i < this.cacheWorldObject[pos].length; i++) {
            if (this.cacheWorldObject[pos][i] == actor) {
                this.cacheWorldObject[pos].splice(i, 1);
                return;
            }
        }
    };
    WorldArea.prototype.AddToCache = function (actor) {
        if (!this.cacheWorldObject)
            return;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var pos = Math.min(Math.floor(actor.X / tileWidth), this.world.areaWidth - 1) + Math.min(Math.floor(actor.Y / tileHeight), this.world.areaHeight - 1) * this.world.areaWidth;
        this.cacheWorldObject[pos].push(actor);
        this.cacheWorldObject[pos].sort(WorldArea.SortActors);
    };
    WorldArea.prototype.HandleActors = function () {
        var actorList = this.actors.slice();
        for (var i = 0; i < actorList.length; i++)
            actorList[i].Handle();
        if (this.otherPlayers)
            for (var i = 0; i < this.otherPlayers.length; i++)
                this.otherPlayers[i].Handle();
        var tempObjects = this.tempObjects.slice();
        for (var i = 0; i < this.tempObjects.length; i++)
            tempObjects[i].Handle();
    };
    WorldArea.Parse = function (data) {
        var r = JSON.parse(data);
        var result = new WorldArea();
        result.storedMap = true;
        result.backgroundTiles = NumberCompression.StringToArray(r.Background);
        result.objects = [];
        for (var i in r.Objects)
            for (var j = 0, s = r.Objects[i]; j < s.length; j += 6)
                result.objects.push(new WorldObject(i, NumberCompression.StringToNumber(s, j, 3), NumberCompression.StringToNumber(s, j + 3, 3)));
        if (r.Chests) {
            var chests = r.Chests.map(function (m) { return Object.cast(m, WorldChest); });
            for (var j = 0; j < chests.length; j++)
                result.objects.push(chests[j]);
        }
        result.storedNPC = r.StoredNPC;
        result.storedMonsters = r.StoredMonsters;
        if (r.Houses)
            for (var j = 0; j < r.Houses.length; j++)
                result.houses.push(new WorldHouse(r.Houses[j].Name, r.Houses[j].X, r.Houses[j].Y));
        if (r.MapActions)
            for (var j = 0; j < r.MapActions.length; j++)
                result.mapActions.push(MapAction.Restore(r.MapActions[j], result));
        result.storedMap = true;
        return result;
    };
    WorldArea.prototype.Stringify = function () {
        var objects = {};
        var chests = [];
        for (var i = 0; i < this.objects.length; i++) {
            if (!world.art.objects[this.objects[i].Name])
                continue;
            if (this.objects[i] instanceof WorldChest) {
                chests.push(this.objects[i]);
                continue;
            }
            if (!objects[this.objects[i].Name])
                objects[this.objects[i].Name] = "";
            objects[this.objects[i].Name] += NumberCompression.NumberToString(this.objects[i].X, 3) + NumberCompression.NumberToString(this.objects[i].Y, 3);
        }
        var r = { Background: NumberCompression.ArrayToString(this.backgroundTiles), Objects: objects, StoredMonsters: this.storedMonsters, StoredNPC: this.storedNPC, Houses: this.houses, MapActions: this.mapActions.map(function (c) { return c.Store(); }), Chests: chests };
        return JSON.stringify(r);
    };
    WorldArea.prototype.ActorAt = function (x, y, allowsCharacters) {
        var result = [];
        for (var i = 0; i < this.actors.length; i++) {
            var obj = null;
            var w = 0;
            var h = 0;
            if (this.actors[i] instanceof Monster)
                obj = this.world.art.characters[this.actors[i].MonsterEnv.Art];
            else if (this.actors[i] instanceof NPCActor)
                obj = this.world.art.characters[this.actors[i].baseNpc.Look];
            else {
                if (!allowsCharacters)
                    continue;
                obj = this.world.art.characters[this.actors[i].Name];
            }
            if (obj && obj.width && obj.frames)
                w = obj.width / obj.frames;
            if (obj && obj.height && obj.directions)
                h = obj.height / obj.directions;
            var a = x + (obj && obj.groundX ? obj.groundX : 0);
            var b = y + (obj && obj.groundY ? obj.groundY : 0);
            if (a >= this.actors[i].X && a <= this.actors[i].X + w && b >= this.actors[i].Y && b <= this.actors[i].Y + h)
                result.push(this.actors[i]);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        if (this.currentFragment && this.currentFragment.actors) {
            for (var i = 0; i < this.currentFragment.actors.length; i++) {
                var obj = null;
                var w = 0;
                var h = 0;
                var obj = this.world.art.characters[this.currentFragment.actors[i].baseNpc.Look];
                if (obj && obj.width && obj.frames)
                    w = obj.width / obj.frames;
                if (obj && obj.height && obj.directions)
                    h = obj.height / obj.directions;
                var a = x + (obj && obj.groundX ? obj.groundX : 0);
                var b = y + (obj && obj.groundY ? obj.groundY : 0);
                if (a >= this.currentFragment.actors[i].X && a <= this.currentFragment.actors[i].X + w && b >= this.currentFragment.actors[i].Y && b <= this.currentFragment.actors[i].Y + h)
                    result.push(this.currentFragment.actors[i]);
            }
        }
        result.sort(function (a, b) { return a.Y - b.Y; });
        return result;
    };
    WorldArea.prototype.GenerateMonsters = function () {
        if (!this.world.GetZone)
            return;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.width;
        var rnd = new SeededRandom();
        rnd.Seed("Monsters_" + this.X + "_" + this.Y);
        var zone = this.world.GetZone(this.Zone);
        // Place the monsters
        if (zone.Monsters && zone.Monsters.length > 0) {
            for (var i = 0; i < (this.world.areaWidth - 1) * (this.world.areaHeight - 1); i++) {
                for (var j = 0; j < zone.Monsters.length; j++) {
                    var monsterDef = this.world.GetMonster(zone.Monsters[j].Name);
                    if (!monsterDef)
                        continue;
                    if (monsterDef.Name.toLowerCase() == "defaultmonster")
                        continue;
                    var dice = rnd.Next() * 100;
                    if (zone.Monsters[j].Frequency && dice <= zone.Monsters[j].Frequency) {
                        var tx = i % this.world.areaWidth;
                        var ty = Math.floor(i / this.world.areaWidth);
                        var monster = Monster.Create(monsterDef, this, tx * tileWidth + rnd.Next(tileWidth), ty * tileHeight + rnd.Next(tileHeight));
                        if (monster.CanWalkOn(monster.X, monster.Y) && world.Player.CanRespawn(monster.MonsterId, null))
                            this.actors.push(monster);
                        break;
                    }
                }
            }
        }
    };
    WorldArea.prototype.OnlyDefinedActors = function () {
        this.actors = [];
        if (world.Player.CurrentArea == this)
            this.actors.push(world.Player);
        // We should transform random monsters in editable monsters
        if (!this.storedMap && !this.edited && (!this.storedMonsters || !this.storedMonsters.length)) {
            this.RecoverMonsters();
            this.GenerateMonsters();
            this.storedMonsters = [];
            for (var i = 0; i < this.actors.length; i++) {
                if (this.actors[i] instanceof Monster) {
                    this.storedMonsters.push({
                        Name: this.actors[i].Name,
                        X: this.actors[i].X,
                        Y: this.actors[i].Y
                    });
                }
            }
        }
        this.RecoverMonsters();
        this.RecoverNPCs();
        this.CleanObjectCache();
    };
    WorldArea.prototype.RecoverActors = function () {
        if (!world || !world.Player)
            return;
        this.actors = [];
        if (world.Player.CurrentArea == this)
            this.actors.push(world.Player);
        if (!this.storedMap && !this.edited)
            this.GenerateMonsters();
        else {
            this.RecoverMonsters();
            this.RecoverNPCs();
        }
        this.CleanObjectCache();
    };
    WorldArea.prototype.RecoverMonsters = function () {
        if (!this.storedMonsters)
            return;
        for (var i = 0; i < this.storedMonsters.length; i++) {
            var m = this.storedMonsters[i];
            var monster = null;
            try {
                monster = Monster.Create(this.world.GetMonster(m.Name), this, m.X, m.Y);
            }
            catch (ex) {
                continue;
            }
            if (monster && world.Player.CanRespawn(monster.MonsterId, this.storedMonsters[i].RespawnTime))
                this.actors.push(monster);
        }
        if (!this.currentFragment)
            this.currentFragment = AreaFragment.CreateFragment(this.world, this, this.X, this.Y, this.Zone);
        for (var i = 0; i < this.currentFragment.monsters.length; i++) {
            var m = this.currentFragment.monsters[i];
            var monster = Monster.Create(this.world.GetMonster(m.Name), this, m.X, m.Y);
            monster['fragId'] = m['fragIg'];
            if (world.Player.CanRespawn(monster.MonsterId, this.currentFragment.monsters[i].RespawnTime))
                this.actors.push(monster);
        }
    };
    WorldArea.prototype.RecoverNPCs = function () {
        if (!this.storedNPC)
            return;
        for (var i = 0; i < this.storedNPC.length; i++) {
            var n = this.storedNPC[i];
            var npc = this.world.GetNPC(n.Name);
            if (!npc)
                continue;
            this.actors.push(NPCActor.Create(npc, this, n.X, n.Y));
        }
    };
    WorldArea.prototype.AddPlayer = function (x, y, name, look, emote, emoteTimer, direction) {
        var otherPlayer = OtherPlayer.FindPlayer(name);
        if (otherPlayer) {
            if (otherPlayer.CurrentArea != this) {
                for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++) {
                    if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer) {
                        otherPlayer.CurrentArea.otherPlayers.splice(i, 1);
                        break;
                    }
                }
                if (!this.otherPlayers)
                    this.otherPlayers = [];
                this.otherPlayers.push(otherPlayer);
                otherPlayer.X = x;
                otherPlayer.Y = y;
                otherPlayer.DX = x;
                otherPlayer.DY = y;
                otherPlayer.VX = null;
                otherPlayer.VY = null;
                otherPlayer.CurrentArea = this;
                otherPlayer.InterpolationStep = null;
                otherPlayer.Name = look;
                otherPlayer.CurrentEmote = emote;
                otherPlayer.EmoteTimer = emoteTimer;
                otherPlayer.Direction = direction;
            }
            else {
                if (Math.abs(x - otherPlayer.X) > 5) {
                    otherPlayer.DX = x;
                    otherPlayer.VX = (x - otherPlayer.X) / 30;
                }
                else {
                    otherPlayer.X = x;
                    otherPlayer.DX = x;
                    otherPlayer.VX = 0;
                }
                if (Math.abs(y - otherPlayer.Y) > 5) {
                    otherPlayer.DY = y;
                    otherPlayer.VY = (y - otherPlayer.Y) / 30;
                }
                else {
                    otherPlayer.Y = y;
                    otherPlayer.DY = y;
                    otherPlayer.VY = 0;
                }
                otherPlayer.InterpolationStep = 0;
                otherPlayer.Name = look;
                otherPlayer.CurrentEmote = emote;
                otherPlayer.EmoteTimer = emoteTimer;
                otherPlayer.Direction = direction;
            }
        }
        else {
            otherPlayer = new OtherPlayer(this.world);
            otherPlayer.CurrentArea = this;
            otherPlayer.X = x;
            otherPlayer.Y = y;
            otherPlayer.Username = name;
            otherPlayer.Name = look;
            otherPlayer.CurrentEmote = emote;
            otherPlayer.EmoteTimer = emoteTimer;
            otherPlayer.Direction = direction;
            if (!this.otherPlayers)
                this.otherPlayers = [];
            this.otherPlayers.push(otherPlayer);
        }
    };
    WorldArea.prototype.ResetFragments = function () {
        this.currentFragment = null;
        this.CleanObjectCache();
    };
    return WorldArea;
}());
///<reference path="../World/WorldArea.ts" />
var TemporaryWorldObject = (function () {
    function TemporaryWorldObject(name, x, y, currentArea) {
        this.MouseCallback = null;
        this.Name = name;
        this.X = x;
        this.Y = y;
        this.CurrentArea = currentArea;
    }
    TemporaryWorldObject.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
    };
    TemporaryWorldObject.prototype.Handle = function () {
        // Need to be destroyed
        if (this.EndOfLife && (this.EndOfLife.getTime() - (new Date()).getTime()) <= 0) {
            for (var i = 0; i < this.CurrentArea.tempObjects.length; i++) {
                if (this.CurrentArea.tempObjects[i] == this) {
                    this.CurrentArea.tempObjects.splice(i, 1);
                    this.CurrentArea.CleanObjectCache();
                    return;
                }
            }
        }
    };
    TemporaryWorldObject.prototype.PlayerInteract = function (ax, ay) {
    };
    TemporaryWorldObject.prototype.PlayerMouseInteract = function (ax, ay) {
        if (this.MouseCallback && this.MouseCallback(this))
            return true;
        return false;
    };
    return TemporaryWorldObject;
}());
/// <reference path="../World/WorldArea.ts" />
/// <reference path="TemporaryWorldObject.ts" />
var TemporaryParticleEffect = (function (_super) {
    __extends(TemporaryParticleEffect, _super);
    function TemporaryParticleEffect(name, x, y, currentArea, end) {
        var _this = _super.call(this, name, x, y, currentArea) || this;
        _this.EndOfLife = end;
        _this.particleSystem = world.GetParticleSystem(name);
        return _this;
    }
    TemporaryParticleEffect.prototype.Draw = function (renderEngine, ctx, x, y) {
        if (!this.particleSystem)
            return;
        ctx.save();
        ctx.translate(x, y);
        this.particleSystem.Draw(ctx);
        ctx.restore();
    };
    return TemporaryParticleEffect;
}(TemporaryWorldObject));
///<reference path="../World/WorldArea.ts" />
var WorldObject = (function () {
    function WorldObject(name, x, y) {
        this.currentFrame = 0;
        this.Name = name;
        this.X = x;
        this.Y = y;
    }
    WorldObject.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        if (artInfo.nbAnimationFrames && artInfo.nbAnimationFrames > 0 && artInfo.frameOffset && artInfo.frameOffset > 0) {
            var s = IfIsNull(artInfo.animationSpeed, 10);
            ctx.drawImage(img, artInfo.x + (artInfo.frameOffset * Math.floor(this.currentFrame / s)), artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
            this.currentFrame++;
            if (this.currentFrame >= artInfo.nbAnimationFrames * s)
                this.currentFrame = 0;
        }
        else
            ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
        if (artInfo.particleEffect) {
            if (!this.particleSystem)
                this.particleSystem = world.GetParticleSystem(artInfo.particleEffect);
            if (this.particleSystem) {
                ctx.save();
                ctx.translate(x, y);
                this.particleSystem.Draw(ctx);
                ctx.restore();
            }
        }
    };
    WorldObject.prototype.PlayerInteract = function (ax, ay) {
        var objInfo = world.art.objects[this.Name];
        if (!objInfo.walkActions || objInfo.walkActions.length == 0)
            return;
        var objId = "walk," + this.GetId(ax, ay, world.Player.Zone);
        if (world.Player.HasVisitedMapObject(objId))
            return;
        var canRun = true;
        if (objInfo.walkConditions)
            for (var j = 0; j < objInfo.walkConditions.length; j++) {
                var cond = objInfo.walkConditions[j];
                if (dialogCondition.code[cond.Name].Check(cond.Values) === false) {
                    canRun = false;
                    break;
                }
            }
        if (canRun) {
            for (var j = 0; j < objInfo.walkActions.length; j++) {
                var act = objInfo.walkActions[j];
                dialogAction.code[act.Name].Execute(act.Values);
            }
            if (objInfo.disappearOnWalk === true) {
                for (var j = 0; j < world.Player.CurrentArea.objects.length; j++) {
                    if (world.Player.CurrentArea.objects[j].X == this.X && world.Player.CurrentArea.objects[j].Y == this.Y && world.Player.CurrentArea.objects[j].Name == this.Name) {
                        world.Player.CurrentArea.objects.splice(j, 1);
                        break;
                    }
                }
                world.Player.CurrentArea.CleanObjectCache();
            }
            world.Player.VisitMapObject(objId);
        }
    };
    WorldObject.prototype.PlayerMouseInteract = function (ax, ay) {
        var objInfo = world.art.objects[this.Name];
        if (!objInfo)
            return false;
        if (!objInfo.clickActions || objInfo.clickActions.length == 0)
            return false;
        if (objInfo.clickOnce !== false) {
            var objId = "click," + this.GetId(ax, ay, world.Player.Zone);
            if (world.Player.HasVisitedMapObject(objId))
                return false;
        }
        if (objInfo.clickConditions)
            for (var i = 0; i < objInfo.clickConditions.length; i++) {
                var cond = objInfo.clickConditions[i];
                if (!dialogCondition.code[cond.Name].Check(cond.Values))
                    return false;
            }
        var px = (world.Player.AX * world.areaWidth * world.art.background.width + world.Player.X);
        var py = (world.Player.AY * world.areaHeight * world.art.background.height + world.Player.Y);
        var cx = (ax * world.areaWidth * world.art.background.width + this.X);
        var cy = (ay * world.areaHeight * world.art.background.height + this.Y);
        var a = px - cx;
        var b = py - cy;
        var d = Math.sqrt(a * a + b * b);
        if (d > 160) {
            Framework.ShowMessage("You are too far, move nearer.");
            return false;
        }
        for (var i = 0; i < objInfo.clickActions.length; i++) {
            var act = objInfo.clickActions[i];
            dialogAction.code[act.Name].Execute(act.Values);
        }
        if (objInfo.disappearOnWalk === true) {
            var area = world.GetArea(ax, ay, world.Player.Zone);
            if (area) {
                for (var i = 0; i < area.objects.length; i++) {
                    if (area.objects[i].X == this.X && area.objects[i].Y == this.Y && area.objects[i].Name == this.Name) {
                        area.objects.splice(i, 1);
                        break;
                    }
                }
                area.CleanObjectCache();
            }
        }
        world.Player.VisitMapObject(objId);
        return true;
    };
    WorldObject.prototype.GetId = function (ax, ay, zone) {
        var cx = (ax * world.areaWidth * world.art.background.width + this.X);
        var cy = (ay * world.areaHeight * world.art.background.height + this.Y);
        return this.Name + "," + cx + "," + cy + "," + zone;
    };
    return WorldObject;
}());
/// <reference path="WorldObject.ts" />
var worldChest = new ((function () {
    function class_4() {
    }
    return class_4;
}()));
var WorldChest = (function () {
    function WorldChest(name, x, y, ax, ay) {
        this.DisplayName = "Chest";
        this.Stats = [];
        this.Items = [];
        this.currentFrame = 0;
        this.Name = name;
        this.X = x;
        this.Y = y;
        this.AX = ax;
        this.AY = ay;
    }
    WorldChest.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetObjectImage(this.Name);
        if (!img)
            return;
        var artInfo = renderEngine.world.art.objects[this.Name];
        ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, x - (artInfo.groundX ? artInfo.groundX : 0), y - (artInfo.groundY ? artInfo.groundY : 0), artInfo.width, artInfo.height);
    };
    WorldChest.prototype.PlayerInteract = function (ax, ay) {
    };
    WorldChest.prototype.GetId = function () {
        var cx = (this.AX * world.areaWidth * world.art.background.width + this.X);
        var cy = (this.AY * world.areaHeight * world.art.background.height + this.Y);
        return "" + cx + "," + cy;
    };
    WorldChest.prototype.PlayerMouseInteract = function (ax, ay) {
        var px = (world.Player.AX * world.areaWidth * world.art.background.width + world.Player.X);
        var py = (world.Player.AY * world.areaHeight * world.art.background.height + world.Player.Y);
        var cx = (this.AX * world.areaWidth * world.art.background.width + this.X);
        var cy = (this.AY * world.areaHeight * world.art.background.height + this.Y);
        var a = px - cx;
        var b = py - cy;
        var d = Math.sqrt(a * a + b * b);
        if (d > 160) {
            Framework.ShowMessage("You are too far, move nearer.");
            return false;
        }
        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(this.DisplayName ? this.DisplayName.htmlEntities() : "Chest");
        if (world.Player.HasVisitedChest(this.GetId())) {
            this.Items = [];
            this.Stats = [];
        }
        worldChest.currentChest = this;
        WorldChest.ShowContent();
        return true;
    };
    WorldChest.ShowContent = function () {
        var html = "";
        html += "<table>";
        for (var i = 0; i < worldChest.currentChest.Items.length; i++) {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='WorldChest.GetItem(" + i + ")'>Get</div></td>";
            html += "<td>" + worldChest.currentChest.Items[i].Name + "</td>";
            html += "<td>" + worldChest.currentChest.Items[i].Quantity + "</td>";
            html += "</tr>";
        }
        for (var i = 0; i < worldChest.currentChest.Stats.length; i++) {
            html += "<tr>";
            html += "<td><div class='gameButton' onclick='WorldChest.GetStat(" + i + ")'>Get</div></td>";
            var stat = world.GetStat(worldChest.currentChest.Stats[i].Name);
            html += "<td>" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : worldChest.currentChest.Stats[i].Name) + "</td>";
            html += "<td>" + worldChest.currentChest.Stats[i].Quantity + "</td>";
            html += "</tr>";
        }
        html += "</table>";
        $("#dialogSentence").html(html);
        play.onDialogPaint = [];
        html = "";
        html += "<div onclick='WorldChest.TakeAll();' class='gameButton'>Take All</div>";
        html += "<div onclick='WorldChest.Close();' class='gameButton'>Close</div>";
        $("#dialogAnswers").html(html);
    };
    WorldChest.GetItem = function (rowId) {
        world.Player.VisitChest(worldChest.currentChest.GetId());
        var v = parseFloat("" + worldChest.currentChest.Items[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.AddItem(worldChest.currentChest.Items[rowId].Name, v);
        worldChest.currentChest.Items.splice(rowId, 1);
        if (worldChest.currentChest.Items.length == 0 && worldChest.currentChest.Stats.length == 0)
            WorldChest.Close();
        else
            WorldChest.ShowContent();
    };
    WorldChest.GetStat = function (rowId) {
        world.Player.VisitChest(worldChest.currentChest.GetId());
        var v = parseFloat("" + worldChest.currentChest.Stats[rowId].Quantity);
        if (isNaN(v))
            v = 0;
        world.Player.SetStat(worldChest.currentChest.Stats[rowId].Name, world.Player.GetStat(worldChest.currentChest.Stats[rowId].Name) + v);
        worldChest.currentChest.Stats.splice(rowId, 1);
        if (worldChest.currentChest.Items.length == 0 && worldChest.currentChest.Stats.length == 0)
            WorldChest.Close();
        else
            WorldChest.ShowContent();
    };
    WorldChest.TakeAll = function () {
        world.Player.VisitChest(worldChest.currentChest.GetId());
        for (var i = 0; i < worldChest.currentChest.Stats.length; i++) {
            var v = parseFloat("" + worldChest.currentChest.Stats[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.SetStat(worldChest.currentChest.Stats[i].Name, world.Player.GetStat(worldChest.currentChest.Stats[i].Name) + v);
        }
        for (var i = 0; i < worldChest.currentChest.Items.length; i++) {
            var v = parseFloat("" + worldChest.currentChest.Items[i].Quantity);
            if (isNaN(v))
                v = 0;
            world.Player.AddItem(worldChest.currentChest.Items[i].Name, v);
        }
        WorldChest.Close();
    };
    WorldChest.Close = function () {
        world.Player.InDialog = false;
        $("#npcDialog").hide();
    };
    WorldChest.ShowEditor = function () {
        if (!mapEditor.currentChest) {
            $("#mapEditorActions").html("");
            return;
        }
        var html = "<style>";
        html += "#mapEditorActions table { width: calc(100% - 35px); border-collapse: collapse; }";
        html += "#mapEditorActions table tr > td:first-child { width: 1px; font-weight: bold; white-space: nowrap; }";
        html += "#mapEditorActions table tr > td:nth-child(3) { width: 1px; font-weight: bold; white-space: nowrap; }";
        html += "#mapEditorActions input { width: 100%; }";
        html += "#mapEditorActions > select { width: calc(100% - 35px); }";
        html += "</style>";
        html += "<table>";
        html += "<tr><td>Name:</td><td><input type='text' id='chest_display_name' value='" + ("" + mapEditor.currentChest.DisplayName).htmlEntities() + "' onkeyup='WorldChest.UpdateField(\"chest_display_name\",\"DisplayName\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Art:</td><td><select id='chest_display' onchange='WorldChest.UpdateField(\"chest_display\",\"Name\");'>";
        var names = [];
        for (var item in world.art.objects)
            names.push(item);
        names.sort();
        for (var i = 0; i < names.length; i++) {
            html += "<option" + (mapEditor.currentChest.Name == names[i] ? " selected" : "") + ">" + names[i] + "</option>";
        }
        html += "</select></td></tr>";
        html += "<tr><td>Position X:</td><td><input id='chest_x' type='text' value='" + mapEditor.currentChest.X + "' onkeyup='WorldChest.UpdateField(\"chest_x\",\"X\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Y:</td><td><input id='chest_y' type='text' value='" + mapEditor.currentChest.Y + "' onkeyup='WorldChest.UpdateField(\"chest_y\",\"Y\");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "</table>";
        html += "<h2>Items:</h2>";
        html += "<table>";
        for (var i = 0; i < mapEditor.currentChest.Items.length; i++) {
            html += "<tr><td>";
            html += "<div class='button' onclick='WorldChest.DeleteItem(" + i + ")'>Remove</div> ";
            html += mapEditor.currentChest.Items[i].Name + "</td>";
            html += "<td><input type='text' value='" + ("" + mapEditor.currentChest.Items[i].Quantity).htmlEntities() + "' id='item_" + i + "' onkeyup='WorldChest.UpdateItem(" + i + ");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        }
        html += "</table>";
        names = world.InventoryObjects.map(function (c) { return c.Name; }).sort();
        html += "<select id='chest_add_item' onchange='WorldChest.AddItem()'>";
        html += "<option>-- Add new item --</option>";
        for (var i = 0; i < names.length; i++)
            html += "<option>" + names[i] + "</option>";
        html += "</select>";
        html += "<h2>Stats:</h2>";
        html += "<table>";
        for (var i = 0; i < mapEditor.currentChest.Stats.length; i++) {
            html += "<tr><td>";
            html += "<div class='button' onclick='WorldChest.DeleteStat(" + i + ")'>Remove</div> ";
            html += mapEditor.currentChest.Stats[i].Name + "</td>";
            html += "<td><input type='text' value='" + ("" + mapEditor.currentChest.Stats[i].Quantity).htmlEntities() + "' id='stat_" + i + "' onkeyup='WorldChest.UpdateStat(" + i + ");' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        }
        html += "</table>";
        names = world.Stats.map(function (c) { return c.Name; }).sort();
        html += "<select id='chest_add_stat' onchange='WorldChest.AddStat()'>";
        html += "<option>-- Add new stat --</option>";
        for (var i = 0; i < names.length; i++)
            html += "<option>" + names[i] + "</option>";
        html += "</select>";
        $("#mapEditorActions").html(html);
    };
    WorldChest.AddItem = function () {
        var item = $("#chest_add_item").val();
        $("#chest_add_item").first().selectedIndex = 0;
        for (var i = 0; i < mapEditor.currentChest.Items.length; i++)
            if (mapEditor.currentChest.Items[i].Name == item)
                return;
        mapEditor.currentChest.Items.push({ Name: item, Quantity: 0, Probability: 100 });
        worldChest.area.edited = true;
        WorldChest.ShowEditor();
    };
    WorldChest.UpdateItem = function (rowId) {
        var val = parseFloat($("#item_" + rowId).val());
        if (isNaN(val))
            return;
        mapEditor.currentChest.Items[rowId].Quantity = val;
        worldChest.area.edited = true;
    };
    WorldChest.DeleteItem = function (rowId) {
        mapEditor.currentChest.Items.splice(rowId, 1);
        worldChest.area.edited = true;
        WorldChest.ShowEditor();
    };
    WorldChest.AddStat = function () {
        var item = $("#chest_add_stat").val();
        $("#chest_add_stat").first().selectedIndex = 0;
        for (var i = 0; i < mapEditor.currentChest.Stats.length; i++)
            if (mapEditor.currentChest.Stats[i].Name == item)
                return;
        mapEditor.currentChest.Stats.push({ Name: item, Quantity: 0, Probability: 100 });
        WorldChest.ShowEditor();
        worldChest.area.edited = true;
    };
    WorldChest.UpdateStat = function (rowId) {
        var val = parseFloat($("#stat_" + rowId).val());
        if (isNaN(val))
            return;
        mapEditor.currentChest.Stats[rowId].Quantity = val;
        worldChest.area.edited = true;
    };
    WorldChest.DeleteStat = function (rowId) {
        mapEditor.currentChest.Stats.splice(rowId, 1);
        WorldChest.ShowEditor();
        worldChest.area.edited = true;
    };
    WorldChest.UpdateField = function (fieldName, propName) {
        var val = $("#" + fieldName).val();
        if (typeof mapEditor.currentChest[propName] == "number") {
            var n = parseInt(val);
            if (isNaN(n))
                return;
            mapEditor.currentChest[propName] = n;
            worldChest.area.CleanObjectCache();
        }
        else
            mapEditor.currentChest[propName] = val;
        mapEditor.modified = true;
        worldChest.area.edited = true;
    };
    return WorldChest;
}());
///<reference path="../World/WorldArea.ts" />
var WorldHouse = (function () {
    function WorldHouse(name, x, y) {
        this.Name = name;
        this.X = x;
        this.Y = y;
    }
    WorldHouse.prototype.Draw = function (renderEngine, ctx, x, y) {
        var house = world.GetHouse(this.Name);
        var cx = Math.floor(house.collisionX + house.collisionWidth / 2);
        var cy = Math.floor(house.collisionY + house.collisionHeight / 2);
        for (var i = 0; i < house.parts.length; i++) {
            var p = house.parts[i];
            var house_part = world.art.house_parts[p.part];
            if (!house_part)
                continue;
            if (house_part.width < 1 || house_part.height < 1)
                continue;
            var img = renderEngine.GetHouseImage(p.part);
            if (!img)
                continue;
            ctx.drawImage(img, house_part.x, house_part.y, house_part.width, house_part.height, x + p.x - cx, y + p.y - cy, house_part.width, house_part.height);
        }
    };
    WorldHouse.prototype.PlayerInteract = function (ax, ay) {
    };
    WorldHouse.prototype.PlayerMouseInteract = function (ax, ay) {
        return false;
    };
    WorldHouse.HouseSize = function (name) {
        var house = world.GetHouse(name);
        if (!house)
            return null;
        var cx = Math.floor(house.collisionX + house.collisionWidth / 2);
        var cy = Math.floor(house.collisionY + house.collisionHeight / 2);
        var minX = 0;
        var minY = 0;
        var maxX = 0;
        var maxY = 0;
        for (var i = 0; i < house.parts.length; i++) {
            var p = house.parts[i];
            minX = Math.min(p.x - cx, minX);
            minY = Math.min(p.y - cy, minY);
            var house_part = world.art.house_parts[p.part];
            maxX = Math.max(p.x - cx + house_part.width, maxX);
            maxY = Math.max(p.y - cy + house_part.height, maxY);
        }
        return {
            X: minX,
            Y: minY,
            Width: maxX - minX,
            Height: maxY - minY
        };
    };
    return WorldHouse;
}());
var ActorTimer = (function () {
    function ActorTimer(name, length) {
        this.StartTime = new Date();
        this.Length = length;
        this.Name = name;
    }
    ActorTimer.prototype.IsOver = function () {
        return (this.Ellapsed() >= this.Length);
    };
    ActorTimer.prototype.Ellapsed = function () {
        var now = new Date();
        return (now.getTime() - this.StartTime.getTime()) / 1000;
    };
    ActorTimer.prototype.Reset = function (length) {
        this.StartTime = new Date();
        this.Length = length;
    };
    return ActorTimer;
}());
var PathSolver = (function () {
    function PathSolver(startX, startY, goalX, goalY, maxDistance, canWalkOn) {
        this.visitedStep = [];
        this.todoStep = [];
        this.operations = 0;
        this.visitedStep = [];
        this.todoStep = [];
        this.goalX = goalX;
        this.goalY = goalY;
        this.operations = 0;
        this.canWalkOn = canWalkOn;
        this.maxDistance = maxDistance;
        var a = startX - this.goalX;
        var b = startY - this.goalY;
        this.todoStep = [
            { x: startX, y: startY, steps: 0, path: [], operations: 0, distance: Math.sqrt(a * a + b * b) }
        ];
        this.visit(this.todoStep[0]);
    }
    PathSolver.Solve = function (startX, startY, goalX, goalY, maxDistance, canWalkOn) {
        var solver = new PathSolver(startX, startY, goalX, goalY, maxDistance, canWalkOn);
        var path = solver.solve();
        if (!path)
            return null;
        var result = [];
        for (var i = 0; i < path.path.length; i++) {
            result.push({
                x: path.path[i].x, y: path.path[i].y
            });
        }
        // Add the goal too
        if (result.length > 0)
            result.push({ x: goalX, y: goalY });
        return result;
    };
    PathSolver.prototype.solve = function () {
        while (this.todoStep.length > 0 && this.operations < 500) {
            this.operations++;
            var res = this.calcStep();
            if (res != null)
                return res;
        }
        return null;
    };
    PathSolver.prototype.addCoordinate = function (coord, x, y) {
        var x = coord.x + x;
        var y = coord.y + y;
        var path = coord.path.concat();
        path[path.length] = coord;
        var a = x - this.goalX;
        var b = y - this.goalY;
        return { x: x, y: y, steps: coord.steps + 1, path: path, distance: Math.sqrt(a * a + b * b), operations: this.operations };
    };
    PathSolver.prototype.isVisited = function (coord) {
        for (var i = 0; i < this.visitedStep.length; i++)
            if (this.visitedStep[i].x == coord.x && this.visitedStep[i].y == coord.y)
                return true;
        return false;
    };
    PathSolver.prototype.visit = function (coord) {
        this.visitedStep[this.visitedStep.length] = coord;
    };
    PathSolver.SortDistance = function (sa, sb) {
        if (sa.steps == sb.steps)
            return sa.distance - sb.distance;
        else
            return sa.steps - sb.steps;
        //return (sa.steps + sa.distance * 2) - (sb.steps + sb.distance * 2);
    };
    PathSolver.prototype.calcStep = function () {
        this.todoStep.sort(PathSolver.SortDistance);
        var s = this.todoStep.shift();
        //if (Math.abs(s.x-this.goalX) <= this.speed && Math.abs(s.y-this.goalY) <= this.speed)
        //if (s.distance < this.speed)
        if (s.distance == 0) {
            s.operations = this.operations;
            return s;
        }
        if (this.todoStep.length > 5000) {
            this.todoStep = [];
            return null;
        }
        if (s.steps > 500)
            return null;
        var newCoords = [
            this.addCoordinate(s, -1, 0),
            this.addCoordinate(s, 0, -1),
            this.addCoordinate(s, 1, 0),
            this.addCoordinate(s, 0, 1),
            this.addCoordinate(s, -1, -1),
            this.addCoordinate(s, -1, 1),
            this.addCoordinate(s, 1, -1),
            this.addCoordinate(s, 1, 1),
        ];
        for (var i = 0; i < newCoords.length; i++) {
            var c = newCoords[i];
            if (c == null)
                continue;
            if (!this.isVisited(c) && c.distance < this.maxDistance) {
                this.visit(c);
                if (this.canWalkOn(c.x, c.y))
                    this.todoStep[this.todoStep.length] = c;
            }
        }
        return null;
    };
    return PathSolver;
}());
/// <reference path="../World/WorldArea.ts" />
///<reference path="PathSolver.ts" />
var movingActor = new ((function () {
    function class_5() {
        this.lastId = 1;
    }
    return class_5;
}()));
var ACTION_ANIMATION;
(function (ACTION_ANIMATION) {
    ACTION_ANIMATION[ACTION_ANIMATION["NONE"] = 0] = "NONE";
    ACTION_ANIMATION[ACTION_ANIMATION["ATTACK"] = 1] = "ATTACK";
    ACTION_ANIMATION[ACTION_ANIMATION["DAMAGED"] = 2] = "DAMAGED";
})(ACTION_ANIMATION || (ACTION_ANIMATION = {}));
var sideAttack = [{ x: 0, y: 0 },
    { x: 5, y: 5 },
    { x: 11, y: 8 },
    { x: 16, y: 7 },
    { x: 18, y: 4 },
    { x: 20, y: 0 }];
var MovingActor = (function () {
    function MovingActor(world) {
        this.X = 0;
        this.Y = 0;
        this.Speed = 4;
        this.Direction = 0;
        this.Frame = 0;
        this.Stats = [];
        this.Skills = [];
        this.Timers = [];
        this.ParticleEffect = null;
        this.ParticleEffectDuration = null;
        //public ActionAnimation: ACTION_ANIMATION = ACTION_ANIMATION.ATTACK;
        this.ActionAnimation = ACTION_ANIMATION.NONE;
        this.ActionAnimationStep = 0;
        this.ActionAnimationDone = null;
        this.Killed = false;
        this.oldX = null;
        this.oldY = null;
        this.variables = {};
        this.World = world;
        this.Id = movingActor.lastId++;
    }
    MovingActor.prototype.UpdatePosition = function (addToMap) {
        if (addToMap === void 0) { addToMap = true; }
        if (this.Killed)
            return;
        var ax = this.CurrentArea.X;
        var ay = this.CurrentArea.Y;
        var tileWidth = this.World.art.background.width;
        var tileHeight = this.World.art.background.height;
        if (this.X < 0) {
            if (!addToMap || this.CanReachArea(ax - 1, ay)) {
                this.X += this.World.areaWidth * tileWidth;
                ax--;
            }
            else
                this.X = 0;
        }
        if (this.X > this.World.areaWidth * tileWidth) {
            if (!addToMap || this.CanReachArea(ax + 1, ay)) {
                this.X -= this.World.areaWidth * tileWidth;
                ax++;
            }
            else
                this.X = this.World.areaWidth * tileWidth;
        }
        if (this.Y < 0) {
            if (!addToMap || this.CanReachArea(ax, ay - 1)) {
                this.Y += this.World.areaHeight * tileHeight;
                ay--;
            }
            else
                this.Y = 0;
        }
        if (this.Y > this.World.areaHeight * tileHeight) {
            if (!addToMap || this.CanReachArea(ax, ay + 1)) {
                this.Y -= this.World.areaHeight * tileHeight;
                ay++;
            }
            else
                this.Y = this.World.areaHeight * tileHeight;
        }
        var changedArea = false;
        if (ax != this.CurrentArea.X || ay != this.CurrentArea.Y) {
            changedArea = true;
            if (addToMap) {
                if (this.Id == world.Player.Id)
                    this.World.VisibleCenter(ax, ay, world.Player.Zone);
                var area = this.World.GetArea(this.CurrentArea.X, this.CurrentArea.Y, this.CurrentArea.Zone);
                if (!area)
                    return;
                for (var i = 0; i < area.actors.length; i++) {
                    if (area.actors[i] == this) {
                        area.actors.splice(i, 1);
                        //this.CurrentArea.RemoveFromCache(this, this.oldX, this.oldY);
                        if (addToMap)
                            this.CurrentArea.CleanObjectCache();
                        this.CurrentArea = this.World.GetArea(ax, ay, this.CurrentArea.Zone);
                        if (!this.CurrentArea)
                            return;
                        this.CurrentArea.actors.push(this);
                        break;
                    }
                }
            }
            else
                this.CurrentArea = this.World.GetArea(ax, ay, this.CurrentArea.Zone);
        }
        if (addToMap && this.oldX !== null && !changedArea)
            this.CurrentArea.RemoveFromCache(this, this.oldX, this.oldY);
        this.oldX = this.X;
        this.oldY = this.Y;
        if (addToMap)
            this.CurrentArea.AddToCache(this);
        //this.CurrentArea.CleanObjectCache();
    };
    MovingActor.prototype.CanWalkOn = function (x, y) {
        var t = this.CurrentArea.GetTile(Math.floor(x / this.World.art.background.width), Math.floor(y / this.World.art.background.height), this.CurrentArea.Zone);
        if (world.art.background.nonWalkable.contains(t))
            return false;
        var t = this.CurrentArea.GetTile(Math.round(x / this.World.art.background.width), Math.round(y / this.World.art.background.height), this.CurrentArea.Zone);
        if (world.art.background.nonWalkable.contains(t))
            return false;
        if (this.CollideWithObject(x, y))
            return false;
        return true;
    };
    MovingActor.prototype.CollideObject = function (x, y) {
        var tx = Math.floor(x / world.art.background.width);
        var ty = Math.floor(y / world.art.background.height);
        for (var a = -5; a <= 5; a++) {
            for (var b = -5; b <= 5; b++) {
                var objs = this.CurrentArea.GetObjects(a + tx, b + ty, this.CurrentArea.Zone, true, false);
                //if (objs && objs.length) console.log(objs);
                if (objs && objs.length)
                    for (var i = 0; i < objs.length; i++) {
                        if (objs[i] == this)
                            continue;
                        switch (objs[i]['__type']) 
                        //switch (objs[i].Type ? objs[i].Type : objs[i]['__type'])
                        {
                            case "Player":
                                continue;
                            case "Monster":
                                var objMon = this.World.art.characters[objs[i].Type ? objs[i].Name : objs[i].MonsterEnv.Art];
                                if (objMon && objMon.collision && objMon.collision.radius) {
                                    var aa = objs[i].X - x;
                                    var bb = objs[i].Y - y;
                                    if (Math.sqrt(aa * aa + bb * bb) < objMon.collision.radius)
                                        return objs[i];
                                }
                                break;
                            case "NPCActor":
                                var objActor = this.World.art.characters[objs[i].Type ? objs[i].Name : objs[i].baseNpc.Look];
                                if (objActor && objActor.collision && objActor.collision.radius) {
                                    var aa = objs[i].X - x;
                                    var bb = objs[i].Y - y;
                                    if (Math.sqrt(aa * aa + bb * bb) < objActor.collision.radius)
                                        return objs[i];
                                }
                                break;
                            case "WorldHouse":
                                //console.log(objs[i]);
                                var objHouse = world.GetHouse(objs[i].Name);
                                var aa = Math.abs(objs[i].X - x);
                                var bb = Math.abs(objs[i].Y - y);
                                var w = objHouse.collisionWidth / 2;
                                var h = objHouse.collisionHeight / 2;
                                if (objHouse && aa <= w && bb <= h)
                                    return objs[i];
                                break;
                            default:
                                var obj = this.World.art.objects[objs[i].Name];
                                if (obj && obj.collision && obj.collision.radius) {
                                    var aa = objs[i].X - x;
                                    var bb = objs[i].Y - y;
                                    if (Math.sqrt(aa * aa + bb * bb) < obj.collision.radius)
                                        return objs[i];
                                }
                        }
                    }
            }
        }
        return null;
    };
    MovingActor.prototype.CollideWithObject = function (x, y) {
        if (this.CollideObject(x, y))
            return true;
        return false;
    };
    MovingActor.prototype.PathTo = function (a, b, c) {
        var _this = this;
        var goalX = 0;
        var goalY = 0;
        var maxDistance = 50;
        if (a instanceof MovingActor) {
            var coords = this.RelativeCoord(a);
            goalX = coords.x;
            goalY = coords.y;
            if (b)
                maxDistance = b;
        }
        else {
            goalX = a;
            goalY = b;
            if (c)
                maxDistance = c;
        }
        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;
        var tx = Math.floor(this.X / tileWidth);
        var ty = Math.floor(this.Y / tileHeight);
        var gx = Math.floor(goalX / tileWidth);
        var gy = Math.floor(goalY / tileWidth);
        var ox = (Math.abs(goalX) % tileWidth);
        var oy = (Math.abs(goalY) % tileWidth);
        var path = PathSolver.Solve(tx, ty, gx, gy, maxDistance, function (a, b) {
            return _this.CanWalkOn(a * world.art.background.width, b * world.art.background.height);
        });
        if (path && path.length > 0) {
            path.shift();
            var sx = this.X % tileWidth;
            var sy = this.Y % tileHeight;
            for (var i = 0; i < path.length; i++) {
                /*var f = i / (path.length - 1);
                path[i].x = Math.round(path[i].x * tileWidth + (sx * (1 - f) + coord.OffsetX * f));
                path[i].y = Math.round(path[i].y * tileHeight + (sy * (1 - f) + coord.OffsetY * f));*/
                path[i].x = Math.round(path[i].x * tileWidth);
                path[i].y = Math.round(path[i].y * tileHeight);
            }
            path[path.length - 1].x += ox;
            path[path.length - 1].y += oy;
        }
        return path;
    };
    MovingActor.prototype.DistanceTo = function (actor) {
        if (!actor.CurrentArea)
            return Number.MAX_VALUE;
        var a = this.X - (((actor.CurrentArea.X - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + actor.X);
        var b = this.Y - (((actor.CurrentArea.Y - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + actor.Y);
        return Math.sqrt(a * a + b * b);
    };
    MovingActor.prototype.RelativeCoord = function (actor) {
        var a = ((actor.CurrentArea.X - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + actor.X;
        var b = ((actor.CurrentArea.Y - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + actor.Y;
        return { x: a, y: b };
    };
    MovingActor.prototype.Kill = function () {
        this.Killed = true;
        //this.CurrentArea.RemoveFromCache(this, this.X, this.Y);
        for (var i = 0; i < this.CurrentArea.actors.length; i++) {
            if (this.CurrentArea.actors[i] == this) {
                this.CurrentArea.actors.splice(i, 1);
                break;
            }
        }
        this.CurrentArea.CleanObjectCache();
        // Checks if it's a monster, if yes prepares the monster drop
        if (this instanceof Monster && this.Name) {
            var monsterId = this.MonsterId;
            world.Player.RecordKill(monsterId, this.Name);
            var monster = world.GetMonster(this.Name);
            if (monster) {
                // We have some drops, then let's calculate what
                if ((monster.ItemDrop && monster.ItemDrop.length) || (monster.StatDrop && monster.StatDrop.length)) {
                    var small_bag_name = (world.art.objects[world.SmallBagObject] ? world.SmallBagObject : FirstItem(world.art.objects));
                    var bag = new TemporaryWorldObject(small_bag_name, this.X, this.Y, this.CurrentArea);
                    var linkedData = {
                        Items: [],
                        Stats: []
                    };
                    if (monster.ItemDrop && monster.ItemDrop.length)
                        for (var i = 0; i < monster.ItemDrop.length; i++) {
                            if ((Math.random() * 100) > monster.ItemDrop[i].Probability)
                                continue;
                            linkedData.Items.push({
                                Name: monster.ItemDrop[i].Name,
                                Quantity: monster.ItemDrop[i].Quantity,
                                Probability: 100
                            });
                        }
                    if (monster.StatDrop && monster.StatDrop.length)
                        for (var i = 0; i < monster.StatDrop.length; i++) {
                            if ((Math.random() * 100) > monster.StatDrop[i].Probability)
                                continue;
                            linkedData.Stats.push({
                                Name: monster.StatDrop[i].Name,
                                Quantity: monster.StatDrop[i].Quantity,
                                Probability: 100
                            });
                        }
                    // No luck? Then don't add it on the map
                    if (linkedData.Items.length > 0 || linkedData.Stats.length > 0) {
                        bag.LinkedData = linkedData;
                        bag.MouseCallback = MapBag.ShowBag;
                        this.CurrentArea.tempObjects.push(bag);
                        this.CurrentArea.CleanObjectCache();
                    }
                }
            }
        }
    };
    MovingActor.FindActorById = function (id) {
        for (var i = 0; i < world.areas.length; i++)
            for (var j = 0; j < world.areas[i].actors.length; j++)
                if (world.areas[i].actors[j].Id == id)
                    return world.areas[i].actors[j];
        return null;
    };
    MovingActor.prototype.FindStat = function (name) {
        if (!this.FindStat.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Stats.length; i++)
            if (this.Stats[i].Name.toLowerCase() == lname)
                return this.Stats[i];
        return null;
    };
    MovingActor.prototype.GetStat = function (name) {
        if (!this.GetStat.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var stat = this.FindStat(name);
        if (stat)
            return stat.Value;
        return null;
    };
    MovingActor.prototype.GetStatMaxValue = function (name) {
        var stat = this.FindStat(name);
        if (stat && stat.MaxValue)
            return stat.MaxValue;
        if (stat) {
            var val = stat.BaseStat.InvokeFunction("maxvalue", [new VariableValue(this.Id)]);
            return (val ? val.GetNumber() : null);
        }
        return null;
    };
    MovingActor.prototype.SetStat = function (name, value) {
        if (!this.SetStat.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var stat = this.FindStat(name);
        if (isNaN(value)) {
            Main.AddErrorMessage("Stat " + name + " error. Cannot set NaN to it");
            return;
        }
        //console.log("Set " + this.Name + " stat " + name + " " + value);
        if (stat) {
            var wishedValue = value;
            var maxVal = this.GetStatMaxValue(name);
            if (maxVal !== null && value > maxVal)
                value = maxVal;
            var oldValue = stat.Value;
            stat.Value = value;
            stat.BaseStat.InvokeFunction("ValueChange", [new VariableValue(this.Id), new VariableValue(value), new VariableValue(wishedValue), new VariableValue(oldValue)]);
            if (this.Id == world.Player.Id) {
                world.Player.StoredCompare = world.Player.JSON();
                world.Player.Save();
            }
        }
    };
    MovingActor.prototype.GetTimer = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Timers.length; i++)
            if (this.Timers[i].Name.toLowerCase() == lname)
                return this.Timers[i];
        return null;
    };
    MovingActor.prototype.SetTimer = function (name, length) {
        if (!this.SetTimer.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Timers.length; i++) {
            if (this.Timers[i].Name.toLowerCase() == lname) {
                if (length <= 0)
                    this.Timers.splice(i, 1);
                else
                    this.Timers[i].Reset(length);
                return;
            }
        }
        if (length > 0)
            this.Timers.push(new ActorTimer(lname, length));
    };
    MovingActor.prototype.ResetVariables = function () {
        this.variables = {};
    };
    MovingActor.prototype.SetVariable = function (name, value) {
        if (!this.SetVariable.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        this.variables[name.toLowerCase()] = value;
    };
    MovingActor.prototype.GetVariable = function (name) {
        if (this.variables[name.toLowerCase()] == undefined)
            return new VariableValue(null);
        return this.variables[name.toLowerCase()];
    };
    return MovingActor;
}());
// Global API variable
var api = {};
var apiFunctions = [];
var wrapperApiCode = "";
var wrapperApi = null;
var stackResult = null;
// Class decorator which will put all the API inside the API variable.
function ApiClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var engineApi = new target();
    api[className.substr(6).toLowerCase()] = engineApi;
}
function ApiWrapper(code) {
    return function (target, propertyKey, descriptor) {
        wrapperApiCode += code;
    };
}
function ApiMethod(parameters, description) {
    return function (target, propertyKey, descriptor) {
        var tName = "" + target.constructor;
        var className = tName.match(/function ([^\(]+)\(/)[1];
        apiFunctions.push({ name: className.substr(6) + "." + propertyKey, description: description, parameters: parameters });
    };
}
var CacheApiCall = {};
function GetApiDocumentation(apiName) {
    var apiFunction = null;
    for (var i = 0; i < apiFunctions.length; i++) {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase()) {
            apiFunction = apiFunctions[i];
            break;
        }
    }
    if (!apiFunction)
        return null;
    var html = "";
    html += "<h1>" + apiName + "</h1>";
    html += "<h2>Function call</h2>";
    html += "<span class='codeExample'>" + apiName + "(";
    if (apiFunction.parameters && apiFunction.parameters.length) {
        for (var i = 0; i < apiFunction.parameters.length; i++) {
            if (i != 0)
                html += ", ";
            html += apiFunction.parameters[i].name;
        }
    }
    html += ");</span>";
    if (apiFunction.parameters && apiFunction.parameters.length) {
        html += "<h2>Parameters</h2>";
        html += "<table>";
        for (var i = 0; i < apiFunction.parameters.length; i++) {
            html += "<tr><td>" + apiFunction.parameters[i].name + "</td>";
            html += "<td>" + apiFunction.parameters[i].description + "</td></tr>";
        }
        html += "</table>";
    }
    html += "<h2>Description</h2>";
    html += apiFunction.description;
    return html;
}
function GetApiSignature(apiName) {
    var apiFunction = null;
    for (var i = 0; i < apiFunctions.length; i++) {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase()) {
            apiFunction = apiFunctions[i];
            break;
        }
    }
    if (!apiFunction)
        return null;
    var html = "<span class='codeExample'>" + apiName + "(";
    if (apiFunction.parameters && apiFunction.parameters.length) {
        for (var i = 0; i < apiFunction.parameters.length; i++) {
            if (i != 0)
                html += ", ";
            html += apiFunction.parameters[i].name;
        }
    }
    html += ");</span>";
    return html;
}
function GetApiDescription(apiName) {
    var apiFunction = null;
    for (var i = 0; i < apiFunctions.length; i++) {
        if (apiFunctions[i].name.toLowerCase() == apiName.toLowerCase()) {
            apiFunction = apiFunctions[i];
            break;
        }
    }
    if (!apiFunction)
        return null;
    else
        return apiFunction.description;
}
var CodeEnvironement = (function () {
    function CodeEnvironement() {
        this.variables = {};
        this.CodeVariables = {};
        this.GlobalVariables = {};
        this.ParentCode = null;
        this.storeStack = false;
        this.FunctionCodes = {};
        this.CodeLine = 0;
        this.variableStack = [];
        this.executionStack = null;
    }
    CodeEnvironement.prototype.Compile = function (functions) {
        for (var i = 0; i < functions.length; i++) {
            if (!functions[i].Name)
                continue;
            var f = new FunctionDefinitionCode();
            f.Name = functions[i].Name;
            functions[i].Compile(f);
            this.FunctionCodes[functions[i].Name.toLowerCase()] = f;
        }
    };
    CodeEnvironement.prototype.Flush = function () {
        this.variableStack = [];
    };
    CodeEnvironement.prototype.Pop = function () {
        return this.variableStack.pop();
    };
    CodeEnvironement.prototype.Push = function (value) {
        return this.variableStack.push(value);
    };
    CodeEnvironement.prototype.ExecuteSubFunctionCode = function (name, values) {
        this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });
        var lname = name.toLowerCase();
        var parts = lname.split(".");
        if (parts.length == 3) {
            var code = world.GetCode(parts[1]);
            if (!code)
                throw "Function '" + name + "' is unknown.";
            if (!code.code)
                code.code = CodeParser.ParseWithParameters(code.Source, code.Parameters, false);
            if (!code.code.HasFunction(parts[2]))
                throw "Function '" + name + "' is unknown.";
            this.codeBlock = code.code.FunctionCodes[parts[2]].Code;
        }
        else {
            if (!this.FunctionCodes[lname])
                throw "Function '" + name + "' is unknown.";
            this.codeBlock = this.FunctionCodes[lname].Code;
        }
        this.CodeLine = 0;
        this.variables = {};
        this.variableStack = [];
        this.callBackResult = null;
        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
    };
    CodeEnvironement.prototype.ExecuteWrapperFunctionCode = function (name, values) {
        this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });
        var w = name.toLowerCase().replace(".", "_");
        this.codeBlock = wrapperApi.FunctionCodes[w].Code;
        this.CodeLine = 0;
        this.variables = {};
        this.variableStack = [];
        this.callBackResult = null;
        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
    };
    CodeEnvironement.prototype.ExecuteFunctionCode = function (name, values, callback) {
        if (callback === void 0) { callback = null; }
        if (this.executionStack)
            this.executionStack.push({ CodeBlock: this.codeBlock, CodeLine: this.CodeLine, Variables: this.variables, VariableStack: this.variableStack, Callback: this.callBackResult });
        else
            this.executionStack = [];
        this.variables = {};
        this.variableStack = [];
        this.CodeLine = 0;
        this.callBackResult = callback;
        var lname = name.toLowerCase();
        if (!this.FunctionCodes[lname])
            throw "Function '" + name + "' is unknown.";
        this.codeBlock = this.FunctionCodes[lname].Code;
        for (var i = 0; i < values.length; i++)
            this.Push(values[i]);
        return this.CodeExecution();
    };
    CodeEnvironement.prototype.CodeExecution = function () {
        while (true) {
            while (this.CodeLine >= 0 && this.CodeLine < this.codeBlock.length) {
                this.codeBlock[this.CodeLine].Execute(this);
                if (this.storeStack) {
                    var f = this.callAfterStoredStack;
                    this.callAfterStoredStack = null;
                    this.storeStack = false;
                    f();
                    return null;
                }
            }
            if (this.executionStack && this.executionStack.length > 0) {
                var s = this.executionStack.pop();
                var res = null;
                if (this.variableStack.length > 0)
                    res = this.variableStack.pop();
                if (this.callBackResult)
                    this.callBackResult(res);
                this.codeBlock = s.CodeBlock;
                this.variables = s.Variables;
                this.variableStack = s.VariableStack;
                this.CodeLine = s.CodeLine;
                this.callBackResult = s.Callback;
                if (res !== null && res !== undefined)
                    this.variableStack.push(res);
            }
            else
                break;
        }
        this.executionStack = null;
        var res = null;
        if (this.variableStack.length > 0)
            res = this.Pop();
        if (this.callBackResult)
            this.callBackResult(res);
        return res;
    };
    CodeEnvironement.prototype.SetVariable = function (name, value) {
        if (this.variables[name]) {
            this.variables[name] = value;
            return;
        }
        var lname = name.toLowerCase();
        this.variables[lname] = value;
    };
    CodeEnvironement.prototype.GetVariable = function (name) {
        if (name == "stackresult")
            return stackResult;
        if (this.variables[name])
            return this.variables[name];
        if (this.variables[name.toLowerCase()])
            return this.variables[name.toLowerCase()];
        throw "Variable " + name + " unknown";
    };
    CodeEnvironement.prototype.HasVariable = function (name) {
        if (this.variables[name] || this.variables[name.toLowerCase()] || name.toLowerCase() == "stackresult")
            return true;
        return false;
    };
    CodeEnvironement.prototype.SetGlobalVariable = function (name, value) {
        var lname = name.toLowerCase();
        this.GlobalVariables[lname] = value;
    };
    CodeEnvironement.prototype.GetGlobalVariable = function (name) {
        var lname = name.toLowerCase();
        if (this.GlobalVariables[lname] == undefined || this.GlobalVariables[lname] == null)
            throw "Global variable " + name + " unknown";
        return this.GlobalVariables[lname];
    };
    CodeEnvironement.prototype.HasFunction = function (name) {
        if (this.FunctionCodes[name] || this.FunctionCodes[name.toLowerCase()])
            return true;
        var parts = name.toLowerCase().split('.');
        if (parts.length != 2)
            return false;
        if (!api[parts[0]])
            return false;
        if (!api[parts[0]][parts[1]])
            return false;
        return true;
    };
    CodeEnvironement.prototype.BuildEnv = function () {
        var env = new CodeEnvironement();
        env.CodeVariables = this.CodeVariables;
        env.GlobalVariables = this.GlobalVariables;
        return env;
    };
    CodeEnvironement.prototype.RebuildStack = function () {
        this.CodeExecution();
    };
    CodeEnvironement.prototype.ExecuteFunction = function (name, values, callback) {
        if (callback === void 0) { callback = null; }
        var lname = name.toLowerCase();
        if (this.FunctionCodes[lname])
            return this.ExecuteFunctionCode(name, values, callback);
        if (this.ParentCode && this.ParentCode.FunctionCodes[lname])
            return this.ParentCode.ExecuteFunctionCode(name, values, callback);
        var parts = lname.split('.');
        if (parts.length == 3) {
            var genericCode = world.GetCode(parts[1]);
            return genericCode.code.ExecuteFunction(parts[2], values, callback);
        }
        else if (parts.length == 2) {
            if (!api[parts[0]])
                throw "Unknown function call " + name;
            var lowerCase = parts[1].toLowerCase().replace(/^_/, "");
            var correctCase = null;
            for (var funcName in api[parts[0]]) {
                if (funcName.toLowerCase() == lowerCase) {
                    correctCase = funcName;
                    break;
                }
            }
            if (!correctCase)
                throw "Unknown function call " + name;
            CacheApiCall[name] = api[parts[0]][correctCase];
            var res = api[parts[0]][correctCase](values, this);
            if (callback)
                callback(res);
            return res;
        }
        else
            throw "Unknown function call " + name;
    };
    CodeEnvironement.prototype.FindApiFunction = function (name) {
        var parts = name.toLowerCase().split('.');
        var lowerCase = parts[1].toLowerCase().replace(/^_/, "");
        var correctCase = null;
        for (var funcName in api[parts[0]]) {
            if (funcName.toLowerCase() == lowerCase) {
                correctCase = funcName;
                break;
            }
        }
        if (!correctCase)
            throw "Unknown function call " + name;
        return api[parts[0]][correctCase];
    };
    CodeEnvironement.prototype.ContainsFunctions = function () {
        if (!this.FunctionCodes)
            return false;
        for (var item in this.FunctionCodes)
            return true;
        return false;
    };
    CodeEnvironement.prototype.StoreStack = function (callback) {
        this.storeStack = true;
        this.callAfterStoredStack = callback;
    };
    CodeEnvironement.prototype.HasWrapper = function (name) {
        if (!wrapperApiCode || wrapperApiCode == "")
            return false;
        if (wrapperApiCode != "" && !wrapperApi)
            wrapperApi = CodeParser.Parse(wrapperApiCode);
        if (wrapperApi.HasFunction(name.replace(".", "_")))
            return true;
    };
    return CodeEnvironement;
}());
var codeParser = new ((function () {
    function class_6() {
        this.codeTokenizer = {};
    }
    return class_6;
}()));
function Token(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    var tokenizer = new target();
    if (tokenizer instanceof CodeToken)
        codeParser.codeTokenizer[className] = tokenizer;
    else
        throw "Class \"" + className + "\" doesn't extends CodeToken.";
}
var CodeParser = (function () {
    function CodeParser(source) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.TokenPosition = 0;
        this.source = source;
        this.tokens = [];
        while (this.HasChar()) {
            this.tokens.push(this.Tokenize());
            this.SkipSpaces();
        }
    }
    CodeParser.ParseWithParameters = function (source, codeVariables, withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        var replaced = source;
        if (codeVariables)
            for (var i in codeVariables) {
                var regexp = new RegExp("@" + i + "@", "gi");
                replaced = replaced.replace(regexp, codeVariables[i].value);
            }
        var parser = new CodeParser(replaced);
        var env = parser.GenerateTopEnvironement(withVerify);
        env.CodeVariables = codeVariables;
        return env;
    };
    CodeParser.Parse = function (source, withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        var comments = CodeParser.GetAllTokens(source, "TokenComment");
        var codeVariables = {};
        var m = null;
        for (var j = 0; j < comments.length; j++) {
            if ((m = comments[j].Value.trim().match(/^\/\s*([a-z-A-z]+):\s*(.+)\s*,\s*([a-zA-Z_]*)$/))) {
                codeVariables[m[1].toLowerCase()] = { name: m[1], value: m[2], type: m[3] };
            }
        }
        var replaced = source;
        for (var i in codeVariables) {
            var regexp = new RegExp("@" + i + "@", "gi");
            replaced = replaced.replace(regexp, codeVariables[i].value);
        }
        var parser = new CodeParser(replaced);
        var env = parser.GenerateTopEnvironement(withVerify);
        env.CodeVariables = codeVariables;
        return env;
    };
    CodeParser.ExecuteStatement = function (source, variables) {
        if (variables === void 0) { variables = null; }
        var variablesNames = [];
        var variablesValues = [];
        if (variables)
            for (var item in variables) {
                variablesNames.push(item);
                variablesValues.push(variables[item]);
            }
        if (source.indexOf(";") != -1 && source.indexOf(";") != source.length)
            var env = CodeParser.Parse("function tempFunction(" + variablesNames.join(",") + ") { " + source + "; }");
        else
            var env = CodeParser.Parse("function tempFunction(" + variablesNames.join(",") + ") { return " + source + "; }");
        return env.ExecuteFunction("tempFunction", variablesValues);
    };
    CodeParser.GetAllTokens = function (source, ofType) {
        var parser = new CodeParser(source);
        if (ofType == null || ofType == undefined)
            return parser.tokens;
        else {
            var result = [];
            for (var i = 0; i < parser.tokens.length; i++)
                if (parser.tokens[i].Type == ofType)
                    result.push(parser.tokens[i]);
            return result;
        }
    };
    CodeParser.prototype.GenerateTopEnvironement = function (withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        var env = new CodeEnvironement();
        var functions = this.GetAllStatements();
        env.Compile(functions);
        if (withVerify) {
            for (var i = 0; i < functions.length; i++)
                functions[i].Verify(env);
        }
        return env;
    };
    CodeParser.prototype.HasChar = function () {
        return this.position < this.source.length;
    };
    ;
    CodeParser.prototype.PeekChar = function (offset) {
        return this.source.charAt(this.position + (offset == null || offset == undefined ? 0 : offset));
    };
    ;
    CodeParser.prototype.NextChar = function () {
        var c = this.source.charAt(this.position++);
        if (c == "\r") {
        }
        else if (c == "\n") {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return c;
    };
    ;
    CodeParser.prototype.SkipChar = function () {
        this.NextChar();
    };
    ;
    CodeParser.prototype.SkipSpaces = function () {
        var spaces = " \n\r\t";
        while (this.HasChar()) {
            if (spaces.indexOf(this.PeekChar()) == -1)
                break;
            this.SkipChar();
        }
    };
    CodeParser.prototype.GetAllStatements = function () {
        var res = [];
        this.TokenPosition = 0;
        /*// remove all the comments
        for (var i = 0; i < this.tokens.length;)
        {
            if (this.tokens[i].Type == "TokenComment")
                this.tokens.splice(i, 1);
            else
                i++;
        }*/
        while (this.HasToken()) {
            var s = this.GetStatement();
            if (s)
                res.push(s);
        }
        return res;
    };
    CodeParser.prototype.GetStatement = function () {
        return CodeStatement.Top(this);
    };
    CodeParser.prototype.Tokenize = function () {
        for (var i in codeParser.codeTokenizer) {
            if (codeParser.codeTokenizer[i].CanBeUsed(this)) {
                return { Type: i, Line: this.line, Column: this.column, Value: codeParser.codeTokenizer[i].Extract(this) };
            }
        }
        throw "Unrecognized token at " + this.line + ":" + this.column;
    };
    ;
    CodeParser.prototype.HasToken = function () {
        return this.TokenPosition < this.tokens.length;
    };
    CodeParser.prototype.PeekToken = function (offset, skipComments) {
        if (offset === void 0) { offset = 0; }
        if (skipComments === void 0) { skipComments = false; }
        while (skipComments && this.HasToken() && this.PeekToken().Type == "TokenComment")
            this.TokenPosition++;
        /*if (this.tokens[this.TokenPosition + offset] === null || this.tokens[this.TokenPosition + offset] == undefined)
            throw "Unexpected end of script.";*/
        return this.tokens[this.TokenPosition + offset];
    };
    CodeParser.prototype.NextToken = function (skipComments) {
        if (skipComments === void 0) { skipComments = false; }
        while (skipComments && this.HasToken() && this.PeekToken().Type == "TokenComment")
            this.TokenPosition++;
        if (this.tokens[this.TokenPosition] === null || this.tokens[this.TokenPosition] == undefined)
            throw "Unexpected end of script.";
        return this.tokens[this.TokenPosition++];
    };
    CodeParser.prototype.GetLine = function () {
        return this.line;
    };
    CodeParser.prototype.GetColumn = function () {
        return this.column;
    };
    return CodeParser;
}());
/// <reference path="CodeParser.ts" />
var statementEditorInfo = {};
var knownStatements = [];
// Class decorator for statements.
function StatementClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownStatements.push(className);
}
var topBlockStatements = [];
// Class decorator defining top block statement level.
function TopBlockStatementClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    topBlockStatements.push(className);
}
var CodeStatement = (function () {
    function CodeStatement() {
    }
    // Static Members
    CodeStatement.ExtractName = function (parser) {
        var result = parser.NextToken();
        while (parser.PeekToken() !== null && parser.PeekToken() !== undefined && parser.PeekToken().Type == "TokenDot") {
            result.Value += parser.NextToken().Value;
            if (parser.PeekToken().Type != "TokenName")
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            result.Value += parser.NextToken().Value;
        }
        return result;
    };
    CodeStatement.Top = function (parser) {
        return CodeStatement.Expression(parser);
    };
    CodeStatement.Expression = function (parser, mustCheckEnd) {
        if (mustCheckEnd === void 0) { mustCheckEnd = true; }
        // Skip comments
        if (parser.HasToken() && parser.PeekToken().Type == "TokenComment") {
            var comment = new CommentStatement(parser.NextToken().Value);
            var pos = parser.TokenPosition;
            if (parser.HasToken() && (parser.PeekToken(0, true) ? parser.PeekToken(0, true).Type : null) == "TokenStartBlock") {
                parser.NextToken(true);
                var statements = [comment];
                while (parser.HasToken() && parser.PeekToken().Type != "TokenEndBlock")
                    statements.push(CodeStatement.Top(parser));
                if (!parser.HasToken())
                    throw "Missing a }";
                if (parser.PeekToken().Type != "TokenEndBlock")
                    throw "Was expecting a } at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new BlockStatement(statements);
            }
            parser.TokenPosition = pos;
            return comment;
        }
        if (!parser.HasToken())
            return null;
        // End Line (no code)
        if (parser.PeekToken().Type == "TokenEndLine") {
            parser.NextToken();
            return new EmptyStatement();
        }
        if (parser.PeekToken().Type == "TokenStartBlock") {
            parser.NextToken();
            var statements = [];
            while (parser.HasToken() && parser.PeekToken().Type != "TokenEndBlock")
                statements.push(CodeStatement.Top(parser));
            if (!parser.HasToken())
                throw "Missing a }";
            if (parser.PeekToken().Type != "TokenEndBlock")
                throw "Was expecting a } at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            parser.NextToken();
            return new BlockStatement(statements);
        }
        var token = CodeStatement.ExtractName(parser);
        // Skip assignement var keywork which is currently not used.
        if (token.Value.toLowerCase() == "var")
            token = CodeStatement.ExtractName(parser);
        var node = null;
        switch (token.Value.toLowerCase()) {
            case "if":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenOpenParenthesis")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                return IfStatement.Parse(parser);
            case "else":
                throw "else statement without the if statement found at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "for":
                //throw "for loops are not yet implemented.";
                return ForStatement.Parse(parser);
            case "foreach":
                throw "foreach loops are not yet implemented.";
            case "do":
                return DoWhileStatement.Parse(parser);
            case "while":
                return WhileStatement.Parse(parser);
            case "break":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenEndLine")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new BreakStatement();
            case "try":
            case "catch":
                throw "try/catch blocks are not yet implemented.";
            case "return":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type == "TokenEndLine") {
                    parser.NextToken();
                    return new ReturnStatement(null);
                }
                var node = new ReturnStatement(CodeStatement.Element(parser));
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenEndLine")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return node;
            case "function":
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                var name = parser.NextToken().Value;
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type != "TokenOpenParenthesis")
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                return FunctionDefinitionStatement.Parse(name, parser);
            default:
                var index = null;
                if (!parser.HasToken())
                    throw "Unexpected end of script.";
                if (parser.PeekToken().Type == "TokenOpenSquareBracket") {
                    parser.NextToken();
                    index = CodeStatement.Additive(parser);
                    if (parser.PeekToken().Type != "TokenCloseSquareBracket")
                        throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    parser.NextToken();
                }
                if (parser.PeekToken().Type == "TokenAssign") {
                    parser.NextToken();
                    node = new AssignStatement(token.Value, CodeStatement.Element(parser));
                    if (index)
                        node.index = index;
                    if (parser.PeekToken().Type != "TokenEndLine") {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenOperatorAssign") {
                    var node = null;
                    var col = parser.PeekToken().Column;
                    var line = parser.PeekToken().Line;
                    var op = parser.PeekToken().Value.charAt(0);
                    parser.NextToken();
                    switch (op) {
                        case "+":
                            node = new AssignStatement(token.Value, new AddStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "-":
                            node = new AssignStatement(token.Value, new SubstractStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "*":
                            node = new AssignStatement(token.Value, new MultiplyStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        case "/":
                            node = new AssignStatement(token.Value, new DivideStatement(new VariableStatement(token.Value, line, col, index), CodeStatement.Element(parser)));
                            break;
                        default:
                            throw "Unexpected operator " + op + " at " + line + ":" + col;
                    }
                    if (index)
                        node.index = index;
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenOpenParenthesis") {
                    var node = FunctionCallStatement.Parse(token.Value, parser);
                    if (parser.PeekToken().Type != "TokenEndLine") {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenIncrement") {
                    parser.NextToken();
                    if (parser.PeekToken().Type != "TokenEndLine") {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    var node = new AssignStatement(token.Value, new AddStatement(new VariableStatement(token.Value, token.Line, token.Column, index), new NumberStatement("1", 0, 0)));
                    if (index)
                        node.index = index;
                    return node;
                }
                else if (parser.PeekToken().Type == "TokenDecrement") {
                    parser.NextToken();
                    if (parser.PeekToken().Type != "TokenEndLine") {
                        if (mustCheckEnd == true)
                            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    }
                    else
                        parser.NextToken();
                    var node = new AssignStatement(token.Value, new SubstractStatement(new VariableStatement(token.Value, token.Line, token.Column, index), new NumberStatement("1", 0, 0)));
                    if (index)
                        node.index = index;
                    return node;
                }
                else
                    throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        }
    };
    CodeStatement.Element = function (parser) {
        return CodeStatement.And(parser);
    };
    CodeStatement.And = function (parser) {
        var node = CodeStatement.Or(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenAnd") {
            parser.NextToken();
            return new AndStatement(node, CodeStatement.Element(parser));
        }
        return node;
    };
    CodeStatement.Or = function (parser) {
        var node = CodeStatement.Compare(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenOr") {
            parser.NextToken();
            return new OrStatement(node, CodeStatement.Element(parser));
        }
        return node;
    };
    CodeStatement.Compare = function (parser) {
        var node = CodeStatement.Additive(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenCompare")
            return new CompareStatement(node, parser.NextToken().Value, CodeStatement.Additive(parser));
        return node;
    };
    CodeStatement.Additive = function (parser) {
        var node = CodeStatement.Multiplicative(parser);
        if (!parser.HasToken())
            return node;
        if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "+") {
            parser.NextToken();
            return new AddStatement(node, CodeStatement.Additive(parser));
        }
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "-") {
            parser.NextToken();
            return new SubstractStatement(node, CodeStatement.Additive(parser));
        }
        return node;
    };
    CodeStatement.Multiplicative = function (parser) {
        var node = CodeStatement.BaseStatement(parser);
        if (!parser.HasToken())
            return node;
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "*") {
            parser.NextToken();
            return new MultiplyStatement(node, CodeStatement.Multiplicative(parser));
        }
        else if (parser.PeekToken().Type == "TokenOperator" && parser.PeekToken().Value == "/") {
            parser.NextToken();
            return new DivideStatement(node, CodeStatement.Multiplicative(parser));
        }
        return node;
    };
    CodeStatement.BaseStatement = function (parser) {
        if (!parser.HasToken())
            throw "Formula not finished correctly.";
        switch (parser.PeekToken().Type) {
            case "TokenOpenSquareBracket":
                var t = parser.NextToken();
                if (parser.PeekToken().Type != "TokenCloseSquareBracket")
                    throw "Missing close square bracket at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return new EmptyArrayStatement(t.Line, t.Column);
            case "TokenCloseParenthesis":
                throw "Found close parenthesis at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "TokenOpenParenthesis":
                parser.NextToken();
                var node = CodeStatement.Element(parser);
                if (!parser.HasToken())
                    throw "Missing close parenthesis.";
                else if (parser.PeekToken().Type != "TokenCloseParenthesis")
                    throw "Missing close parenthesis at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                parser.NextToken();
                return node;
            case "TokenNot":
                parser.NextToken();
                return new NotStatement(CodeStatement.BaseStatement(parser));
            case "TokenNumber":
                var t = parser.NextToken();
                return new NumberStatement(t.Value, t.Line, t.Column);
            case "TokenCodeVariable":
                var t = parser.NextToken();
                return new CodeVariableStatement(t.Value, t.Line, t.Column);
            case "TokenName":
                var name = CodeStatement.ExtractName(parser);
                // A function call
                if (parser.HasToken() && parser.PeekToken().Type == "TokenOpenParenthesis")
                    return FunctionCallStatement.Parse(name.Value, parser);
                else if (parser.HasToken() && parser.PeekToken().Type == "TokenOpenSquareBracket") {
                    parser.NextToken();
                    var index = CodeStatement.Additive(parser);
                    if (parser.HasToken() && parser.PeekToken().Type != "TokenCloseSquareBracket")
                        throw "Missing close square bracket at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
                    parser.NextToken();
                    var res = new VariableStatement(name.Value, name.Line, name.Column);
                    res.index = index;
                    return res;
                }
                else {
                    switch (name.Value) {
                        case "true":
                            return new BooleanStatement(true);
                        case "false":
                            return new BooleanStatement(false);
                        case "null":
                            return new NullStatement();
                        default:
                            return new VariableStatement(name.Value, name.Line, name.Column);
                    }
                }
            case "TokenString":
                return new StringStatement(parser.NextToken().Value);
            case "TokenOperator":
                if (parser.PeekToken().Value == "-" || parser.PeekToken().Value == "+") {
                    var t = parser.NextToken();
                    return new NumberStatement(t.Value + parser.NextToken().Value, t.Line, t.Column);
                }
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            case "TokenCodeVariable":
                throw "Code variable @" + parser.PeekToken().Value + "@ unknown at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            default:
                throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        }
    };
    CodeStatement.prototype.ExtractConstants = function (values) {
        var result = [];
        for (var i = 0; i < values.length; i++) {
            if (values[i] instanceof NumberStatement)
                result.push(values[i].Value.GetNumber());
            else if (values[i] instanceof StringStatement)
                result.push(values[i].Value.GetString());
            else
                result.push(null);
        }
        return result;
    };
    CodeStatement.prototype.HTMLBlocks = function (path, codeStatements) {
        var html = "";
        var name = ("" + this.constructor).match(/function ([a-z]+)Statement\(/i)[1];
        var info = statementEditorInfo[name];
        var propInfo = null;
        var nbParams = 0;
        if (info)
            for (var i = 0; i < info.params.length; i++) {
                if (info.params[i].display == "embed")
                    propInfo = info.params[i];
                else
                    nbParams++;
            }
        else {
            for (var prop in this) {
                var propName = "" + prop;
                var propInfo = null;
                if (typeof this[propName] == "function")
                    continue;
                // private variable
                if (propName[0] != propName[0].toUpperCase())
                    continue;
                nbParams++;
            }
        }
        var isOk = this.BlockVerify();
        if (propInfo) {
            html += "<div class='codeBlock" + (isOk ? "" : " blockOnError") + "' id='bl_" + path.replace(/\./g, "_") + "'>";
            html += "<span class='" + (nbParams > 0 ? "blockType" : "simpleBlockType") + "'>" + name.title() + " <input type='text' value='" + (propInfo.type == "VariableValue" ? this[propInfo.name].GetString() : this[propInfo.name]).htmlEntities() + "' path='" + path + "." + propInfo.name + "'></span>";
        }
        else {
            html += "<div class='codeBlock" + (isOk ? "" : " blockOnError") + "' id='bl_" + path.replace(/\./g, "_") + "'>";
            html += "<span class='" + (nbParams > 0 ? "blockType" : "simpleBlockType") + "'>" + name.title() + "</span>";
        }
        if (info) {
            for (var i = 0; i < info.params.length; i++) {
                var propInfo = info.params[i];
                if (propInfo.display == "embed")
                    continue;
                html += this.RenderBlockField(propInfo.name, path, codeStatements, propInfo);
            }
        }
        else {
            for (var prop in this) {
                var propName = "" + prop;
                var propInfo = null;
                if (typeof this[propName] == "function")
                    continue;
                // private variable
                if (propName[0] != propName[0].toUpperCase())
                    continue;
                html += this.RenderBlockField(propName, path, codeStatements);
            }
        }
        if (nbParams > 0)
            html += "<span class='endBlock'></span>";
        html += "</div>";
        return html;
    };
    CodeStatement.prototype.RenderBlockField = function (propName, path, statements, propInfo) {
        if (propInfo === void 0) { propInfo = null; }
        var html = "";
        var title = propName.replace(/Statement$/, "").title();
        if (propInfo && propInfo.display && propInfo.display != "embed")
            title = propInfo.display;
        // private variable
        if ((this[propName] && typeof this[propName].HTMLBlocks == "function") || (propInfo && propInfo.type == "CodeStatement")) {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='subBlock'>" + (this[propName] ? this[propName].HTMLBlocks(path + "." + propName, statements) : "<span class='emptyBlock' path='" + (path + "." + propName) + "'>Empty</span>") + "</span>";
            html += "</div>";
        }
        else if (this[propName] && this[propName] instanceof VariableValue || (propInfo && propInfo.type == "VariableValue")) {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='blockValue'><input type='text' value='" + this[propName].GetString().htmlEntities() + "' path='" + path + "." + propName + "'></span>";
            html += "</div>";
        }
        else if (propInfo && propInfo.type == "string[]") {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            var values = this[propName];
            for (var i = 0; i < values.length; i++) {
                html += "<span class='blockValue'>";
                html += "<input type='text' value='" + values[i].htmlEntities(true) + "' path='" + path + "." + propName + "." + i + "' class='blockArrayEntry'>";
                html += "<span class='blockDeleteArrayEntry' path='" + path + "." + propName + "." + i + "'>x</span>";
                html += "</span>";
            }
            html += "<span class='blockValue'><span class='button blockAddArrayEntry' path='" + path + "." + propName + "'>Add</span></span>";
            html += "</div>";
        }
        else {
            html += "<div><span class='blockLabel'>" + title + "</span>";
            html += "<span class='blockValue'><input type='text' value='" + ("" + this[propName]).htmlEntities() + "' path='" + path + "." + propName + "'></span>";
            html += "</div>";
        }
        return html;
    };
    CodeStatement.prototype.Indent = function (nb) {
        var res = "";
        for (var i = 0; i < nb; i++)
            res += "    ";
        return res;
    };
    return CodeStatement;
}());
var CodeToken = (function () {
    function CodeToken() {
    }
    return CodeToken;
}());
var ValueType;
(function (ValueType) {
    ValueType[ValueType["Number"] = 0] = "Number";
    ValueType[ValueType["String"] = 1] = "String";
    ValueType[ValueType["Boolean"] = 2] = "Boolean";
    ValueType[ValueType["Null"] = 3] = "Null";
    ValueType[ValueType["Array"] = 4] = "Array";
})(ValueType || (ValueType = {}));
var VariableValue = (function () {
    function VariableValue(source) {
        if (source === null) {
            this.Value = null;
            this.Type = ValueType.Null;
        }
        else if (typeof source == "string") {
            this.Value = source;
            this.Type = ValueType.String;
        }
        else if (typeof source == "number") {
            this.Value = source;
            this.Type = ValueType.Number;
        }
        else if (typeof source == "boolean") {
            this.Value = source;
            this.Type = ValueType.Boolean;
        }
        else if (source instanceof Array) {
            this.Value = source;
            this.Type = ValueType.Array;
        }
        else if (source instanceof VariableValue) {
            this.Value = source.Value;
            this.Type = source.Type;
        }
        else if (source.name && source.value && source.type) {
            switch (source.type) {
                case "number":
                    return new VariableValue(parseFloat(source.value));
                case "string":
                    return new VariableValue(source.value);
                case "boolean":
                    return new VariableValue(source.value.trim().toLowerCase() == "true" ? true : false);
                default:
                    return new VariableValue(source.value);
            }
        }
        else
            throw "Cannot convert this type (" + (typeof source) + ") to a VariableValue";
    }
    VariableValue.prototype.GetNumber = function () {
        switch (this.Type) {
            case ValueType.String:
                return parseFloat(this.Value);
            case ValueType.Boolean:
                return (this.Value ? 1 : 0);
            case ValueType.Number:
                return this.Value;
        }
    };
    VariableValue.prototype.GetString = function () {
        switch (this.Type) {
            case ValueType.String:
                return this.Value;
            case ValueType.Boolean:
                return "" + this.Value;
            case ValueType.Number:
                return "" + this.Value;
            case ValueType.Null:
                return "";
        }
    };
    VariableValue.prototype.GetBoolean = function () {
        switch (this.Type) {
            case ValueType.String:
                return (this.Value.toLower() == "true" ? true : false);
            case ValueType.Boolean:
                return this.Value;
            case ValueType.Number:
                return (this.Value == 0 ? false : true);
        }
    };
    return VariableValue;
}());
var JournalEntry = (function () {
    function JournalEntry() {
    }
    return JournalEntry;
}());
var KnownQuest = (function () {
    function KnownQuest() {
    }
    return KnownQuest;
}());
var Quest = (function () {
    function Quest() {
        this.JournalEntries = [];
    }
    return Quest;
}());
var ReceivedJournalEntry = (function () {
    function ReceivedJournalEntry() {
    }
    return ReceivedJournalEntry;
}());
var defaultParticleSystems = [{
        "Name": "blood", "InitialParticles": 0, "MaxParticles": 1000, "MaxAge": 100, "MaxSpeed": 10, "Emitter": { "SpawnRate": 4, "Velocity": 1, "Direction": -90, "JitterDirection": 5, "JitterVelocity": 0.5, "JitterX": 3, "JitterY": 3, "StopEmittingAfter": 100, "__type": "ParticleEmitterPoint" }, "Effectors": [{ "Gravity": 0.02, "GravityDirection": 90, "__type": "ParticleGravity" }, { "StartColor": "#FF0000", "EndColor": "", "__type": "ParticleColor" }, { "ParticleStartSize": 1, "ParticleStartAgeSizeChange": 0, "ParticleEndSize": 3, "__type": "ParticleSize" }, { "ParticleStartOpacity": 1, "ParticleStartAgeOpacityChange": 10, "ParticleEndOpacity": 0, "__type": "ParticleOpacity" }]
    },
    { "Name": "torch", "InitialParticles": 0, "MaxParticles": 1000, "MaxAge": 100, "MaxSpeed": 10, "Emitter": { "OffsetX": 0, "OffsetY": 0, "SpawnRate": 0.5, "Velocity": 1, "Direction": -90, "JitterDirection": 10, "JitterVelocity": 0.1, "JitterX": 5, "JitterY": 5, "StopEmittingAfter": null, "__type": "ParticleEmitterPoint" }, "Effectors": [{ "Strength": 0.005, "FrequencyAlphaX": 20, "FrequencyAlphaY": 20, "FrequencyBetaX": 10, "FrequencyBetaY": 10, "AgeFactor": 0.5, "__type": "ParticleWave" }, { "Gravity": 0.002, "GravityDirection": 180, "__type": "ParticleGravity" }, { "StartColor": "#FFFF00", "EndColor": "#FF0000", "__type": "ParticleColor" }, { "ParticleStartSize": 2, "ParticleStartAgeSizeChange": 50, "ParticleEndSize": 6, "__type": "ParticleSize" }, { "ParticleStartOpacity": 1, "ParticleStartAgeOpacityChange": 50, "ParticleEndOpacity": 0, "__type": "ParticleOpacity" }] }];
var Particle = (function () {
    function Particle(system) {
        this.Color = "#000000";
        this.Opacity = 1;
        this.Size = 2;
        this.System = system;
        this.Age = 0;
    }
    Particle.prototype.Handle = function () {
        this.Age++;
        if (this.Age >= this.System.MaxAge)
            return false;
        var bounce = null;
        var friction = null;
        for (var i = 0; i < this.System.Effectors.length; i++) {
            if (this.System.Effectors[i] instanceof ParticleBounce) {
                bounce = this.System.Effectors[i];
                continue;
            }
            if (this.System.Effectors[i] instanceof ParticleFriction) {
                friction = this.System.Effectors[i];
                continue;
            }
            this.System.Effectors[i].Handle(this);
        }
        if (this.System.MaxSpeed !== null) {
            var s = Math.sqrt(this.VX * this.VX + this.VY * this.VY);
            if (s > this.System.MaxSpeed) {
                var a = EngineMath.CalculateAngle(this.VX, this.VY);
                this.VX = Math.cos(a) * this.System.MaxSpeed;
                this.VY = Math.sin(a) * this.System.MaxSpeed;
            }
        }
        if (friction)
            friction.Handle(this);
        this.X += this.VX;
        this.Y += this.VY;
        if (bounce)
            bounce.Handle(this);
        return true;
    };
    Particle.prototype.Draw = function (ctx) {
        var x = Math.floor(this.X - this.Size / 2);
        var y = Math.floor(this.Y - this.Size / 2);
        ctx.globalAlpha = this.Opacity;
        switch (this.System.ParticleType) {
            case 1:
                ctx.drawImage(ParticleBlob.GetBlob(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            case 2:
                ctx.drawImage(ParticleSparkle.GetSparkle(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            case 3:
                ctx.drawImage(ParticleDisk.GetDisk(this.Color), 0, 0, 20, 20, x, y, this.Size, this.Size);
                break;
            default:
                ctx.fillStyle = this.Color;
                ctx.fillRect(x, y, this.Size, this.Size);
        }
        //ParticleBlob.CreateBlob(20, 20, 255, 0, 0);
    };
    return Particle;
}());
var knownParticleEffectors = [];
var knownParticleEffectorsNullableProperties = [];
var knownParticleEffectorsNumberProperties = [];
var knownParticleEmitters = [];
function ParticleEffectorClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEffectors.push(className);
    knownParticleEffectors.sort();
}
function ParticleEffectorPropertyNullable(target, key) {
    var tName = "" + target.constructor;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEffectorsNullableProperties.push(key + "@" + className);
}
function ParticleEffectorPropertyNumber(target, key) {
    var tName = "" + target.constructor;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEffectorsNumberProperties.push(key + "@" + className);
}
function ParticleEmitterClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownParticleEmitters.push(className);
    knownParticleEmitters.sort();
}
var particleSystemParameters = ["Name",
    "InitialParticles",
    "ParticleType",
    "MaxParticles",
    "MaxAge",
    "MaxSpeed",
];
var ParticleSystem = (function () {
    function ParticleSystem() {
        this.Name = "particles_1";
        this.ParticleType = 1;
        this.Emitter = new ParticleEmitterPoint();
        this.InitialParticles = 0;
        this.MaxParticles = 1000;
        this.MaxAge = 1000;
        this.MaxSpeed = 10;
        this.Effectors = [];
        this.particles = null;
        this.Age = 0;
        this.RandomId = Math.round(Math.random() * 10000000);
        this.spawnCount = 0;
    }
    ParticleSystem.prototype.Draw = function (ctx) {
        if ((world.Edition == EditorEdition.Demo || Main.CheckTouch()) && !Main.CheckNW())
            return;
        this.Handle();
        for (var i = 0; i < this.particles.length; i++)
            this.particles[i].Draw(ctx);
    };
    ParticleSystem.prototype.Reset = function () {
        this.particles = null;
        this.Age = 0;
        this.RandomId = Math.round(Math.random() * 10000000);
    };
    ParticleSystem.prototype.Handle = function () {
        if (!this.particles) {
            this.particles = [];
            for (var i = 0; i < this.InitialParticles && this.particles.length < this.MaxParticles; i++)
                this.Emitter.Emit(this);
            //this.particles.push(new Particle(this));
        }
        // Handle and kill the hold
        for (var i = 0; i < this.particles.length;) {
            // Time to kill it
            if (this.particles[i].Handle() === false)
                this.particles.splice(i, 1);
            else
                i++;
        }
        if (this.Emitter.StopEmittingAfter === null || this.Age < this.Emitter.StopEmittingAfter) {
            this.spawnCount += this.Emitter.SpawnRate;
            // Create the new one
            var i = 0;
            for (; i < this.spawnCount && this.particles.length < Math.min(Math.max(this.MaxParticles, 10), 5000); i++)
                this.Emitter.Emit(this);
            this.spawnCount -= i;
            if (this.spawnCount > 1)
                this.spawnCount = 1;
            this.Emitter.SystemStep();
        }
        this.Age++;
    };
    ParticleSystem.SerializeItem = function (sourceItem) {
        var result = {};
        for (var item in sourceItem) {
            if (typeof sourceItem[item] == "function" || item.charAt(0) == "_")
                continue;
            result[item] = sourceItem[item];
        }
        result['__type'] = ("" + sourceItem.constructor).match(/function ([^\(]+)\(/)[1];
        return result;
    };
    ParticleSystem.CreateFromSerialize = function (sourceItem) {
        var result = new window[sourceItem['__type']]();
        for (var item in sourceItem) {
            if (typeof sourceItem[item] == "function" || item.charAt(0) == "_")
                continue;
            result[item] = sourceItem[item];
        }
        return result;
    };
    ParticleSystem.prototype.Serialize = function () {
        var data = {};
        for (var i = 0; i < particleSystemParameters.length; i++)
            data[particleSystemParameters[i]] = this[particleSystemParameters[i]];
        data['Emitter'] = ParticleSystem.SerializeItem(this.Emitter);
        var effects = [];
        for (var i = 0; i < this.Effectors.length; i++)
            effects.push(ParticleSystem.SerializeItem(this.Effectors[i]));
        data['Effectors'] = effects;
        return data;
    };
    ParticleSystem.Rebuild = function (data) {
        var result = new ParticleSystem();
        for (var i = 0; i < particleSystemParameters.length; i++)
            result[particleSystemParameters[i]] = data[particleSystemParameters[i]];
        result.Emitter = ParticleSystem.CreateFromSerialize(data['Emitter']);
        var effects = [];
        for (var i = 0; i < data['Effectors'].length; i++)
            effects.push(ParticleSystem.CreateFromSerialize(data['Effectors'][i]));
        result.Effectors = effects;
        return result;
    };
    return ParticleSystem;
}());
/// <reference path="ParticleSystem.ts" />
var ParticleAttractor = (function () {
    function ParticleAttractor() {
        this.X = 0;
        this.Y = 0;
        this.Strength = 0.01;
        this.EffectDistance = 100;
    }
    ParticleAttractor.prototype.Handle = function (p) {
        var dx = p.X - this.X;
        var dy = p.Y - this.Y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > this.EffectDistance)
            return;
        var s = this.Strength * d / this.EffectDistance;
        var ed = EngineMath.CalculateAngle(dx, dy);
        p.VX -= Math.cos(ed) * s;
        p.VY -= Math.sin(ed) * s;
    };
    ParticleAttractor.prototype.Draw = function (ctx) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.EffectDistance, 0, Math.PI * 2);
        ctx.moveTo(this.X - 10, this.Y + 0.5);
        ctx.lineTo(this.X + 10, this.Y + 0.5);
        ctx.moveTo(this.X + 0.5, this.Y - 10);
        ctx.lineTo(this.X + 0.5, this.Y + 10);
        ctx.stroke();
    };
    return ParticleAttractor;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleAttractor.prototype, "X", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleAttractor.prototype, "Y", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleAttractor.prototype, "Strength", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleAttractor.prototype, "EffectDistance", void 0);
ParticleAttractor = __decorate([
    ParticleEffectorClass
], ParticleAttractor);
var blobs = {};
var ParticleBlob = (function () {
    function ParticleBlob() {
    }
    ParticleBlob.GetColorComponents = function (color) {
        return {
            r: parseInt(color.substr(1, 2), 16),
            g: parseInt(color.substr(3, 2), 16),
            b: parseInt(color.substr(5, 2), 16)
        };
    };
    ParticleBlob.ColorReduce = function (c) {
        return {
            r: Math.floor(c.r / 4) * 4,
            g: Math.floor(c.g / 4) * 4,
            b: Math.floor(c.b / 4) * 4
        };
    };
    ParticleBlob.GetColorString = function (color) {
        return "#" + ("" + color.r.toString(16)).padLeft("0", 2) + ("" + color.g.toString(16)).padLeft("0", 2) + ("" + color.b.toString(16)).padLeft("0", 2);
    };
    ParticleBlob.GetBlob = function (color) {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (blobs[cs])
            return blobs[cs];
        blobs[cs] = ParticleBlob.CreateBlob(20, 20, c.r, c.g, c.b);
        return blobs[cs];
    };
    ParticleBlob.CreateBlob = function (width, height, r, g, b) {
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
        var imgData = ctx.createImageData(width, height);
        var side = (width / 2);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var op = side - x;
                var ad = side - y;
                var d = (side - Math.sqrt(op * op + ad * ad)) / side;
                var p = (x + y * width) * 4;
                if (d <= 0)
                    d = 0;
                else
                    d = Math.max(0, Math.min(255, Math.floor(255 * d)));
                imgData.data[p + 0] = r;
                imgData.data[p + 1] = g;
                imgData.data[p + 2] = b;
                imgData.data[p + 3] = d;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        var image = new Image();
        image.src = c.toDataURL("image/png");
        return image;
    };
    return ParticleBlob;
}());
/// <reference path="ParticleSystem.ts" />
var ParticleBounce = (function () {
    function ParticleBounce() {
        this.BouncePlane = 30;
        this.BounceEnergy = 0.8;
    }
    ParticleBounce.prototype.Handle = function (p) {
        if (this.BouncePlane !== null && p.Y > this.BouncePlane) {
            p.Y = this.BouncePlane - (p.Y - this.BouncePlane);
            p.VY = -p.VY * this.BounceEnergy;
            p.VX *= this.BounceEnergy;
        }
    };
    ParticleBounce.prototype.Draw = function (ctx) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10000, this.BouncePlane + 0.5);
        ctx.lineTo(10000, this.BouncePlane + 0.5);
        ctx.stroke();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(-10000, this.BouncePlane + 0.5, 20000, 20000);
    };
    return ParticleBounce;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleBounce.prototype, "BouncePlane", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleBounce.prototype, "BounceEnergy", void 0);
ParticleBounce = __decorate([
    ParticleEffectorClass
], ParticleBounce);
/// <reference path="ParticleSystem.ts" />
var ParticleColor = (function () {
    function ParticleColor() {
        this.StartColor = "#FF0000";
        this.EndColor = "#00FF00";
    }
    ParticleColor.prototype.Handle = function (p) {
        if (!this.EndColor) {
            if (this.StartColor.indexOf(",") !== -1) {
                if (p.Age == 1) {
                    var cols = this.StartColor.split(",");
                    p.Color = cols[Math.round((cols.length - 1) * Math.random())].trim();
                }
            }
            else
                p.Color = this.StartColor;
            return;
        }
        var sr = parseInt(this.StartColor.substr(1, 2), 16);
        var sg = parseInt(this.StartColor.substr(3, 2), 16);
        var sb = parseInt(this.StartColor.substr(5, 2), 16);
        var er = parseInt(this.EndColor.substr(1, 2), 16);
        var eg = parseInt(this.EndColor.substr(3, 2), 16);
        var eb = parseInt(this.EndColor.substr(5, 2), 16);
        var rr = Math.floor((er - sr) * p.Age / p.System.MaxAge + sr);
        var rg = Math.floor((eg - sg) * p.Age / p.System.MaxAge + sg);
        var rb = Math.floor((eb - sb) * p.Age / p.System.MaxAge + sb);
        p.Color = "#" + ("" + rr.toString(16)).padLeft("0", 2) + ("" + rg.toString(16)).padLeft("0", 2) + ("" + rb.toString(16)).padLeft("0", 2);
    };
    ParticleColor.prototype.Draw = function (ctx) {
    };
    return ParticleColor;
}());
__decorate([
    ParticleEffectorPropertyNullable
], ParticleColor.prototype, "EndColor", void 0);
ParticleColor = __decorate([
    ParticleEffectorClass
], ParticleColor);
var disks = {};
var ParticleDisk = (function () {
    function ParticleDisk() {
    }
    ParticleDisk.GetDisk = function (color) {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (disks[cs])
            return disks[cs];
        disks[cs] = ParticleDisk.CreateDisk(20, 20, c.r, c.g, c.b);
        return disks[cs];
    };
    ParticleDisk.CreateDisk = function (width, height, r, g, b) {
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
        ctx.fillStyle = ParticleBlob.GetColorString({ r: r, g: g, b: b });
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
        ctx.fill();
        var image = new Image();
        image.src = c.toDataURL("image/png");
        return image;
    };
    return ParticleDisk;
}());
/// <reference path="ParticleSystem.ts" />
var ParticleEmitter = (function () {
    function ParticleEmitter() {
        this.OffsetX = 0;
        this.OffsetY = 0;
        this.SpawnRate = 0.5;
        this.Velocity = 1;
        this.Direction = -90;
        this.JitterDirection = 10;
        this.JitterVelocity = 0.1;
        this.JitterX = 5;
        this.JitterY = 5;
        this.StopEmittingAfter = null;
    }
    ParticleEmitter.prototype.SystemStep = function () {
    };
    return ParticleEmitter;
}());
__decorate([
    ParticleEffectorPropertyNullable
], ParticleEmitter.prototype, "StopEmittingAfter", void 0);
/// <reference path="ParticleSystem.ts" />
var ParticleEmitterCircle = (function (_super) {
    __extends(ParticleEmitterCircle, _super);
    function ParticleEmitterCircle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Radius = 30;
        _this.Height = null;
        return _this;
    }
    ParticleEmitterCircle.prototype.Emit = function (system) {
        var a = Math.PI * 2 * Math.random();
        var p = new Particle(system);
        p.X = this.OffsetX + Math.cos(a) * this.Radius + Math.random() * this.JitterX * 2 - this.JitterX;
        p.Y = this.OffsetY + Math.sin(a) * (this.Height === null ? this.Radius : this.Height) + Math.random() * this.JitterY * 2 - this.JitterY;
        var a = (this.Direction + ((Math.random() * 2 - 1) * this.JitterDirection)) * Math.PI / 180;
        var jv = (Math.random() * 2 - 1) * this.JitterVelocity;
        p.VX = Math.cos(a) * (this.Velocity + jv);
        p.VY = Math.sin(a) * (this.Velocity + jv);
        system.particles.push(p);
    };
    ParticleEmitterCircle.prototype.Draw = function (ctx) {
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = Math.max(this.JitterX * 2, this.JitterY * 2);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        for (var i = 0; i < 60; i++) {
            var x = Math.round(Math.cos(i * Math.PI / 30) * this.Radius);
            var y = Math.round(Math.sin(i * Math.PI / 30) * (this.Height === null ? this.Radius : this.Height));
            if (i == 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }
        ctx.closePath();
        //ctx.arc(this.OffsetX, this.OffsetY, this.Radius, 0, Math.PI * 2);
        ctx.stroke();
    };
    return ParticleEmitterCircle;
}(ParticleEmitter));
__decorate([
    ParticleEffectorPropertyNullable
], ParticleEmitterCircle.prototype, "Height", void 0);
ParticleEmitterCircle = __decorate([
    ParticleEmitterClass
], ParticleEmitterCircle);
/// <reference path="ParticleSystem.ts" />
var ParticleEmitterPoint = (function (_super) {
    __extends(ParticleEmitterPoint, _super);
    function ParticleEmitterPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParticleEmitterPoint.prototype.Emit = function (system) {
        var p = new Particle(system);
        p.X = this.OffsetX + Math.random() * this.JitterX * 2 - this.JitterX;
        p.Y = this.OffsetY + Math.random() * this.JitterY * 2 - this.JitterY;
        var a = (this.Direction + ((Math.random() * 2 - 1) * this.JitterDirection)) * Math.PI / 180;
        var jv = (Math.random() * 2 - 1) * this.JitterVelocity;
        p.VX = Math.cos(a) * (this.Velocity + jv);
        p.VY = Math.sin(a) * (this.Velocity + jv);
        system.particles.push(p);
    };
    ParticleEmitterPoint.prototype.Draw = function (ctx) {
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(this.OffsetX - this.JitterX, this.OffsetY - this.JitterY, this.JitterX * 2, this.JitterY * 2);
        ctx.beginPath();
        ctx.moveTo(this.OffsetX + 0.5, this.OffsetY - 20);
        ctx.lineTo(this.OffsetX + 0.5, this.OffsetY + 20);
        ctx.moveTo(this.OffsetX - 20, this.OffsetY + 0.5);
        ctx.lineTo(this.OffsetX + 20, this.OffsetY + 0.5);
        ctx.stroke();
    };
    return ParticleEmitterPoint;
}(ParticleEmitter));
ParticleEmitterPoint = __decorate([
    ParticleEmitterClass
], ParticleEmitterPoint);
/// <reference path="ParticleSystem.ts" />
var ParticleEmitterRotating = (function (_super) {
    __extends(ParticleEmitterRotating, _super);
    function ParticleEmitterRotating() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Radius = 30;
        _this.Height = null;
        _this.RotationSpeed = 1;
        _this._currentAngle = 0;
        return _this;
    }
    ParticleEmitterRotating.prototype.SystemStep = function () {
        this._currentAngle += this.RotationSpeed * Math.PI / 180;
    };
    ParticleEmitterRotating.prototype.Emit = function (system) {
        var p = new Particle(system);
        p.X = this.OffsetX + Math.cos(this._currentAngle) * this.Radius + Math.random() * this.JitterX * 2 - this.JitterX;
        p.Y = this.OffsetY + Math.sin(this._currentAngle) * (this.Height === null ? this.Radius : this.Height) + Math.random() * this.JitterY * 2 - this.JitterY;
        var a = (this.Direction + ((Math.random() * 2 - 1) * this.JitterDirection)) * Math.PI / 180;
        var jv = (Math.random() * 2 - 1) * this.JitterVelocity;
        p.VX = Math.cos(a) * (this.Velocity + jv);
        p.VY = Math.sin(a) * (this.Velocity + jv);
        system.particles.push(p);
    };
    ParticleEmitterRotating.prototype.Draw = function (ctx) {
        ctx.fillStyle = "#0000FF";
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth = Math.max(this.JitterX * 2, this.JitterY * 2);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        for (var i = 0; i < 60; i++) {
            var x = Math.round(Math.cos(i * Math.PI / 30) * this.Radius);
            var y = Math.round(Math.sin(i * Math.PI / 30) * (this.Height === null ? this.Radius : this.Height));
            if (i == 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }
        ctx.closePath();
        //ctx.arc(this.OffsetX, this.OffsetY, this.Radius, 0, Math.PI * 2);
        ctx.stroke();
    };
    return ParticleEmitterRotating;
}(ParticleEmitter));
__decorate([
    ParticleEffectorPropertyNullable
], ParticleEmitterRotating.prototype, "Height", void 0);
ParticleEmitterRotating = __decorate([
    ParticleEmitterClass
], ParticleEmitterRotating);
/// <reference path="ParticleSystem.ts" />
var ParticleFriction = (function () {
    function ParticleFriction() {
        this.EnergyConservation = 1;
    }
    ParticleFriction.prototype.Handle = function (p) {
        p.VY *= this.EnergyConservation;
        p.VX *= this.EnergyConservation;
    };
    ParticleFriction.prototype.Draw = function (ctx) {
    };
    return ParticleFriction;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleFriction.prototype, "EnergyConservation", void 0);
ParticleFriction = __decorate([
    ParticleEffectorClass
], ParticleFriction);
/// <reference path="ParticleSystem.ts" />
var ParticleGravity = (function () {
    function ParticleGravity() {
        this.Gravity = 0.01;
        this.GravityDirection = 90;
    }
    ParticleGravity.prototype.Handle = function (p) {
        if (this.Gravity > 0) {
            var a = this.GravityDirection * Math.PI / 180;
            p.VX += Math.cos(a) * this.Gravity;
            p.VY += Math.sin(a) * this.Gravity;
        }
    };
    ParticleGravity.prototype.Draw = function (ctx) {
    };
    return ParticleGravity;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleGravity.prototype, "Gravity", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleGravity.prototype, "GravityDirection", void 0);
ParticleGravity = __decorate([
    ParticleEffectorClass
], ParticleGravity);
/// <reference path="ParticleSystem.ts" />
var ParticleOpacity = (function () {
    function ParticleOpacity() {
        this.ParticleStartOpacity = 1;
        this.ParticleStartAgeOpacityChange = 500;
        this.ParticleEndOpacity = 0;
    }
    ParticleOpacity.prototype.Handle = function (p) {
        if (this.ParticleStartAgeOpacityChange === null || this.ParticleEndOpacity === null) {
            p.Opacity = this.ParticleStartOpacity;
            return;
        }
        if (p.Age <= this.ParticleStartAgeOpacityChange)
            p.Opacity = this.ParticleStartOpacity;
        else {
            var a = p.Age - this.ParticleStartAgeOpacityChange;
            var ma = p.System.MaxAge - this.ParticleStartAgeOpacityChange;
            a = a / ma;
            a = (a * this.ParticleEndOpacity) + (1 - a) * this.ParticleStartOpacity;
            p.Opacity = Math.max(Math.min(a, 1), 0);
        }
    };
    ParticleOpacity.prototype.Draw = function (ctx) {
    };
    return ParticleOpacity;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleOpacity.prototype, "ParticleStartOpacity", void 0);
__decorate([
    ParticleEffectorPropertyNumber,
    ParticleEffectorPropertyNullable
], ParticleOpacity.prototype, "ParticleStartAgeOpacityChange", void 0);
__decorate([
    ParticleEffectorPropertyNumber,
    ParticleEffectorPropertyNullable
], ParticleOpacity.prototype, "ParticleEndOpacity", void 0);
ParticleOpacity = __decorate([
    ParticleEffectorClass
], ParticleOpacity);
/// <reference path="ParticleSystem.ts" />
var ParticleRepulsor = (function () {
    function ParticleRepulsor() {
        this.X = 0;
        this.Y = 0;
        this.Strength = 0.01;
        this.EffectDistance = 100;
    }
    ParticleRepulsor.prototype.Handle = function (p) {
        var dx = p.X - this.X;
        var dy = p.Y - this.Y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > this.EffectDistance)
            return;
        var s = this.Strength * d / this.EffectDistance;
        var ed = EngineMath.CalculateAngle(dx, dy);
        p.VX += Math.cos(ed) * s;
        p.VY += Math.sin(ed) * s;
    };
    ParticleRepulsor.prototype.Draw = function (ctx) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.X, this.Y, this.EffectDistance, 0, Math.PI * 2);
        ctx.moveTo(this.X - 10, this.Y + 0.5);
        ctx.lineTo(this.X + 10, this.Y + 0.5);
        ctx.moveTo(this.X + 0.5, this.Y - 10);
        ctx.lineTo(this.X + 0.5, this.Y + 10);
        ctx.stroke();
    };
    return ParticleRepulsor;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleRepulsor.prototype, "X", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleRepulsor.prototype, "Y", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleRepulsor.prototype, "Strength", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleRepulsor.prototype, "EffectDistance", void 0);
ParticleRepulsor = __decorate([
    ParticleEffectorClass
], ParticleRepulsor);
/// <reference path="ParticleSystem.ts" />
var ParticleSize = (function () {
    function ParticleSize() {
        this.ParticleStartSize = 2;
        this.ParticleStartAgeSizeChange = 500;
        this.ParticleEndSize = 6;
    }
    ParticleSize.prototype.Handle = function (p) {
        if (this.ParticleStartAgeSizeChange === null || this.ParticleEndSize === null) {
            p.Size = this.ParticleStartSize;
            return;
        }
        if (p.Age <= this.ParticleStartAgeSizeChange)
            p.Size = this.ParticleStartSize;
        else {
            var a = p.Age - this.ParticleStartAgeSizeChange;
            var ma = p.System.MaxAge - this.ParticleStartAgeSizeChange;
            a = a / ma;
            a = (a * this.ParticleEndSize) + (1 - a) * this.ParticleStartSize;
            p.Size = Math.round(Math.max(Math.min(a, 100), 1));
        }
    };
    ParticleSize.prototype.Draw = function (ctx) {
    };
    return ParticleSize;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleSize.prototype, "ParticleStartSize", void 0);
__decorate([
    ParticleEffectorPropertyNumber,
    ParticleEffectorPropertyNullable
], ParticleSize.prototype, "ParticleStartAgeSizeChange", void 0);
__decorate([
    ParticleEffectorPropertyNumber,
    ParticleEffectorPropertyNullable
], ParticleSize.prototype, "ParticleEndSize", void 0);
ParticleSize = __decorate([
    ParticleEffectorClass
], ParticleSize);
var sparcles = {};
var ParticleSparkle = (function () {
    function ParticleSparkle() {
    }
    ParticleSparkle.GetSparkle = function (color) {
        var c = ParticleBlob.ColorReduce(ParticleBlob.GetColorComponents(color));
        var cs = ParticleBlob.GetColorString(c);
        if (sparcles[cs])
            return sparcles[cs];
        sparcles[cs] = ParticleSparkle.CreateSparkle(20, 20, c.r, c.g, c.b);
        return sparcles[cs];
    };
    ParticleSparkle.CreateSparkle = function (width, height, r, g, b) {
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
        var imgData = ctx.createImageData(width, height);
        var side = (width / 2);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var op = Math.abs(side - x);
                var ad = Math.abs(side - y);
                var d = (side - Math.sqrt(op * op + ad * ad)) / side;
                d *= (ad * ad <= side * 0.01 || op * op <= side * 0.01 || (op - ad) * (op - ad) <= side * 0.01 ? 1 : 0);
                var p = (x + y * width) * 4;
                if (d <= 0)
                    d = 0;
                else
                    d = Math.max(0, Math.min(255, Math.floor(255 * d)));
                imgData.data[p + 0] = r;
                imgData.data[p + 1] = g;
                imgData.data[p + 2] = b;
                imgData.data[p + 3] = d;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        var image = new Image();
        image.src = c.toDataURL("image/png");
        return image;
    };
    return ParticleSparkle;
}());
/// <reference path="ParticleSystem.ts" />
var ParticleWave = (function () {
    function ParticleWave() {
        this.Strength = 0.005;
        this.FrequencyAlphaX = 20;
        this.FrequencyAlphaY = 20;
        this.FrequencyBetaX = 10;
        this.FrequencyBetaY = 10;
        this.AgeFactor = 0.5;
    }
    ParticleWave.prototype.Handle = function (p) {
        var age = (p.System.Age + p.System.RandomId) * this.AgeFactor;
        var ax = p.X + age;
        var ay = p.Y + age;
        var bx = p.X - age;
        var by = p.Y - age;
        var a = Math.sin(ax / this.FrequencyAlphaX) + Math.sin(bx / this.FrequencyBetaX) * 0.5 + Math.cos(ay / this.FrequencyAlphaY) + Math.cos(by / this.FrequencyBetaY) * 0.5;
        p.VX += this.Strength * Math.cos(a);
        p.VY += this.Strength * Math.sin(a);
        /*p.VX += Math.cos(ed) * s;
        p.VY += Math.sin(ed) * s;*/
    };
    ParticleWave.prototype.Draw = function (ctx) {
    };
    return ParticleWave;
}());
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "Strength", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "FrequencyAlphaX", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "FrequencyAlphaY", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "FrequencyBetaX", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "FrequencyBetaY", void 0);
__decorate([
    ParticleEffectorPropertyNumber
], ParticleWave.prototype, "AgeFactor", void 0);
ParticleWave = __decorate([
    ParticleEffectorClass
], ParticleWave);
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
var DefaultSkills = (function () {
    function DefaultSkills() {
    }
    DefaultSkills.Generate = function (game) {
        game.Skills = [];
        var baseSkill = null;
        for (var i = 0; i < skillCodes.length; i++) {
            var skill = new KnownSkill();
            skill.Parse(skillCodes[i], false);
            skill.Name = skill.Code.CodeVariables["name"].value;
            skill.AutoReceive = (skill.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
            if (skill.Name.toLowerCase() == "attack")
                baseSkill = skill;
            game.Skills.push(skill);
        }
        for (var i = 0; i < game.Skills.length; i++) {
            if (game.Skills[i].Name.toLowerCase() != "attack")
                game.Skills[i].BaseSkill = baseSkill;
        }
    };
    return DefaultSkills;
}());
var KnownSkill = (function () {
    function KnownSkill() {
        this.AutoReceive = false;
    }
    KnownSkill.prototype.Parse = function (sourceCode, withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        this.SourceCode = sourceCode.replace(/^\/\/\/.*$/mg, "").replace(/(\s*\r?\n){3,}/g, "\n\n");
        this.Code = CodeParser.Parse(sourceCode, withVerify);
    };
    KnownSkill.prototype.Verify = function () {
        var c = CodeParser.Parse(this.FullCode(), true);
    };
    KnownSkill.prototype.CodeVariable = function (name) {
        var result = this.Code.CodeVariables[name.toLowerCase()];
        if (result)
            return result.value;
        return null;
    };
    KnownSkill.prototype.CodeVariables = function () {
        var code = "";
        for (var i in this.Code.CodeVariables)
            code += "/// " + this.Code.CodeVariables[i].name + ": " + this.Code.CodeVariables[i].value + "," + this.Code.CodeVariables[i].type + "\n";
        return code;
    };
    KnownSkill.prototype.FullCode = function () {
        return this.CodeVariables() + this.SourceCode;
    };
    KnownSkill.prototype.UpdateCodeVariables = function () {
        this.Parse(this.FullCode());
        this.Name = this.Code.CodeVariables["name"].value;
        this.AutoReceive = (this.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
    };
    KnownSkill.prototype.InvokeFunction = function (functionName, values) {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        if (this.BaseSkill && this.BaseSkill.Code.HasFunction(functionName)) {
            this.BaseSkill.Code.ParentCode = this.Code;
            return this.BaseSkill.Code.ExecuteFunction(functionName, values);
        }
        return null;
    };
    KnownSkill.prototype.Store = function () {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            Auto: this.AutoReceive
        };
    };
    KnownSkill.Rebuild = function (source, alertWhileParsing) {
        if (alertWhileParsing === void 0) { alertWhileParsing = true; }
        if (typeof source == "string") {
            var result = new KnownSkill();
            try {
                result.Parse(source, false);
                result.Name = result.Code.CodeVariables["name"].value;
                if (result.Code.CodeVariables["quicksloteditable"] === null || result.Code.CodeVariables["quicksloteditable"] === undefined)
                    result.Code.CodeVariables["quicksloteditable"] = {
                        name: "QuickslotEditable",
                        type: "boolean",
                        value: (result.Name == "Attack" ? "false" : "true"),
                    };
                result.AutoReceive = (result.Code.CodeVariables["autoreceive"].value.trim().toLowerCase() == "true");
            }
            catch (ex) {
                Framework.Alert("Error while rebuilding skill: " + ex);
            }
            return result;
        }
        else {
            var result = new KnownSkill();
            if (alertWhileParsing) {
                try {
                    result.Parse(source.Source, false);
                }
                catch (ex) {
                    Framework.Alert("Error while rebuilding skill '" + source.Name + "': " + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false);
            result.Name = source.Name;
            if (result.Code.CodeVariables["quicksloteditable"] === null || result.Code.CodeVariables["quicksloteditable"] === undefined)
                result.Code.CodeVariables["quicksloteditable"] = {
                    name: "QuickslotEditable",
                    type: "boolean",
                    value: (result.Name == "Attack" ? "false" : "true"),
                };
            result.AutoReceive = source.Auto;
            return result;
        }
    };
    return KnownSkill;
}());
var Skill = (function () {
    function Skill() {
    }
    return Skill;
}());
var sounds = {};
var Sounds = (function () {
    function Sounds() {
    }
    Sounds.Init = function (clearAtStart) {
        if (clearAtStart === void 0) { clearAtStart = true; }
        if (clearAtStart)
            Sounds.ClearSound();
        if (!world.art.sounds)
            return;
        for (var item in world.art.sounds)
            Sounds.Load(item, world.art.sounds[item].mp3, world.art.sounds[item].ogg);
    };
    Sounds.ClearSound = function () {
        /*var soundArea = $('#sounds').first();
        while (soundArea.firstChild != null)
            soundArea.removeChild(soundArea.firstChild);
        sounds = {};*/
        for (var item in sounds) {
            for (var i = 0; i < sounds[item].stack; i++) {
                try {
                    sounds[item].sounds[i].pause();
                    sounds[item].sounds[i].currentTime = 0;
                }
                catch (ex) {
                }
            }
        }
        Sounds.Init(false);
    };
    Sounds.Load = function (name, mp3, ogg, stack) {
        name = name.id();
        if (document.getElementById("sound_" + name + "_" + 0))
            return;
        var soundArea = $('#sounds').first();
        if (!stack)
            stack = 6;
        var audioStack = { round: 0, stack: stack, sounds: [] };
        for (var i = 0; i < stack; i++) {
            var audio = document.createElement('audio');
            var source = document.createElement('source');
            if (("" + document.location).substr(0, 5) == "file:" && mp3 != null && mp3 != undefined && mp3.charAt(0) == '/')
                source.src = mp3.substr(1);
            else
                source.src = mp3;
            source.type = "audio/mpeg";
            audio.appendChild(source);
            audio.id = "sound_" + name + "_" + i;
            soundArea.appendChild(audio);
            audio.oncanplay = function () {
                audio['loaded'] = true;
            };
            audioStack.sounds[i] = audio;
        }
        sounds[name] = audioStack;
    };
    Sounds.Play = function (name, volume, looped) {
        if (volume === void 0) { volume = 0.6; }
        if (looped === void 0) { looped = false; }
        name = name.id();
        var browser = "";
        if (("" + navigator.userAgent).toLowerCase().indexOf("chrome") != -1)
            browser = "Chrome";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("msie") != -1)
            browser = "Internet Explorer";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("opera") != -1)
            browser = "Opera";
        else if (("" + navigator.userAgent).toLowerCase().indexOf("firefox") != -1)
            browser = "Firefox";
        var s = null;
        try {
            if (sounds[name].stack == null || sounds[name].stack == undefined) {
                s = sounds[name];
            }
            else {
                try {
                    sounds[name].sounds[sounds[name].round].currentTime = 0;
                }
                catch (ex2) {
                }
                if (browser == "Chrome")
                    sounds[name].sounds[sounds[name].round].load();
                sounds[name].round = (sounds[name].round + 1) % sounds[name].stack;
                s = sounds[name].sounds[sounds[name].round];
            }
            s.loop = looped;
            try {
                s.currentTime = 0;
            }
            catch (ex2) {
            }
            s.volume = volume;
            s.play();
        }
        catch (ex) {
        }
    };
    return Sounds;
}());
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
",
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
var DefaultStats = (function () {
    function DefaultStats() {
    }
    DefaultStats.Generate = function (game) {
        game.Stats = [];
        for (var i = 0; i < statCodes.length; i++) {
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
    };
    return DefaultStats;
}());
var KnownStat = (function () {
    function KnownStat() {
        this.MonsterStat = false;
    }
    KnownStat.prototype.Parse = function (sourceCode, withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        this.SourceCode = sourceCode.replace(/^\/\/\/.*$/mg, "").replace(/(\s*\r?\n){3,}/g, "\n\n");
        this.Code = CodeParser.Parse(sourceCode, withVerify);
    };
    KnownStat.prototype.Verify = function () {
        var c = CodeParser.Parse(this.FullCode(), true);
    };
    KnownStat.prototype.CodeVariable = function (name) {
        var result = this.Code.CodeVariables[name.toLowerCase()];
        if (result)
            return result.value;
        return null;
    };
    KnownStat.prototype.CodeVariables = function () {
        var code = "";
        for (var i in this.Code.CodeVariables)
            code += "/// " + this.Code.CodeVariables[i].name + ": " + this.Code.CodeVariables[i].value + "," + this.Code.CodeVariables[i].type + "\n";
        return code;
    };
    KnownStat.prototype.FullCode = function () {
        return this.CodeVariables() + this.SourceCode;
    };
    KnownStat.prototype.UpdateCodeVariables = function () {
        this.Parse(this.FullCode());
        if (this.Code.CodeVariables["name"])
            this.Name = this.Code.CodeVariables["name"].value;
        if (this.Code.CodeVariables["defaultvalue"])
            this.DefaultValue = parseFloat(this.Code.CodeVariables["defaultvalue"].value);
        if (this.Code.CodeVariables["monsterstat"])
            this.MonsterStat = (this.Code.CodeVariables["monsterstat"].value.trim().toLowerCase() == "true" ? true : false);
    };
    KnownStat.prototype.InvokeFunction = function (functionName, values) {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        return null;
    };
    KnownStat.prototype.Store = function () {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            DefaultValue: this.DefaultValue,
            MonsterStat: this.MonsterStat
        };
    };
    KnownStat.Rebuild = function (source, alertWhileParsing) {
        if (alertWhileParsing === void 0) { alertWhileParsing = true; }
        if (typeof source == "string") {
            var result = new KnownStat();
            try {
                result.Parse(source, false);
                if (result.Code.CodeVariables["name"])
                    result.Name = result.Code.CodeVariables["name"].value;
                if (result.Code.CodeVariables["defaultvalue"])
                    result.DefaultValue = parseFloat(result.Code.CodeVariables["defaultvalue"].value);
                if (result.Code.CodeVariables["monsterstat"])
                    result.MonsterStat = (result.Code.CodeVariables["monsterstat"].value.trim().toLowerCase() == "true" ? true : false);
            }
            catch (ex) {
                Framework.Alert("Error while parsing stat " + ex);
            }
            return result;
        }
        else {
            var result = new KnownStat();
            if (alertWhileParsing) {
                try {
                    result.Parse(source.Source, false);
                }
                catch (ex) {
                    Framework.Alert("Error while rebuilding stat '" + source.Name + "':" + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false);
            result.Name = source.Name;
            result.MonsterStat = source.MonsterStat;
            result.DefaultValue = source.DefaultValue;
            return result;
        }
    };
    return KnownStat;
}());
var Stat = (function () {
    function Stat() {
    }
    return Stat;
}());
var RunningEffect = (function () {
    function RunningEffect() {
    }
    return RunningEffect;
}());
var TemporaryEffect = (function () {
    function TemporaryEffect() {
        this.MultipleInstance = true;
        this.Timer = 30;
        this.StartActions = [];
        this.EndActions = [];
        this.RecurringTimer = 0;
        this.RecurringActions = [];
    }
    return TemporaryEffect;
}());
var areaFragment = new ((function () {
    function class_7() {
    }
    return class_7;
}()));
var AreaFragment = (function () {
    function AreaFragment() {
        this.backgroundTiles = [];
        this.objects = [];
        this.monsters = [];
        this.actors = [];
        this.houses = [];
        this.storedMonsters = [];
    }
    AreaFragment.CreateFragment = function (world, area, areaX, areaY, zoneName) {
        var result = new AreaFragment();
        var zone = world.GetZone(zoneName);
        var check = (areaFragment.canRunFragment ? areaFragment.canRunFragment : AreaFragment.DefaultCanRunFragment);
        if (zone.MapFragments)
            for (var i = 0; i < zone.MapFragments.length; i++) {
                var fragment = zone.MapFragments[i];
                if ((check && !check(fragment)) || (!check && !AreaFragment.DefaultCanRunFragment(fragment)))
                    continue;
                for (var j = 0; j < fragment.Modifications.length; j++) {
                    var modification = fragment.Modifications[j];
                    if (modification.AX != areaX || modification.AY != areaY)
                        continue;
                    switch (fragment.Modifications[j].Action) {
                        case "tile":
                            result.backgroundTiles[modification.X + modification.Y * world.areaWidth] = modification.Value;
                            break;
                        case "object":
                            result.objects.push(new WorldObject(modification.Value, modification.X, modification.Y));
                            break;
                        case "monster":
                            var m = { Name: modification.Value.Name, X: modification.X, Y: modification.Y, RespawnTime: modification.Value.RespawnTime };
                            m['fragId'] = fragment.Name + "_" + j;
                            result.monsters.push(m);
                            break;
                        case "npc":
                            result.actors.push(NPCActor.Create(world.GetNPC(modification.Value), area, modification.X, modification.Y));
                            break;
                        case "house":
                            result.houses.push(new WorldHouse(modification.Value, modification.X, modification.Y));
                            break;
                        default:
                            break;
                    }
                }
            }
        return result;
    };
    AreaFragment.DefaultCanRunFragment = function (fragment) {
        for (var i = 0; i < fragment.Conditions.length; i++)
            if (!dialogCondition.code[fragment.Conditions[i].Name].Check(fragment.Conditions[i].Values))
                return false;
        return true;
    };
    AreaFragment.AllCurrentFragments = function (zoneName) {
        var fragments = [];
        var zone = world.GetZone(zoneName);
        if (!zone.MapFragments)
            return "";
        for (var i = 0; i < zone.MapFragments.length; i++) {
            for (var i = 0; i < zone.MapFragments.length; i++)
                if ((areaFragment.canRunFragment && areaFragment.canRunFragment(zone.MapFragments[i])) || (!areaFragment.canRunFragment && AreaFragment.DefaultCanRunFragment(zone.MapFragments[i])))
                    fragments.push(zone.MapFragments[i].Name);
        }
        fragments.sort();
        return fragments.join(",");
    };
    return AreaFragment;
}());
var MapAction = (function () {
    function MapAction() {
        this.Actions = [];
        this.Conditions = [];
    }
    MapAction.Restore = function (source, area) {
        var result = new MapAction();
        result.X = source.X;
        result.Y = source.Y;
        result.Actions = source.Actions;
        result.Conditions = source.Conditions;
        if (source.Size !== null && source.Size !== undefined)
            result.Size = source.Size;
        result.Area = area;
        return result;
    };
    MapAction.prototype.Store = function () {
        return { X: this.X, Y: this.Y, Size: this.Size, Actions: this.Actions, Conditions: this.Conditions };
    };
    MapAction.prototype.Display = function () {
        var html = "";
        html += "<style>#mapActionPosition { width: 100%; } #mapActionPosition tr td:nth-child(odd) { width: 50px; font-weight: bold; white-space: nowrap;}#mapActionPosition tr td:nth-child(even) { width: 30%;} #mapActionPosition input { width: 100%; }</style>";
        html += "<table id='mapActionPosition'><tr><td>Position X:</td><td><input type='text' value='" + this.X + "' id='mapActionX' onkeyup='MapAction.ChangeActionX()' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Y:</td><td><input type='text' value='" + this.Y + "' id='mapActionY' onkeyup='MapAction.ChangeActionY()' onfocus='play.inField=true;' onblur='play.inField=false;'></td>";
        html += "<td>Effect size:</td><td><select id='mapActionSize' onchange='MapAction.ChangeSize()'>";
        var sizes = ["Small", "Medium", "Large"];
        if (this.Size === null || this.Size === undefined)
            this.Size = 1;
        for (var i = 0; i < sizes.length; i++) {
            html += "<option value='" + i + "'" + (i == this.Size ? " selected" : "") + ">" + sizes[i] + "</option>";
        }
        html += "</select></td></tr></table>";
        html += "<br>";
        html += "<b>Conditions:</b><br>";
        for (var j = 0; j < this.Conditions.length; j++) {
            var cond = this.Conditions[j];
            html += "<span class='dialogBlock'>";
            html += "<div class='dialogBlockDelete' onclick='MapAction.DeleteCondition(" + j + ")'>X</div>";
            html += "<b>" + cond.Name.title() + ":</b><br>";
            html += dialogCondition.code[cond.Name].Display(j, cond.Values);
            html += "</span>";
        }
        html += "<select onchange='MapAction.AddCondition()' id='addCondition'>";
        html += "<option>-- Select new condition --</option>";
        for (var item in dialogCondition.code)
            html += "<option value='" + item + "'>" + item.title() + "</option>";
        html += "</select>";
        html += "<b>Actions:</b><br>";
        for (var j = 0; j < this.Actions.length; j++) {
            var action = this.Actions[j];
            html += "<span class='dialogBlock'>";
            html += "<div class='dialogBlockDelete' onclick='MapAction.DeleteAction(" + j + ")'>X</div>";
            html += "<b>" + action.Name.title() + ":</b><br>";
            html += dialogAction.code[action.Name].Display(j, action.Values);
            html += "</span>";
        }
        html += "<select onchange='MapAction.AddAction()' id='addAction'>";
        html += "<option>-- Select new action --</option>";
        for (var item in dialogAction.code)
            html += "<option value='" + item + "'>" + item.title() + "</option>";
        html += "</select>";
        html += "<br>";
        html += "<center>";
        html += "<div class='button' onclick='MapAction.DeleteMapAction()'>Delete Map Action</div>";
        html += "</center>";
        $("#mapEditorActions").html(html);
    };
    MapAction.ChangeSize = function () {
        mapEditor.currentMapAction.Size = parseInt($("#mapActionSize").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    };
    MapAction.DeleteCondition = function (rowId) {
        mapEditor.currentMapAction.Conditions.splice(rowId, 1);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    };
    MapAction.DeleteAction = function (rowId) {
        mapEditor.currentMapAction.Actions.splice(rowId, 1);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    };
    MapAction.prototype.Check = function () {
        for (var i = 0; i < this.Conditions.length; i++)
            if (!dialogCondition.code[this.Conditions[i].Name].Check(this.Conditions[i].Values))
                return false;
        return true;
    };
    MapAction.prototype.Execute = function () {
        for (var i = 0; i < this.Actions.length; i++)
            dialogAction.code[this.Actions[i].Name].Execute(this.Actions[i].Values);
    };
    MapAction.AddCondition = function () {
        var condition = new DialogCondition();
        condition.Name = $("#addCondition").val();
        mapEditor.currentMapAction.Conditions.push(condition);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    };
    MapAction.AddAction = function () {
        var action = new DialogAction();
        action.Name = $("#addAction").val();
        mapEditor.currentMapAction.Actions.push(action);
        mapEditor.currentMapAction.Display();
        mapEditor.currentMapAction.Area.edited = true;
    };
    MapAction.DeleteMapAction = function () {
        Framework.Confirm("Are you sure you want to delete this map action?", function () {
            for (var i = 0; i < mapEditor.currentMapAction.Area.mapActions.length; i++) {
                if (mapEditor.currentMapAction.Area.mapActions[i] == mapEditor.currentMapAction) {
                    mapEditor.currentMapAction.Area.edited = true;
                    mapEditor.currentMapAction.Area.mapActions.splice(i, 1);
                    mapEditor.currentMapAction = null;
                    $("#mapEditorActions").html("");
                    mapEditor.modified = true;
                    return;
                }
            }
        });
    };
    MapAction.ChangeActionX = function () {
        mapEditor.currentMapAction.X = parseInt($("#mapActionX").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    };
    MapAction.ChangeActionY = function () {
        mapEditor.currentMapAction.Y = parseInt($("#mapActionY").val());
        mapEditor.currentMapAction.Area.edited = true;
        mapEditor.modified = true;
    };
    MapAction.ChangeCondition = function (id, position) {
        mapEditor.currentMapAction.Conditions[id].Values[position] = $("#condition_" + id + "_" + position).val();
        mapEditor.currentMapAction.Area.edited = true;
    };
    MapAction.ChangeAction = function (id, position) {
        mapEditor.currentMapAction.Actions[id].Values[position] = $("#action_" + id + "_" + position).val();
        mapEditor.currentMapAction.Area.edited = true;
    };
    return MapAction;
}());
var MapFragment = (function () {
    function MapFragment() {
        this.Conditions = [];
        this.Modifications = [];
    }
    return MapFragment;
}());
var MapModification = (function () {
    function MapModification() {
    }
    return MapModification;
}());
var mapUtilities = new ((function () {
    function class_8() {
        this.openModifications = [];
    }
    return class_8;
}()));
var MapUtilities = (function () {
    function MapUtilities() {
    }
    MapUtilities.Modify = function (what, oldName, newName) {
        // Make the first letter an upper case
        what = what.toLowerCase();
        what = what[0].toUpperCase() + what.substr(1);
        // Don't call the server on each keystroke, wait 5sec from the last modification then call it.
        if (mapUtilities.serverCallTimeout)
            clearTimeout(mapUtilities.serverCallTimeout);
        mapUtilities.serverCallTimeout = setTimeout(MapUtilities.ServerCall, 5000);
        var found = false;
        for (var i = 0; i < mapUtilities.openModifications.length; i++) {
            if (mapUtilities.openModifications[i].what == what && mapUtilities.openModifications[i].newName == oldName) {
                // basically no change? We drop the change
                if (mapUtilities.openModifications[i].oldName == newName)
                    mapUtilities.openModifications.splice(i, 1);
                else
                    mapUtilities.openModifications[i].newName = newName;
                found = true;
                break;
            }
        }
        if (!found)
            mapUtilities.openModifications.push({
                what: what,
                oldName: oldName,
                newName: newName
            });
        if (mapUtilities.openModifications.length == 0) {
            clearTimeout(mapUtilities.serverCallTimeout);
            mapUtilities.serverCallTimeout = null;
        }
    };
    MapUtilities.ServerCall = function () {
        mapUtilities.serverCallTimeout = null;
        var change = mapUtilities.openModifications.shift();
        // We still have to do
        if (mapUtilities.openModifications.length > 0)
            mapUtilities.serverCallTimeout = setTimeout(MapUtilities.ServerCall, 5000);
        var data = {
            game: world.Id,
            token: framework.Preferences['token']
        };
        data["old" + change.what] = change.oldName;
        if (change.newName)
            data["new" + change.what] = change.newName;
        $.ajax({
            type: 'POST',
            url: '/backend/UpdateMapDetails',
            data: data,
            success: function (msg) {
                if (TryParse(msg) == true) {
                    Framework.ShowMessage("Map modified.");
                    world.ResetAreas();
                    mapEditor.modified = true;
                }
            },
            error: function (msg, textStatus) {
                var message = TryParse(msg);
                if (message && message.error)
                    msg = message.error;
                Framework.Alert("Error: " + msg);
            }
        });
    };
    return MapUtilities;
}());
var defaultTilesets = {};
/// <reference path="TilesetInformation.ts" />
/// <reference path="../../Libs/Point.ts" />
var game = null;
// Web Worker thread
var workerGenerator = null;
onmessage = function (message) {
    if (!message || !message.data || !message.data.action || message.data.action != "generate")
        return;
    var zoneInfo = message.data.zoneInfo;
    var gameId = message.data.gameId;
    var x = message.data.x;
    var y = message.data.y;
    var zone = message.data.zone;
    var world = World.Rebuild(message.data.world);
    self['world'] = world;
    var generator = new (self[zoneInfo.Generator + "Generator"])(world, "Game_" + gameId, zoneInfo);
    var area = generator.Generate(x, y, zone);
    self['post' + 'Message']({ x: x, y: y, zone: zone, area: area.Stringify() });
};
var EditorEdition;
(function (EditorEdition) {
    EditorEdition[EditorEdition["Demo"] = 0] = "Demo";
    EditorEdition[EditorEdition["Standard"] = 1] = "Standard";
})(EditorEdition || (EditorEdition = {}));
var World = (function () {
    function World() {
        this.areaWidth = 100;
        this.areaHeight = 100;
        this.editMode = false;
        this.ShowFPS = false;
        this.ChatEnabled = true;
        this.ChatSmilies = true;
        this.ChatLink = true;
        this.PublicView = false;
        this.Skills = null;
        this.Stats = null;
        this.Monsters = null;
        this.NPCs = [];
        this.Houses = null;
        this.Zones = null;
        this.InventorySlots = null;
        this.InventoryObjects = null;
        this.InventoryObjectTypes = null;
        this.InitializeSteps = null;
        this.StartLook = "male_1";
        this.SmallBagObject = "small_bag";
        this.Edition = EditorEdition.Demo;
        this.TemporaryEffects = [];
        this.Quests = [];
        this.Codes = [];
        this.ChatBots = [];
        this.SimplifiedObjectLogic = true;
        this.ShowInventory = true;
        this.ShowStats = true;
        this.ShowJournal = true;
        this.ShowMessage = true;
        this.ReadyToSave = true;
        this.SpawnPoint = null;
        this.seed = "ThisIsMyFirstSeed";
        this.initDone = false;
        this.lastRequest = null;
        this.lastArea = null;
        this.currentCenter = null;
        this.areasToLoad = [];
        this.currentLoading = 0;
        this.totAreaToLoad = 0;
    }
    World.SetGame = function (data) {
        game = data;
    };
    World.prototype.Init = function () {
        var _this = this;
        if (!this.art)
            this.art = defaultTilesets['tileset2'];
        if (!this.art.panelStyle)
            this.art.panelStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].panelStyle));
        if (!this.art.quickslotStyle)
            this.art.quickslotStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].quickslotStyle));
        if (!this.art.statBarStyle)
            this.art.statBarStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].statBarStyle));
        if (!this.art.background.paths)
            this.art.background.paths = {};
        if (!this.Houses)
            this.Houses = this.art.houses;
        if (!this.StartLook)
            this.StartLook = "male_1";
        if (!this.SmallBagObject)
            this.SmallBagObject = "small_bag";
        if (!this.art.sounds)
            this.art.sounds = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].sounds));
        if (!this.ParticleEffects)
            this.ParticleEffects = defaultParticleSystems;
        if (this.PublicView !== true)
            this.PublicView = false;
        this.areas = [];
        if (!this.InventoryObjects)
            this.InventoryObjects = KnownObject.DefaultObjects();
        if (!this.InventoryObjectTypes)
            this.InventoryObjectTypes = ObjectType.DefaultObjectType();
        if (!this.InventorySlots)
            this.InventorySlots = InventorySlot.DefaultSlots();
        if (!this.Skills)
            DefaultSkills.Generate(this);
        if (!this.Stats)
            DefaultStats.Generate(this);
        if (!this.Monsters)
            DefaultMonsters.Generate(this);
        if (!this.SpawnPoint)
            this.SpawnPoint = { X: 0, Y: 0, Zone: "Base" };
        if (!this.NPCs) {
            this.NPCs = [];
            this.NPCs.push(NPC.Generate());
        }
        if (!this.Zones || this.Zones.length == 0) {
            this.Zones = [];
            var zone = new WorldZone();
            zone.Name = "Base";
            zone.BaseTileType = this.art.background.mainType;
            zone.Generator = "Perlin";
            zone.GeneratorParameters = PerlinGenerator.DefaultParameters();
            zone.Monsters = [];
            zone.Monsters.push({ Name: "Rat", PlaceOn: ["grass"], Frequency: 0.2 });
            zone.Monsters.push({ Name: "Brown bear", PlaceOn: ["grass"], Frequency: 0.05 });
            zone.Objects = [];
            zone.Objects.push({ Name: "smallGrass_1", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "mediumGrass_1", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "mediumGrass_2", PlaceOn: ["grass"], Frequency: 3 });
            zone.Objects.push({ Name: "flower_1", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "flower_2", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "flower_3", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_1", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_2", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_3", PlaceOn: ["grass"], Frequency: 0.1 });
            zone.Objects.push({ Name: "tree_4", PlaceOn: ["grass"], Frequency: 0.1 });
            this.Zones.push(zone);
        }
        $("#mapLoadingPage").show();
        this.Player = new Player(this);
        this.Player.Name = this.StartLook;
        this.Player.Username = framework.Preferences['user'];
        this.Player.Initialize(function () {
            _this.VisibleCenter(_this.Player.AX, _this.Player.AY, _this.Player.Zone);
            _this.Player.CurrentArea = _this.GetArea(_this.Player.AX, _this.Player.AY, _this.Player.Zone);
            if (_this.Player.CurrentArea)
                _this.Player.CurrentArea.actors.push(_this.Player);
            _this.initDone = true;
            if (!_this.IsLoading()) {
                $("#mapLoadingPage").hide();
                _this.totAreaToLoad = 0;
            }
        });
        //if(
    };
    World.prototype.GetMonster = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Monsters.length; i++)
            if (this.Monsters[i].Name.toLowerCase() == lname)
                return this.Monsters[i];
        return null;
    };
    World.prototype.GetCode = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Codes.length; i++)
            if (this.Codes[i].Name.toLowerCase() == lname)
                return this.Codes[i];
        return null;
    };
    World.prototype.GetSkill = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Skills.length; i++)
            if (this.Skills[i].Name.toLowerCase() == lname)
                return this.Skills[i];
        return null;
    };
    World.prototype.GetStat = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Stats.length; i++)
            if (this.Stats[i].Name.toLowerCase() == lname)
                return this.Stats[i];
        return null;
    };
    World.prototype.GetNPC = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.NPCs.length; i++)
            if (this.NPCs[i].Name.toLowerCase() == lname)
                return this.NPCs[i];
        return null;
    };
    World.prototype.GetHouse = function (name) {
        var lname = name.toLowerCase();
        return this.Houses[lname];
    };
    World.prototype.GetZone = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Zones.length; i++)
            if (this.Zones[i].Name.toLowerCase() == lname)
                return this.Zones[i];
        return null;
    };
    World.prototype.GetTemporaryEffect = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.TemporaryEffects.length; i++)
            if (this.TemporaryEffects[i].Name.toLowerCase() == lname)
                return this.TemporaryEffects[i];
        return null;
    };
    World.prototype.GetInventoryObject = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventoryObjects.length; i++)
            if (this.InventoryObjects[i].Name.toLowerCase() == lname)
                return this.InventoryObjects[i];
        return null;
    };
    World.prototype.GetInventoryObjectType = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventoryObjectTypes.length; i++)
            if (this.InventoryObjectTypes[i].Name.toLowerCase() == lname)
                return this.InventoryObjectTypes[i];
        return null;
    };
    World.prototype.GetInventorySlot = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.InventorySlots.length; i++)
            if (this.InventorySlots[i].Name.toLowerCase() == lname)
                return this.InventorySlots[i];
        return null;
    };
    World.prototype.GetQuest = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return this.Quests[i];
        return null;
    };
    World.prototype.GetParticleSystem = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.ParticleEffects.length; i++)
            if (this.ParticleEffects[i].Name.toLowerCase() == lname)
                return ParticleSystem.Rebuild(this.ParticleEffects[i]);
        return null;
    };
    World.prototype.CountActors = function () {
        var nb = 0;
        for (var i = 0; i < this.areas.length; i++)
            nb += this.areas[i].actors.length;
        return nb;
    };
    World.prototype.HasArea = function (x, y, zone) {
        for (var i = 0; i < this.areas.length; i++)
            if (this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone)
                return true;
        return false;
    };
    World.prototype.VisibleCenter = function (x, y, zone, force) {
        if (force === void 0) { force = false; }
        if (!force && this.currentCenter && this.currentCenter.Zone == zone && this.currentCenter.X == x && this.currentCenter.Y == y)
            return;
        this.currentCenter = { X: x, Y: y, Zone: zone };
        // Let's cleanup those which are out of range...
        for (var i = 0; i < this.areas.length;) {
            if ((Math.abs(this.areas[i].X - x) > 1 || Math.abs(this.areas[i].Y - y) > 1 || this.areas[i].Zone != zone) && this.areas[i].edited == false)
                this.areas.splice(i, 1);
            else
                i++;
        }
        // Now let's add the missing one
        for (var a = -1; a < 2; a++)
            for (var b = -1; b < 2; b++)
                if (!this.HasArea(a + x, b + y, zone))
                    this.LoadArea(a + x, b + y, zone);
    };
    World.prototype.ResetFragments = function () {
        for (var i = 0; i < this.areas.length; i++)
            this.areas[i].ResetFragments();
    };
    World.prototype.GetArea = function (x, y, zone) {
        if (!this.areas)
            return null;
        if (this.lastRequest && this.lastRequest.X == x && this.lastRequest.Y == y && this.lastRequest.Zone == zone)
            return this.lastArea;
        for (var i = 0; i < this.areas.length; i++) {
            if (this.areas[i] && this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone) {
                this.lastRequest = { X: x, Y: y, Zone: zone };
                this.lastArea = this.areas[i];
                return this.areas[i];
            }
        }
        return null;
    };
    World.prototype.CountAreaToLoad = function () {
        return this.areasToLoad.length;
    };
    World.prototype.IsLoading = function () {
        if (play.renderer) {
            if (this.areasToLoad.length > 0 || this.currentLoading > 0 || this.ActiveWorkers() > 0) {
                var v = (this.totAreaToLoad - this.areasToLoad.length) * 100 / this.totAreaToLoad;
                $("#mapLoadingPage").html("<div>Loading maps... " + Math.round(v) + "%</div>");
            }
            else {
                var v = play.renderer.loaded * 100 / play.renderer.toLoad;
                $("#mapLoadingPage").html("<div>Loading art... " + Math.round(v) + "%</div>");
            }
        }
        if (workerGenerator) {
            //if ((this.areasToLoad && this.areasToLoad.length > 5) || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()) || this.ActiveWorkers() > 3)
            if ((this.areasToLoad && this.areasToLoad.length > 0) || this.currentLoading > 0 || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()) || this.ActiveWorkers() > 0)
                return true;
        }
        else {
            if ((this.areasToLoad && this.areasToLoad.length) || this.currentLoading != 0 || !this.initDone || (play.renderer && !play.renderer.IsAllLoaded()))
                return true;
        }
        return false;
    };
    World.prototype.LoadArea = function (x, y, zone) {
        // It's a temp world, we should not check on the server
        //if (this.Id == -1 && !Main.CheckNW())
        if (this.Id == -1) {
            this.SetArea(x, y, zone, this.GetGenerator(zone).Generate(x, y, zone));
            return;
        }
        // Skip multiple loads
        for (var i = 0; i < this.areasToLoad.length; i++)
            if (this.areasToLoad[i].X == x && this.areasToLoad[i].Y == y && this.areasToLoad[i].Zone == zone)
                return;
        this.totAreaToLoad++;
        this.areasToLoad.push({ X: x, Y: y, Zone: zone });
        if (this.areasToLoad.length > 6 || this.ActiveWorkers() > 3 || this.currentLoading > 3) {
            $("#mapLoadingPage").show();
        }
        if (this.currentLoading < Main.NbCores())
            this.DoLoad();
    };
    World.prototype.ActiveWorkers = function () {
        if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW())) {
            var nb = 0;
            if (!workerGenerator)
                return Main.NbCores();
            for (var i = 0; i < Main.NbCores(); i++)
                if (workerGenerator[i].isRunning)
                    nb++;
            return nb;
        }
        return 0;
    };
    World.prototype.ResetAreas = function () {
        this.areas = [];
        this.lastRequest = null;
        this.lastArea = null;
        if (this.currentCenter)
            this.VisibleCenter(this.currentCenter.X, this.currentCenter.Y, this.currentCenter.Zone, true);
        this.Player.CurrentArea = this.GetArea(this.Player.AX, this.Player.AY, this.Player.Zone);
        if (this.Player.CurrentArea)
            this.Player.CurrentArea.actors.push(this.Player);
    };
    World.prototype.ResetGenerator = function () {
        this.generator = null;
        this.previousZone = null;
    };
    World.prototype.GetGenerator = function (zoneName) {
        if (!this.generator || this.previousZone != zoneName) {
            var zoneInfo = this.GetZone(zoneName);
            this.generator = new (window[zoneInfo.Generator + "Generator"])(this, "Game_" + this.Id, zoneInfo);
            this.previousZone = zoneName;
        }
        return this.generator;
    };
    World.prototype.PreloadArt = function (area) {
        if (!play.renderer)
            return;
        for (var i = 0; i < area.objects.length; i++)
            play.renderer.GetObjectImage(area.objects[i].Name);
        for (var i = 0; i < area.actors.length; i++)
            if (area.actors[i].Name)
                play.renderer.GetActorImage(area.actors[i].Name);
    };
    World.prototype.DoLoad = function () {
        var _this = this;
        if (this.areasToLoad.length == 0) {
            if (!this.IsLoading() && this.ActiveWorkers() < 1 && this.currentLoading < 1) {
                $("#mapLoadingPage").hide();
                this.totAreaToLoad = 0;
            }
            else
                setTimeout(function () {
                    _this.DoLoad();
                }, 100);
            return;
        }
        var p = this.areasToLoad.shift();
        var x = p.X;
        var y = p.Y;
        var zone = p.Zone;
        if (game) {
            var data = null;
            for (var i = 0; i < game.maps.length; i++) {
                if (game.maps[i].x == x && game.maps[i].y == y && game.maps[i].zone == zone) {
                    data = JSON.stringify(game.maps[i].data);
                    break;
                }
            }
            if (Main.CheckNW() || isHtmlStandalone) {
                this.currentLoading++;
                setTimeout(function () {
                    _this.currentLoading--;
                    _this.PostLoad(x, y, zone, data);
                }, 10);
            }
            else
                this.PostLoad(x, y, zone, data);
            return;
        }
        if (Main.CheckNW()) {
            //this.SetArea(x, y, zone, this.GetGenerator(zone).Generate(x, y, zone));
            this.currentLoading++;
            setTimeout(function () {
                _this.currentLoading--;
                _this.PostLoad(x, y, zone, data);
            }, 10);
            //this.PostLoad(x, y, zone, null);
            return;
        }
        this.currentLoading++;
        $.ajax({
            type: 'POST',
            url: '/backend/GetMap',
            data: {
                game: this.Id,
                x: x,
                y: y,
                zone: zone
            },
            success: function (msg) {
                _this.currentLoading--;
                var data = TryParse(msg);
                _this.PostLoad(x, y, zone, data);
            },
            error: function (msg, textStatus) {
                this.currentLoading--;
            }
        });
    };
    World.prototype.PostLoad = function (x, y, zone, data) {
        var _this = this;
        var area;
        if (data) {
            area = WorldArea.Parse(data);
            area.world = this;
            area.X = x;
            area.Y = y;
            area.Zone = zone;
            area.OnlyDefinedActors();
            area.RemoveVisitedObjects();
            this.SetArea(x, y, zone, area);
            this.PreloadArt(area);
            this.DoLoad();
        }
        else {
            // Browser supports the web worker
            if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW())) {
                if (!workerGenerator) {
                    workerGenerator = [];
                    for (var i = 0; i < Main.NbCores(); i++) {
                        if (isHtmlStandalone)
                            workerGenerator[i] = new Worker("engine.js");
                        else
                            workerGenerator[i] = new Worker("/runtime.js");
                        workerGenerator[i].onmessage = function (result) {
                            result.target.isRunning = false;
                            var area = WorldArea.Parse(result.data.area);
                            area.world = _this;
                            area.storedMap = false;
                            area.X = result.data.x;
                            area.Y = result.data.y;
                            area.Zone = result.data.zone;
                            area.RecoverActors();
                            area.RemoveVisitedObjects();
                            world.SetArea(result.data.x, result.data.y, result.data.zone, area);
                            world.PreloadArt(area);
                            world.DoLoad();
                        };
                        workerGenerator[i].isRunning = false;
                    }
                }
                var zoneInfo = this.GetZone(zone);
                for (var i = 0; i < Main.NbCores(); i++) {
                    if (workerGenerator[i].isRunning)
                        continue;
                    workerGenerator[i].isRunning = true;
                    workerGenerator[i].postMessage({
                        world: this.Stringify(),
                        action: 'generate',
                        zoneInfo: zoneInfo,
                        x: x,
                        y: y,
                        zone: zone
                    });
                    break;
                }
            }
            else {
                area = this.GetGenerator(zone).Generate(x, y, zone);
                area.RemoveVisitedObjects();
                this.SetArea(x, y, zone, area);
                this.PreloadArt(area);
                this.DoLoad();
            }
        }
    };
    World.prototype.SetArea = function (x, y, zone, area) {
        var replaced = false;
        for (var i = 0; i < this.areas.length; i++) {
            if (this.areas[i] && this.areas[i].X == x && this.areas[i].Y == y && this.areas[i].Zone == zone) {
                this.areas[i] = area;
                this.areas[i].world = this;
                this.areas[i].X = x;
                this.areas[i].Y = y;
                this.areas[i].Zone = zone;
                if (!this.Player.CurrentArea) {
                    if (x == this.Player.AX && y == this.Player.AY && zone == this.Player.Zone) {
                        this.Player.CurrentArea = area;
                        this.areas[i].actors.push(this.Player);
                        this.Player.CurrentArea = this.areas[i];
                    }
                }
                else if (this.Player.CurrentArea.X == x && this.Player.CurrentArea.Y == y && this.Player.Zone == zone) {
                    this.areas[i].actors.push(this.Player);
                    this.Player.CurrentArea = this.areas[i];
                }
                if (!this.lastArea || this.lastArea.X === undefined || (this.lastArea.X == x && this.lastArea.Y == y))
                    this.lastArea = this.areas[i];
                replaced = true;
                break;
            }
        }
        if (!replaced)
            this.areas.push(area);
    };
    World.prototype.NWMapChanges = function () {
        if (!game)
            game = { maps: [], data: null };
        for (var i = 0; i < this.areas.length; i++) {
            if (this.areas[i].edited !== true)
                continue;
            var data = JSON.parse(this.areas[i].Stringify());
            var found = false;
            for (var j = 0; j < game.maps.length; j++) {
                if (game.maps[j].x == this.areas[i].X && game.maps[j].y == this.areas[i].Y && game.maps[j].zone == this.areas[i].Zone) {
                    found = true;
                    game.maps[j].data = data;
                    break;
                }
            }
            if (!found) {
                game.maps.push({
                    x: this.areas[i].X,
                    y: this.areas[i].Y,
                    zone: this.areas[i].Zone,
                    data: data
                });
            }
        }
    };
    World.prototype.SaveMapChanges = function () {
        var _this = this;
        if (Main.CheckNW()) {
            this.NWMapChanges();
            game.data = this.Stringify();
            StandaloneMaker.SaveProject();
            return;
        }
        this.ReadyToSave = false;
        for (var i = 0; i < this.areas.length; i++) {
            if (this.areas[i].edited !== true)
                continue;
            $.ajax({
                type: 'POST',
                url: '/backend/SaveMap',
                data: {
                    game: this.Id,
                    token: framework.Preferences['token'],
                    x: this.areas[i].X,
                    y: this.areas[i].Y,
                    zone: this.areas[i].Zone,
                    data: this.areas[i].Stringify()
                },
                success: function (msg) {
                    _this.areas[i].edited = false;
                    _this.SaveMapChanges();
                },
                error: function (msg, textStatus) {
                    Framework.ShowMessage("Error while saving...");
                }
            });
            return;
        }
        this.Save();
        Framework.ShowMessage("Map saved.");
    };
    World.prototype.ToMapEditorAreas = function () {
        for (var i = 0; i < this.areas.length; i++) {
            this.areas[i].OnlyDefinedActors();
        }
    };
    World.prototype.ToPlayAreas = function () {
        for (var i = 0; i < this.areas.length; i++) {
            /*if (this.areas[i].edited)
                i++;
            else
                this.areas.splice(i, 1);*/
            this.areas[i].RecoverActors();
        }
        //this.GetArea(this.Player.X, this.Player.Y, true);
    };
    World.prototype.Stringify = function () {
        var data = {
            Tileset: this.art,
            Name: this.Name,
            Description: this.Description,
            Skills: this.Skills.map(function (c) { return c.Store(); }),
            Stats: this.Stats.map(function (c) { return c.Store(); }),
            Monsters: this.Monsters.map(function (c) { return c.Store(); }),
            NPCs: this.NPCs,
            Houses: this.Houses,
            Zones: this.Zones,
            ShowFPS: this.ShowFPS,
            InventoryObjects: this.InventoryObjects,
            InventoryObjectTypes: this.InventoryObjectTypes,
            InventorySlots: this.InventorySlots,
            SpawnPoint: this.SpawnPoint,
            InitializeSteps: this.InitializeSteps,
            ChatEnabled: this.ChatEnabled,
            ChatLink: this.ChatLink,
            ChatSmilies: this.ChatSmilies,
            StartLook: this.StartLook,
            SmallBagObject: this.SmallBagObject,
            SimplifiedObjectLogic: this.SimplifiedObjectLogic,
            PublicView: this.PublicView,
            TemporaryEffects: this.TemporaryEffects,
            Quests: this.Quests,
            ShowInventory: this.ShowInventory,
            ShowStats: this.ShowStats,
            ShowJournal: this.ShowJournal,
            ShowMessage: this.ShowMessage,
            ParticleEffects: this.ParticleEffects,
            SaveId: this.SaveId,
            Codes: this.Codes.map(function (c) { return c.Store(); }),
            ChatBots: this.ChatBots.map(function (c) { return c.Store(); }),
        };
        if (Main.CheckNW())
            data['Id'] = this.Id;
        return JSON.stringify(data);
    };
    World.Rebuild = function (source, alertWhileParsing) {
        if (alertWhileParsing === void 0) { alertWhileParsing = true; }
        var serialized = JSON.parse(source);
        var result = new World();
        result.PublicView = (serialized.PublicView === true);
        result.Name = serialized.Name;
        result.SaveId = serialized.SaveId;
        result.Description = serialized.Description;
        result.ShowFPS = (serialized.ShowFPS === true ? true : false);
        result.ShowInventory = (serialized.ShowInventory === false ? false : true);
        result.ShowStats = (serialized.ShowStats === false ? false : true);
        result.ShowJournal = (serialized.ShowJournal === false ? false : true);
        result.ShowMessage = (serialized.ShowMessage === false ? false : true);
        result.Stats = serialized.Stats.map(function (c) { return KnownStat.Rebuild(c, alertWhileParsing); });
        result.Skills = serialized.Skills.map(function (c) { return KnownSkill.Rebuild(c, alertWhileParsing); });
        result.Monsters = serialized.Monsters.map(function (c) { return KnownMonster.Rebuild(c, alertWhileParsing); });
        result.NPCs = serialized.NPCs;
        result.Houses = (serialized.Houses ? serialized.Houses : null);
        result.Zones = (serialized.Zones ? serialized.Zones : null);
        result.art = (serialized.Tileset ? serialized.Tileset : defaultTilesets['tileset2']);
        result.InventoryObjects = (serialized.InventoryObjects ? serialized.InventoryObjects : KnownObject.DefaultObjects()).map(function (m) { return Object.cast(m, KnownObject); });
        ;
        result.InventoryObjectTypes = (serialized.InventoryObjectTypes ? serialized.InventoryObjectTypes : ObjectType.DefaultObjectType()).map(function (m) { return Object.cast(m, ObjectType); });
        result.InventorySlots = (serialized.InventorySlots ? serialized.InventorySlots : InventorySlot.DefaultSlots()).map(function (m) { return Object.cast(m, InventorySlot); });
        result.SpawnPoint = (serialized.SpawnPoint ? serialized.SpawnPoint : { X: 0, Y: 0, Zone: "Base" });
        result.InitializeSteps = (serialized.InitializeSteps ? serialized.InitializeSteps : []);
        result.Codes = (serialized.Codes ? serialized.Codes.map(function (m) { return Object.cast(m, KnownCode); }) : []);
        result.ChatBots = (serialized.ChatBots ? serialized.ChatBots : []).map(function (m) { return ChatBot.Rebuild(m); });
        result.Quests = (serialized.Quests ? serialized.Quests : []);
        if (!result.art.panelStyle)
            result.art.panelStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].panelStyle));
        if (!result.art.quickslotStyle)
            result.art.quickslotStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].quickslotStyle));
        if (!result.art.statBarStyle)
            result.art.statBarStyle = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].statBarStyle));
        if (!result.art.background.paths)
            result.art.background.paths = {};
        if (!result.art.panelStyle.contentHeaderBackgroundColor)
            result.art.panelStyle.contentHeaderBackgroundColor = result.art.panelStyle.contentColor;
        if (!result.art.panelStyle.contentHeaderColor)
            result.art.panelStyle.contentHeaderColor = result.art.panelStyle.buttonBorder;
        if (!result.art.panelStyle.contentSelectedColor)
            result.art.panelStyle.contentSelectedColor = result.art.panelStyle.buttonBackground;
        if (!result.art.panelStyle.buttonBackgroundHover)
            result.art.panelStyle.buttonBackgroundHover = result.art.panelStyle.buttonBorder;
        if (!result.art.quickslotStyle.selectedSkillColor)
            result.art.quickslotStyle.selectedSkillColor = result.art.panelStyle.contentColor;
        result.ChatEnabled = !(serialized.ChatEnabled === false);
        result.ChatLink = !(serialized.ChatLink === false);
        result.ChatSmilies = !(serialized.ChatSmilies === false);
        result.StartLook = (serialized.StartLook ? serialized.StartLook : "male_1");
        result.SmallBagObject = (serialized.SmallBagObject ? serialized.SmallBagObject : "small_bag");
        result.SimplifiedObjectLogic = (serialized.SimplifiedObjectLogic === true ? true : false);
        result.ParticleEffects = (serialized.ParticleEffects ? serialized.ParticleEffects : defaultParticleSystems);
        if (!result.art.sounds)
            result.art.sounds = JSON.parse(JSON.stringify(defaultTilesets['tileset2'].sounds));
        result.TemporaryEffects = serialized.TemporaryEffects ? serialized.TemporaryEffects : [];
        var defMonster = result.GetMonster("DefaultMonster");
        if (defMonster)
            for (var i = 0; i < result.Monsters.length; i++)
                if (result.Monsters[i].Name.toLowerCase() != "defaultmonster")
                    result.Monsters[i].DefaultMonster = defMonster;
        var baseSkill = result.GetSkill("Attack");
        if (baseSkill)
            for (var i = 0; i < result.Skills.length; i++)
                if (result.Skills[i].Name.toLowerCase() != "attack")
                    result.Skills[i].BaseSkill = baseSkill;
        if (Main.CheckNW())
            result.Id = serialized['Id'];
        return result;
    };
    /**
     * Verify all the script code used by the world.
     */
    World.prototype.Verify = function () {
        for (var i = 0; i < this.Skills.length; i++)
            this.Skills[i].Verify();
        for (var i = 0; i < this.Stats.length; i++)
            this.Stats[i].Verify();
        for (var i = 0; i < this.Monsters.length; i++)
            this.Monsters[i].Verify();
    };
    World.prototype.Save = function () {
        var _this = this;
        if (Main.CheckNW()) {
            if (!game)
                game = { maps: [], data: null };
            game.data = this.Stringify();
            StandaloneMaker.SaveProject();
            this.ReadyToSave = true;
            return;
        }
        if (this.Id == undefined || this.Id == null || this.Id == -1) {
            Framework.Alert("No associated ID. Can't save.");
            this.ReadyToSave = true;
            return;
        }
        try {
            this.Verify();
            var w = World.Rebuild(this.Stringify(), false);
            this.DoSave();
        }
        catch (ex) {
            this.ReadyToSave = true;
            Framework.Confirm("The world definition contains some error. Are you sure you want to save it as is?", function () { _this.DoSave(); });
        }
    };
    World.prototype.DoSave = function () {
        var _this = this;
        $.ajax({
            type: 'POST',
            url: '/backend/SaveWorld',
            data: {
                game: this.Id,
                token: framework.Preferences['token'],
                data: this.Stringify()
            },
            success: function (msg) {
                _this.ReadyToSave = true;
                _this.SaveId = TryParse(msg);
                Framework.ShowMessage("World definition saved.");
            },
            error: function (msg, textStatus) {
                this.ReadyToSave = true;
                Framework.ShowMessage("ERROR! World is not yet saved.");
            }
        });
    };
    return World;
}());
///<reference path="World.ts" />
///<reference path="WorldArea.ts" />
var WorldRender = (function () {
    function WorldRender(world, canvasElement, zoomLevel) {
        if (canvasElement === void 0) { canvasElement = "gameCanvas"; }
        if (zoomLevel === void 0) { zoomLevel = 1; }
        var _this = this;
        this.objectSprites = {};
        this.objectImages = {};
        this.houseImages = {};
        this.houseSprites = {};
        this.minimap = false;
        this.miniMapColor = null;
        this.knownObjectMinimap = {};
        this.areaX = 0;
        this.areaY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.oldOffsetX = 0;
        this.oldOffsetY = 0;
        this.showGrid = false;
        this.showMapActions = false;
        this.zone = "Base";
        this.mapEffect = null;
        this.toLoad = 0;
        this.loaded = 0;
        this.canvasElement = canvasElement;
        this.zoomLevel = zoomLevel;
        $(window).bind("resize", function () { _this.Resize(); });
        this.world = world;
        this.Resize();
        this.backgroundTiles = new Image();
        this.backgroundTiles.addEventListener("load", function () {
            _this.loaded++;
        });
        this.backgroundTiles.onerror = this.backgroundTiles.onload;
        this.backgroundTiles.src = world.art.background.file;
        this.toLoad++;
    }
    WorldRender.prototype.Dispose = function () {
        $(window).unbind("resize");
        this.objectImages = {};
        this.objectSprites = {};
    };
    WorldRender.prototype.Render = function () {
        if (!this.world.art || !this.world.art.background || !this.world.art.background.width)
            return;
        var ctx = document.getElementById(this.canvasElement).getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = this.backgroundTiles.width / tileWidth;
        var orx = Math.round(Math.abs(this.offsetX) % tileWidth * (this.offsetX < 0 ? -1 : 1));
        var ory = Math.round(Math.abs(this.offsetY) % tileHeight * (this.offsetY < 0 ? -1 : 1));
        // Render the background
        for (var y = -1; y <= Math.ceil(this.height / this.world.art.background.height); y++) {
            if (y >= this.world.areaHeight)
                break;
            for (var x = -1; x <= Math.ceil(this.width / this.world.art.background.width); x++) {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;
                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight;
                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;
                // Draw the background tile
                //var t = area.backgroundTiles[tx + ty * this.world.areaWidth];
                var t = area.GetTile(tx, ty, this.zone);
                var ox = (t % nbTilesPerLine);
                var oy = Math.floor(t / nbTilesPerLine);
                ctx.drawImage(this.backgroundTiles, ox * tileWidth, oy * tileHeight, tileWidth, tileHeight, x * tileWidth - orx, y * tileHeight - ory, tileWidth, tileHeight);
            }
        }
        // Render the objects
        for (var y = -20; y <= Math.ceil(this.height / this.world.art.background.height) + 20; y++) {
            if (y >= this.world.areaHeight)
                break;
            for (var x = -20; x <= Math.ceil(this.width / this.world.art.background.width) + 20; x++) {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;
                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight;
                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;
                // Draw the object
                var objs = area.GetObjects(tx, ty, this.zone);
                for (var i = 0; i < objs.length; i++) {
                    var objx = (x * tileWidth - orx) + (objs[i].X - tx * tileWidth);
                    var objy = (y * tileHeight - ory) + (objs[i].Y - ty * tileHeight);
                    objs[i].Draw(this, ctx, objx, objy);
                }
            }
        }
        if (this.showMapActions) {
            ctx.fillStyle = "#E00000";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            var actionMade = [];
            for (var y = -20; y <= Math.ceil(this.height / this.world.art.background.height) + 20; y++) {
                if (y >= this.world.areaHeight)
                    break;
                for (var x = -20; x <= Math.ceil(this.width / this.world.art.background.width) + 20; x++) {
                    if (x >= this.world.areaWidth)
                        break;
                    var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x;
                    var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y;
                    var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                    var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                    if (tx < 0)
                        tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                    else
                        tx %= this.world.areaWidth;
                    if (ty < 0)
                        ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                    else
                        ty %= this.world.areaHeight;
                    var area = this.world.GetArea(cx, cy, this.zone);
                    if (!area)
                        continue;
                    // Draw the object
                    var action = area.GetActions(tx * tileWidth, ty * tileHeight, this.zone, true);
                    if (action && actionMade.indexOf("" + action.X + "," + action.Y) == -1) {
                        actionMade.push("" + action.X + "," + action.Y);
                        var objx = (x * tileWidth - orx) + (action.X - tx * tileWidth);
                        var objy = (y * tileHeight - ory) + (action.Y - ty * tileHeight);
                        ctx.beginPath();
                        var sizes = [0.5, 1, 2];
                        ctx.arc(objx, objy, tileWidth * sizes[action.Size === null || action.Size === undefined ? 1 : action.Size], 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
        }
        // Render the map effect if set
        if (this.mapEffect)
            this.mapEffect.Render(ctx, this.width, this.height);
        // Used for the map editor, allows to show a tile grid over the current rendered map
        if (this.showGrid) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.strokeStyle = "#303030";
            for (var y = -1; y <= Math.ceil(this.height / this.world.art.background.height); y++) {
                if (y >= this.world.areaHeight)
                    break;
                ctx.moveTo(0, Math.round(y * tileHeight) + 0.5 - Math.round(ory));
                ctx.lineTo(this.width, Math.round(y * tileHeight) + 0.5 - Math.round(ory));
            }
            for (var x = -1; x <= Math.ceil(this.width / this.world.art.background.width); x++) {
                if (x >= this.world.areaWidth)
                    break;
                ctx.moveTo(Math.round(x * tileWidth) + 0.5 - Math.round(orx), 0);
                ctx.lineTo(Math.round(x * tileWidth) + 0.5 - Math.round(orx), this.height);
            }
            ctx.stroke();
        }
        if (this.OnRender)
            this.OnRender(ctx);
        if (this.minimap)
            this.RenderMiniMap(ctx);
    };
    WorldRender.prototype.RenderMiniMap = function (ctx, startX, startY) {
        if (startX === void 0) { startX = null; }
        if (startY === void 0) { startY = null; }
        if (startX === null)
            startX = Math.floor(this.width - 210);
        if (startY === null)
            startY = 10;
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = this.backgroundTiles.width / tileWidth;
        var h = Math.ceil(this.height / this.world.art.background.height);
        var w = Math.ceil(this.width / this.world.art.background.width);
        if (!this.miniMapColor)
            this.miniMapColor = this.CalculateBackgroundMinimap();
        if (!this.miniMapColor)
            return;
        // Render the minimap
        for (var y = 0; y < 100; y++) {
            if (y >= this.world.areaHeight)
                break;
            for (var x = 0; x < 100; x++) {
                if (x >= this.world.areaWidth)
                    break;
                var tx = Math.floor(Math.abs(this.offsetX) / tileWidth) * (this.offsetX < 0 ? -1 : 1) + x - Math.floor(50 - w / 2);
                var ty = Math.floor(Math.abs(this.offsetY) / tileHeight) * (this.offsetY < 0 ? -1 : 1) + y - Math.floor(50 - h / 2);
                var cx = this.areaX + Math.floor(tx / this.world.areaWidth);
                var cy = this.areaY + Math.floor(ty / this.world.areaHeight);
                if (tx < 0)
                    tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
                else
                    tx %= this.world.areaWidth;
                if (ty < 0)
                    ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
                else
                    ty %= this.world.areaHeight;
                var area = this.world.GetArea(cx, cy, this.zone);
                if (!area)
                    continue;
                // Draw the background tile
                var t = area.GetTile(tx, ty, this.zone);
                ctx.fillStyle = this.miniMapColor[t];
                ctx.fillRect(x * 2 + startX, y * 2 + startY, 2, 2);
                // Draw the object
                var objs = area.GetObjects(tx, ty, this.zone);
                for (var i = 0; i < objs.length; i++) {
                    var m = this.GetObjectMinimap(objs[i]);
                    if (m) {
                        ctx.fillStyle = m.color;
                        ctx.fillRect(Math.floor(x * 2 + startX - m.w / 2), Math.floor(y * 2 + startY - m.h / 2), m.w, m.h);
                    }
                }
            }
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#303030";
        ctx.strokeRect(startX + 100.5 - w, startY + 100.5 - h, w * 2, h * 2);
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(startX + 0.5, startY - 0.5, 201, 201);
    };
    WorldRender.prototype.GetObjectMinimap = function (obj) {
        if (!this.IsAllLoaded())
            return null;
        if (this.knownObjectMinimap[obj.Name] === undefined) {
            if (obj.Type == "WorldObject" || obj['__type'] == "WorldObject") {
                var img = this.GetObjectImage(obj.Name);
                if (!img)
                    return;
                var artInfo = this.world.art.objects[obj.Name];
                if (artInfo.width < this.world.art.background.width / 2 || artInfo.height < this.world.art.background.height / 2)
                    this.knownObjectMinimap[obj.Name] = null;
                else {
                    var canvas = document.createElement("canvas");
                    canvas.width = 1;
                    canvas.height = 1;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, artInfo.x, artInfo.y, artInfo.width, artInfo.height, 0, 0, 1, 1);
                    var data = ctx.getImageData(0, 0, 1, 1);
                    var artInfo = this.world.art.objects[obj.Name];
                    this.knownObjectMinimap[obj.Name] = {
                        w: Math.round(artInfo.width * 2 / this.world.art.background.width),
                        h: Math.round(artInfo.height * 2 / this.world.art.background.height),
                        color: ColorHandling.RgbToHex(data.data[0], data.data[1], data.data[2])
                    };
                }
            }
            else if (obj.Type == "WorldHouse" || obj['__type'] == "WorldHouse") {
                var house = world.GetHouse(obj.Name);
                this.knownObjectMinimap[obj.Name] = {
                    w: Math.round(house.collisionWidth * 2 / this.world.art.background.width),
                    h: Math.round(house.collisionHeight * 2 / this.world.art.background.width),
                    color: "#C0C0C0"
                };
            }
            else
                this.knownObjectMinimap[obj.Name] = null;
        }
        return this.knownObjectMinimap[obj.Name];
    };
    WorldRender.prototype.CalculateBackgroundMinimap = function () {
        if (!this.IsAllLoaded())
            return null;
        var res = [];
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var nbTilesPerLine = Math.floor(this.backgroundTiles.width / tileWidth);
        var canvas = document.createElement("canvas");
        canvas.width = nbTilesPerLine;
        canvas.height = Math.floor(this.backgroundTiles.height / tileHeight);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.backgroundTiles, 0, 0, this.backgroundTiles.width, this.backgroundTiles.height, 0, 0, canvas.width, canvas.height);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var x = 0; x < canvas.width; x++)
            for (var y = 0; y < canvas.height; y++)
                res[x + y * canvas.width] = ColorHandling.RgbToHex(data.data[(x + y * canvas.width) * 4 + 0], data.data[(x + y * canvas.width) * 4 + 1], data.data[(x + y * canvas.width) * 4 + 2]);
        return res;
    };
    WorldRender.prototype.MapTileToScreen = function (x, y) {
        return this.MapToScreen(x * this.world.art.background.width, y * this.world.art.background.height);
    };
    WorldRender.prototype.MapToScreen = function (x, y) {
        return { X: x - this.offsetX, Y: y - this.offsetY };
    };
    WorldRender.prototype.ScreenToMap = function (x, y) {
        var pos = $("#" + this.canvasElement).position();
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.height;
        var orx = Math.abs(this.offsetX) % tileWidth * (this.offsetX < 0 ? -1 : 1);
        var ory = Math.abs(this.offsetY) % tileHeight * (this.offsetY < 0 ? -1 : 1);
        var x = (x - pos.left) + this.offsetX;
        var y = (y - pos.top) + this.offsetY;
        var ox = Math.abs(x) % tileWidth;
        var oy = Math.abs(y) % tileHeight;
        if (x < 0)
            ox = tileWidth - ox;
        if (y < 0)
            oy = tileHeight - oy;
        x = Math.floor(x / tileWidth);
        y = Math.floor(y / tileHeight);
        var cx = this.areaX + Math.floor(x / this.world.areaWidth);
        var cy = this.areaY + Math.floor(y / this.world.areaHeight);
        var tx = x;
        var ty = y;
        if (tx < 0)
            tx = (this.world.areaWidth - 1) - (Math.abs(tx + 1) % this.world.areaWidth);
        else
            tx %= this.world.areaWidth;
        if (ty < 0)
            ty = (this.world.areaHeight - 1) - (Math.abs(ty + 1) % this.world.areaHeight);
        else
            ty %= this.world.areaHeight;
        var rx = tx + (cx - this.areaX) * (this.world.areaWidth - ((cx - this.areaX) < 0 ? 1 : 0));
        var ry = ty + (cy - this.areaY) * (this.world.areaHeight - ((cy - this.areaY) < 0 ? 1 : 0));
        return { TileX: tx, TileY: ty, AreaX: cx, AreaY: cy, RelativeX: rx, RelativeY: ry, OffsetX: ox, OffsetY: oy };
    };
    // Handles the risize of the canvas
    WorldRender.prototype.Resize = function () {
        var canvas = document.getElementById(this.canvasElement);
        if (!canvas)
            return;
        this.width = document.getElementById(this.canvasElement).clientWidth * this.zoomLevel;
        this.height = document.getElementById(this.canvasElement).clientHeight * this.zoomLevel;
        canvas.width = this.width;
        canvas.height = this.height;
        if (this.backgroundTiles)
            this.Render();
    };
    WorldRender.prototype.IsAllLoaded = function () {
        return (this.loaded >= this.toLoad);
    };
    WorldRender.prototype.GetActorSpriteSheet = function (name) {
        var _this = this;
        if (!this.objectImages[name]) {
            this.objectImages[name] = new Image();
            this.objectImages[name].addEventListener("load", function () {
                _this.loaded++;
            });
            this.objectImages[name].onerror = this.objectImages[name].onload;
            this.objectImages[name].src = name;
            this.toLoad++;
        }
        return this.objectImages[name];
    };
    WorldRender.prototype.GetActorImage = function (name) {
        var _this = this;
        var fname = null;
        if (this.world.art.characters[name])
            fname = this.world.art.characters[name].file;
        if (!fname)
            return null;
        if (!this.objectImages[fname]) {
            this.objectImages[fname] = new Image();
            this.objectImages[fname].addEventListener("load", function () {
                _this.loaded++;
            });
            this.objectImages[fname].onerror = this.objectImages[fname].onload;
            this.objectImages[fname].src = fname;
            this.toLoad++;
        }
        return this.objectImages[fname];
    };
    WorldRender.prototype.GetObjectSpriteSheet = function (name) {
        var _this = this;
        if (!this.objectImages[name]) {
            this.objectImages[name] = new Image();
            this.objectImages[name].addEventListener("load", function () {
                _this.loaded++;
            });
            this.objectImages[name].onerror = this.objectImages[name].onload;
            this.objectImages[name].src = name;
            this.toLoad++;
        }
        return this.objectImages[name];
    };
    // Handles the cache of the images
    WorldRender.prototype.GetObjectImage = function (name) {
        var _this = this;
        if (!this.objectSprites[name]) {
            if (!this.world.art.objects[name])
                return null;
            if (!this.objectImages[this.world.art.objects[name].file]) {
                this.objectImages[this.world.art.objects[name].file] = new Image();
                this.objectImages[this.world.art.objects[name].file].addEventListener("load", function () {
                    _this.loaded++;
                });
                this.objectImages[this.world.art.objects[name].file].onerror = this.objectImages[this.world.art.objects[name].file].onload;
                this.objectImages[this.world.art.objects[name].file].src = this.world.art.objects[name].file;
                this.toLoad++;
            }
            this.objectSprites[name] = this.objectImages[this.world.art.objects[name].file];
        }
        return this.objectSprites[name];
    };
    WorldRender.prototype.GetHouseImage = function (name) {
        var _this = this;
        if (!this.houseSprites[name]) {
            if (!this.world.art.house_parts[name])
                return null;
            if (!this.houseImages[this.world.art.house_parts[name].file]) {
                this.houseImages[this.world.art.house_parts[name].file] = new Image();
                this.houseImages[this.world.art.house_parts[name].file].addEventListener("load", function () {
                    _this.loaded++;
                });
                this.houseImages[this.world.art.house_parts[name].file].onerror = this.houseImages[this.world.art.house_parts[name].file].onload;
                this.houseImages[this.world.art.house_parts[name].file].src = this.world.art.house_parts[name].file;
                this.toLoad++;
            }
            this.houseSprites[name] = this.houseImages[this.world.art.house_parts[name].file];
        }
        return this.houseSprites[name];
    };
    WorldRender.prototype.GetTileSheet = function () {
        return this.backgroundTiles;
    };
    return WorldRender;
}());
var WorldZone = (function () {
    function WorldZone() {
        this.GeneratorParameters = null;
        this.Objects = [];
        this.Monsters = [];
        this.MapFragments = [];
    }
    return WorldZone;
}());
var knownGenerators = [];
// Class decorator which will put all the API inside the api variable.
function WorldGeneratorClass(target) {
    var tName = "" + target;
    var className = tName.match(/function ([^\(]+)\(/)[1];
    knownGenerators.push(className.substr(0, className.length - 9));
    knownGenerators.sort();
}
var WorldGenerator = (function () {
    function WorldGenerator(world, seed, zoneInfo) {
        this.zoneInfo = zoneInfo;
        this.seed = seed;
        this.world = world;
        this.rnd = new SeededRandom();
        this.rnd.Seed(seed);
    }
    WorldGenerator.GetTypeOfTile = function (tileSetDefinition, t, withTransition) {
        var types = tileSetDefinition.background.types;
        for (var i in types) {
            if (types[i].contains(t))
                return i;
        }
        if (withTransition) {
            var transitions = tileSetDefinition.background.transitions;
            for (var j = 0; j < transitions.length; j++) {
                if (transitions[j].transition.contains(t))
                    return transitions[j].to;
            }
        }
        return null;
    };
    WorldGenerator.IsTransition = function (world, t) {
        for (var i = 0; i < world.art.background.transitions.length; i++) {
            if (world.art.background.transitions[i].transition.contains(t))
                return true;
        }
        return false;
    };
    WorldGenerator.prototype.GetTile = function (x, y, areaX, areaY, zone) {
        while (x < 0) {
            x += this.world.areaWidth;
            areaX--;
        }
        while (x >= this.world.areaWidth) {
            x -= this.world.areaWidth;
            areaX++;
        }
        while (y < 0) {
            y += this.world.areaHeight;
            areaY--;
        }
        while (y >= this.world.areaHeight) {
            y -= this.world.areaHeight;
            areaY++;
        }
        var area;
        if (this.world.GetArea)
            area = this.world.GetArea(areaX, areaY, zone);
        if (area)
            return area.backgroundTiles[x + y * this.world.areaWidth];
        return this.GetBaseBackgroundTile(x, y, areaX, areaY, zone);
    };
    WorldGenerator.prototype.ChangeTransition = function (x, y, areaX, areaY, zone) {
        var cells = [];
        var base = WorldGenerator.GetTypeOfTile(this.world.art, this.GetTile(x, y, areaX, areaY, zone), true);
        for (var a = -1; a < 2; a++) {
            cells[a] = [];
            for (var b = -1; b < 2; b++) {
                cells[a][b] = WorldGenerator.GetTypeOfTile(this.world.art, this.GetTile(a + x, b + y, areaX, areaY, zone));
                if (cells[a][b] == null)
                    cells[a][b] = base;
            }
        }
        // Small Corners
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][-1], cells[1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, -1, -1))
            return transition.transition[4];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][-1], cells[-1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, 1, -1))
            return transition.transition[5];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][1], cells[1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, -1, 1))
            return transition.transition[6];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][1], cells[-1][0]);
        if (transition && transition.size != 4 && WorldGenerator.AllBut(cells, 1, 1))
            return transition.transition[7];
        // Corners
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][-1], cells[1][1]);
        if (transition && transition.size != 4 && cells[-1][0] == transition.from && cells[0][-1] == transition.from && cells[0][0] == transition.to)
            return transition.transition[0];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][-1], cells[-1][1]);
        if (transition && transition.size != 4 && cells[0][-1] == transition.from && cells[1][0] == transition.from && cells[0][0] == transition.to)
            return transition.transition[1];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][1], cells[1][-1]);
        if (transition && transition.size != 4 && cells[-1][0] == transition.from && cells[0][1] == transition.from && cells[0][0] == transition.to)
            return transition.transition[2];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][1], cells[-1][-1]);
        if (transition && transition.size != 4 && cells[0][1] == transition.from && cells[1][0] == transition.from && cells[0][0] == transition.to)
            return transition.transition[3];
        // Sides
        var transition = WorldGenerator.GetTransition(this.world.art, cells[0][-1], cells[0][1]);
        if (transition && ((transition.size == 4 && cells[0][0] == transition.from && cells[0][1] == transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 8 : 0];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[-1][0], cells[1][0]);
        if (transition && ((transition.size == 4 && cells[0][-1] != transition.to && cells[0][1] != transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 9 : 1];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[1][0], cells[-1][0]);
        if (transition && ((transition.size == 4 && cells[0][-1] != transition.to && cells[0][1] != transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 10 : 2];
        var transition = WorldGenerator.GetTransition(this.world.art, cells[0][1], cells[0][-1]);
        if (transition && ((transition.size == 4 && cells[0][0] == transition.from && cells[0][-1] == transition.to) || transition.size != 4) && cells[0][0] == transition.to)
            return transition.transition[transition.size != 4 ? 11 : 3];
        // Nothing found
        return null;
    };
    WorldGenerator.AllBut = function (cells, x, y) {
        var toCheck = cells[x][y];
        var other = cells[-x][-y];
        if (other == toCheck)
            return false;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i == x && j == y)
                    continue;
                if (cells[i][j] != other && cells[i][j] != null)
                    return false;
            }
        }
        return true;
    };
    WorldGenerator.GetTransition = function (tileSetDefinition, fromType, toType) {
        if (fromType == toType)
            return null;
        var transitions = tileSetDefinition.background.transitions;
        if (!transitions)
            return null;
        for (var j = 0; j < transitions.length; j++) {
            if (transitions[j].from == fromType && transitions[j].to == toType)
                return transitions[j];
        }
        return null;
    };
    WorldGenerator.prototype.GenerateObjects = function (worldArea) {
        var tileWidth = this.world.art.background.width;
        var tileHeight = this.world.art.background.width;
        this.rnd.Seed(this.seed + "_" + worldArea.X + "_" + worldArea.Y);
        // Place the objects
        if (this.zoneInfo.Objects) {
            //for (var i = 0; i < (this.world.areaWidth - 1) * (this.world.areaHeight - 1); i++)
            for (var i = 0; i < (this.world.areaWidth) * (this.world.areaHeight); i++) {
                for (var j = 0; j < this.zoneInfo.Objects.length; j++) {
                    var item = this.zoneInfo.Objects[j].Name;
                    var dice = this.rnd.Next() * 100;
                    if (this.zoneInfo.Objects[j].Frequency && dice <= this.zoneInfo.Objects[j].Frequency) {
                        var tx = i % this.world.areaWidth;
                        var ty = Math.floor(i / this.world.areaWidth);
                        var obj = new WorldObject(item, 0, 0);
                        // Check if this object can be placed on this position
                        if (this.zoneInfo.Objects[j].PlaceOn) {
                            var ttype = WorldGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[tx + ty * this.world.areaWidth]);
                            if (!this.zoneInfo.Objects[j].PlaceOn.contains(ttype))
                                continue;
                        }
                        obj.X = tx * tileWidth + this.rnd.Next(tileWidth);
                        obj.Y = ty * tileHeight + this.rnd.Next(tileHeight);
                        worldArea.objects.push(obj);
                        break;
                    }
                }
            }
        }
    };
    return WorldGenerator;
}());
/// <reference path="WorldGenerator.ts" />
var CaveGenerator = CaveGenerator_1 = (function (_super) {
    __extends(CaveGenerator, _super);
    function CaveGenerator(world, seed, zoneInfo) {
        return _super.call(this, world, seed, zoneInfo) || this;
    }
    CaveGenerator.prototype.Generate = function (x, y, zone) {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.Zone = zone;
        worldArea.world = this.world;
        worldArea.backgroundTiles = [];
        worldArea.objects = [];
        var caveData = this.zoneInfo.GeneratorParameters;
        if (!this.maze)
            //this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, Math.floor(caveData.caveWidth / 2), Math.floor(caveData.caveHeight / 2), caveData.pathSize);
            this.maze = CaveGenerator_1.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, 2, 2, caveData.pathSize);
        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var type;
                var tx = (x * this.world.areaWidth + a);
                var ty = (y * this.world.areaHeight + b);
                if (tx < 0 || ty < 0 || tx >= caveData.caveWidth * caveData.pathSize || ty >= caveData.caveHeight * caveData.pathSize || this.maze[tx][ty] == false)
                    type = this.world.art.background.types[this.zoneInfo.BaseTileType];
                else
                    type = this.world.art.background.types[caveData.walkTile];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }
        var knownTransitions = {};
        for (var i = 0; i < this.world.art.background.transitions.length; i++)
            knownTransitions[this.world.art.background.transitions[i].to] = true;
        // Make a copy of the tiles such that we use the original as source
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var t = WorldGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[a + b * this.world.areaWidth]);
                if (knownTransitions[t] === true) {
                    var ct = this.ChangeTransition(a, b, x, y, zone);
                    if (ct != null)
                        worldArea.backgroundTiles[a + b * this.world.areaWidth] = ct;
                }
            }
        }
        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    };
    CaveGenerator.prototype.GetBaseBackgroundTile = function (x, y, areaX, areaY) {
        var caveData = this.zoneInfo.GeneratorParameters;
        if (!this.maze)
            //this.maze = CaveGenerator.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, Math.floor(caveData.caveWidth / 2), Math.floor(caveData.caveHeight / 2), caveData.pathSize);
            this.maze = CaveGenerator_1.CreateCave("" + caveData.seed, caveData.caveWidth, caveData.caveHeight, 2, 2, caveData.pathSize);
        var tx = (areaX * this.world.areaWidth + x);
        var ty = (areaY * this.world.areaHeight + y);
        var type;
        if (tx < 0 || ty < 0 || tx >= caveData.caveWidth * caveData.pathSize || ty >= caveData.caveHeight * caveData.pathSize || this.maze[tx][ty] == false)
            type = this.world.art.background.types[this.zoneInfo.BaseTileType];
        else
            type = this.world.art.background.types[caveData.walkTile];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    };
    CaveGenerator.CreateCave = function (seed, w, h, cx, cy, pathSize) {
        if (!w || !h)
            return [];
        var smallMap = CaveGenerator_1.CreateBaseCave(seed, w, h, cx, cy);
        var map = [];
        for (var x = 0; x < w * pathSize; x++) {
            map[x] = [];
            for (var y = 0; y < h * pathSize; y++)
                map[x][y] = smallMap[Math.floor(x / pathSize)][Math.floor(y / pathSize)];
        }
        var origMap = JSON.parse(JSON.stringify(map));
        // Fixes errors
        for (var x = 1; x < w * pathSize - 1; x++) {
            for (var y = 1; y < h * pathSize - 1; y++) {
                // Diagonal
                if (map[x - 1][y - 1] == true && map[x][y] == true && map[x][y - 1] == false && map[x - 1][y] == false) {
                    for (var a = -1; a < 2; a++)
                        for (var b = -1; b < 2; b++)
                            map[x + a][y + b] = false;
                }
                // Diagonal
                if (map[x + 1][y - 1] == true && map[x][y] == true && map[x][y - 1] == false && map[x + 1][y] == false) {
                    for (var a = -1; a < 2; a++)
                        for (var b = -1; b < 2; b++)
                            map[x + a][y + b] = false;
                }
                // Corner
                if (MazeGenerator.CountNeighbour(origMap, x, y) == 3 && origMap[x][y] == true)
                    map[x][y] = false;
                var n = MazeGenerator.CountNeighbour(map, x, y, "horizontal");
                if (n == 2 && map[x][y] == false) {
                    map[x - 1][y] = true;
                    map[x + 1][y] = true;
                }
                var n = MazeGenerator.CountNeighbour(map, x, y, "vertical");
                if (n == 2 && map[x][y] == false) {
                    map[x][y - 1] = true;
                    map[x][y + 1] = true;
                }
                var n = MazeGenerator.CountNeighbour(map, x, y);
                if (n >= 5 && map[x][y] == false) {
                    map[x][y] = true;
                }
            }
        }
        return map;
    };
    CaveGenerator.CountNeighbour = function (map, x, y, directions) {
        if (directions === void 0) { directions = "all"; }
        var w = map.length;
        var h = map[0].length;
        switch (directions) {
            case "vertical":
                var n = 0;
                for (var b = -1; b < 2; b++) {
                    if (b == 0)
                        continue;
                    if (b + y < 0 || b + y >= h)
                        continue;
                    if (map[x][b + y] == true)
                        n++;
                }
                break;
            case "horizontal":
                var n = 0;
                for (var a = -1; a < 2; a++) {
                    if (a == 0)
                        continue;
                    if (a + x < 0 || a + x >= w)
                        continue;
                    if (map[a + x][y] == true)
                        n++;
                }
                break;
            default:
                var n = 0;
                for (var a = -1; a < 2; a++) {
                    for (var b = -1; b < 2; b++) {
                        if (a == 0 && b == 0)
                            continue;
                        if (a + x < 0 || b + y < 0 || a + x >= w || b + y >= h)
                            continue;
                        if (map[a + x][b + y] == true)
                            n++;
                    }
                }
                break;
        }
        return n;
    };
    CaveGenerator.CreateBaseCave = function (seed, w, h, cx, cy, coverage) {
        var rnd = new SeededRandom();
        rnd.Seed("" + seed);
        if (coverage == null || coverage == undefined)
            coverage = Math.floor((w * h) / 6);
        var minCoverage = Math.floor((w * h) / 20);
        // Build the array
        var map = null;
        var done = [];
        for (var genNb = 0;; genNb++) {
            map = [];
            for (var i = 0; i < h; i++)
                map[i] = [];
            // Fill all
            for (var i = 0; i < w; i++)
                for (var j = 0; j < h; j++)
                    map[i][j] = false;
            var todo = [];
            todo[todo.length] = { x: cx, y: cy };
            done = [];
            while (todo.length > 0) {
                var step = todo[0];
                todo.splice(0, 1);
                var x = step.x;
                var y = step.y;
                map[x][y] = true;
                done[done.length] = step;
                var d = Math.round(rnd.Next() * 3);
                var nbDir = Math.round(rnd.Next() * 2.7);
                for (var k = 0; k < 1 + nbDir; k++) {
                    switch (d) {
                        case 0:
                            if (CaveGenerator_1.MazeAroundIsFilled(map, x - 1, y, w, h))
                                todo[todo.length] = { x: x - 1, y: y };
                            break;
                        case 1:
                            if (CaveGenerator_1.MazeAroundIsFilled(map, x, y - 1, w, h))
                                todo[todo.length] = { x: x, y: y - 1 };
                            break;
                        case 2:
                            if (CaveGenerator_1.MazeAroundIsFilled(map, x + 1, y, w, h))
                                todo[todo.length] = { x: x + 1, y: y };
                            break;
                        case 3:
                            if (CaveGenerator_1.MazeAroundIsFilled(map, x, y + 1, w, h))
                                todo[todo.length] = { x: x, y: y + 1 };
                            break;
                    }
                    d = (d + 1) % 4;
                }
            }
            var nb = 0;
            for (var i = 0; i < w; i++)
                for (var j = 0; j < h; j++)
                    if (map[i][j])
                        nb++;
            //if (nb >= coverage || (genNb > 20 && nb > minCoverage))
            if (nb >= coverage || genNb > 200)
                break;
        }
        return map;
    };
    CaveGenerator.MazeAroundIsFilled = function (map, x, y, w, h) {
        if (!(x > 0 && x < w - 1 && y > 0 && y < h - 1))
            return false;
        var n = 0;
        if (map[x][y] == true)
            n += 5;
        if (map[x - 1][y] == true)
            n++;
        if (map[x + 1][y] == true)
            n++;
        if (map[x][y - 1] == true)
            n++;
        if (map[x][y + 1] == true)
            n++;
        if (n < 2)
            return true;
        return false;
    };
    CaveGenerator.DefaultParameters = function () {
        var knownTypes = Keys(world.art.background.types);
        return { caveWidth: 50, caveHeight: 50, pathSize: 5, walkTile: (knownTypes.length > 1 ? knownTypes[1] : knownTypes[0]), seed: Math.round(Math.random() * 1000000) };
    };
    CaveGenerator.DisplayParameters = function (generatorParameters) {
        var html = "";
        html += "<tr><td>Walkable Tile:</td>";
        html += "<td><select onchange='MazeGenerator.ChangeParameter(\"walkTile\")' id='walkTile'>";
        for (var j in world.art.background.types)
            html += "<option value='" + j + "'" + (generatorParameters.walkTile == j ? " selected" : "") + ">" + j + "</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Seed:</td>";
        html += "<td><input type='text' value='" + generatorParameters.seed + "' onkeyup='MazeGenerator.ChangeParameter(\"seed\")' id='seed'></td></tr>";
        html += "<tr><td>Path Size:</td>";
        html += "<td><input type='text' value='" + generatorParameters.pathSize + "' onkeyup='MazeGenerator.ChangeParameter(\"pathSize\")' id='pathSize'></td></tr>";
        html += "<tr><td>Maze Width:</td>";
        html += "<td><input type='text' value='" + generatorParameters.caveWidth + "' onkeyup='MazeGenerator.ChangeParameter(\"caveWidth\")' id='caveWidth'></td></tr>";
        html += "<tr><td>Maze Height:</td>";
        html += "<td><input type='text' value='" + generatorParameters.caveHeight + "' onkeyup='MazeGenerator.ChangeParameter(\"caveHeight\")' id='caveHeight'></td></tr>";
        return html;
    };
    CaveGenerator.ChangeParameter = function (paramName) {
        if (typeof zoneEditor.selectedZone.GeneratorParameters[paramName] == "number") {
            var n = parseInt($("#" + paramName).val());
            if (!isNaN(n))
                zoneEditor.selectedZone.GeneratorParameters[paramName] = n;
        }
        else
            zoneEditor.selectedZone.GeneratorParameters[paramName] = $("#" + paramName).val();
        switch (paramName) {
            case "pathSize":
                if (zoneEditor.selectedZone.GeneratorParameters.pathSize < 1)
                    zoneEditor.selectedZone.GeneratorParameters.pathSize = 1;
                if (zoneEditor.selectedZone.GeneratorParameters.pathSize > 10)
                    zoneEditor.selectedZone.GeneratorParameters.pathSize = 10;
                break;
            case "caveWidth":
                if (zoneEditor.selectedZone.GeneratorParameters.caveWidth < 5)
                    zoneEditor.selectedZone.GeneratorParameters.caveWidth = 5;
                if (zoneEditor.selectedZone.GeneratorParameters.caveWidth > 200)
                    zoneEditor.selectedZone.GeneratorParameters.caveWidth = 200;
                break;
            case "caveHeight":
                if (zoneEditor.selectedZone.GeneratorParameters.caveHeight < 5)
                    zoneEditor.selectedZone.GeneratorParameters.caveHeight = 5;
                if (zoneEditor.selectedZone.GeneratorParameters.caveHeight > 200)
                    zoneEditor.selectedZone.GeneratorParameters.caveHeight = 200;
                break;
            default:
                break;
        }
        window['ZoneEditor'].MakeZonePreview();
    };
    CaveGenerator.prototype.RenameTileType = function (oldName, newName) {
        var caveData = this.zoneInfo.GeneratorParameters;
        if (caveData.walkTile == oldName)
            caveData.walkTile = newName;
    };
    return CaveGenerator;
}(WorldGenerator));
CaveGenerator = CaveGenerator_1 = __decorate([
    WorldGeneratorClass
], CaveGenerator);
var CaveGenerator_1;
/// <reference path="WorldGenerator.ts" />
var ConstantGenerator = (function (_super) {
    __extends(ConstantGenerator, _super);
    function ConstantGenerator(world, seed, zoneInfo) {
        return _super.call(this, world, seed, zoneInfo) || this;
    }
    ConstantGenerator.prototype.Generate = function (x, y, zone) {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.Zone = zone;
        worldArea.world = this.world;
        worldArea.backgroundTiles = [];
        worldArea.objects = [];
        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var type = this.world.art.background.types[PerlinGenerator.GetTypeOfTile(this.world.art, this.GetBaseBackgroundTile(a, b, x, y, zone))];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }
        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    };
    ConstantGenerator.prototype.GetBaseBackgroundTile = function (x, y, areaX, areaY, zone) {
        try {
            if (!this.world.art.background.types[this.zoneInfo.BaseTileType])
                this.world.art.background.types[FirstItem(this.world.art.background.types)][0];
            return this.world.art.background.types[this.zoneInfo.BaseTileType][0];
        }
        catch (ex) {
            return 0;
        }
    };
    ConstantGenerator.DefaultParameters = function () {
        return null;
    };
    ConstantGenerator.DisplayParameters = function (generatorParameters) {
        return "";
    };
    ConstantGenerator.prototype.RenameTileType = function (oldName, newName) {
    };
    return ConstantGenerator;
}(WorldGenerator));
ConstantGenerator = __decorate([
    WorldGeneratorClass
], ConstantGenerator);
/// <reference path="WorldGenerator.ts" />
var MazeGenerator = MazeGenerator_1 = (function (_super) {
    __extends(MazeGenerator, _super);
    function MazeGenerator(world, seed, zoneInfo) {
        return _super.call(this, world, seed, zoneInfo) || this;
    }
    MazeGenerator.prototype.Generate = function (x, y, zone) {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.Zone = zone;
        worldArea.world = this.world;
        worldArea.backgroundTiles = [];
        worldArea.objects = [];
        var mazeData = this.zoneInfo.GeneratorParameters;
        if (!mazeData.erosion)
            mazeData.erosion = 0;
        if (!this.maze)
            this.maze = MazeGenerator_1.CreateMaze("" + mazeData.seed, mazeData.mazeWidth, mazeData.mazeHeight, Math.floor(mazeData.mazeWidth / 2), Math.floor(mazeData.mazeHeight / 2), mazeData.pathSize, mazeData.erosion);
        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var type;
                var tx = (x * this.world.areaWidth + a);
                var ty = (y * this.world.areaHeight + b);
                if (tx < 0 || ty < 0 || tx >= mazeData.mazeWidth * mazeData.pathSize || ty >= mazeData.mazeHeight * mazeData.pathSize || this.maze[tx][ty] == false)
                    type = this.world.art.background.types[this.zoneInfo.BaseTileType];
                else
                    type = this.world.art.background.types[mazeData.walkTile];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }
        var knownTransitions = {};
        for (var i = 0; i < this.world.art.background.transitions.length; i++)
            knownTransitions[this.world.art.background.transitions[i].to] = true;
        // Make a copy of the tiles such that we use the original as source
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var t = WorldGenerator.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[a + b * this.world.areaWidth]);
                if (knownTransitions[t] === true) {
                    var ct = this.ChangeTransition(a, b, x, y, zone);
                    if (ct != null)
                        worldArea.backgroundTiles[a + b * this.world.areaWidth] = ct;
                }
            }
        }
        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    };
    MazeGenerator.prototype.GetBaseBackgroundTile = function (x, y, areaX, areaY) {
        var mazeData = this.zoneInfo.GeneratorParameters;
        if (!mazeData.erosion)
            mazeData.erosion = 0;
        if (!this.maze)
            this.maze = MazeGenerator_1.CreateMaze("" + mazeData.seed, mazeData.mazeWidth, mazeData.mazeHeight, Math.floor(mazeData.mazeWidth / 2), Math.floor(mazeData.mazeHeight / 2), mazeData.pathSize, mazeData.erosion);
        var tx = (areaX * this.world.areaWidth + x);
        var ty = (areaY * this.world.areaHeight + y);
        var type;
        if (tx < 0 || ty < 0 || tx >= mazeData.mazeWidth * mazeData.pathSize || ty >= mazeData.mazeHeight * mazeData.pathSize || this.maze[tx][ty] == false)
            type = this.world.art.background.types[this.zoneInfo.BaseTileType];
        else
            type = this.world.art.background.types[mazeData.walkTile];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    };
    MazeGenerator.CreateMaze = function (seed, w, h, cx, cy, pathSize, erosion) {
        if (!w || !h)
            return [];
        var smallMap = MazeGenerator_1.CreateBaseMaze(seed, w, h, cx, cy);
        var map = [];
        for (var x = 0; x < w * pathSize; x++) {
            map[x] = [];
            for (var y = 0; y < h * pathSize; y++)
                map[x][y] = smallMap[Math.floor(x / pathSize)][Math.floor(y / pathSize)];
        }
        if (erosion) {
            var rnd = new SeededRandom();
            rnd.Seed(seed);
            var perlin = new Perlin(rnd);
            for (var i = 0; i < erosion; i++)
                map = MazeGenerator_1.Erode(map, perlin);
        }
        return map;
    };
    MazeGenerator.Erode = function (map, perlin) {
        var origMap = JSON.parse(JSON.stringify(map));
        var w = map.length;
        var h = map[0].length;
        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                var p = Math.round(perlin.Noise(x / 15.0, y / 15.0) * 4 + 4);
                var n = MazeGenerator_1.CountNeighbour(origMap, x, y);
                /*if (p == 0 && n > 0 && origMap[x][y] == false)
                    map[x][y] = true;*/
                if (p >= 7 && n < 8 && origMap[x][y] == true)
                    map[x][y] = false;
                else if (n == 3 && origMap[x][y] == true)
                    map[x][y] = false;
            }
        }
        // Fixes errors
        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                var n = MazeGenerator_1.CountNeighbour(map, x, y, "horizontal");
                if (n == 2 && map[x][y] == false) {
                    map[x - 1][y] = true;
                    map[x + 1][y] = true;
                }
                var n = MazeGenerator_1.CountNeighbour(map, x, y, "vertical");
                if (n == 2 && map[x][y] == false) {
                    map[x][y - 1] = true;
                    map[x][y + 1] = true;
                }
                var n = MazeGenerator_1.CountNeighbour(map, x, y);
                if (n >= 5 && map[x][y] == false) {
                    map[x][y] = true;
                }
            }
        }
        return map;
    };
    MazeGenerator.CountNeighbour = function (map, x, y, directions) {
        if (directions === void 0) { directions = "all"; }
        var w = map.length;
        var h = map[0].length;
        switch (directions) {
            case "vertical":
                var n = 0;
                for (var b = -1; b < 2; b++) {
                    if (b == 0)
                        continue;
                    if (b + y < 0 || b + y >= h)
                        continue;
                    if (map[x][b + y] == true)
                        n++;
                }
                break;
            case "horizontal":
                var n = 0;
                for (var a = -1; a < 2; a++) {
                    if (a == 0)
                        continue;
                    if (a + x < 0 || a + x >= w)
                        continue;
                    if (map[a + x][y] == true)
                        n++;
                }
                break;
            default:
                var n = 0;
                for (var a = -1; a < 2; a++) {
                    for (var b = -1; b < 2; b++) {
                        if (a == 0 && b == 0)
                            continue;
                        if (a + x < 0 || b + y < 0 || a + x >= w || b + y >= h)
                            continue;
                        if (map[a + x][b + y] == true)
                            n++;
                    }
                }
                break;
        }
        return n;
    };
    MazeGenerator.CreateBaseMaze = function (seed, w, h, cx, cy) {
        if (!w || !h)
            return [];
        var rnd = new SeededRandom();
        rnd.Seed("" + seed);
        var visited = [];
        // Build the array
        var map = [];
        for (var i = 0; i < w; i++)
            map[i] = [];
        var offX = 1 - (cx % 2);
        var offY = 1 - (cy % 2);
        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                map[i][j] = false;
                visited[i + j * w] = false;
            }
        }
        // Fill all
        for (var i = 0; i < w - offX; i++) {
            for (var j = 0; j < h - offY; j++) {
                if (i % 2 == 1 && j % 2 == 1 && i < w - (1 + offX) && j < h - (1 + offY))
                    map[i + offX][j + offY] = true;
                else
                    map[i + offX][j + offY] = false;
            }
        }
        var todo = [{ x: 1 + offX, y: 1 + offY }];
        var done = [];
        visited[todo[0].x + todo[0].y * w] = true;
        var maxSteps = Math.round(w * h / 3);
        while (todo.length > 0 && maxSteps > 0) {
            maxSteps--;
            var s = Math.min(Math.round(rnd.Next() * todo.length), todo.length - 1);
            var c = todo[s];
            done[done.length] = c;
            todo.splice(s, 1);
            if (c.x > 1 + offX && visited[(c.x - 2) + c.y * w] == false) {
                todo[todo.length] = { x: c.x - 2, y: c.y };
                visited[(c.x - 2) + c.y * w] = true;
                map[(c.x) - 1][c.y] = true;
            }
            if (c.y > 1 + offY && visited[(c.x) + (c.y - 2) * w] == false) {
                todo[todo.length] = { x: c.x, y: c.y - 2 };
                visited[(c.x) + (c.y - 2) * w] = true;
                map[c.x][(c.y) - 1] = true;
            }
            if (c.x + 2 < w - 1 && visited[(c.x + 2) + c.y * w] == false) {
                todo[todo.length] = { x: c.x + 2, y: c.y };
                visited[(c.x + 2) + c.y * w] = true;
                map[(c.x) + 1][c.y] = true;
            }
            if (c.y + 2 < h - 1 && visited[(c.x) + (c.y + 2) * w] == false) {
                todo[todo.length] = { x: c.x, y: c.y + 2 };
                visited[(c.x) + (c.y + 2) * w] = true;
                map[c.x][(c.y) + 1] = true;
            }
        }
        return map;
    };
    MazeGenerator.DefaultParameters = function () {
        var knownTypes = Keys(world.art.background.types);
        return { mazeWidth: 50, mazeHeight: 50, pathSize: 5, walkTile: (knownTypes.length > 1 ? knownTypes[1] : knownTypes[0]), seed: Math.round(Math.random() * 1000000), erosion: 0 };
    };
    MazeGenerator.DisplayParameters = function (generatorParameters) {
        if (!generatorParameters.erosion)
            generatorParameters.erosion = 0;
        var html = "";
        html += "<tr><td>Walkable Tile:</td>";
        html += "<td><select onchange='MazeGenerator.ChangeParameter(\"walkTile\")' id='walkTile'>";
        for (var j in world.art.background.types)
            html += "<option value='" + j + "'" + (generatorParameters.walkTile == j ? " selected" : "") + ">" + j + "</option>";
        html += "</select></td></tr>";
        html += "<tr><td>Seed:</td>";
        html += "<td><input type='text' value='" + generatorParameters.seed + "' onkeyup='MazeGenerator.ChangeParameter(\"seed\")' id='seed'></td></tr>";
        html += "<tr><td>Path Size:</td>";
        html += "<td><input type='text' value='" + generatorParameters.pathSize + "' onkeyup='MazeGenerator.ChangeParameter(\"pathSize\")' id='pathSize'></td></tr>";
        html += "<tr><td>Maze Width:</td>";
        html += "<td><input type='text' value='" + generatorParameters.mazeWidth + "' onkeyup='MazeGenerator.ChangeParameter(\"mazeWidth\")' id='mazeWidth'></td></tr>";
        html += "<tr><td>Maze Height:</td>";
        html += "<td><input type='text' value='" + generatorParameters.mazeHeight + "' onkeyup='MazeGenerator.ChangeParameter(\"mazeHeight\")' id='mazeHeight'></td></tr>";
        html += "<tr><td>Erosion:</td>";
        html += "<td><select id='erosion' onchange='MazeGenerator.ChangeParameter(\"erosion\")'>";
        var errosionTypes = ["None", "Light", "Medium", "Heavy"];
        for (var i = 0; i < errosionTypes.length; i++)
            html += "<option value='" + i + "'" + (generatorParameters.erosion == i ? " selected" : "") + ">" + errosionTypes[i] + "</option>";
        html += "</select></td></tr>";
        return html;
    };
    MazeGenerator.ChangeParameter = function (paramName) {
        if (typeof zoneEditor.selectedZone.GeneratorParameters[paramName] == "number") {
            var n = parseInt($("#" + paramName).val());
            if (!isNaN(n))
                zoneEditor.selectedZone.GeneratorParameters[paramName] = n;
        }
        else
            zoneEditor.selectedZone.GeneratorParameters[paramName] = $("#" + paramName).val();
        switch (paramName) {
            case "pathSize":
                if (zoneEditor.selectedZone.GeneratorParameters.pathSize < 1)
                    zoneEditor.selectedZone.GeneratorParameters.pathSize = 1;
                if (zoneEditor.selectedZone.GeneratorParameters.pathSize > 10)
                    zoneEditor.selectedZone.GeneratorParameters.pathSize = 10;
                break;
            case "mazeWidth":
                if (zoneEditor.selectedZone.GeneratorParameters.mazeWidth < 5)
                    zoneEditor.selectedZone.GeneratorParameters.mazeWidth = 5;
                if (zoneEditor.selectedZone.GeneratorParameters.mazeWidth > 200)
                    zoneEditor.selectedZone.GeneratorParameters.mazeWidth = 200;
                break;
            case "mazeHeight":
                if (zoneEditor.selectedZone.GeneratorParameters.mazeHeight < 5)
                    zoneEditor.selectedZone.GeneratorParameters.mazeHeight = 5;
                if (zoneEditor.selectedZone.GeneratorParameters.mazeHeight > 200)
                    zoneEditor.selectedZone.GeneratorParameters.mazeHeight = 200;
                break;
            default:
                break;
        }
        window['ZoneEditor'].MakeZonePreview();
    };
    MazeGenerator.prototype.RenameTileType = function (oldName, newName) {
        var mazeData = this.zoneInfo.GeneratorParameters;
        if (mazeData.walkTile == oldName)
            mazeData.walkTile = newName;
    };
    return MazeGenerator;
}(WorldGenerator));
MazeGenerator = MazeGenerator_1 = __decorate([
    WorldGeneratorClass
], MazeGenerator);
var MazeGenerator_1;
/// <reference path="WorldGenerator.ts" />
var perlinGenerator = new ((function () {
    function class_9() {
        this.perlin = null;
    }
    return class_9;
}()));
var PerlinGenerator = PerlinGenerator_1 = (function (_super) {
    __extends(PerlinGenerator, _super);
    function PerlinGenerator(world, seed, zoneInfo) {
        return _super.call(this, world, seed, zoneInfo) || this;
    }
    PerlinGenerator.prototype.Generate = function (x, y, zone) {
        var worldArea = new WorldArea();
        worldArea.X = x;
        worldArea.Y = y;
        worldArea.world = this.world;
        worldArea.Zone = zone;
        worldArea.backgroundTiles = [];
        worldArea.objects = [];
        var levels = this.zoneInfo.GeneratorParameters.levels.slice();
        levels.sort(function (a, b) { return a.maxLevel - b.maxLevel; });
        // Fill the world with the background
        for (var a = 0; a < this.world.areaWidth; a++) {
            for (var b = 0; b < this.world.areaHeight; b++) {
                var type = this.world.art.background.types[PerlinGenerator_1.GetTypeOfTile(this.world.art, this.GetBaseBackgroundTile(a, b, x, y))];
                //var type = this.world.tileSetDefinition.background.types[this.zoneInfo.BaseTileType];
                worldArea.backgroundTiles[a + b * this.world.areaWidth] = type[Math.floor(this.rnd.Next() * type.length)];
            }
        }
        // Smooth the tiles
        if (levels) {
            var knownTransitions = {};
            for (var i = 0; i < this.world.art.background.transitions.length; i++)
                knownTransitions[this.world.art.background.transitions[i].to] = true;
            // Make a copy of the tiles such that we use the original as source
            for (var a = 0; a < this.world.areaWidth; a++) {
                for (var b = 0; b < this.world.areaHeight; b++) {
                    var t = PerlinGenerator_1.GetTypeOfTile(this.world.art, worldArea.backgroundTiles[a + b * this.world.areaWidth]);
                    if (knownTransitions[t] === true) {
                        var ct = this.ChangeTransition(a, b, x, y, zone);
                        if (ct != null)
                            worldArea.backgroundTiles[a + b * this.world.areaWidth] = ct;
                    }
                }
            }
        }
        this.GenerateObjects(worldArea);
        worldArea.RecoverActors();
        return worldArea;
    };
    PerlinGenerator.prototype.GetBaseBackgroundTile = function (x, y, areaX, areaY) {
        if (!perlinGenerator.perlin) {
            var rnd = new SeededRandom();
            rnd.Seed(this.world.seed);
            perlinGenerator.perlin = new Perlin(rnd);
        }
        var mainType = this.zoneInfo.BaseTileType;
        var levels = this.zoneInfo.GeneratorParameters.levels;
        // Fill the world with the background
        var type;
        if (levels) {
            var nx = x + areaX * this.world.areaWidth;
            var ny = y + areaY * this.world.areaHeight;
            var l = (perlinGenerator.perlin.Noise(nx / this.zoneInfo.GeneratorParameters.zoomFactor, ny / this.zoneInfo.GeneratorParameters.zoomFactor) / 2) + 0.5;
            var t = mainType;
            for (var j = levels.length - 1; j >= 0; j--) {
                if (levels[j].maxLevel != null && levels[j].maxLevel != undefined && levels[j].maxLevel < l)
                    break;
                t = levels[j].type;
            }
            type = this.world.art.background.types[t];
        }
        else
            type = world.art.background.types[mainType];
        if (!type)
            type = this.world.art.background.types[FirstItem(this.world.art.background.types)];
        return type[0];
    };
    PerlinGenerator.DefaultParameters = function () {
        var knownTypes = Keys(world.art.background.types);
        if (knownTypes.length < 3) {
            return {
                zoomFactor: 60,
                levels: [{ "type": knownTypes[0], "maxLevel": 1.0 }]
            };
        }
        if (world.art.background.types['water'] && world.art.background.types['grass'] && world.art.background.types['dark_grass'])
            return {
                zoomFactor: 60,
                levels: [{ "type": 'water', "maxLevel": 0.3 },
                    { "type": 'grass', "maxLevel": 0.9 },
                    { "type": 'dark_grass', "maxLevel": 1.0 }]
            };
        return {
            zoomFactor: 60,
            levels: [{ "type": knownTypes[0], "maxLevel": 0.3 }, { "type": knownTypes[1], "maxLevel": 0.9 }, { "type": knownTypes[2], "maxLevel": 1.0 }]
        };
    };
    PerlinGenerator.DisplayParameters = function (generatorParameters) {
        var html = "";
        var levels = generatorParameters.levels;
        levels.sort(function (a, b) { return a.maxLevel - b.maxLevel; });
        html += "<tr><td>Zoom Factor:</td>";
        html += "<td><input type='text' value='" + generatorParameters.zoomFactor + "' onkeyup='PerlinGenerator.ChangeZoom()' id='zoneZoom'></td></tr>";
        html += "<tr><td colspan='2'>Terrain levels:</td></tr>";
        for (var i = 0; i < levels.length; i++) {
            html += "<tr><td>";
            html += "<select onchange='PerlinGenerator.ChangeLevelType(" + i + ")' id='zoneLevelType_" + i + "' style='width: 150px;'>";
            for (var j in world.art.background.types) {
                html += "<option value='" + j + "'" + (levels[i].type == j ? " selected" : "") + ">" + j + "</option>";
            }
            html += "</select></td>";
            html += "<td><input type='text' onkeyup='PerlinGenerator.ChangeLevelValue(" + i + ")' value='" + levels[i].maxLevel + "' id='zoneLevelValue_" + i + "'></td>";
            html += "<td><div class='button' onclick='PerlinGenerator.RemoveLevel(" + i + ")'>Remove</div></td>";
            html += "</tr>";
        }
        html += "<tr><td colspan='2'><div class='button' onclick='PerlinGenerator.AddLevel()'>Add Level</div></td></tr>";
        return html;
    };
    PerlinGenerator.RemoveLevel = function (level) {
        if (zoneEditor.selectedZone.GeneratorParameters.levels.length < 2)
            return;
        zoneEditor.selectedZone.GeneratorParameters.levels.splice(level, 1);
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].Render();
        window['ZoneEditor'].MakeZonePreview();
    };
    PerlinGenerator.AddLevel = function () {
        var firstItem = "";
        for (var item in world.art.background.types) {
            firstItem = item;
            break;
        }
        zoneEditor.selectedZone.GeneratorParameters.levels.push({ type: firstItem, maxLevel: 1.0 });
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].Render();
        window['ZoneEditor'].MakeZonePreview();
    };
    PerlinGenerator.ChangeZoom = function () {
        zoneEditor.selectedZone.GeneratorParameters.zoomFactor = parseFloat($("#zoneZoom").val());
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    };
    PerlinGenerator.ChangeLevelType = function (level) {
        zoneEditor.selectedZone.GeneratorParameters.levels[level].type = $("#zoneLevelType_" + level).val();
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    };
    PerlinGenerator.ChangeLevelValue = function (level) {
        zoneEditor.selectedZone.GeneratorParameters.levels[level].maxLevel = parseFloat($("#zoneLevelValue_" + level).val());
        world.ResetGenerator();
        world.ResetAreas();
        window['ZoneEditor'].MakeZonePreview();
    };
    PerlinGenerator.prototype.RenameTileType = function (oldName, newName) {
        var perlinData = this.zoneInfo.GeneratorParameters;
        for (var i = 0; i < perlinData.levels.length; i++)
            if (perlinData.levels[i].type == oldName)
                perlinData.levels[i].type = newName;
    };
    return PerlinGenerator;
}(WorldGenerator));
PerlinGenerator = PerlinGenerator_1 = __decorate([
    WorldGeneratorClass
], PerlinGenerator);
var PerlinGenerator_1;
///<reference path="../MovingActor.ts" />
var MapMessage = (function (_super) {
    __extends(MapMessage, _super);
    function MapMessage(world) {
        var _this = _super.call(this, world) || this;
        _this.life = 0;
        return _this;
    }
    MapMessage.Create = function (message, color, worldArea, x, y) {
        var result = new MapMessage(world);
        result.CurrentArea = worldArea;
        result.X = x;
        result.Y = y;
        result.message = message;
        result.color = color;
        return result;
    };
    MapMessage.prototype.CanReachArea = function (x, y) {
        return true;
    };
    MapMessage.prototype.Handle = function () {
        this.Y -= 0.4;
        this.life++;
        if (this.life > 100)
            this.Kill();
        else
            this.UpdatePosition();
    };
    MapMessage.prototype.Draw = function (renderEngine, ctx, x, y) {
        var width = ctx.measureText(this.message).width;
        if (this.life < 50)
            ctx.globalAlpha = 1;
        else {
            var a = (50 - (this.life - 50)) / 50;
            if (a < 0)
                return;
            ctx.globalAlpha = a;
        }
        var cx = x + Math.sin(this.life / 10) * 5;
        ctx.font = "13px sans-serif";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeText(this.message, Math.floor(cx) + 0.5, y + 0.5);
        ctx.fillStyle = this.color;
        ctx.fillText(this.message, Math.floor(cx) + 0.5, y + 0.5);
        ctx.globalAlpha = 1;
    };
    MapMessage.prototype.PlayerInteract = function (ax, ay) {
    };
    MapMessage.prototype.PlayerMouseInteract = function (ax, ay) {
        return false;
    };
    return MapMessage;
}(MovingActor));
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
var DefaultMonsters = (function () {
    function DefaultMonsters() {
    }
    DefaultMonsters.Generate = function (game) {
        var defaultMonster = null;
        game.Monsters = [];
        for (var i = 0; i < monsterCodes.length; i++) {
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
            if (monster.Code.CodeVariables["statdrop"]) {
                monster.StatDrop = JSON.parse(monster.Code.CodeVariables["statdrop"].value.replace(/'/g, "\""));
                delete monster.Code.CodeVariables["statdrop"];
            }
            if (monster.Code.CodeVariables["itemdrop"]) {
                monster.ItemDrop = JSON.parse(monster.Code.CodeVariables["itemdrop"].value.replace(/'/g, "\""));
                delete monster.Code.CodeVariables["itemdrop"];
            }
            game.Monsters.push(monster);
        }
        for (var i = 0; i < game.Monsters.length; i++)
            game.Monsters[i].DefaultMonster = defaultMonster;
    };
    return DefaultMonsters;
}());
var KnownMonster = (function () {
    function KnownMonster() {
        this.StatDrop = [];
        this.ItemDrop = [];
    }
    KnownMonster.prototype.Parse = function (sourceCode, withVerify) {
        if (withVerify === void 0) { withVerify = true; }
        this.SourceCode = sourceCode.replace(/^\/\/\/.*$/mg, "").replace(/(\s*\r?\n){3,}/g, "\n\n");
        this.Code = CodeParser.Parse(sourceCode, withVerify);
    };
    KnownMonster.prototype.Verify = function () {
        var c = CodeParser.Parse(this.FullCode(), true);
    };
    KnownMonster.prototype.CodeVariables = function () {
        var code = "";
        for (var i in this.Code.CodeVariables)
            code += "/// " + this.Code.CodeVariables[i].name + ": " + this.Code.CodeVariables[i].value + "," + this.Code.CodeVariables[i].type + "\n";
        return code;
    };
    KnownMonster.prototype.FullCode = function () {
        return this.CodeVariables() + this.SourceCode;
    };
    KnownMonster.prototype.UpdateCodeVariables = function () {
        this.Parse(this.FullCode());
        this.Name = this.Code.CodeVariables["name"].value;
        if (this.Code.CodeVariables["art"])
            this.Art = this.Code.CodeVariables["art"].value;
    };
    KnownMonster.prototype.HasFunction = function (functionName) {
        return this.Code.HasFunction(functionName);
    };
    KnownMonster.prototype.InvokeFunction = function (functionName, values) {
        if (this.Code.HasFunction(functionName))
            return this.Code.ExecuteFunction(functionName, values);
        return null;
    };
    KnownMonster.prototype.Store = function () {
        return {
            Name: this.Name,
            Source: this.FullCode(),
            Art: this.Art,
            StatDrop: this.StatDrop,
            ItemDrop: this.ItemDrop
        };
    };
    KnownMonster.Rebuild = function (source, alertWhileParsing) {
        if (alertWhileParsing === void 0) { alertWhileParsing = true; }
        if (typeof source == "string") {
            var result = new KnownMonster();
            result.Parse(source, false);
            result.Name = result.Code.CodeVariables["name"].value;
            if (result.Code.CodeVariables["art"])
                result.Art = result.Code.CodeVariables["art"].value;
            if (result.Code.CodeVariables["statdrop"]) {
                result.StatDrop = JSON.parse(result.Code.CodeVariables["statdrop"].value.replace(/'/g, "\""));
                delete result.Code.CodeVariables["statdrop"];
            }
            if (result.Code.CodeVariables["itemdrop"]) {
                result.ItemDrop = JSON.parse(result.Code.CodeVariables["itemdrop"].value.replace(/'/g, "\""));
                delete result.Code.CodeVariables["itemdrop"];
            }
            return result;
        }
        else {
            var result = new KnownMonster();
            if (alertWhileParsing) {
                try {
                    result.Parse(source.Source, false);
                }
                catch (ex) {
                    Framework.Alert("Error while rebuilding monster '" + source.Name + "': " + ex);
                    result.Code = new CodeEnvironement();
                    result.Code.CodeVariables = {};
                    result.SourceCode = source.Source;
                }
            }
            else
                result.Parse(source.Source, false);
            result.Name = source.Name;
            result.Art = source.Art;
            result.StatDrop = (source.StatDrop ? source.StatDrop : []);
            result.ItemDrop = (source.ItemDrop ? source.ItemDrop : []);
            return result;
        }
    };
    return KnownMonster;
}());
///<reference path="../MovingActor.ts" />
var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster(world) {
        var _this = _super.call(this, world) || this;
        _this.nbStepCount = 0;
        _this.path = null;
        _this.lastPath = 0;
        _this.realDirection = 0;
        _this.MonsterEnv = null;
        for (var i = 0; i < _this.World.Stats.length; i++) {
            if (!_this.World.Stats[i].MonsterStat)
                continue;
            var stat = new Stat();
            stat.Name = _this.World.Stats[i].Name;
            stat.BaseStat = _this.World.Stats[i];
            stat.Value = _this.World.Stats[i].DefaultValue;
            _this.Stats.push(stat);
        }
        return _this;
    }
    Monster.Create = function (monsterDef, worldArea, x, y) {
        var monster = new Monster(worldArea.world);
        monster.CurrentArea = worldArea;
        monster.MonsterId = worldArea.Zone + "," + (x + worldArea.X * world.areaWidth * world.art.background.width) + "," + (y + worldArea.Y * world.areaHeight * world.art.background.height);
        monster.X = x;
        monster.Y = y;
        monster.Speed = (monsterDef.Code.CodeVariables["speed"] ? parseFloat(monsterDef.Code.CodeVariables["speed"].value) : 2);
        monster.Name = monsterDef.Name;
        monster.MonsterEnv = monsterDef;
        for (var i = 0; i < monster.Stats.length; i++) {
            if (monsterDef.Code.CodeVariables[monster.Stats[i].Name.toLowerCase()])
                monster.Stats[i].Value = monster.Stats[i].MaxValue = monster.Stats[i].Value = parseFloat(monsterDef.Code.CodeVariables[monster.Stats[i].Name.toLowerCase()].value);
        }
        return monster;
    };
    Monster.prototype.CanReachArea = function (x, y) {
        //return (Math.abs(this.World.Player.CurrentArea.X - x) < 2 && Math.abs(this.World.Player.CurrentArea.Y - y) < 2);
        return (Math.abs(this.World.Player.AX - x) < 2 && Math.abs(this.World.Player.AY - y) < 2);
        //return false;
    };
    Monster.prototype.Handle = function () {
        if (this.ParticleEffectDuration && this.ParticleEffectDuration.getTime() < new Date().getTime()) {
            this.ParticleEffect = null;
            this.ParticleEffectDuration = null;
        }
        if (!this.MonsterEnv || !this.World.art.characters[this.MonsterEnv.Art]) {
            this.Kill();
            return;
        }
        if (!framework.Preferences['token'] && !Main.CheckNW()) {
            this.RandomWalk();
        }
        // Too far we skip it completly.
        var a = this.X - (((world.Player.AX - this.CurrentArea.X) * this.World.areaWidth * this.World.art.background.width) + world.Player.X);
        var b = this.Y - (((world.Player.AY - this.CurrentArea.Y) * this.World.areaHeight * this.World.art.background.height) + world.Player.Y);
        if (Math.abs(a) > play.renderer.width / 2 || Math.abs(b) > play.renderer.height / 2)
            return;
        if (world.Player.InDialog) {
            this.RandomWalk();
        }
        else {
            var scriptedHandleResult = this.InvokeFunction("Handle", [new VariableValue(this.Id)]);
            if (scriptedHandleResult !== null && scriptedHandleResult.GetBoolean())
                return;
            // Either no 
            if (world.Player.InDialog)
                this.RandomWalk();
            else
                this.HuntWalk(10);
        }
    };
    Monster.prototype.HuntWalk = function (maxDistance) {
        if (maxDistance > 20)
            maxDistance = 20;
        if (maxDistance < 5)
            maxDistance = 5;
        var pDist = this.DistanceTo(this.World.Player);
        if (pDist < this.World.art.background.width) {
            return;
        }
        if (pDist < (maxDistance * this.World.art.background.width)) {
            if (this.lastPath <= 0) {
                this.path = this.PathTo(this.World.Player, maxDistance);
                this.lastPath = 10;
            }
            this.lastPath--;
        }
        else {
            this.path = null;
            this.lastPath = 0;
        }
        if (!this.HandlePath()) {
            this.RandomWalk();
        }
    };
    Monster.prototype.RandomWalk = function () {
        this.path = null;
        this.lastPath = 0;
        var mDef = this.World.art.characters[this.MonsterEnv.Art];
        if (this.nbStepCount <= 0) {
            this.realDirection += (Math.random() * 0.6) - 0.3;
            if (this.realDirection < 0)
                this.realDirection += Math.PI * 2;
            if (this.realDirection >= Math.PI * 2)
                this.realDirection -= Math.PI * 2;
            this.nbStepCount = 10;
            var d = Math.round(this.realDirection * (mDef.directions - 1) / (Math.PI * 2));
            this.Direction = (mDef.directionFrames ? mDef.directionFrames[d] : d);
        }
        else
            this.nbStepCount--;
        var nx = this.X + Math.cos(this.realDirection) * this.Speed;
        var ny = this.Y + Math.sin(this.realDirection) * this.Speed;
        if (this.CanWalkOn(nx, ny)) {
            if (mDef.animationCycle == "simple")
                this.Frame = (this.Frame + 1) % (mDef.frames * mDef.imageFrameDivider);
            else
                this.Frame = (this.Frame + 1) % ((mDef.frames + 1) * mDef.imageFrameDivider);
            this.X = nx;
            this.Y = ny;
            this.UpdatePosition();
        }
        else {
            this.realDirection += Math.PI;
            if (this.realDirection < 0)
                this.realDirection += Math.PI * 2;
            if (this.realDirection >= Math.PI * 2)
                this.realDirection -= Math.PI * 2;
        }
    };
    Monster.prototype.HandlePath = function () {
        if (!this.path || this.path.length == 0)
            return false;
        var updateFrame = false;
        var nx = this.X;
        var ny = this.Y;
        if (this.path && this.path.length > 0) {
            var p = this.path[0];
            var sx = Math.abs(p.x - this.X);
            var sy = Math.abs(p.y - this.Y);
            if (sx <= this.Speed && sy <= this.Speed) {
                nx = p.x;
                ny = p.y;
                this.path.shift();
            }
            else {
                if (p.x > nx && sx > this.Speed) {
                    nx += this.Speed;
                    this.Direction = 2;
                    updateFrame = true;
                }
                else if (p.x < nx && sx > this.Speed) {
                    nx -= this.Speed;
                    this.Direction = 1;
                    updateFrame = true;
                }
                if (p.y > ny && sy > this.Speed) {
                    ny += this.Speed;
                    this.Direction = 0;
                    updateFrame = true;
                }
                else if (p.y < ny && sy > this.Speed) {
                    ny -= this.Speed;
                    this.Direction = 3;
                    updateFrame = true;
                }
            }
        }
        if (this.CanWalkOn(nx, ny)) {
            this.X = nx;
            this.Y = ny;
            var ax = this.CurrentArea.X;
            var ay = this.CurrentArea.Y;
            if (updateFrame)
                this.Frame = (this.Frame + 1) % ((world.art.characters[this.MonsterEnv.Art].frames + 1) * world.art.characters[this.MonsterEnv.Art].imageFrameDivider);
            this.UpdatePosition();
            // Update path after crossing the border
            if (this.path && this.path.length > 0) {
                var tileWidth = world.art.background.width;
                var tileHeight = world.art.background.height;
                var needToRepath = false;
                if (ax > world.Player.CurrentArea.X) {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].x += (world.areaWidth - 0) * tileWidth;
                    needToRepath = true;
                }
                if (ax < world.Player.CurrentArea.X) {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].x -= (world.areaWidth - 0) * tileWidth;
                    needToRepath = true;
                }
                if (ay > world.Player.CurrentArea.Y) {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].y += (world.areaHeight - 0) * tileHeight;
                    needToRepath = true;
                }
                if (ay < world.Player.CurrentArea.Y) {
                    for (var i = 0; i < this.path.length; i++)
                        this.path[i].y -= (world.areaHeight - 0) * tileHeight;
                    needToRepath = true;
                }
                this.lastPath = 0;
            }
            return true;
        }
        else {
            this.path = null;
            return false;
        }
    };
    Monster.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetActorImage(this.MonsterEnv.Art);
        if (!img || !img.width)
            return;
        var actorArtInfo = renderEngine.world.art.characters[this.MonsterEnv.Art];
        var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
        var w = Math.floor(img.width / actorArtInfo.frames);
        var h = Math.floor(img.height / actorArtInfo.directions);
        var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
        var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
        var fz = 1;
        var d = this.Direction;
        switch (this.ActionAnimation) {
            case ACTION_ANIMATION.ATTACK:
                var ox = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].x;
                var oy = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].y;
                switch (this.Direction) {
                    case 0:
                        iy -= ox;
                        break;
                    case 1:
                        ix += ox;
                        iy -= oy;
                        break;
                    case 2:
                        ix -= ox;
                        iy -= oy;
                        break;
                    case 3:
                        iy += ox;
                        break;
                    default:
                        break;
                }
                f += Math.floor(this.ActionAnimationStep / actorArtInfo.imageFrameDivider);
                this.ActionAnimationStep++;
                if (this.ActionAnimationStep >= 40) {
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
                if (this.ActionAnimationStep >= 6) {
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
        if (actorArtInfo.animationCycle != "simple") {
            f = f % (actorArtInfo.frames + 1);
            if (f == actorArtInfo.frames)
                f = Math.floor(f / 2);
        }
        else
            f = f % actorArtInfo.frames;
        ctx.drawImage(img, Math.floor(w * f), Math.floor(h * d), w, h, Math.floor(ix + (1 - fz) * w / 2), Math.floor(iy + (1 - fz) * h / 2), w * fz, h * fz);
        var maxValue = this.GetStatMaxValue('life');
        if (maxValue) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(ix, iy + h + 2, w, 5);
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(ix + 1, iy + h + 3, Math.round(this.GetStat('life') * (w - 2) / maxValue), 3);
        }
        if (this.ParticleEffect) {
            ctx.save();
            ctx.translate(x, y);
            this.ParticleEffect.Draw(ctx);
            ctx.restore();
        }
    };
    Monster.prototype.PlayerInteract = function (ax, ay) {
        //world.Player.InvokeSkillFunction("Attack", "Action", [new VariableValue(this.Id)]);
    };
    Monster.prototype.PlayerMouseInteract = function (ax, ay) {
        return false;
    };
    Monster.prototype.InvokeFunction = function (action, variableValues) {
        if (!this.MonsterEnv.HasFunction(action)) {
            if (!this.MonsterEnv.DefaultMonster.HasFunction(action))
                return null;
            this.MonsterEnv.DefaultMonster.Code.ParentCode = this.MonsterEnv.Code;
            return this.MonsterEnv.DefaultMonster.InvokeFunction(action, variableValues);
        }
        return this.MonsterEnv.InvokeFunction(action, variableValues);
    };
    return Monster;
}(MovingActor));
var Answer = (function () {
    function Answer() {
        this.Text = "Ok";
        this.Actions = [];
        this.Conditions = [];
        this.JumpTo = -1;
    }
    return Answer;
}());
var npcNames = new ((function () {
    function class_10() {
        this.firstNames = ["Adelaide", "Aleida", "Alexia", "Alianor", "Alice", "Althalos", "Amelia", "Anastas", "Angmar", "Anne", "Arabella", "Ariana",
            "Arthur", "Asher", "Atheena", "Ayleth", "Barda", "Beatrix", "Benedict", "Benevolence", "Berinon", "Borin", "Brangian", "Brom",
            "Brunhild", "Bryce", "Carac", "Cassius", "Catherine", "Catrain", "Cedany", "Cedric", "Charles", "Clifton", "Cornwallis", "Cristiana",
            "Dain", "Destrian", "Dimia", "Donald", "Doran", "Duraina", "Edmund", "Eleanor", "Elizabeth", "Emeline", "Enndolynn", "Falk",
            "Farfelee", "Favian", "Fendrel", "Forthwind", "Francis", "Frederick", "Gavin", "Gavin", "Geoffrey", "Gloriana", "Godiva", "Gorvenal",
            "Gregory", "Guinevere", "Gussalen", "Gwendolynn", "Hadrian", "Helena", "Helena", "Helewys", "Henry", "Hildegard", "Isabel", "Iseult",
            "Isolde", "Jacquelyn", "Janet", "Janshai", "Jarin", "Jasmine", "John", "John", "Josef", "Joseph", "Josselyn", "Juliana", "Justice", "Katelyn",
            "Katrina", "Kaylein", "Krea", "Leo", "Leofrick", "Letholdus", "Lief", "Loreena", "Luanda", "Maerwynn", "Malkyn", "Margaret", "Maria", "Mary",
            "Matilda", "Merek", "Millicent", "Mirabelle", "Muriel", "Oliver", "Peronell", "Peter", "Peyton", "Phrowenia", "Quinn", "Rainydayas", "Robin",
            "Roger", "Ronald", "Rose", "Rowan", "Rulf", "Ryia", "Sadon", "Seraphina", "Sibyl", "Simon", "Terrin", "Terrowin", "Terryn", "Thea", "Thomas",
            "Tristan", "Tybalt", "Ulric", "Victoria", "Walter", "William", "Winifred", "Xalvador", "Ysmay", "Zane"];
        this.firstPart = ["Long", "Short", "Kink", "Brown", "Red", "Small", "Big", "Short", "Swift", "Quick", "Slow", "Odd",
            "Cute", "Nice", "Ugly", "Dead", "Beautiful", "Meaningless", "Adorable", "Gorgeous", "Broken", "Aged", "Aggresive", "Angry", "Amused",
            "Antique", "Ashamed", "Austere", "Awerage", "Bad", "Bare", "Basic", "Beloved", "Black", "Blue", "Bleak", "Brisk", "Bruised", "Busy",
            "Brave", "Bulky", "Blushing", "Calm", "Deep", "Dim", "Dirty", "Double", "Drab", "Dicrete", "Dual", "Dull", "Fat", "Fond", "Frugal",
            "Fumbling", "Flawless", "Few", "Glum", "Glossy", "Grim", "Grown", "Giant", "Hairy", "Handy", "Harsh", "Hot", "Huge"];
        this.middlePart = ["nose", "head", "leg", "foot", "arm", "eye", "hear", "hair", "thumb", "finger", "nail", "neck", "tongue",
            "chest", "knee", "eyebrow", "mouth", "shoulder", "elbow", "tummy", "ankle", "back", "toe", "blood", "brain", "breast", "claf", "chin",
            "clavicle", "diaphragm", "eyelid", "face", "femur", "groin", "grum", "heart", "heel", "hip", "humerus", "jaw", "kidney", "larynx", "lip", "liver",
            "lobe", "lungs", "mandible", "muscle", "molar", "navel", "nerves", "organs", "palm", "phalanges", "pupil", "radius", "ribs", "scalp", "senses",
            "shoulder", "skin", "skull", "sole", "spine", "stomach", "sternum", "teeth", "throat", "tibia", "waist", "wrist"];
        this.lastNames = [];
    }
    return class_10;
}()));
var NPC = (function () {
    function NPC() {
    }
    NPC.GenerateName = function (firstNameOnly) {
        if (firstNameOnly === void 0) { firstNameOnly = false; }
        if (firstNameOnly)
            return npcNames.firstNames[Math.round(Math.random() * (npcNames.firstNames.length - 1))];
        return npcNames.firstNames[Math.round(Math.random() * (npcNames.firstNames.length - 1))] + " " +
            npcNames.firstPart[Math.round(Math.random() * (npcNames.firstPart.length - 1))] +
            npcNames.middlePart[Math.round(Math.random() * (npcNames.middlePart.length - 1))];
    };
    NPC.Generate = function () {
        var npc = new NPC();
        var dialog = new Dialog();
        dialog.Text = "Hi @name@!\n\nWhat can I do for you today?";
        npc.Dialogs = [dialog];
        var answer = new Answer();
        answer.Text = "Nothing thanks.";
        dialog.Answers = [answer];
        npc.Name = NPC.GenerateName();
        for (var n in world.art.characters) {
            npc.Look = n;
            break;
        }
        return npc;
    };
    return NPC;
}());
/// <reference path="../MovingActor.ts" />
var npc = new ((function () {
    function class_11() {
    }
    return class_11;
}()));
var NPCActor = (function (_super) {
    __extends(NPCActor, _super);
    function NPCActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NPCActor.Create = function (npc, worldArea, x, y) {
        var result = new NPCActor(worldArea.world);
        result.CurrentArea = worldArea;
        result.X = x;
        result.Y = y;
        result.Name = npc.Name;
        result.baseNpc = npc;
        return result;
    };
    NPCActor.prototype.CanReachArea = function (x, y) {
        return (Math.abs(this.World.Player.CurrentArea.X - x) < 2 && Math.abs(this.World.Player.CurrentArea.Y - y) < 2);
    };
    NPCActor.prototype.Handle = function () {
    };
    NPCActor.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetActorImage(this.baseNpc.Look);
        if (!img)
            return;
        if (img.width) {
            var actorArtInfo = null;
            actorArtInfo = renderEngine.world.art.characters[this.baseNpc.Look];
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            ctx.drawImage(img, w * 1, h * this.Direction, w, h, ix, iy, w, h);
            ctx.font = "10px sans-serif";
            var tw = ctx.measureText(this.Name).width;
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText(this.Name, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
            ctx.fillStyle = "#00E000";
            ctx.lineWidth = 1;
            ctx.fillText(this.Name, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
        }
    };
    NPCActor.prototype.PlayerInteract = function (ax, ay) {
    };
    NPCActor.prototype.PlayerMouseInteract = function (ax, ay) {
        if (this.DistanceTo(world.Player) > 160) {
            Framework.ShowMessage("You are too far, move nearer.");
            return true;
        }
        setTimeout(Play.MouseUp, 100);
        world.Player.InDialog = true;
        $("#npcDialog").show();
        $("#npcDialog .gamePanelHeader").html(this.baseNpc.Name.htmlEntities());
        npc.Dialogs = this.baseNpc.Dialogs;
        npc.currentNPC = this.baseNpc;
        NPCActor.ShowDialog(0);
        return true;
    };
    NPCActor.ShowDialog = function (id) {
        // Close dialog
        if (id < 0) {
            world.Player.InDialog = false;
            $("#npcDialog").hide();
            return;
        }
        var dialog = npc.Dialogs[id];
        npc.Answers = dialog.Answers;
        $("#dialogSentence").html(Main.TextTransform(dialog.Text, true));
        play.onDialogPaint = [];
        var html = "";
        for (var i = 0; i < dialog.Answers.length; i++)
            if (NPCActor.CanShow(dialog.Answers[i].Conditions))
                html += "<div onclick='NPCActor.ClickAnswer(" + i + ");' class='gameButton'>" + dialog.Answers[i].Text.htmlEntities() + "</div>";
        $("#dialogAnswers").html(html);
    };
    NPCActor.ClickAnswer = function (id) {
        var answer = npc.Answers[id];
        if (!NPCActor.CanShow(answer.Conditions))
            return;
        npc.canJump = true;
        // Execute code
        if (answer.Actions)
            for (var i = 0; i < answer.Actions.length; i++)
                dialogAction.code[answer.Actions[i].Name].Execute(answer.Actions[i].Values);
        if (npc.canJump)
            NPCActor.ShowDialog(answer.JumpTo);
    };
    NPCActor.CanShow = function (conditions) {
        if (!conditions)
            return true;
        for (var i = 0; i < conditions.length; i++)
            if (!dialogCondition.code[conditions[i].Name].Check(conditions[i].Values))
                return false;
        return true;
    };
    NPCActor.ShowShop = function () {
        $.ajax({
            type: 'POST',
            url: '/backend/GetTotalCredits',
            data: {
                token: framework.Preferences['token'],
            },
            success: function (msg) {
                $("#field_currentCredits").html(msg);
                var credits = parseInt(msg);
                var havePremiumItems = false;
                for (var i = 0; i < npc.currentNPC.ShopItems.length; i++) {
                    if (npc.currentNPC.ShopItems[i].PremiumShop === true) {
                        havePremiumItems = true;
                        break;
                    }
                }
                var html = "";
                var moneyStat = world.Player.FindStat("Money");
                html += "Your " + (moneyStat.BaseStat.CodeVariable('DisplayName') ? moneyStat.BaseStat.CodeVariable('DisplayName') : moneyStat.Name).htmlEntities() + ": " + ("" + moneyStat.Value).htmlEntities();
                if (havePremiumItems)
                    html += "<br><a href='https://www.dotworldmaker.com/add_credits.html' target='credits'>Game premium credits: " + msg + "</a> <div class='gameButton' onclick='NPCActor.ShowShop()'>Refresh</div><br><br>";
                html += "<table>";
                //html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Price:</td><td>In Inventory:</td></tr></thead>";
                html += "<thead><tr><td>&nbsp;</td><td>Item:</td><td>Buy Price:</td><td>Sell Price:</td><td>In Inventory:</td></tr></thead>";
                for (var i = 0; i < npc.currentNPC.ShopItems.length; i++) {
                    var details = world.GetInventoryObject(npc.currentNPC.ShopItems[i].Name);
                    if (!details)
                        continue;
                    var qt = world.Player.GetInventoryQuantity(npc.currentNPC.ShopItems[i].Name);
                    html += "<tr>";
                    html += "<td>";
                    if ((moneyStat.Value >= npc.currentNPC.ShopItems[i].SellPrice && npc.currentNPC.ShopItems[i].PremiumShop !== true) ||
                        (credits >= npc.currentNPC.ShopItems[i].SellPrice && npc.currentNPC.ShopItems[i].PremiumShop === true))
                        html += "<div class='gameButton' onclick='NPCActor.Buy(" + i + ")'>Buy</div>";
                    if (qt > 0 && npc.currentNPC.ShopItems[i].BuyPrice > 0)
                        html += "<div class='gameButton' onclick='NPCActor.Sell(" + i + ")'>Sell</div>";
                    html += "&nbsp;";
                    html += "</td>";
                    html += "<td>" + npc.currentNPC.ShopItems[i].Name.htmlEntities() + "</td>";
                    html += "<td>" + ("" + npc.currentNPC.ShopItems[i].SellPrice).htmlEntities() + "</td>";
                    html += "<td>" + ("" + (npc.currentNPC.ShopItems[i].BuyPrice === 0 ? "" : npc.currentNPC.ShopItems[i].BuyPrice)).htmlEntities() + "</td>";
                    html += "<td>" + (qt ? qt : 0) + "</td>";
                    html += "<td>" + (npc.currentNPC.ShopItems[i].PremiumShop === true ? "Credits" : "") + "</td>";
                    html += "</tr>";
                }
                html += "</table>";
                $("#dialogSentence").html(html);
                play.onDialogPaint = [];
                $("#dialogAnswers").html("<div onclick='NPCActor.HideShop();' class='gameButton'>Close</div>");
            },
            error: function (msg, textStatus) {
            }
        });
    };
    NPCActor.Sell = function (rowId) {
        var shopItem = npc.currentNPC.ShopItems[rowId];
        var qt = world.Player.GetInventoryQuantity(shopItem.Name);
        if (qt < 1)
            return;
        if (shopItem.PremiumShop) {
            Framework.Confirm("This is a premium item, are you sure you want to sell it?", function () {
                world.Player.SetStat("Money", world.Player.GetStat("Money") + shopItem.BuyPrice);
                world.Player.RemoveItem(shopItem.Name, 1);
                NPCActor.ShowShop();
            });
        }
        else {
            world.Player.SetStat("Money", world.Player.GetStat("Money") + shopItem.BuyPrice);
            world.Player.RemoveItem(shopItem.Name, 1);
            NPCActor.ShowShop();
        }
    };
    NPCActor.Buy = function (rowId) {
        var shopItem = npc.currentNPC.ShopItems[rowId];
        if (shopItem.PremiumShop) {
            Framework.Confirm("This is a premium item, are you sure you want to purchase it?", function () {
                $.ajax({
                    type: 'POST',
                    url: '/backend/PremiumPurchase',
                    data: {
                        token: framework.Preferences['token'],
                        item: shopItem.Name,
                        game: world.Id,
                        credits: shopItem.SellPrice
                    },
                    success: function (msg) {
                        var res = TryParse(msg);
                        if (res === true) {
                            world.Player.AddItem(shopItem.Name, 1);
                            NPCActor.ShowShop();
                            Framework.ShowMessage("Operation succeeded !");
                        }
                        else
                            Framework.ShowMessage("Operation failed...");
                    },
                    error: function (msg, textStatus) {
                    }
                });
            });
        }
        else {
            if (world.Player.GetStat("Money") < shopItem.SellPrice)
                return;
            world.Player.SetStat("Money", world.Player.GetStat("Money") - shopItem.SellPrice);
            world.Player.AddItem(shopItem.Name, 1);
            NPCActor.ShowShop();
        }
    };
    NPCActor.HideShop = function () {
        NPCActor.ShowDialog(0);
    };
    return NPCActor;
}(MovingActor));
///<reference path="../MovingActor.ts" />
var OtherPlayer = (function (_super) {
    __extends(OtherPlayer, _super);
    function OtherPlayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.CurrentEmote = null;
        _this.EmoteTimer = 0;
        return _this;
    }
    OtherPlayer.FindPlayer = function (username) {
        if (world && world.areas)
            for (var i = 0; i < world.areas.length; i++)
                if (world.areas[i] && world.areas[i].otherPlayers)
                    for (var j = 0; j < world.areas[i].otherPlayers.length; j++)
                        if (world.areas[i].otherPlayers[j].Username == username)
                            return world.areas[i].otherPlayers[j];
        return null;
    };
    OtherPlayer.prototype.CanReachArea = function (x, y) {
        return true;
    };
    OtherPlayer.prototype.Handle = function () {
        if ((this.VX || this.VY) && this.InterpolationStep < 30) {
            this.Frame = (this.Frame + 1) % ((world.art.characters[world.Player.Name].frames + 1) * world.art.characters[world.Player.Name].imageFrameDivider);
            this.X += this.VX;
            this.Y += this.VY;
            if (this.VY < 0)
                this.Direction = 3;
            if (this.VX < 0)
                this.Direction = 1;
            if (this.VX > 0)
                this.Direction = 2;
            if (this.VY > 0)
                this.Direction = 0;
            this.InterpolationStep++;
        }
        else if (this.InterpolationStep >= 30) {
            this.X = this.DX;
            this.Y = this.DY;
        }
    };
    OtherPlayer.prototype.Draw = function (renderEngine, ctx, x, y) {
        var img = renderEngine.GetActorImage(this.Name);
        if (!img)
            return;
        if (img.width) {
            var actorArtInfo = renderEngine.world.art.characters[this.Name];
            var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
            if (f == actorArtInfo.frames)
                f = Math.floor(f / 2);
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            /*var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);*/
            //var ix = x;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            //var iy = y - h;
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            ctx.drawImage(img, Math.floor(w * f), Math.floor(h * this.Direction), w, h, Math.floor(ix), Math.floor(iy), w, h);
            if (this.CurrentEmote != null) {
                if (this.EmoteTimer > 160)
                    ctx.globalAlpha = (180 - this.EmoteTimer) / 20;
                ctx.drawImage(playerEffects.emotes, this.CurrentEmote * 24, 0, 24, 24, ix + w / 2, iy + (Math.sin(this.EmoteTimer / 10) * 5) - 28, 24, 24);
                ctx.globalAlpha = 1;
                this.EmoteTimer++;
                if (this.EmoteTimer > 180) {
                    this.EmoteTimer = 0;
                    this.CurrentEmote = null;
                }
            }
            ctx.font = "10px sans-serif";
            var tw = ctx.measureText(this.Username).width;
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText(this.Username, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
            ctx.fillStyle = "#A0A0FF";
            ctx.lineWidth = 1;
            ctx.fillText(this.Username, Math.floor(ix + w / 2 - tw / 2) + 0.5, Math.floor(iy + h) + 0.5);
        }
    };
    OtherPlayer.prototype.PlayerInteract = function (ax, ay) {
    };
    OtherPlayer.prototype.PlayerMouseInteract = function (ax, ay) {
        return false;
    };
    return OtherPlayer;
}(MovingActor));
///<reference path="../MovingActor.ts" />
var playerEffects = new ((function () {
    function class_12() {
    }
    return class_12;
}()));
var EmotesArt;
(function (EmotesArt) {
    EmotesArt[EmotesArt["sml"] = 0] = "sml";
    EmotesArt[EmotesArt["yay"] = 1] = "yay";
    EmotesArt[EmotesArt["wee"] = 2] = "wee";
    EmotesArt[EmotesArt["sad"] = 3] = "sad";
    EmotesArt[EmotesArt["orz"] = 4] = "orz";
    EmotesArt[EmotesArt["oo"] = 5] = "oo";
    EmotesArt[EmotesArt["meh"] = 6] = "meh";
    EmotesArt[EmotesArt["lv"] = 7] = "lv";
    EmotesArt[EmotesArt["hurr"] = 8] = "hurr";
    EmotesArt[EmotesArt["huh"] = 9] = "huh";
    EmotesArt[EmotesArt["hmm"] = 10] = "hmm";
    EmotesArt[EmotesArt["guu"] = 11] = "guu";
    EmotesArt[EmotesArt["grr"] = 12] = "grr";
    EmotesArt[EmotesArt["ah"] = 13] = "ah";
})(EmotesArt || (EmotesArt = {}));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(world) {
        var _this = _super.call(this, world) || this;
        _this.InDialog = false;
        _this.Zone = "Base";
        _this.AX = 0;
        _this.AY = 0;
        _this.lastSentUpdate = null;
        _this.initializedReceiver = false;
        _this.saveTimeout = null;
        _this.questVariables = {};
        _this.Inventory = [];
        _this.EquipedObjects = {};
        _this.TemporaryEffects = [];
        _this.RespawnPoint = null;
        _this.Quests = [];
        _this.Kills = [];
        _this.killCache = null;
        _this.VisitedChests = [];
        _this.VisitedMapObjects = [];
        _this.CurrentSkill = "Attack";
        _this.QuickSlot = [null, null, null, null, null, null, null, null, null, null];
        _this.CurrentEmote = null;
        _this.EmoteTimer = 0;
        _this.ChatMutedTill = null;
        _this.ChatBannedTill = null;
        _this.StoredCompare = null;
        _this.onGoingSave = null;
        return _this;
    }
    Player.prototype.Initialize = function (whenFinished) {
        var _this = this;
        if (world.Id == 1 && framework.Preferences['token'] == "demo") {
            this.DefaultInit(whenFinished);
            return;
        }
        if (Main.CheckNW()) {
            var saves = {};
            if (framework.Preferences['gameSaves'])
                saves = JSON.parse(framework.Preferences['gameSaves']);
            if (!saves["S" + world.Id]) {
                this.DefaultInit(whenFinished);
                return;
            }
            try {
                var p = saves["S" + world.Id].position;
                var result = {
                    x: p.X, y: p.Y, zone: p.Zone, data: saves["S" + world.Id].data
                };
                this.PostLoad(JSON.stringify(result), whenFinished);
            }
            catch (ex) {
                this.DefaultInit(whenFinished);
            }
            return;
        }
        if (game) {
            Framework.ReloadPreferences();
            if (!framework.Preferences['gamePlayer']) {
                this.DefaultInit(whenFinished);
                return;
            }
            try {
                var p = JSON.parse(framework.Preferences['gamePlayerPos']);
                var result = {
                    x: p.X, y: p.Y, zone: p.Zone, data: framework.Preferences['gamePlayer']
                };
                this.PostLoad(JSON.stringify(result), whenFinished);
            }
            catch (ex) {
                this.DefaultInit(whenFinished);
            }
            return;
        }
        if (!framework.Preferences['token']) {
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
            success: function (msg) {
                _this.PostLoad(msg, whenFinished);
            },
            error: function (msg, textStatus) {
                framework.Preferences['token'] = null;
                Framework.SavePreferences();
                document.location.reload();
                return;
            }
        });
    };
    Player.prototype.PostLoad = function (msg, whenFinished) {
        var result = TryParse(msg);
        if (!result) {
            this.DefaultInit(whenFinished);
            return;
        }
        try {
            this.RestoreJSON(result.data);
            world.Player.StoredCompare = world.Player.JSON();
        }
        catch (ex) {
            console.log(ex);
            this.DefaultInit(whenFinished);
            return;
        }
        Teleport.Teleport(result.x, result.y, result.zone);
        whenFinished();
    };
    Player.prototype.DefaultInit = function (whenFinished) {
        for (var i = 0; i < this.World.Stats.length; i++) {
            var stat = new Stat();
            stat.Name = this.World.Stats[i].Name;
            stat.BaseStat = this.World.Stats[i];
            stat.Value = this.World.Stats[i].DefaultValue;
            this.Stats.push(stat);
        }
        for (var i = 0; i < this.World.Skills.length; i++) {
            if (!this.World.Skills[i].AutoReceive)
                continue;
            var skill = new Skill();
            skill.Name = this.World.Skills[i].Name;
            skill.BaseSkill = this.World.Skills[i];
            if (this.Skills.length < 10) {
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
    };
    Player.prototype.CanReachArea = function (x, y) {
        return true;
    };
    Player.prototype.Handle = function () {
        var _this = this;
        if (this.ParticleEffectDuration && this.ParticleEffectDuration.getTime() < new Date().getTime()) {
            this.ParticleEffect = null;
            this.ParticleEffectDuration = null;
        }
        var j = this.JSON();
        if (j != this.StoredCompare) {
            play.devTools = true;
            this.InformServer();
        }
        this.HandleEffects();
        if (this.CurrentArea) {
            this.AX = this.CurrentArea.X;
            this.AY = this.CurrentArea.Y;
        }
        var now = new Date();
        if (chat.socket && (this.lastSentUpdate == null || (now.valueOf() - this.lastSentUpdate.valueOf()) >= 500)) {
            chat.socket.emit('position', this.Zone, this.X + this.AX * world.areaWidth * world.art.background.width, this.Y + this.AY * world.areaHeight * world.art.background.height, this.Name, this.CurrentEmote, this.EmoteTimer, this.Direction);
            this.lastSentUpdate = now;
        }
        if (!this.initializedReceiver && chat.socket) {
            this.initializedReceiver = true;
            chat.socket.on('remove', function (name) {
                var otherPlayer = OtherPlayer.FindPlayer(name);
                if (otherPlayer) {
                    for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++) {
                        if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer) {
                            otherPlayer.CurrentArea.otherPlayers.splice(i, 1);
                            break;
                        }
                    }
                }
                return;
            });
            chat.socket.on('reset', function () {
                document.location.reload();
            });
            chat.socket.on('recall', function () {
                if (world.Player.RespawnPoint)
                    Teleport.Teleport(world.Player.RespawnPoint.X, world.Player.RespawnPoint.Y, world.Player.RespawnPoint.Zone);
                else
                    Teleport.Teleport(world.SpawnPoint.X, world.SpawnPoint.Y, world.SpawnPoint.Zone);
            });
            chat.socket.on('position', function (zone, x, y, name, look, emote, emoteTimer, direction) {
                var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
                var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
                var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
                var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
                if (ax < 0)
                    mx = (world.areaWidth - 0) * world.art.background.width - mx;
                if (ay < 0)
                    my = (world.areaHeight - 0) * world.art.background.height - my;
                // no need to handle if it's outside of the current region
                if (_this.Zone != zone || Math.abs(ax - _this.AX) > 1 || Math.abs(ay - _this.AY) > 1 || name == _this.Username) {
                    var otherPlayer = OtherPlayer.FindPlayer(name);
                    if (otherPlayer) {
                        for (var i = 0; i < otherPlayer.CurrentArea.otherPlayers.length; i++) {
                            if (otherPlayer.CurrentArea.otherPlayers[i] == otherPlayer) {
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
    };
    Player.prototype.InformServer = function () {
        Framework.Alert("Cheat detected... Server has been informed.");
    };
    Player.prototype.InvokeSkillFunction = function (skillName, functionName, values) {
        var name = skillName.toLowerCase();
        for (var i = 0; i < this.Skills.length; i++)
            if (this.Skills[i].Name.toLowerCase() == name)
                return this.Skills[i].BaseSkill.InvokeFunction(functionName, values);
        return null;
    };
    Player.prototype.Draw = function (renderEngine, ctx, x, y) {
        if (!playerEffects.emotes) {
            playerEffects.emotes = new Image();
            playerEffects.emotes.src = "art/tileset2/emotes.png";
        }
        var img = renderEngine.GetActorImage(this.Name);
        if (!img)
            return;
        if (img.width) {
            var actorArtInfo = renderEngine.world.art.characters[this.Name];
            var f = Math.floor(this.Frame / actorArtInfo.imageFrameDivider);
            var w = img.width / actorArtInfo.frames;
            var h = img.height / actorArtInfo.directions;
            var ix = x - (actorArtInfo.groundX ? actorArtInfo.groundX : 0);
            var iy = y - (actorArtInfo.groundY ? actorArtInfo.groundY : 0);
            var fz = 1;
            var d = this.Direction;
            switch (this.ActionAnimation) {
                case ACTION_ANIMATION.ATTACK:
                    var ox = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].x;
                    var oy = sideAttack[Math.floor(this.ActionAnimationStep * sideAttack.length / 40)].y;
                    switch (this.Direction) {
                        case 0:
                            iy -= ox;
                            break;
                        case 1:
                            ix += ox;
                            iy -= oy;
                            break;
                        case 2:
                            ix -= ox;
                            iy -= oy;
                            break;
                        case 3:
                            iy += ox;
                            break;
                        default:
                            break;
                    }
                    f += Math.floor(this.ActionAnimationStep / actorArtInfo.imageFrameDivider);
                    this.ActionAnimationStep++;
                    if (this.ActionAnimationStep >= 40) {
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
                    if (this.ActionAnimationStep >= 6) {
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
            if (actorArtInfo.animationCycle != "simple") {
                f = f % (actorArtInfo.frames + 1);
                if (f == actorArtInfo.frames)
                    f = Math.floor(f / 2);
            }
            else
                f = f % actorArtInfo.frames;
            ctx.drawImage(img, Math.floor(w * f), Math.floor(h * d), w, h, Math.floor(ix + (1 - fz) * w / 2), Math.floor(iy + (1 - fz) * h / 2), w * fz, h * fz);
            if (this.CurrentEmote != null) {
                if (this.EmoteTimer > 160)
                    ctx.globalAlpha = (180 - this.EmoteTimer) / 20;
                ctx.drawImage(playerEffects.emotes, this.CurrentEmote * 24, 0, 24, 24, ix + w / 2, iy + (Math.sin(this.EmoteTimer / 10) * 5) + (1 - fz) * h / 2 - 28, 24, 24);
                ctx.globalAlpha = 1;
                this.EmoteTimer++;
                if (this.EmoteTimer > 180) {
                    this.EmoteTimer = 0;
                    this.CurrentEmote = null;
                }
            }
        }
        if (this.ParticleEffect) {
            ctx.save();
            ctx.translate(x, y);
            this.ParticleEffect.Draw(ctx);
            ctx.restore();
        }
    };
    Player.prototype.PlayerInteract = function (ax, ay) {
    };
    Player.prototype.PlayerMouseInteract = function (ax, ay) {
        return false;
    };
    Player.prototype.GetQuestVariable = function (name) {
        if (this.questVariables[name] == null || this.questVariables[name] == undefined)
            return null;
        return this.questVariables[name];
    };
    Player.prototype.SetQuestVariable = function (name, value) {
        if (!this.SetQuestVariable.caller) {
            play.devTools = true;
            return;
        }
        this.questVariables[name] = value;
        this.StoredCompare = this.JSON();
        world.Player.Save();
    };
    Player.prototype.AddItem = function (name, quantity) {
        if (quantity === void 0) { quantity = 1; }
        if (isNaN(quantity) || quantity <= 0) {
            Main.AddErrorMessage("Can't add item '" + name + "' quantity " + quantity);
            return;
        }
        if (!this.AddItem.caller) {
            play.devTools = true;
            return;
        }
        for (var i = 0; i < this.Inventory.length; i++) {
            if (this.Inventory[i].Name == name) {
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
    };
    Player.prototype.RemoveItem = function (name, quantity) {
        if (quantity === void 0) { quantity = 1; }
        if (isNaN(quantity) || quantity <= 0) {
            Main.AddErrorMessage("Can't remove item '" + name + "' quantity " + quantity);
            return;
        }
        if (!this.RemoveItem.caller) {
            play.devTools = true;
            return;
        }
        for (var i = 0; i < this.Inventory.length; i++) {
            if (this.Inventory[i].Name == name) {
                this.Inventory[i].Count -= quantity;
                if (this.Inventory[i].Count <= 0)
                    this.Inventory.splice(i, 1);
                InventoryMenu.Update();
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return;
            }
        }
    };
    Player.prototype.GetInventoryQuantity = function (name) {
        for (var i = 0; i < this.Inventory.length; i++)
            if (this.Inventory[i].Name == name)
                return this.Inventory[i].Count;
        return null;
    };
    Player.prototype.Wear = function (itemName) {
        if (!this.Wear.caller) {
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
    };
    Player.prototype.Unwear = function (slot) {
        if (!this.Unwear.caller) {
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
    };
    Player.prototype.GiveSkill = function (name) {
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
    };
    Player.prototype.StartTemporaryEffect = function (name) {
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
    };
    Player.prototype.RemoveTemporaryEffect = function (name) {
        for (var i = 0; i < this.TemporaryEffects.length;) {
            if (this.TemporaryEffects[i].Name.toLowerCase() == name.toLowerCase())
                this.TemporaryEffects.splice(i, 1);
            else
                i++;
        }
        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    };
    Player.prototype.ClearTemporaryEffects = function () {
        this.TemporaryEffects = [];
        this.StoredCompare = this.JSON();
        world.Player.Save();
        ProfileMenu.Update();
    };
    Player.prototype.HandleEffects = function () {
        var modified = false;
        var now = new Date().getTime();
        for (var i = 0; i < this.TemporaryEffects.length;) {
            if (typeof this.TemporaryEffects[i].LastEvaluate == "string")
                this.TemporaryEffects[i].LastEvaluate = new Date(this.TemporaryEffects[i].LastEvaluate);
            if (typeof this.TemporaryEffects[i].EndTime == "string")
                this.TemporaryEffects[i].EndTime = new Date(this.TemporaryEffects[i].EndTime);
            var effect = world.GetTemporaryEffect(this.TemporaryEffects[i].Name);
            // Shall we have a recuring effect?
            if (effect.RecurringTimer > 0 && effect.RecurringActions && effect.RecurringActions.length > 0) {
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
            if (now > this.TemporaryEffects[i].EndTime.getTime()) {
                this.TemporaryEffects.splice(i, 1);
                for (var j = 0; j < effect.EndActions.length; j++)
                    dialogAction.code[effect.EndActions[j].Name].Execute(effect.EndActions[j].Values);
                modified = true;
            }
            else
                i++;
        }
        if (modified) {
            this.StoredCompare = this.JSON();
            world.Player.Save();
            ProfileMenu.Update();
        }
    };
    Player.prototype.RecordKill = function (monsterId, name) {
        if (!this.RecordKill.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        this.Kills.push({ KilledOn: new Date, MonsterId: monsterId, Name: name });
        if (this.killCache)
            this.killCache[monsterId] = this.Kills.length - 1;
        this.StoredCompare = this.JSON();
        world.Player.Save();
    };
    Player.prototype.CanRespawn = function (monsterId, respawnTime) {
        if (window['MapEditor'] && window['MapEditor'].IsOpen())
            return true;
        if (!this.killCache) {
            this.killCache = {};
            for (var i = 0; i < this.Kills.length; i++)
                this.killCache[this.Kills[i].MonsterId] = i;
        }
        if (this.killCache[monsterId]) {
            var i = this.killCache[monsterId];
            if (respawnTime === null || respawnTime === undefined)
                return false;
            var now = new Date();
            if (this.Kills[i] && this.Kills[i].KilledOn && (now.getTime() - this.Kills[i].KilledOn.getTime()) / 60000 > respawnTime) {
                this.Kills.splice(i, 1);
                delete this.killCache[monsterId];
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return true;
            }
            return false;
        }
        return true;
    };
    Player.prototype.StartQuest = function (name) {
        if (!this.StartQuest.caller) {
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
    };
    Player.prototype.IsQuestStarted = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return true;
        return false;
    };
    Player.prototype.IsQuestCompleted = function (name) {
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++)
            if (this.Quests[i].Name.toLowerCase() == lname)
                return this.Quests[i].Completed != null;
        return false;
    };
    Player.prototype.AddQuestJournalEntry = function (questName, journalEntry) {
        if (!this.AddQuestJournalEntry.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var quest = world.GetQuest(questName);
        if (!quest)
            return;
        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++) {
            if (quest.JournalEntries[i].Id == journalEntry) {
                found = true;
                break;
            }
        }
        if (!found)
            return;
        if (!this.IsQuestStarted(questName))
            this.StartQuest(questName);
        var lname = questName.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++) {
            if (this.Quests[i].Name.toLowerCase() == lname) {
                this.Quests[i].JournalEntries.push({ EntryId: journalEntry, ReceivedOn: new Date() });
                this.StoredCompare = this.JSON();
                world.Player.Save();
                return;
            }
        }
    };
    Player.prototype.HaveQuestJournalEntry = function (questName, journalEntry) {
        var lname = questName.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++) {
            if (this.Quests[i].Name.toLowerCase() == lname) {
                for (var j = 0; j < this.Quests[i].JournalEntries.length; j++)
                    if (this.Quests[i].JournalEntries[j].EntryId == journalEntry)
                        return true;
                return false;
            }
        }
        return false;
    };
    Player.prototype.CompleteQuest = function (name) {
        if (!this.CompleteQuest.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        var lname = name.toLowerCase();
        for (var i = 0; i < this.Quests.length; i++) {
            if (this.Quests[i].Name.toLowerCase() == lname) {
                if (!this.Quests[i].Completed) {
                    this.Quests[i].Completed = new Date();
                    this.StoredCompare = this.JSON();
                    world.Player.Save();
                }
                return;
            }
        }
    };
    Player.prototype.HasVisitedChest = function (id) {
        return this.VisitedChests.indexOf(id) != -1;
    };
    Player.prototype.VisitChest = function (id) {
        if (this.HasVisitedChest(id))
            return;
        this.VisitedChests.push(id);
        this.StoredCompare = this.JSON();
        world.Player.Save();
    };
    Player.prototype.HasVisitedMapObject = function (id) {
        return this.VisitedMapObjects.indexOf(id) != -1;
    };
    Player.prototype.VisitMapObject = function (id) {
        if (this.HasVisitedMapObject(id))
            return;
        this.VisitedMapObjects.push(id);
        this.StoredCompare = this.JSON();
        world.Player.Save();
    };
    Player.prototype.JSON = function () {
        if (!this.JSON.caller) {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }
        return JSON.stringify({
            name: this.Name,
            saveId: this.SaveId,
            questVariables: this.questVariables,
            inventory: this.Inventory,
            equipedObjects: this.EquipedObjects,
            currentSkill: this.CurrentSkill,
            quickslots: this.QuickSlot,
            stats: this.Stats.map(function (c) {
                return { Name: c.Name, MaxValue: c.MaxValue, Value: c.Value };
            }),
            skills: this.Skills.map(function (c) {
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
    };
    Player.prototype.RestoreJSON = function (json) {
        var data = JSON.parse(json);
        this.SaveId = data.saveId;
        this.Name = data.name;
        this.questVariables = data.questVariables;
        this.QuickSlot = data.quickslots;
        this.CurrentSkill = data.currentSkill;
        this.Inventory = data.inventory ? data.inventory.map(function (c) { return new InventoryObject(c.Name, c.Count, c.UsageLevel); }) : [];
        this.EquipedObjects = {};
        for (var item in data.equipedObjects)
            this.EquipedObjects[item] = new InventoryObject(data.equipedObjects[item].Name, data.equipedObjects[item].Count, data.equipedObjects[item].UsageLevel);
        this.Quests = (data.quests ? data.quests : []);
        this.Stats = data.stats.map(function (c) {
            var res = new Stat();
            res.Name = c.Name;
            res.MaxValue = c.MaxValue;
            res.Value = c.Value;
            res.BaseStat = world.GetStat(c.Name);
            return res;
        });
        this.Skills = data.skills.map(function (c) {
            var res = new Skill();
            res.Name = c.Name;
            res.Level = c.Level;
            res.BaseSkill = world.GetSkill(c.Name);
            return res;
        });
        this.Kills = (data.kills ? data.kills : []);
        for (var i = 0; i < this.Kills.length; i++)
            this.Kills[i].KilledOn = new Date(this.Kills[i].KilledOn);
        this.killCache = null;
        this.VisitedChests = (data.chests ? data.chests : []);
        this.VisitedMapObjects = (data.mapobjects ? data.mapobjects : []);
        this.TemporaryEffects = data.temporaryEffects ? data.temporaryEffects : [];
        this.RespawnPoint = (data.respawnPoint ? data.respawnPoint : null);
        this.ChatBannedTill = new Date(data.chatBannedTill);
        this.ChatMutedTill = new Date(data.chatMutedTill);
    };
    Player.prototype.Save = function () {
        var _this = this;
        if (world.Id == -1)
            return;
        if (play.devTools)
            return;
        if (this.saveTimeout)
            clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(function () {
            _this.DoSave();
        }, 100);
    };
    Player.prototype.DoSave = function () {
        var _this = this;
        if (this.onGoingSave)
            return;
        var x = this.X + this.AX * world.areaWidth * world.art.background.width;
        var y = this.Y + this.AY * world.areaHeight * world.art.background.height;
        if (Main.CheckNW()) {
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
        if (game) {
            framework.Preferences['gamePlayer'] = this.JSON();
            var p = { Zone: this.Zone, X: x, Y: y };
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
            success: function (msg) {
                _this.onGoingSave = null;
                _this.SaveId = TryParse(msg);
                _this.StoredCompare = _this.JSON();
            },
            error: function (msg, textStatus) {
                this.onGoingSave = null;
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });
    };
    return Player;
}(MovingActor));
/// <reference path="ExecutionCode.ts" />
var AddCode = (function () {
    function AddCode() {
    }
    AddCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        if (a === null && b === null) {
            env.Push(new VariableValue(null));
            return;
        }
        if (a === null || a === undefined)
            a = new VariableValue("(null)");
        if (b === null || b === undefined)
            b = new VariableValue("(null)");
        var aType = a.Type;
        var bType = b.Type;
        if (aType == ValueType.String) {
            var aValue = a.GetString();
            if (!isNaN(parseFloat(aValue)) && ("" + parseFloat(aValue)) == aValue)
                aType = ValueType.Number;
        }
        if (bType == ValueType.String) {
            var bValue = b.GetString();
            if (!isNaN(parseFloat(bValue)) && ("" + parseFloat(bValue)) == bValue)
                bType = ValueType.Number;
        }
        if (aType == ValueType.String || bType == ValueType.String)
            env.Push(new VariableValue(a.GetString() + b.GetString()));
        else
            env.Push(new VariableValue(a.GetNumber() + b.GetNumber()));
        env.CodeLine++;
    };
    return AddCode;
}());
/// <reference path="ExecutionCode.ts" />
var AndCode = (function () {
    function AndCode() {
    }
    AndCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        env.Push(new VariableValue(a.GetBoolean() && b.GetBoolean()));
        env.CodeLine++;
    };
    return AndCode;
}());
/// <reference path="ExecutionCode.ts" />
var AssignCode = (function () {
    function AssignCode(name, index) {
        if (index === void 0) { index = false; }
        this.Index = false;
        this.Name = name;
        this.Index = index;
    }
    AssignCode.prototype.Execute = function (env) {
        if (this.Index == false) {
            var a = env.Pop();
            env.SetVariable(this.Name, a);
        }
        else {
            var idx = env.Pop().GetNumber();
            var a = env.Pop();
            var v = env.GetVariable(this.Name);
            v.Value[idx] = a;
        }
        env.CodeLine++;
    };
    return AssignCode;
}());
/// <reference path="ExecutionCode.ts" />
var CompareCode = (function () {
    function CompareCode(operation) {
        this.Operation = operation;
    }
    CompareCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        if (!a)
            a = new VariableValue(null);
        if (!b)
            b = new VariableValue(null);
        switch (this.Operation) {
            case "==":
                if (a.Type == ValueType.Null || b.Type == ValueType.Null)
                    env.Push(new VariableValue(a.Value === b.Value));
                else
                    env.Push(new VariableValue(a.Value == b.Value));
                break;
            case "!=":
                if (a.Type == ValueType.Null || b.Type == ValueType.Null)
                    env.Push(new VariableValue(a.Value !== b.Value));
                else
                    env.Push(new VariableValue(a.Value != b.Value));
                break;
            case "<=":
                env.Push(new VariableValue(a.Value <= b.Value));
                break;
            case "<":
                env.Push(new VariableValue(a.Value < b.Value));
                break;
            case ">=":
                env.Push(new VariableValue(a.Value >= b.Value));
                break;
            case ">":
                env.Push(new VariableValue(a.Value > b.Value));
                break;
            default:
                throw "Unknown operator " + this.Operation;
        }
        env.CodeLine++;
    };
    return CompareCode;
}());
/// <reference path="ExecutionCode.ts" />
var DivideCode = (function () {
    function DivideCode() {
    }
    DivideCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        if (a === null || b === null)
            env.Push(new VariableValue(null));
        else
            env.Push(new VariableValue(a.GetNumber() / b.GetNumber()));
        env.CodeLine++;
    };
    return DivideCode;
}());
/// <reference path="ExecutionCode.ts" />
var FlushVariableStackCode = (function () {
    function FlushVariableStackCode() {
    }
    FlushVariableStackCode.prototype.Execute = function (env) {
        env.Flush();
        env.CodeLine++;
    };
    return FlushVariableStackCode;
}());
/// <refe/rence path="ExecutionCode.ts" />
var FunctionCallCode = (function () {
    function FunctionCallCode(name, parametersCount) {
        this.Name = name;
        this.ParametersCount = parametersCount;
    }
    FunctionCallCode.prototype.Execute = function (env) {
        var values = [];
        for (var i = this.ParametersCount - 1; i >= 0; i--)
            values[i] = env.Pop();
        env.CodeLine++;
        if (!this.type) {
            var parts = this.Name.split('.');
            if (parts.length == 2 && env.HasWrapper(this.Name))
                this.type = "wrapper";
            else if (parts.length == 1 || parts.length == 3)
                this.type = "sub";
            else
                this.type = "api";
        }
        switch (this.type) {
            case "wrapper":
                env.ExecuteWrapperFunctionCode(this.Name, values);
                break;
            case "sub":
                env.ExecuteSubFunctionCode(this.Name, values);
                break;
            case "api":
                var a = env.ExecuteFunction(this.Name, values);
                if (a !== null)
                    env.Push(a);
                break;
        }
    };
    return FunctionCallCode;
}());
var FunctionDefinitionCode = (function () {
    function FunctionDefinitionCode() {
        this.Code = [];
        this.LoopExitStack = [];
    }
    return FunctionDefinitionCode;
}());
/// <reference path="ExecutionCode.ts" />
var IfCode = (function () {
    function IfCode(trueJump, falseJump) {
        this.TrueJump = trueJump;
        this.FalseJump = falseJump;
    }
    IfCode.prototype.Execute = function (env) {
        var a = env.Pop();
        if (a.GetBoolean() === true)
            env.CodeLine = this.TrueJump;
        else
            env.CodeLine = this.FalseJump;
    };
    return IfCode;
}());
/// <reference path="ExecutionCode.ts" />
var JumpCode = (function () {
    function JumpCode(jumpLine) {
        this.JumpLine = jumpLine;
    }
    JumpCode.prototype.Execute = function (env) {
        env.CodeLine = this.JumpLine;
    };
    return JumpCode;
}());
/// <reference path="ExecutionCode.ts" />
var MultiplyCode = (function () {
    function MultiplyCode() {
    }
    MultiplyCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        if (a === null || b === null)
            env.Push(new VariableValue(null));
        else
            env.Push(new VariableValue(a.GetNumber() * b.GetNumber()));
        env.CodeLine++;
    };
    return MultiplyCode;
}());
/// <reference path="ExecutionCode.ts" />
var NewArrayCode = (function () {
    function NewArrayCode() {
    }
    NewArrayCode.prototype.Execute = function (env) {
        env.Push(new VariableValue([]));
        env.CodeLine++;
    };
    return NewArrayCode;
}());
/// <reference path="ExecutionCode.ts" />
var NotCode = (function () {
    function NotCode() {
    }
    NotCode.prototype.Execute = function (env) {
        env.Push(new VariableValue(!(env.Pop().GetBoolean())));
        env.CodeLine++;
    };
    return NotCode;
}());
/// <reference path="ExecutionCode.ts" />
var OrCode = (function () {
    function OrCode() {
    }
    OrCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        env.Push(new VariableValue(a.GetBoolean() || b.GetBoolean()));
        env.CodeLine++;
    };
    return OrCode;
}());
/// <reference path="ExecutionCode.ts" />
var PushCode = (function () {
    function PushCode(value) {
        this.Value = value;
    }
    PushCode.prototype.Execute = function (env) {
        env.Push(new VariableValue(this.Value));
        env.CodeLine++;
    };
    return PushCode;
}());
/// <reference path="ExecutionCode.ts" />
var ReadCode = (function () {
    function ReadCode(name, index) {
        if (index === void 0) { index = false; }
        this.Index = false;
        this.Name = name;
        this.Index = index;
    }
    ReadCode.prototype.Execute = function (env) {
        if (this.Index == false)
            env.Push(env.GetVariable(this.Name));
        else {
            var idx = env.Pop().GetNumber();
            var v = env.GetVariable(this.Name);
            env.Push(v.Value[idx]);
        }
        env.CodeLine++;
    };
    return ReadCode;
}());
/// <reference path="ExecutionCode.ts" />
var ReturnCode = (function () {
    function ReturnCode() {
    }
    ReturnCode.prototype.Execute = function (env) {
        env.CodeLine = -1;
    };
    return ReturnCode;
}());
/// <reference path="ExecutionCode.ts" />
var SubstractCode = (function () {
    function SubstractCode() {
    }
    SubstractCode.prototype.Execute = function (env) {
        var a = env.Pop();
        var b = env.Pop();
        if (a === null || b === null)
            env.Push(new VariableValue(null));
        else
            env.Push(new VariableValue(a.GetNumber() - b.GetNumber()));
        env.CodeLine++;
    };
    return SubstractCode;
}());
/// <reference path="../CodeEnvironement.ts" />
var EngineActor = (function () {
    function EngineActor() {
    }
    EngineActor.prototype.Kill = function (values, env) {
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
    };
    EngineActor.prototype.DistanceToPlayer = function (values, env) {
        if (values[0] === null)
            return new VariableValue(0);
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor)
            return new VariableValue(actor.DistanceTo(world.Player));
        return new VariableValue(0);
    };
    EngineActor.prototype.HasMaxValue = function (values, env) {
        if (values[0] === null)
            return new VariableValue(false);
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var statName = values[1].GetString();
        var stat = actor.FindStat(statName);
        return new VariableValue(stat.MaxValue ? true : false);
    };
    EngineActor.prototype.Verify_HasMaxValue = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.GetMaxValue = function (values, env) {
        if (values[0] === null)
            return null;
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var statName = values[1].GetString();
        var stat = actor.FindStat(statName);
        return new VariableValue(stat.MaxValue);
    };
    EngineActor.prototype.Verify_GetMaxValue = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.IncreaseStat = function (values, env) {
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
    };
    EngineActor.prototype.Verify_IncreaseStat = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.ReduceStat = function (values, env) {
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
    };
    EngineActor.prototype.Verify_ReduceStat = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.RadiusReduceStat = function (values, env) {
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
        var actors = [];
        for (var a = -1; a < 2; a++) {
            for (var b = -1; b < 2; b++) {
                var area = world.GetArea(world.Player.AX + a, world.Player.AY + b, world.Player.Zone);
                if (!area)
                    continue;
                actors = actors.concat(area.actors);
            }
        }
        for (var i = 0; i < actors.length; i++) {
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
    };
    EngineActor.prototype.Verify_RadiusReduceStat = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetStat(values[2]))
            throw "The stat '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.RadiusIncreaseStat = function (values, env) {
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
        var actors = [];
        for (var a = -1; a < 2; a++) {
            for (var b = -1; b < 2; b++) {
                var area = world.GetArea(world.Player.AX + a, world.Player.AY + b, world.Player.Zone);
                if (!area)
                    continue;
                actors = actors.concat(area.actors);
            }
        }
        for (var i = 0; i < actors.length; i++) {
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
    };
    EngineActor.prototype.Verify_RadiusIncreaseStat = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetStat(values[2]))
            throw "The stat '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.GetStat = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var statName = values[1].GetString();
        return new VariableValue(actor.GetStat(statName));
    };
    EngineActor.prototype.Verify_GetStat = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.SetStat = function (values, env) {
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
    };
    EngineActor.prototype.Verify_SetStat = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetStat(values[1]))
            throw "The stat '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.IsMonster = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor && actor instanceof Monster && actor.Id != world.Player.Id)
            return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineActor.prototype.TimerRunning = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? !timer.IsOver() : false);
    };
    EngineActor.prototype.StartTimer = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, length);
        return null;
    };
    EngineActor.prototype.StopTimer = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, 0);
        return null;
    };
    EngineActor.prototype.GetTimer = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? (timer.Length - timer.Ellapsed() < 0 ? 0 : timer.Length - timer.Ellapsed()) : 0);
    };
    EngineActor.prototype.GetX = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(0);
        return new VariableValue(actor.X + actor.CurrentArea.X * world.areaWidth * world.art.background.width);
    };
    EngineActor.prototype.GetY = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(0);
        return new VariableValue(actor.Y + actor.CurrentArea.Y * world.areaHeight * world.art.background.height);
    };
    EngineActor.prototype.SetVariable = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        actor.SetVariable(values[1].GetString(), values[2]);
        return null;
    };
    EngineActor.prototype.GetVariable = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        return actor.GetVariable(values[1].GetString());
    };
    EngineActor.prototype.IsAnimationRunning = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue(false);
        return new VariableValue(actor.ActionAnimation != ACTION_ANIMATION.NONE);
    };
    EngineActor.prototype.SetAnimation = function (values, env) {
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
        switch (animation) {
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
    };
    EngineActor.prototype.Verify_SetAnimation = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (values[1].toLowerCase() != "attack" && values[1].toLowerCase() != "damage")
            throw "The animation '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    EngineActor.prototype.ExecuteWhenAnimationDone = function (values, env) {
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
        actor.ActionAnimationDone = function () {
            actor.ActionAnimationDone = null;
            env.ExecuteFunction(values[1].GetString(), [new VariableValue(id)]);
        };
        return null;
    };
    EngineActor.prototype.GetCurrentActor = function (values, env) {
        return env.GetGlobalVariable('currentActor');
    };
    EngineActor.prototype.AddParticleEffect = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return;
        actor.ParticleEffect = world.GetParticleSystem(values[1].GetString());
        if (actor.ParticleEffect)
            actor.ParticleEffectDuration = new Date(new Date().getTime() + values[2].GetNumber() * 1000);
        return null;
    };
    EngineActor.prototype.Verify_AddParticleEffect = function (line, column, values) {
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "string")
            return;
        if (!world.GetParticleSystem(values[1]))
            throw "The particle effect '" + values[1] + "' is unknown at " + line + ":" + column;
    };
    return EngineActor;
}());
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the monster to kill." }], "Kills an a monster and remove it from the map.")
], EngineActor.prototype, "Kill", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the monster to evaluate." }], "Distance between the player and the monster.")
], EngineActor.prototype, "DistanceToPlayer", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to check." }], "Returns true if the actor's stat has a maximum value.")
], EngineActor.prototype, "HasMaxValue", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to check." }], "Returns the maximum the given stat of the checked actor is.")
], EngineActor.prototype, "GetMaxValue", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to increase." }, { name: "value", description: "Quantity to increase." }], "Increase the actor stat by the given value.")
], EngineActor.prototype, "IncreaseStat", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }], "Reduce the actor stat by the given value.")
], EngineActor.prototype, "ReduceStat", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate of the center of effect." }, { name: "y", description: "Y coordinate of the center of effect." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }, { name: "radius", description: "Area of effect." }], "Reduce all the actor (non player) within the radius stat by the given value.")
], EngineActor.prototype, "RadiusReduceStat", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate of the center of effect." }, { name: "y", description: "Y coordinate of the center of effect." }, { name: "statName", description: "The STAT to reduce." }, { name: "value", description: "Quantity to reduce." }, { name: "radius", description: "Area of effect." }], "Increase all the actor (non player) within the radius stat by the given value.")
], EngineActor.prototype, "RadiusIncreaseStat", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to read." }], "Get the player stat by the given value.")
], EngineActor.prototype, "GetStat", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "statName", description: "The STAT to modify." }, { name: "value", description: "Value to set." }], "Set the player stat by the given value.")
], EngineActor.prototype, "SetStat", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns true if the actor is a monser.")
], EngineActor.prototype, "IsMonster", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to check." }], "Returns true if the actor's timer is currently running. If it's finished it will return false.")
], EngineActor.prototype, "TimerRunning", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to set." }, { name: "time", description: "The time the actor's timer needs to be set to." }], "Sets a timer which will run till the full time is elapsed.")
], EngineActor.prototype, "StartTimer", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to stop." }], "Stops a currently actor's running timer.")
], EngineActor.prototype, "StopTimer", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "timerName", description: "The name of the timer to check." }], "Returns the time left or 0 on the given actor's timer.")
], EngineActor.prototype, "GetTimer", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns the X coordinate of the actor.")
], EngineActor.prototype, "GetX", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns the Y coordinate of the actor.")
], EngineActor.prototype, "GetY", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a variable which can be read from another function or later on.")
], EngineActor.prototype, "SetVariable", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The variable to read." }], "Retreives a variable previously stored.")
], EngineActor.prototype, "GetVariable", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }], "Returns true if an animation is currently running.")
], EngineActor.prototype, "IsAnimationRunning", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The animation effect to set. Can be either 'none', 'attack' or 'damage'." }], "Sets the animation effect.")
], EngineActor.prototype, "SetAnimation", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The function name to execute when the player animation is over." }], "Will execute the function of the current block when the animation is over.")
], EngineActor.prototype, "ExecuteWhenAnimationDone", null);
__decorate([
    ApiMethod([], "Returns the current actor ID.")
], EngineActor.prototype, "GetCurrentActor", null);
__decorate([
    ApiMethod([{ name: "actorId", description: "The unique ID identifying the actor to evaluate." }, { name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on an actor for a given time.")
], EngineActor.prototype, "AddParticleEffect", null);
EngineActor = __decorate([
    ApiClass
], EngineActor);
/// <reference path="../CodeEnvironement.ts" />
var EngineArray = (function () {
    function EngineArray() {
    }
    EngineArray.prototype.IsArray = function (values, env) {
        if (values[0].Type == ValueType.Array)
            return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineArray.prototype.Count = function (values, env) {
        if (values[0].Type != ValueType.Array)
            return new VariableValue(0);
        return new VariableValue(values[0].Value.length);
    };
    EngineArray.prototype.Remove = function (values, env) {
        if (values[0].Type != ValueType.Array)
            return null;
        values[0].Value.splice(values[1].GetNumber(), 1);
        return null;
    };
    return EngineArray;
}());
__decorate([
    ApiMethod([{ name: "variable", description: "The variable to check." }], "Checks if a variable is an array.")
], EngineArray.prototype, "IsArray", null);
__decorate([
    ApiMethod([{ name: "variable", description: "The variable to check." }], "Returns the number of elements of an array.")
], EngineArray.prototype, "Count", null);
__decorate([
    ApiMethod([{ name: "variable", description: "The variable to modify." }, { name: "index", description: "The position of the array to remove." }], "Removes an element from the array.")
], EngineArray.prototype, "Remove", null);
EngineArray = __decorate([
    ApiClass
], EngineArray);
/// <reference path="../CodeEnvironement.ts" />
var EngineChat = (function () {
    function EngineChat() {
    }
    EngineChat.prototype.SendMessage = function (values, env) {
        Chat.SendLine(values[1].GetString(), values[0].GetString());
        return null;
    };
    EngineChat.prototype.SendBotMessage = function (values, env) {
        Chat.SendBotLine(values[0].GetString(), values[1].GetString(), values[2].GetString());
        return null;
    };
    EngineChat.prototype.CurrentChannel = function (values, env) {
        return new VariableValue(chat.currentChannel);
    };
    EngineChat.prototype.SplitLine = function (values, env) {
        return new VariableValue(ChatBotSentence.SplitLine(values[0].GetString()).map(function (c) { return new VariableValue(c); }));
    };
    EngineChat.prototype.Ban = function (values, env) {
        $.ajax({
            type: 'POST',
            url: '/backend/ChatBan',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                username: values[0].GetString(),
                days: values[1].GetNumber()
            },
            success: function (msg) {
            },
            error: function (msg, textStatus) {
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });
        return null;
    };
    EngineChat.prototype.Mute = function (values, env) {
        $.ajax({
            type: 'POST',
            url: '/backend/ChatMute',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                username: values[0].GetString(),
                minutes: values[1].GetNumber()
            },
            success: function (msg) {
            },
            error: function (msg, textStatus) {
                var data = TryParse(msg);
                Framework.ShowMessage("Error: " + (data && data.error ? data.error : msg));
            }
        });
        return null;
    };
    return EngineChat;
}());
__decorate([
    ApiMethod([{ name: "channel", description: "Name of the channel to send it to." }, { name: "message", description: "Message to send" }], "Sends a chat message.")
], EngineChat.prototype, "SendMessage", null);
__decorate([
    ApiMethod([{ name: "botName", description: "Bot name used for posting the message." }, { name: "channel", description: "Name of the channel to send it to." }, { name: "message", description: "Message to send" }], "Sends a chat message as a bot.")
], EngineChat.prototype, "SendBotMessage", null);
__decorate([
    ApiMethod([], "Returns the current active channel.")
], EngineChat.prototype, "CurrentChannel", null);
__decorate([
    ApiMethod([{ name: "line", description: "Chat line to split" }], "Split a chat line into words.")
], EngineChat.prototype, "SplitLine", null);
__decorate([
    ApiMethod([{ name: "playerName", description: "The player to ban." }, { name: "days", description: "The number of days to ban." }], "Ban a player from the chat for the specified number of days.")
], EngineChat.prototype, "Ban", null);
__decorate([
    ApiMethod([{ name: "playerName", description: "The player to mute." }, { name: "minutes", description: "The minutes to mute." }], "Mute a player for the specified number of minutes.")
], EngineChat.prototype, "Mute", null);
EngineChat = __decorate([
    ApiClass
], EngineChat);
/// <reference path="../CodeEnvironement.ts" />
var engineDisplay = new ((function () {
    function class_13() {
        this.dialogSideButtons = [];
        this.dialogButtons = [];
        this.canRestartInline = false;
    }
    return class_13;
}()));
var EngineDisplay = EngineDisplay_1 = (function () {
    function EngineDisplay() {
    }
    EngineDisplay.prototype.AddMapMessage = function (values, env) {
        if (values[0] === null || values[1] === null || values[2] === null)
            return;
        var x = (values[0] ? values[0].GetNumber() : 0);
        var y = (values[1] ? values[1].GetNumber() : 0);
        var color = (values[3] ? values[3].GetString() : "#FFFFFF");
        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;
        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area) {
            area.actors.push(MapMessage.Create(values[2].GetString(), color, area, mx, my));
        }
        return null;
    };
    EngineDisplay.prototype.ShowMinimap = function (values, env) {
        play.showMinimap = true;
        return null;
    };
    EngineDisplay.prototype.HideMinimap = function (values, env) {
        play.showMinimap = false;
        return null;
    };
    EngineDisplay.prototype.ParticleEffect = function (values, env) {
        var x = values[0].GetNumber();
        var y = values[1].GetNumber();
        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;
        var area = world.GetArea(ax, ay, world.Player.Zone);
        if (area) {
            var effect = new TemporaryParticleEffect(values[2].GetString(), mx, my, area, new Date(new Date().getTime() + values[3].GetNumber() * 1000));
            area.tempObjects.push(effect);
            area.CleanObjectCache();
            area.actors.push();
        }
        return null;
    };
    EngineDisplay.prototype.Verify_ParticleEffect = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetParticleSystem(values[2]))
            throw "The particle effect '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    EngineDisplay.prototype.Log = function (values, env) {
        var msg = (values[0] ? values[0].GetString() : "null");
        Main.AddErrorMessage(msg);
        return null;
    };
    EngineDisplay.prototype.SetDialogTitle = function (values, env) {
        $("#npcDialog .gamePanelHeader").text(values[0].GetString());
        return null;
    };
    EngineDisplay.prototype.ShowDialog = function (values, env) {
        $("#npcDialog").show();
        world.Player.InDialog = true;
        return;
    };
    EngineDisplay.OnChange = function (functionCallback) {
        var env = CodeParser.Parse("function toExec() { " + functionCallback + "();}");
        env.ExecuteFunction("toExec", []);
    };
    EngineDisplay.prototype.SetDialogText = function (values, env) {
        play.onDialogPaint = [];
        npc.canJump = false;
        var html = Main.TextTransform(values[0].GetString(), true);
        // Dropdown Lists
        html = html.replace(/\[dropdown([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            m = capture.match(/\onchange=['"]{0,1}([a-z_0-9\.]+)/i);
            var onchange = (m && m[1] ? m[1] : null);
            return "<select style='width: 100%;'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;'" + (onchange ? " onchange=\"EngineDisplay.OnChange('" + onchange + "');\"" : "") + "></select>";
        });
        // Text areas
        html = html.replace(/\[textarea([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\srows=['"]{0,1}([0-9]+)/);
            var rows = (m && m[1] ? parseInt(m[1]) : 2);
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            return "<textarea style='resize: none; width: 100%;' rows='" + rows + "'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;'></textarea>";
        });
        // Buttons
        html = html.replace(/\[button([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\label=['"]{0,1}([^'"]+)/);
            var label = (m && m[1] ? m[1] : "");
            var m = capture.match(/\sid=['"]{0,1}([0-9]+)/i);
            var id = (m && m[1] ? parseInt(m[1]) : 0);
            return "<span class='button' onclick='EngineDisplay.InlineButton(" + id + ")'>" + label + "</span>";
        });
        // Text field
        html = html.replace(/\[text([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            return "<input type='text' style='width: 100%;'" + (id ? " id='" + id + "'" : "") + " onfocus='play.inField=true;' onblur='play.inField=false;' />";
        });
        // Image tag
        html = html.replace(/\[img([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            var m = capture.match(/\ssrc=['"]{0,1}([a-z_0-9\:\.]+)/i);
            var src = (m && m[1] ? m[1] : null);
            return EngineDisplay_1.ImageSrc(src, id);
        });
        // Image tag
        html = html.replace(/\[canvas([^\]]*)\]/gi, function (substr, capture) {
            var m = capture.match(/\sid=['"]{0,1}([a-z_0-9]+)/i);
            var id = (m && m[1] ? m[1] : null);
            var m = capture.match(/\swidth=['"]{0,1}([0-9]+)/i);
            var width = parseInt(m && m[1] ? m[1] : "300");
            var m = capture.match(/\sheight=['"]{0,1}([0-9]+)/i);
            var height = parseInt(m && m[1] ? m[1] : "300");
            m = capture.match(/\onpaint=['"]{0,1}([a-z_0-9\.]+)/i);
            var onpaint = (m && m[1] ? m[1] : null);
            if (onpaint)
                play.onDialogPaint.push("Graphics.Canvas('" + id + "');" + onpaint + "();");
            return "<canvas id='" + id + "' width='" + width + "' height='" + height + "'>";
        });
        $("#dialogSentence").html(html);
        engineDisplay.canRestartInline = true;
        return null;
    };
    EngineDisplay.ImageSrc = function (src, id) {
        if (!src)
            return "-- Must specify a src --";
        if (src.toLowerCase().indexOf("http:") == 0 || src.toLowerCase().indexOf("https:") == 0) {
            return "-- No external images allowed --";
        }
        if (src.toLowerCase().indexOf(".png") != -1 || src.toLowerCase().indexOf(".jpg") != -1)
            return "<img" + (id ? " id='dialogimg_" + id + "'" : "") + " sec='/user_art/" + EngineDisplay_1.GameDir(world.Id) + "/" + src + "'>";
        else if (src.toLowerCase().indexOf("item:") == 0) {
            var item = world.GetInventoryObject(src.substr(5));
            if (!item || !item.Image)
                return "-- inventory item '" + src.substr(5) + "' is unknown or doesn't have an image --";
            return "<img" + (id ? " id='dialogimg_" + id + "'" : "") + " src='" + item.Image + "' />";
        }
        else if (src.toLowerCase().indexOf("character:") == 0) {
            var char = world.art.characters[src.substr(10)];
            if (!char)
                return "-- character '" + src.substr(10) + "' is unknown  --";
            var w = Math.floor(char.width / char.frames);
            var h = Math.floor(char.height / char.directions);
            return "<span" + (id ? " id='dialogimg_" + id + "'" : "") + " style='width: " + w + "px; height: " + h + "px; display: inline-block; background-image: url(\"" + char.file + "\");'></span>";
        }
        else if (src.toLowerCase().indexOf("object:") == 0) {
            var obj = world.art.objects[src.substr(7)];
            if (!obj)
                return "-- map object '" + src.substr(7) + "' is unknown  --";
            return "<span" + (id ? " id='dialogimg_" + id + "'" : "") + " style='width: " + obj.width + "px; height: " + obj.height + "px; background-position: -" + obj.x + "px -" + obj.y + "px; display: inline-block; background-image: url(\"" + obj.file + "\");'></span>";
        }
    };
    EngineDisplay.prototype.ReplaceImage = function (values, env) {
        var elem = $("#dialogimg_" + values[0].GetString()).first();
        if (!elem)
            return null;
        elem.outerHTML = EngineDisplay_1.ImageSrc(values[1].GetString(), values[0].GetString());
        return null;
    };
    EngineDisplay.GameDir = function (gameId) {
        return "" + gameId + "_" + (gameId ^ 8518782);
    };
    EngineDisplay.prototype.GetFieldValue = function (values, env) {
        var val = $("#" + values[0].GetString()).val();
        // Remove potential nasty elements
        val = val.replace(/\[textarea([^\]]*)\]/gi, "");
        val = val.replace(/\[button([^\]]*)\]/gi, "");
        val = val.replace(/\[dropdown([^\]]*)\]/gi, "");
        val = val.replace(/\[text([^\]]*)\]/gi, "");
        return new VariableValue(val);
    };
    EngineDisplay.prototype.SetFieldValue = function (values, env) {
        $("#" + values[0].GetString()).val(values[1].GetString());
        return null;
    };
    EngineDisplay.prototype.AddOption = function (values, env) {
        var value = values[1].GetString();
        var text = value;
        if (values[2])
            text = values[2].GetString();
        $("#" + values[0].GetString()).append("<option value='" + value + "'>" + text + "</option>");
        return null;
    };
    EngineDisplay.prototype.ClearOptions = function (values, env) {
        $("#" + values[0].GetString()).find("option").remove();
        return null;
    };
    EngineDisplay.prototype.ClearDialogSideButtons = function (values, env) {
        engineDisplay.dialogSideButtons = [];
        $("#dialogAnswers").html("");
        return null;
    };
    EngineDisplay.prototype.AddDialogSideButton = function (values, env) {
        $("#dialogAnswers").html($("#dialogAnswers").html() + "<div class='gameButton' onclick='EngineDisplay.SideButton(" + engineDisplay.dialogSideButtons.length + ")'>" + values[0].GetString() + "</div>");
        engineDisplay.dialogSideButtons.push(values[1].GetString());
        return null;
    };
    EngineDisplay.prototype.DockDialogBottom = function (values, env) {
        $("#npcDialog").css("top", "auto").css("bottom", "0px");
        return null;
    };
    EngineDisplay.prototype.DockDialogTop = function (values, env) {
        $("#npcDialog").css("top", "0px").css("bottom", "auto");
        return null;
    };
    EngineDisplay.prototype.DockDialogLeft = function (values, env) {
        $("#npcDialog").css("left", "0px").css("right", "auto");
        return null;
    };
    EngineDisplay.prototype.DockDialogRight = function (values, env) {
        $("#npcDialog").css("left", "auto").css("right", "0px");
        return null;
    };
    EngineDisplay.prototype.DialogCenter = function (values, env) {
        $("#npcDialog").css("top", "").css("left", "").css("right", "").css("width", "").css("height", "").css("bottom", "");
        return null;
    };
    EngineDisplay.prototype.DialogFillWidth = function (values, env) {
        $("#npcDialog").css("left", "0px").css("right", "0px").css("width", "100%");
        return null;
    };
    EngineDisplay.prototype.DialogFillHeight = function (values, env) {
        $("#npcDialog").css("top", "0px").css("bottom", "0px").css("height", "100%");
        return null;
    };
    EngineDisplay.prototype.DialogHeight = function (values, env) {
        var val = null;
        if (values[0].Type == ValueType.String && ("" + values[0].Value).trim().endsWith("%"))
            val = "" + parseInt("" + values[0].Value) + "%";
        else
            val = "" + values[0].GetNumber() + "px";
        $("#npcDialog").css("height", val);
        return null;
    };
    EngineDisplay.prototype.DialogWidth = function (values, env) {
        var val = null;
        if (values[0].Type == ValueType.String && ("" + values[0].Value).trim().endsWith("%"))
            val = "" + parseInt("" + values[0].Value) + "%";
        else
            val = "" + values[0].GetNumber() + "px";
        $("#npcDialog").css("width", val);
        return null;
    };
    EngineDisplay.prototype.HideDialog = function (values, env) {
        $("#dialogAnswers").html("");
        $("#dialogSentence").html("");
        $("#npcDialog .gamePanelHeader").html("Dialog");
        $("#npcDialog").hide();
        $("#npcDialog").css("top", "").css("left", "").css("right", "").css("width", "").css("height", "").css("bottom", "");
        world.Player.InDialog = false;
        return null;
    };
    EngineDisplay.prototype.CleanupBBCodes = function (values, env) {
        var source = values[0].GetString();
        return new VariableValue(source.replace(/\[[^]]+\]/g, ""));
    };
    EngineDisplay.prototype.InlineButton = function (values, env) {
        if (engineDisplay.canRestartInline) {
            engineDisplay.dialogButtons = [];
            engineDisplay.canRestartInline = false;
        }
        engineDisplay.dialogButtons.push(values[1].GetString());
        return new VariableValue("[button id='" + (engineDisplay.dialogButtons.length - 1) + "' label='" + values[0].GetString() + "']");
    };
    EngineDisplay.SideButton = function (rowId) {
        var func = engineDisplay.dialogSideButtons[rowId];
        if (func.indexOf("(") == -1)
            func += "();";
        if (func.charAt(func.length - 1) != ";")
            func += ";";
        var env = CodeParser.Parse("function buttonToExec() { " + func + "}");
        env.ExecuteFunction("buttonToExec", []);
    };
    EngineDisplay.InlineButton = function (rowId) {
        var func = engineDisplay.dialogButtons[rowId];
        if (func.indexOf("(") == -1)
            func += "();";
        if (func.charAt(func.length - 1) != ";")
            func += ";";
        var env = CodeParser.Parse("function buttonToExec() { " + func + "}");
        env.ExecuteFunction("buttonToExec", []);
    };
    return EngineDisplay;
}());
__decorate([
    ApiMethod([{ name: "x", description: "The X coordinate where to place the map message" }, { name: "y", description: "The Y coordinate where to place the map message" }, { name: "message", description: "The message to place the map message" }, { name: "color", description: "(optional) The color to use to display the message. If skipped it will be white. Otherwise use the web color format." }], "Place a small floating temporary message on the map.")
], EngineDisplay.prototype, "AddMapMessage", null);
__decorate([
    ApiMethod([], "Shows the minimap on the screen.")
], EngineDisplay.prototype, "ShowMinimap", null);
__decorate([
    ApiMethod([], "Hides the minimap on the screen.")
], EngineDisplay.prototype, "HideMinimap", null);
__decorate([
    ApiMethod([{ name: "x", description: "The X coordinate where to place the map message" }, { name: "y", description: "The Y coordinate where to place the map message" }, { name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on a map for a given time.")
], EngineDisplay.prototype, "ParticleEffect", null);
__decorate([
    ApiMethod([{ name: "message", description: "The message to show on the error log" }], "Display a message in the error log.")
], EngineDisplay.prototype, "Log", null);
__decorate([
    ApiMethod([{ name: "title", description: "The title of the dialog box." }], "Set the title of the dialog box.")
], EngineDisplay.prototype, "SetDialogTitle", null);
__decorate([
    ApiMethod([], "Shows the dialog box.")
], EngineDisplay.prototype, "ShowDialog", null);
__decorate([
    ApiMethod([{ name: "content", description: "The content as BB code." }], "Set the content of the dialog box.")
], EngineDisplay.prototype, "SetDialogText", null);
__decorate([
    ApiMethod([{ name: "imageId", description: "The id of the image." }, { name: "src", description: "Image source info." }], "Replace the current image with a new image.")
], EngineDisplay.prototype, "ReplaceImage", null);
__decorate([
    ApiMethod([{ name: "fieldName", description: "The field to read." }], "Reads a field and returns the value.")
], EngineDisplay.prototype, "GetFieldValue", null);
__decorate([
    ApiMethod([{ name: "fieldName", description: "The field to set." }, { name: "value", description: "The value to set." }], "Set the value of a field.")
], EngineDisplay.prototype, "SetFieldValue", null);
__decorate([
    ApiMethod([{ name: "fieldName", description: "The field to change." }, { name: "value", description: "The value of the option to set." }, { name: "text", description: "(optional) The text to display for the option." }], "Add a value to a dropdown menu.")
], EngineDisplay.prototype, "AddOption", null);
__decorate([
    ApiMethod([{ name: "fieldName", description: "The field to change." }], "Remove all the options of a dropdown.")
], EngineDisplay.prototype, "ClearOptions", null);
__decorate([
    ApiMethod([], "Clear up all the buttons on the side of the dialog.")
], EngineDisplay.prototype, "ClearDialogSideButtons", null);
__decorate([
    ApiMethod([{ name: "label", description: "Label of the button to add." }, { name: "functionToCall", description: "Function to call back when the button is pressed." }], "Add a button to the side of the dialog.")
], EngineDisplay.prototype, "AddDialogSideButton", null);
__decorate([
    ApiMethod([], "Dock the dialog to the bottom of the screen.")
], EngineDisplay.prototype, "DockDialogBottom", null);
__decorate([
    ApiMethod([], "Dock the dialog to the top of the screen.")
], EngineDisplay.prototype, "DockDialogTop", null);
__decorate([
    ApiMethod([], "Dock the dialog to the left of the screen.")
], EngineDisplay.prototype, "DockDialogLeft", null);
__decorate([
    ApiMethod([], "Dock the dialog to the right of the screen.")
], EngineDisplay.prototype, "DockDialogRight", null);
__decorate([
    ApiMethod([], "Place the dialog in the center.")
], EngineDisplay.prototype, "DialogCenter", null);
__decorate([
    ApiMethod([], "Dialog will take all the width of the screen.")
], EngineDisplay.prototype, "DialogFillWidth", null);
__decorate([
    ApiMethod([], "Dialog will take all the height of the screen.")
], EngineDisplay.prototype, "DialogFillHeight", null);
__decorate([
    ApiMethod([{ name: "height", description: "The wished height of the dialog box. If the parameter is a string and ends with a % sign it will be taken as % of the screen size." }], "Dialog will take all the height of the screen.")
], EngineDisplay.prototype, "DialogHeight", null);
__decorate([
    ApiMethod([{ name: "width", description: "The wished width of the dialog box. If the parameter is a string and ends with a % sign it will be taken as % of the screen size." }], "Dialog will take all the height of the screen.")
], EngineDisplay.prototype, "DialogWidth", null);
__decorate([
    ApiMethod([], "Hide the dialog box.")
], EngineDisplay.prototype, "HideDialog", null);
__decorate([
    ApiMethod([{ name: "source", description: "Source text to cleanup." }], "Removes all the BB codes.")
], EngineDisplay.prototype, "CleanupBBCodes", null);
__decorate([
    ApiMethod([{ name: "label", description: "Label of the button to add." }, { name: "functionToCall", description: "Function to call back when the button is pressed." }], "Generate button BB code to place within the text of a dialog.")
], EngineDisplay.prototype, "InlineButton", null);
EngineDisplay = EngineDisplay_1 = __decorate([
    ApiClass
], EngineDisplay);
var EngineDisplay_1;
/// <reference path="../CodeEnvironement.ts" />
var gp = 0;
var EngineGame = EngineGame_1 = (function () {
    function EngineGame() {
    }
    EngineGame.prototype.AddStatistic = function (values, env) {
        if (Main.CheckNW())
            return;
        /*if ((this['Game'] && this['Game'].AddStatistic && !this['Game'].AddStatistic.caller) || (this.AddStatistic && !this.AddStatistic.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var stat = values[0].GetString();
        EngineGame_1.IncreaseStatistic(stat);
        return null;
    };
    EngineGame.prototype.Verify_AddStatistic = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        switch (values[0].toLowerCase()) {
            case "monster_kill":
            case "level_up":
            case "player_kill":
                break;
            default:
                throw "The statistic name '" + values[0] + "' is unknown at " + line + ":" + column;
        }
    };
    EngineGame.IncreaseStatistic = function (stat) {
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
        switch (stat.toLowerCase()) {
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
            success: function (msg) {
            },
            error: function (msg, textStatus) {
            }
        });
        return null;
    };
    EngineGame.prototype.Pause = function (values, env) {
        var toWait = 1000;
        if (values.length > 0)
            toWait = values[0].GetNumber();
        env.StoreStack(function () {
            setTimeout(function () {
                env.RebuildStack();
            }, toWait);
        });
        return null;
    };
    EngineGame.prototype.GetDateString = function (values, env) {
        return new VariableValue(Main.FormatDate(new Date()));
    };
    EngineGame.prototype.AddKeyBinding = function (values, env) {
        play.keyHook[values[0].GetString()] = values[1].GetString();
        return null;
    };
    return EngineGame;
}());
__decorate([
    ApiMethod([{ name: "statisticName", description: "The statistic type to add ('monster_kill', 'level_up', 'player_kill')." }], "Increment the statistic counter (visible in the \"Admin\" =&gt; \"Game Stat\" menu).")
], EngineGame.prototype, "AddStatistic", null);
__decorate([
    ApiMethod([{ name: "time", description: "Time in millisecond to pause the execution." }], "Pause the execution of the scripts and then continues.")
], EngineGame.prototype, "Pause", null);
__decorate([
    ApiMethod([], "Returns the date as string format (YYYY/MM/DD).")
], EngineGame.prototype, "GetDateString", null);
__decorate([
    ApiMethod([{ name: "key", description: "Key to bind." }, { name: "callback", description: "The function to call back once the key is pressed." }], "Hook a function to a key binding. Can be placed in the \"AutoRun\" function of your generic code to have it always set.")
], EngineGame.prototype, "AddKeyBinding", null);
EngineGame = EngineGame_1 = __decorate([
    ApiClass
], EngineGame);
var EngineGame_1;
/// <reference path="../CodeEnvironement.ts" />
var engineGraphics = new ((function () {
    function class_14() {
        this.currentCanvas = null;
        this.imageCache = {};
    }
    return class_14;
}()));
var EngineGraphics = EngineGraphics_1 = (function () {
    function EngineGraphics() {
    }
    EngineGraphics.prototype.Canvas = function (values, env) {
        engineGraphics.currentContext = $("#" + values[0].GetString()).first().getContext("2d");
        engineGraphics.currentCanvas = values[0].GetString();
        return null;
    };
    EngineGraphics.prototype.Color = function (values, env) {
        engineGraphics.currentContext.strokeStyle = values[0].GetString();
        engineGraphics.currentContext.fillStyle = values[0].GetString();
        return null;
    };
    EngineGraphics.prototype.LineWidth = function (values, env) {
        engineGraphics.currentContext.lineWidth = values[0].GetNumber();
        return null;
    };
    EngineGraphics.prototype.Line = function (values, env) {
        engineGraphics.currentContext.beginPath();
        engineGraphics.currentContext.moveTo(Math.round(values[0].GetNumber()) + 0.5, Math.round(values[1].GetNumber()) + 0.5);
        engineGraphics.currentContext.lineTo(Math.round(values[2].GetNumber()) + 0.5, Math.round(values[3].GetNumber()) + 0.5);
        engineGraphics.currentContext.stroke();
        return null;
    };
    EngineGraphics.prototype.Text = function (values, env) {
        if (values[3])
            engineGraphics.currentContext.font = "" + values[3].GetNumber() + "px sans-serif";
        else
            engineGraphics.currentContext.font = "12px sans-serif";
        engineGraphics.currentContext.fillText(values[0].GetString(), Math.round(values[1].GetNumber()) + 0.5, Math.round(values[2].GetNumber()) + 0.5);
        return null;
    };
    EngineGraphics.prototype.Rectangle = function (values, env) {
        engineGraphics.currentContext.strokeRect(Math.round(values[0].GetNumber()) + 0.5, Math.round(values[1].GetNumber()) + 0.5, Math.round(values[2].GetNumber()), Math.round(values[3].GetNumber()));
        return null;
    };
    EngineGraphics.prototype.FillRectangle = function (values, env) {
        engineGraphics.currentContext.fillRect(Math.round(values[0].GetNumber()), Math.round(values[1].GetNumber()), Math.round(values[2].GetNumber()), Math.round(values[3].GetNumber()));
        return null;
    };
    EngineGraphics.prototype.Ellipse = function (values, env) {
        var centerX = Math.round(values[0].GetNumber());
        var centerY = Math.round(values[1].GetNumber());
        var height = Math.round(values[3].GetNumber());
        var width = Math.round(values[2].GetNumber());
        engineGraphics.currentContext.beginPath();
        engineGraphics.currentContext.moveTo(centerX, centerY - height / 2); // A1
        engineGraphics.currentContext.bezierCurveTo(centerX + width / 2, centerY - height / 2, // C1
        centerX + width / 2, centerY + height / 2, // C2
        centerX, centerY + height / 2); // A2
        engineGraphics.currentContext.bezierCurveTo(centerX - width / 2, centerY + height / 2, // C3
        centerX - width / 2, centerY - height / 2, // C4
        centerX, centerY - height / 2); // A1
        engineGraphics.currentContext.stroke();
        engineGraphics.currentContext.closePath();
        return null;
    };
    EngineGraphics.prototype.FillEllipse = function (values, env) {
        var centerX = Math.round(values[0].GetNumber());
        var centerY = Math.round(values[1].GetNumber());
        var height = Math.round(values[3].GetNumber());
        var width = Math.round(values[2].GetNumber());
        engineGraphics.currentContext.beginPath();
        engineGraphics.currentContext.moveTo(centerX, centerY - height / 2); // A1
        engineGraphics.currentContext.bezierCurveTo(centerX + width / 2, centerY - height / 2, // C1
        centerX + width / 2, centerY + height / 2, // C2
        centerX, centerY + height / 2); // A2
        engineGraphics.currentContext.bezierCurveTo(centerX - width / 2, centerY + height / 2, // C3
        centerX - width / 2, centerY - height / 2, // C4
        centerX, centerY - height / 2); // A1
        engineGraphics.currentContext.fill();
        engineGraphics.currentContext.closePath();
        return null;
    };
    EngineGraphics.CacheImage = function (imageId, callback) {
        if (callback === void 0) { callback = null; }
        if (engineGraphics.imageCache[imageId]) {
            if (callback)
                callback();
            return;
        }
        var type = imageId.split(":")[0];
        var name = imageId.split(":")[1];
        switch (type) {
            case "object":
                var obj = world.art.objects[name];
                var img = new Image();
                img.src = obj.file;
                img.startX = obj.x;
                img.startY = obj.y;
                img.objWidth = obj.width;
                img.objHeight = obj.height;
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = function () {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
            case "item":
                var inventObject = world.GetInventoryObject(name);
                ;
                var img = new Image();
                img.src = inventObject.Image;
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = function () {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
            case "character":
                var char = world.art.characters[name];
                var img = new Image();
                img.src = char.file;
                img.startX = 0;
                img.startY = 0;
                img.objWidth = Math.floor(char.width / char.frames);
                img.objHeight = Math.floor(char.height / char.directions);
                img.loaded = false;
                engineGraphics.imageCache[imageId] = img;
                img.onload = function () {
                    img.loaded = true;
                    if (callback)
                        callback();
                };
                break;
        }
    };
    EngineGraphics.prototype.LoadImage = function (values, env) {
        var imageId = values[0].GetString().toLowerCase();
        env.StoreStack(function () {
            EngineGraphics_1.CacheImage(imageId, function () {
                if (engineGraphics.currentCanvas)
                    engineGraphics.currentContext = $("#" + engineGraphics.currentCanvas).first().getContext("2d");
                env.RebuildStack();
            });
        });
        return null;
    };
    EngineGraphics.prototype.DrawImage = function (values, env) {
        var imageId = values[0].GetString().toLowerCase();
        var x = values[1].GetNumber();
        var y = values[2].GetNumber();
        if (!engineGraphics.imageCache[imageId]) {
            EngineGraphics_1.CacheImage(imageId);
            return null;
        }
        var img = engineGraphics.imageCache[imageId];
        if (!img.loaded)
            return null;
        if (img.objWidth)
            engineGraphics.currentContext.drawImage(img, img.startX, img.startY, img.objWidth, img.objHeight, x, y, img.objWidth, img.objHeight);
        else
            engineGraphics.currentContext.drawImage(img, 0, 0, img.width, img.height, x, y, img.width, img.height);
        return null;
    };
    return EngineGraphics;
}());
__decorate([
    ApiMethod([{ name: "canvasId", description: "The id of the canvas to recover the context from." }], "Set the current drawing context.")
], EngineGraphics.prototype, "Canvas", null);
__decorate([
    ApiMethod([{ name: "color", description: "The color to set." }], "Set the color for the further draw functions.")
], EngineGraphics.prototype, "Color", null);
__decorate([
    ApiMethod([{ name: "width", description: "The width to set." }], "Set the line width.")
], EngineGraphics.prototype, "LineWidth", null);
__decorate([
    ApiMethod([{ name: "x1", description: "First X coordinate." }, { name: "y1", description: "First Y coordinate." }, { name: "x2", description: "Second X coordinate." }, { name: "y2", description: "Second Y coordinate." }], "Draw a line.")
], EngineGraphics.prototype, "Line", null);
__decorate([
    ApiMethod([{ name: "text", description: "The text to draw." }, { name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "size", description: "(optional) Font size. By default 12px." }], "Draw a line.")
], EngineGraphics.prototype, "Text", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Rectangle width." }, { name: "height", description: "Rectangle height" }], "Draw the contour of a rectangle.")
], EngineGraphics.prototype, "Rectangle", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Rectangle width." }, { name: "height", description: "Rectangle height" }], "Fill a rectangle.")
], EngineGraphics.prototype, "FillRectangle", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Ellipse width." }, { name: "height", description: "Ellipse height" }], "Draw the contour of an ellipse.")
], EngineGraphics.prototype, "Ellipse", null);
__decorate([
    ApiMethod([{ name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }, { name: "width", description: "Ellipse width." }, { name: "height", description: "Ellipse height" }], "Fill an ellipse.")
], EngineGraphics.prototype, "FillEllipse", null);
__decorate([
    ApiMethod([{ name: "image", description: "Image to draw." }], "Draw an image on the coordinate specified.")
], EngineGraphics.prototype, "LoadImage", null);
__decorate([
    ApiMethod([{ name: "image", description: "Image to draw." }, { name: "x", description: "X coordinate." }, { name: "y", description: "Y coordinate." }], "Draw an image on the coordinate specified.")
], EngineGraphics.prototype, "DrawImage", null);
EngineGraphics = EngineGraphics_1 = __decorate([
    ApiClass
], EngineGraphics);
var EngineGraphics_1;
/// <reference path="../CodeEnvironement.ts" />
var EngineInventory = (function () {
    function EngineInventory() {
    }
    EngineInventory.prototype.AddItem = function (values, env) {
        /*if ((this['Inventory'] && this['Inventory'].AddItem && !this['Inventory'].AddItem.caller) || (this.AddItem && !this.AddItem.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.AddItem(values[0].GetString(), values[1] ? values[1].GetNumber() : 1);
        return null;
    };
    EngineInventory.prototype.Verify_AddItem = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineInventory.prototype.RemoveItem = function (values, env) {
        /*if ((this['Inventory'] && this['Inventory'].RemoveItem && !this['Inventory'].RemoveItem.caller) || (this.RemoveItem && !this.RemoveItem.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.RemoveItem(values[0].GetString(), values[1] ? values[1].GetNumber() : 1);
        return null;
    };
    EngineInventory.prototype.Verify_RemoveItem = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineInventory.prototype.ObjectParameterExists = function (values, env) {
        var objName = values[0].GetString().toLowerCase();
        var object = null;
        for (var i = 0; i < world.InventoryObjects.length; i++) {
            if (world.InventoryObjects[i].Name.toLowerCase() == objName) {
                object = world.InventoryObjects[i];
                break;
            }
        }
        var paramName = values[1].GetString().toLowerCase();
        for (var i = 0; i < object.Parameters.length; i++)
            if (object.Parameters[i].Name.toLowerCase() == paramName)
                return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineInventory.prototype.Verify_ObjectParameterExists = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineInventory.prototype.ObjectParameter = function (values, env) {
        var objName = values[0].GetString().toLowerCase();
        var object = null;
        for (var i = 0; i < world.InventoryObjects.length; i++) {
            if (world.InventoryObjects[i].Name.toLowerCase() == objName) {
                object = world.InventoryObjects[i];
                break;
            }
        }
        var paramName = values[1].GetString().toLowerCase();
        for (var i = 0; i < object.Parameters.length; i++)
            if (object.Parameters[i].Name.toLowerCase() == paramName)
                return new VariableValue(parseFloat(object.Parameters[i].Value));
        return new VariableValue(0);
    };
    EngineInventory.prototype.Verify_ObjectParameter = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineInventory.prototype.GetWearedEffect = function (values, env) {
        var statName = values[0].GetString();
        var result = 0;
        for (var slot in world.Player.EquipedObjects) {
            var objectName = world.Player.EquipedObjects[slot].Name;
            var inventObject = world.GetInventoryObject(world.Player.EquipedObjects[slot].Name);
            var stat = parseFloat(inventObject.GetParameter(statName));
            if (stat && !isNaN(stat))
                result += stat;
        }
        if (isNaN(result))
            return new VariableValue(0);
        return new VariableValue(result);
    };
    EngineInventory.prototype.IsWearing = function (values, env) {
        var itemName = values[0].GetString();
        for (var slot in world.Player.EquipedObjects)
            if (world.Player.EquipedObjects[slot].Name.toLowerCase() == itemName)
                return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineInventory.prototype.Verify_IsWearing = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetInventoryObject(values[0]))
            throw "The inventory object '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineInventory.prototype.ExecuteWearingUsage = function (values, env) {
        /*if ((this['Inventory'] && this['Inventory'].ExecuteWearingUsage && !this['Inventory'].ExecuteWearingUsage.caller) || (this.ExecuteWearingUsage && !this.ExecuteWearingUsage.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        for (var slot in world.Player.EquipedObjects) {
            var name = world.Player.EquipedObjects[slot].Name;
            var object = world.GetInventoryObject(name);
            object.Use();
        }
        return null;
    };
    return EngineInventory;
}());
__decorate([
    ApiMethod([{ name: "itemName", description: "Item to add." }, { name: "quantity", description: "Quantity to add." }], "(optional) Adds an item to the player inventory. If skipped it will remove one.")
], EngineInventory.prototype, "AddItem", null);
__decorate([
    ApiMethod([{ name: "itemName", description: "Item to add." }, { name: "quantity", description: "(optional) Quantity to remove. If skipped it will remove one." }], "Removes an item from the player inventory.")
], EngineInventory.prototype, "RemoveItem", null);
__decorate([
    ApiMethod([{ name: "itemName", description: "Item to check." }, { name: "parameterName", description: "Name of the parameter to check." }], "Returns true if the item do have this parameter defined.")
], EngineInventory.prototype, "ObjectParameterExists", null);
__decorate([
    ApiMethod([{ name: "itemName", description: "Item to check." }, { name: "parameterName", description: "Value to calculate." }], "Returns the value of the item's parameter value.")
], EngineInventory.prototype, "ObjectParameter", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The stat to evaluate." }], "Calculates the stat effect of all the items the player is currently wearing.")
], EngineInventory.prototype, "GetWearedEffect", null);
__decorate([
    ApiMethod([{ name: "itemName", description: "The inventory object to check." }], "Checks if the player is currently wearing the item.")
], EngineInventory.prototype, "IsWearing", null);
__decorate([
    ApiMethod([], "Executing all the Use actions of the weared items.")
], EngineInventory.prototype, "ExecuteWearingUsage", null);
EngineInventory = __decorate([
    ApiClass
], EngineInventory);
/// <reference path="../CodeEnvironement.ts" />
var EngineMap = (function () {
    function EngineMap() {
    }
    EngineMap.prototype.SpawnMapObject = function (values, env) {
        /*if ((this['Map'] && this['Map'].SpawnMapObject && !this['Map'].SpawnMapObject.caller) || (this.SpawnMapObject && !this.SpawnMapObject.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var x = values[0].GetNumber();
        var y = values[1].GetNumber();
        var zone = world.Player.Zone;
        var name = values[2].GetString();
        var ax = Math.floor(x / (world.areaWidth * world.art.background.width));
        var ay = Math.floor(y / (world.areaHeight * world.art.background.height));
        var mx = Math.abs(x) % (world.areaWidth * world.art.background.width);
        var my = Math.abs(y) % (world.areaHeight * world.art.background.height);
        if (ax < 0)
            mx = (world.areaWidth - 1) * world.art.background.width - mx;
        if (ay < 0)
            my = (world.areaHeight - 1) * world.art.background.height - my;
        var area = world.GetArea(ax, ay, zone);
        area.tempObjects.push(new TemporaryWorldObject(name, mx, my, area));
        if (values[3])
            area.tempObjects[area.tempObjects.length - 1].EndOfLife = new Date(new Date().getTime() + values[3].GetNumber() * 1000);
        area.CleanObjectCache();
        return null;
    };
    EngineMap.prototype.Verify_SpawnMapObject = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.art.objects[values[2]])
            throw "The map object '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    return EngineMap;
}());
__decorate([
    ApiMethod([{ name: "x", description: "Position x on the map." },
        { name: "y", description: "Position y on the map." },
        { name: "name", description: "Name of the object to place." },
        { name: "timeToLive", description: "(optional) Time to live expressed in seconds." }], "Creates a new temporaty object on the map.")
], EngineMap.prototype, "SpawnMapObject", null);
EngineMap = __decorate([
    ApiClass
], EngineMap);
/// <reference path="../CodeEnvironement.ts" />
var EngineMath = (function () {
    function EngineMath() {
    }
    EngineMath.prototype.PI = function (values, env) {
        return new VariableValue(Math.PI);
    };
    EngineMath.prototype.Sin = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.sin(values[0].GetNumber()));
    };
    EngineMath.prototype.ASin = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.asin(values[0].GetNumber()));
    };
    EngineMath.prototype.Cos = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.cos(values[0].GetNumber()));
    };
    EngineMath.prototype.ACos = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.acos(values[0].GetNumber()));
    };
    EngineMath.prototype.Tan = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.tan(values[0].GetNumber()));
    };
    EngineMath.prototype.ATan = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.atan(values[0].GetNumber()));
    };
    EngineMath.prototype.Pow = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.pow(values[0].GetNumber(), values[1].GetNumber()));
    };
    EngineMath.prototype.Round = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.round(values[0].GetNumber()));
    };
    EngineMath.prototype.Floor = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.floor(values[0].GetNumber()));
    };
    EngineMath.prototype.Ceil = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.ceil(values[0].GetNumber()));
    };
    EngineMath.prototype.Mod = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue((values[0].GetNumber() % values[1].GetNumber()));
    };
    EngineMath.prototype.Sqrt = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.sqrt(values[0].GetNumber()));
    };
    EngineMath.prototype.Log = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.log(values[0].GetNumber()));
    };
    EngineMath.prototype.Exp = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.exp(values[0].GetNumber()));
    };
    EngineMath.prototype.Abs = function (values, env) {
        if (values[0] === null)
            return null;
        return new VariableValue(Math.abs(values[0].GetNumber()));
    };
    EngineMath.prototype.Rnd = function (values, env) {
        if (values[1]) {
            var min = values[1].GetNumber();
            var max = values[0].GetNumber();
            return new VariableValue(Math.round(Math.random() * (max - min)) + min);
        }
        else if (values[0]) {
            var max = values[0].GetNumber();
            return new VariableValue(Math.round(Math.random() * max));
        }
        return new VariableValue(Math.random());
    };
    EngineMath.CalculateAngle = function (ad, op) {
        var angle = 0.0;
        if (ad == 0.0)
            ad = 0.00001;
        // Get the angle formed by the line
        angle = Math.atan(op / ad);
        if (ad < 0.0) {
            angle = Math.PI * 2.0 - angle;
            angle = Math.PI - angle;
        }
        while (angle < 0)
            angle += Math.PI * 2.0;
        return angle;
    };
    return EngineMath;
}());
__decorate([
    ApiMethod([], "Returns the mathematical constant PI which is 3.141592653589793 .")
], EngineMath.prototype, "PI", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the sinusoidal of the given value.")
], EngineMath.prototype, "Sin", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc sinusoidal of the given value.")
], EngineMath.prototype, "ASin", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the cosinusoidal of the given value.")
], EngineMath.prototype, "Cos", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc cosinusoidal of the given value.")
], EngineMath.prototype, "ACos", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the tangent of the given value.")
], EngineMath.prototype, "Tan", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the arc tangent of the given value.")
], EngineMath.prototype, "ATan", null);
__decorate([
    ApiMethod([{ name: "base", description: "Base number to calculate." }, { name: "exponent", description: "Exponent number to calculate." }], "Returns the base number power exponent.")
], EngineMath.prototype, "Pow", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the rounded value (< 0.5 will be 0, >= 0.5 will be 1).")
], EngineMath.prototype, "Round", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the floored value (< 1 will be 0).")
], EngineMath.prototype, "Floor", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the ceiled value (> 0 will be 1).")
], EngineMath.prototype, "Ceil", null);
__decorate([
    ApiMethod([{ name: "var1", description: "The value to divide." }, { name: "var2", description: "The value to divide width." }], "Returns the remainder operator value when deviding the first variable with the second.")
], EngineMath.prototype, "Mod", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the square root of the value.")
], EngineMath.prototype, "Sqrt", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the natural logarithm (base e) of the value.")
], EngineMath.prototype, "Log", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the e power of the value.")
], EngineMath.prototype, "Exp", null);
__decorate([
    ApiMethod([{ name: "value", description: "Value to calculate." }], "Returns the absolute number of the value.")
], EngineMath.prototype, "Abs", null);
__decorate([
    ApiMethod([{ name: "max", description: "(optional) max value to return (inclusive)." }, { name: "min", description: "(optional) min value to return (inclusive)." }], "Returns a random number. If no min/max is given the value is between 0 and 1.")
], EngineMath.prototype, "Rnd", null);
EngineMath = __decorate([
    ApiClass
], EngineMath);
/// <reference path="../CodeEnvironement.ts" />
var EngineMessage = (function () {
    function EngineMessage() {
    }
    EngineMessage.prototype.SendMessage = function (values, env) {
        MessageMenu.SendMessage(values[0].GetString(), values[1].GetString(), values[2].GetString());
        return null;
    };
    EngineMessage.prototype.HasNewMessage = function (values, env) {
        return new VariableValue(messageMenu.nonRead > 0);
    };
    return EngineMessage;
}());
__decorate([
    ApiMethod([{ name: "username", description: "Destination user." }, { name: "subject", description: "The subject of the message" }, { name: "message", description: "Message to send" }], "Sends an offline message (in-game email).")
], EngineMessage.prototype, "SendMessage", null);
__decorate([
    ApiMethod([], "Returns true if there is a new non-read message.")
], EngineMessage.prototype, "HasNewMessage", null);
EngineMessage = __decorate([
    ApiClass
], EngineMessage);
/// <reference path="../CodeEnvironement.ts" />
var EngineMonster = (function () {
    function EngineMonster() {
    }
    EngineMonster.prototype.RetreiveSetting = function (values, env) {
        var id = values[0].GetNumber();
        var name = values[1].GetString().toLowerCase();
        var actor = MovingActor.FindActorById(id);
        if (actor && actor instanceof Monster) {
            var monster = actor;
            if (monster.MonsterEnv.Code.CodeVariables[name])
                return new VariableValue(monster.MonsterEnv.Code.CodeVariables[name]);
            if (monster.MonsterEnv.DefaultMonster.Code.CodeVariables[name])
                return new VariableValue(monster.MonsterEnv.DefaultMonster.Code.CodeVariables[name]);
        }
        return new VariableValue(null);
    };
    EngineMonster.prototype.HuntWalk = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return null;
        var dist = values[1].GetNumber();
        actor.HuntWalk(dist);
        return null;
    };
    EngineMonster.prototype.RandomWalk = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (actor)
            actor.RandomWalk();
        return null;
    };
    EngineMonster.prototype.GetName = function (values, env) {
        var id = values[0].GetNumber();
        var actor = MovingActor.FindActorById(id);
        if (!actor)
            return new VariableValue("");
        return new VariableValue(actor.Name);
    };
    return EngineMonster;
}());
__decorate([
    ApiMethod([{ name: "monsterId", description: "Monster ID to check." }, { name: "parameterName", description: "Monster parameter to read." }], "Returns the value of the monster parameter.")
], EngineMonster.prototype, "RetreiveSetting", null);
__decorate([
    ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }, { name: "maxDistance", description: "Max distance in tiles before we use a random walk (must be between 5 and 20)." }], "Moves the monster toward the player if possible.")
], EngineMonster.prototype, "HuntWalk", null);
__decorate([
    ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }], "Moves the monster randomly.")
], EngineMonster.prototype, "RandomWalk", null);
__decorate([
    ApiMethod([{ name: "monsterId", description: "Monster ID to handle." }], "Returns the name of the monster.")
], EngineMonster.prototype, "GetName", null);
EngineMonster = __decorate([
    ApiClass
], EngineMonster);
/// <reference path="../CodeEnvironement.ts" />
var EngineObject = (function () {
    function EngineObject() {
    }
    EngineObject.prototype.ObjectExists = function (values, env) {
        if (world.GetInventoryObject(values[0].GetString()))
            return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineObject.prototype.CreateObject = function (values, env) {
        world.InventoryObjects.push(new KnownObject(values[0].GetString(), values[1].GetString()));
        return new VariableValue(values[0].GetString());
    };
    EngineObject.prototype.TypeExists = function (values, env) {
        if (world.GetInventoryObjectType(values[0].GetString()))
            return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineObject.prototype.CreateType = function (values, env) {
        world.InventoryObjectTypes.push(new ObjectType(values[0].GetString(), values[1] ? values[1].GetString() : values[0].GetString()));
        return new VariableValue(values[0].GetString());
    };
    EngineObject.prototype.SetObjectUseAction = function (values, env) {
        var obj = world.GetInventoryObject(values[0].GetString());
        if (!obj)
            return null;
        obj.Action = values[1].GetString();
        obj.UsageActions = [{ Name: "ExecuteCodeFunction", Values: [values[2].GetString()] }];
        return null;
    };
    return EngineObject;
}());
__decorate([
    ApiMethod([{ name: "name", description: "The name to check." }], "Returns true if the object is defined in the object database.")
], EngineObject.prototype, "ObjectExists", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name to create." }, { name: "typeName", description: "The name of the object type." }], "Returns the name of the created object or the existing object.")
], EngineObject.prototype, "CreateObject", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name to check." }], "Returns true if the object type is defined in the object database.")
], EngineObject.prototype, "TypeExists", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name to create." }, { name: "group", description: "(optional) The name of the object type." }], "Returns the name of the created object or the existing object.")
], EngineObject.prototype, "CreateType", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name of the object." }, { name: "actionText", description: "Name of the action to show" }, { name: "actionCode", description: "Script code to execute" }], "Set an action to an object.")
], EngineObject.prototype, "SetObjectUseAction", null);
EngineObject = __decorate([
    ApiClass
], EngineObject);
/// <reference path="../CodeEnvironement.ts" />
var EnginePlayer = (function () {
    function EnginePlayer() {
    }
    EnginePlayer.prototype.IsOnline = function (values, env) {
        var username = values[0].GetString().toLowerCase();
        for (var i = 0; i < chat.channels['#global'].users.length; i++) {
            if (chat.channels['#global'].users[i].toLowerCase() == username)
                return new VariableValue(true);
        }
        return new VariableValue(false);
    };
    EnginePlayer.prototype.HasRole = function (values, env) {
        switch (values[0].GetString().toLowerCase()) {
            case "admin":
            case "game admin":
                return new VariableValue(userRoles.contains(1000) || userRoles.contains(100));
            case "moderator":
            case "chat moderator":
                return new VariableValue(userRoles.contains(1000) || userRoles.contains(100) || userRoles.contains(10));
        }
        return new VariableValue(false);
    };
    EnginePlayer.prototype.Verify_HasRole = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            throw "The role '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!["admin", "game admin", "moderator", "chat moderator"].contains(values[0].toLowerCase()))
            throw "The role '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.IncreaseStat = function (values, env) {
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
    };
    EnginePlayer.prototype.Verify_IncreaseStat = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.ReduceStat = function (values, env) {
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
    };
    EnginePlayer.prototype.Verify_ReduceStat = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.GetStat = function (values, env) {
        var statName = values[0].GetString();
        return new VariableValue(world.Player.GetStat(statName));
    };
    EnginePlayer.prototype.Verify_GetStat = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.HasMaxValue = function (values, env) {
        var statName = values[0].GetString();
        var stat = world.Player.FindStat(statName);
        return new VariableValue(stat.MaxValue ? true : false);
    };
    EnginePlayer.prototype.Verify_HasMaxValue = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.GetStatMaxValue = function (values, env) {
        var statName = values[0].GetString();
        var result = world.Player.GetStatMaxValue(statName);
        if (isNaN(result))
            return new VariableValue(0);
        return new VariableValue(result);
    };
    EnginePlayer.prototype.Verify_GetStatMaxValue = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.SetStat = function (values, env) {
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
    };
    EnginePlayer.prototype.Verify_SetStat = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetStat(values[0]))
            throw "The stat '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.TimerRunning = function (values, env) {
        var name = values[0].GetString().toLowerCase();
        var timer = world.Player.GetTimer(name);
        return new VariableValue(timer ? !timer.IsOver() : false);
    };
    EnginePlayer.prototype.StartTimer = function (values, env) {
        var name = values[0].GetString().toLowerCase();
        var length = (values[1] ? values[1].GetNumber() : null);
        world.Player.SetTimer(name, length);
        return null;
    };
    EnginePlayer.prototype.StopTimer = function (values, env) {
        var actor = world.Player;
        var name = values[1].GetString().toLowerCase();
        var length = (values[2] ? values[2].GetNumber() : null);
        actor.SetTimer(name, 0);
        return null;
    };
    EnginePlayer.prototype.GetTimer = function (values, env) {
        var actor = world.Player;
        var name = values[1].GetString().toLowerCase();
        var timer = actor.GetTimer(name);
        return new VariableValue(timer ? (timer.Length - timer.Ellapsed() < 0 ? 0 : timer.Length - timer.Ellapsed()) : 0);
    };
    EnginePlayer.prototype.Respawn = function () {
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
    };
    EnginePlayer.prototype.SetRespawn = function (values, env) {
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
    };
    EnginePlayer.prototype.Verify_SetRespawn = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetZone(values[2]))
            throw "The zone '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.Teleport = function (values, env) {
        /*if ((this['Player'] && this['Player'].Teleport && !this['Player'].Teleport.caller) || (this.Teleport && !this.Teleport.caller))
        {
            play.devTools = true;
            return;
        }*/
        Teleport.Teleport(values[0].GetNumber(), values[1].GetNumber(), values[2].GetString());
        return null;
    };
    EnginePlayer.prototype.Verify_Teleport = function (line, column, values) {
        if (!values || !values[2] || !world)
            return;
        if (typeof values[2] != "string")
            return;
        if (!world.GetZone(values[2]))
            throw "The zone '" + values[2] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.GetX = function (values, env) {
        return new VariableValue(world.Player.X + world.Player.AX * world.areaWidth * world.art.background.width);
    };
    EnginePlayer.prototype.GetY = function (values, env) {
        return new VariableValue(world.Player.Y + world.Player.AY * world.areaHeight * world.art.background.height);
    };
    EnginePlayer.prototype.IsAnimationRunning = function (values, env) {
        return new VariableValue(world.Player.ActionAnimation != ACTION_ANIMATION.NONE);
    };
    EnginePlayer.prototype.SetAnimation = function (values, env) {
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
        switch (animation) {
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
    };
    EnginePlayer.prototype.Verify_SetAnimation = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (values[0].toLowerCase() != "attack" && values[0].toLowerCase() != "damage")
            throw "The animation '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.ExecuteWhenAnimationDone = function (values, env) {
        /*if ((this['Player'] && this['Player'].ExecuteWhenAnimationDone && !this['Player'].ExecuteWhenAnimationDone.caller) || (this.ExecuteWhenAnimationDone && !this.ExecuteWhenAnimationDone.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.ActionAnimationDone = function () {
            world.Player.ActionAnimationDone = null;
            //console.log("Execute player after animation");
            env.ExecuteFunction(values[0].GetString(), []);
        };
        return null;
    };
    EnginePlayer.prototype.SetVariable = function (values, env) {
        /*if ((this['Player'] && this['Player'].SetVariable && !this['Player'].SetVariable.caller) || (this.SetVariable && !this.SetVariable.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.SetVariable(values[0].GetString(), values[1]);
        return null;
    };
    EnginePlayer.prototype.GetVariable = function (values, env) {
        return world.Player.GetVariable(values[0].GetString());
    };
    EnginePlayer.prototype.SetQuestVariable = function (values, env) {
        /*if ((this['Player'] && this['Player'].SetQuestVariable && !this['Player'].SetQuestVariable.caller) || (this.SetQuestVariable && !this.SetQuestVariable.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.SetQuestVariable(values[0].GetString(), values[1].GetNumber());
        return null;
    };
    EnginePlayer.prototype.GetQuestVariable = function (values, env) {
        return new VariableValue(world.Player.GetQuestVariable(values[0].GetString()));
    };
    EnginePlayer.prototype.SetLook = function (values, env) {
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
    };
    EnginePlayer.prototype.Verify_SetLook = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.art.characters[values[0]])
            throw "The charcter '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.GetLook = function (values, env) {
        return new VariableValue(world.Player.Name);
    };
    EnginePlayer.prototype.GetCurrentSkill = function (values, env) {
        return new VariableValue(world.Player.CurrentSkill);
    };
    EnginePlayer.prototype.IsInDialog = function (values, env) {
        return new VariableValue(world.Player.InDialog);
    };
    EnginePlayer.prototype.StartTemporaryEffect = function (values, env) {
        /*if ((this['Player'] && this['Player'].StartTemporaryEffect && !this['Player'].StartTemporaryEffect.caller) || (this.StartTemporaryEffect && !this.StartTemporaryEffect.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.StartTemporaryEffect(values[0].GetString());
        return null;
    };
    EnginePlayer.prototype.Verify_StartTemporaryEffect = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetTemporaryEffect(values[0]))
            throw "The temporary effect '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.RemoveTemporaryEffect = function (values, env) {
        /*if ((this['Player'] && this['Player'].RemoveTemporaryEffect && !this['Player'].RemoveTemporaryEffect.caller) || (this.RemoveTemporaryEffect && !this.RemoveTemporaryEffect.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.RemoveTemporaryEffect(values[0].GetString());
        return null;
    };
    EnginePlayer.prototype.Verify_RemoveTemporaryEffect = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetTemporaryEffect(values[0]))
            throw "The temporary effect '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.RemoveAllTemporaryEffects = function (values, env) {
        /*if ((this['Player'] && this['Player'].RemoveAllTemporaryEffects && !this['Player'].RemoveAllTemporaryEffects.caller) || (this.RemoveAllTemporaryEffects && !this.RemoveAllTemporaryEffects.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.ClearTemporaryEffects();
        return null;
    };
    EnginePlayer.prototype.StorePlayerLook = function (values, env) {
        /*if ((this['Player'] && this['Player'].StorePlayerLook && !this['Player'].StorePlayerLook.caller) || (this.StorePlayerLook && !this.StorePlayerLook.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        world.Player.SetQuestVariable("__PlayerLook", world.Player.Name);
        return null;
    };
    EnginePlayer.prototype.RestorePlayerLook = function (values, env) {
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
    };
    EnginePlayer.prototype.AddParticleEffect = function (values, env) {
        world.Player.ParticleEffect = world.GetParticleSystem(values[0].GetString());
        if (world.Player.ParticleEffect)
            world.Player.ParticleEffectDuration = new Date(new Date().getTime() + values[1].GetNumber() * 1000);
        return null;
    };
    EnginePlayer.prototype.Verify_AddParticleEffect = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetParticleSystem(values[0]))
            throw "The particle effect '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EnginePlayer.prototype.GetName = function (values, env) {
        return new VariableValue(world.Player.Username);
    };
    return EnginePlayer;
}());
__decorate([
    ApiMethod([{ name: "playerName", description: "The player to check." }], "Checks if a player is online.")
], EnginePlayer.prototype, "IsOnline", null);
__decorate([
    ApiMethod([{ name: "role", description: "The role to check." }], "Checks if the current player has a given role.")
], EnginePlayer.prototype, "HasRole", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to increase." }, { name: "value", description: "Quantity to increase." }], "Increase the player stat by the given value.")
], EnginePlayer.prototype, "IncreaseStat", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to decrease." }, { name: "value", description: "Quantity to decrease." }], "Decrease the player stat by the given value.")
], EnginePlayer.prototype, "ReduceStat", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to read." }], "Get the player stat by the given value.")
], EnginePlayer.prototype, "GetStat", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to check." }], "Returns true if the player's stat has a maximum value.")
], EnginePlayer.prototype, "HasMaxValue", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to read." }], "Get the player stat max value by the given value.")
], EnginePlayer.prototype, "GetStatMaxValue", null);
__decorate([
    ApiMethod([{ name: "statName", description: "The STAT to modify." }, { name: "value", description: "Value to set." }], "Set the player stat by the given value.")
], EnginePlayer.prototype, "SetStat", null);
__decorate([
    ApiMethod([{ name: "timerName", description: "The name of the timer to check." }], "Returns true if the player's timer is currently running. If it's finished it will return false.")
], EnginePlayer.prototype, "TimerRunning", null);
__decorate([
    ApiMethod([{ name: "timerName", description: "The name of the timer to set." }, { name: "time", description: "The time the player's timer needs to be set to." }], "Sets a timer which will run till the full time is elapsed.")
], EnginePlayer.prototype, "StartTimer", null);
__decorate([
    ApiMethod([{ name: "timerName", description: "The name of the timer to stop." }], "Stops a currently player's running timer.")
], EnginePlayer.prototype, "StopTimer", null);
__decorate([
    ApiMethod([{ name: "timerName", description: "The name of the timer to check." }], "Returns the time left or 0 on the given player's timer.")
], EnginePlayer.prototype, "GetTimer", null);
__decorate([
    ApiMethod([], "Respawn the player to the initial position.")
], EnginePlayer.prototype, "Respawn", null);
__decorate([
    ApiMethod([{ name: "x", description: "The X coordinate where to place the player." }, { name: "y", description: "The Y coordinate where to place the player." }, { name: "zone", description: "The Zone where to place the player." }], "Set the respawn point of the player.")
], EnginePlayer.prototype, "SetRespawn", null);
__decorate([
    ApiMethod([{ name: "x", description: "The X coordinate where to place the player." }, { name: "y", description: "The Y coordinate where to place the player." }, { name: "zone", description: "The Zone where to place the player." }], "Place the player on another position on the same map or on another one.")
], EnginePlayer.prototype, "Teleport", null);
__decorate([
    ApiMethod([], "Returns the X coordinate of the player.")
], EnginePlayer.prototype, "GetX", null);
__decorate([
    ApiMethod([], "Returns the Y coordinate of the player.")
], EnginePlayer.prototype, "GetY", null);
__decorate([
    ApiMethod([], "Returns true if an animation is currently running.")
], EnginePlayer.prototype, "IsAnimationRunning", null);
__decorate([
    ApiMethod([{ name: "name", description: "The animation effect to set. Can be either 'none', 'attack' or 'damage'." }], "Sets the animation effect.")
], EnginePlayer.prototype, "SetAnimation", null);
__decorate([
    ApiMethod([{ name: "name", description: "The function name to execute when the player animation is over." }], "Will execute the function of the current block when the animation is over.")
], EnginePlayer.prototype, "ExecuteWhenAnimationDone", null);
__decorate([
    ApiMethod([{ name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a variable which can be read from another function or later on.")
], EnginePlayer.prototype, "SetVariable", null);
__decorate([
    ApiMethod([{ name: "name", description: "The variable to read." }], "Retreives a variable previously stored.")
], EnginePlayer.prototype, "GetVariable", null);
__decorate([
    ApiMethod([{ name: "name", description: "The variable to set." }, { name: "value", description: "The value to set." }], "Set a quest variable which can be read from another function or later on.")
], EnginePlayer.prototype, "SetQuestVariable", null);
__decorate([
    ApiMethod([{ name: "name", description: "The variable to read." }], "Retreives a quest variable previously stored.")
], EnginePlayer.prototype, "GetQuestVariable", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name of the character art to use." }], "Set the player look to the wished character art.")
], EnginePlayer.prototype, "SetLook", null);
__decorate([
    ApiMethod([], "Returns the player the current character art used by the player.")
], EnginePlayer.prototype, "GetLook", null);
__decorate([
    ApiMethod([], "Returns the currently player selected skill.")
], EnginePlayer.prototype, "GetCurrentSkill", null);
__decorate([
    ApiMethod([], "Returns the true if the player is currently within a NPC dialog / shop.")
], EnginePlayer.prototype, "IsInDialog", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name of the temporary effect to add." }], "Adds a temporary effect.")
], EnginePlayer.prototype, "StartTemporaryEffect", null);
__decorate([
    ApiMethod([{ name: "name", description: "The name of the temporary effect to remove." }], "Removes the player temporary effects.")
], EnginePlayer.prototype, "RemoveTemporaryEffect", null);
__decorate([
    ApiMethod([], "Removes all the player temporary effects.")
], EnginePlayer.prototype, "RemoveAllTemporaryEffects", null);
__decorate([
    ApiMethod([], "Stores the current player look.")
], EnginePlayer.prototype, "StorePlayerLook", null);
__decorate([
    ApiMethod([], "Restores the current player look.")
], EnginePlayer.prototype, "RestorePlayerLook", null);
__decorate([
    ApiMethod([{ name: "name", description: "The particle effect name." }, { name: "time", description: "Time to keep this particle effect on the map." }], "Place particle effect on the player for a given time.")
], EnginePlayer.prototype, "AddParticleEffect", null);
__decorate([
    ApiMethod([], "Returns the player name.")
], EnginePlayer.prototype, "GetName", null);
EnginePlayer = __decorate([
    ApiClass
], EnginePlayer);
/// <reference path="../CodeEnvironement.ts" />
var EngineQuest = (function () {
    function EngineQuest() {
    }
    EngineQuest.prototype.Start = function (values, env) {
        /*if ((this['Quest'] && this['Quest'].Start && !this['Quest'].Start.caller) || (this.Start && !this.Start.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var questName = values[0].GetString();
        world.Player.StartQuest(questName);
        return null;
    };
    EngineQuest.prototype.Verify_Start = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineQuest.prototype.CheckStarted = function (values, env) {
        var questName = values[0].GetString();
        return new VariableValue(world.Player.IsQuestStarted(questName));
    };
    EngineQuest.prototype.Verify_CheckStarted = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineQuest.prototype.CheckCompleted = function (values, env) {
        var questName = values[0].GetString();
        return new VariableValue(world.Player.IsQuestCompleted(questName));
    };
    EngineQuest.prototype.Verify_CheckCompleted = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineQuest.prototype.Complete = function (values, env) {
        /*if ((this['Quest'] && this['Quest'].Complete && !this['Quest'].Complete.caller) || (this.Complete && !this.Complete.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var questName = values[0].GetString();
        world.Player.CompleteQuest(questName);
        return null;
    };
    EngineQuest.prototype.Verify_Complete = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetQuest(values[0]))
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineQuest.prototype.AddJournalEntry = function (values, env) {
        /*if ((this['Quest'] && this['Quest'].AddJournalEntry && !this['Quest'].AddJournalEntry.caller) || (this.AddJournalEntry && !this.AddJournalEntry.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var questName = values[0].GetString();
        var entryId = values[1].GetNumber();
        world.Player.AddQuestJournalEntry(questName, entryId);
        return null;
    };
    EngineQuest.prototype.Verify_AddJournalEntry = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        var quest = world.GetQuest(values[0]);
        if (!quest)
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "number")
            return;
        var id = values[1];
        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++) {
            if (quest.JournalEntries[i].Id == id) {
                found = true;
                break;
            }
        }
        if (!quest)
            throw "The quest '" + values[0] + "' doesn't contain a journal entry with the id '" + id + "' at " + line + ":" + column;
    };
    EngineQuest.prototype.JournalEntryReceived = function (values, env) {
        var questName = values[0].GetString();
        var entryId = values[1].GetNumber();
        return new VariableValue(world.Player.HaveQuestJournalEntry(questName, entryId));
    };
    EngineQuest.prototype.Verify_JournalEntryReceived = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        var quest = world.GetQuest(values[0]);
        if (!quest)
            throw "The quest '" + values[0] + "' is unknown at " + line + ":" + column;
        if (!values || !values[1] || !world)
            return;
        if (typeof values[1] != "number")
            return;
        var id = values[1];
        var found = false;
        for (var i = 0; i < quest.JournalEntries.length; i++) {
            if (quest.JournalEntries[i].Id == id) {
                found = true;
                break;
            }
        }
        if (!quest)
            throw "The quest '" + values[0] + "' doesn't contain a journal entry with the id '" + id + "' at " + line + ":" + column;
    };
    return EngineQuest;
}());
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest to start." }], "Starts a player quest.")
], EngineQuest.prototype, "Start", null);
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest to check." }], "Returns true if the player started this quest.")
], EngineQuest.prototype, "CheckStarted", null);
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest to check." }], "Returns true if the player completed this quest.")
], EngineQuest.prototype, "CheckCompleted", null);
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest to complete." }], "Completes a player quest.")
], EngineQuest.prototype, "Complete", null);
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest." }, { name: "journalEntryId", description: "The id of the journal entry to add." }], "Adds a quest journal entry.")
], EngineQuest.prototype, "AddJournalEntry", null);
__decorate([
    ApiMethod([{ name: "questName", description: "The name of the quest." }, { name: "journalEntryId", description: "The id of the journal entry to check." }], "Returns true if the player received this journal entry.")
], EngineQuest.prototype, "JournalEntryReceived", null);
EngineQuest = __decorate([
    ApiClass
], EngineQuest);
/// <reference path="../CodeEnvironement.ts" />
var EngineSkill = (function () {
    function EngineSkill() {
    }
    EngineSkill.prototype.RetreiveSetting = function (values, env) {
        var name = values[0].GetString().toLowerCase();
        var skill = world.GetSkill(world.Player.CurrentSkill);
        if (skill.CodeVariable(name))
            return new VariableValue(skill.CodeVariable(name));
        else if (skill.BaseSkill)
            return new VariableValue(skill.BaseSkill.CodeVariable(name));
        else
            return new VariableValue(0);
    };
    EngineSkill.prototype.GiveSkill = function (values, env) {
        /*if ((this['Skill'] && this['Skill'].GiveSkill && !this['Skill'].GiveSkill.caller) || (this.GiveSkill && !this.GiveSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var name = values[0].GetString().toLowerCase();
        world.Player.GiveSkill(name);
        return null;
    };
    EngineSkill.prototype.Verify_GiveSkill = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineSkill.prototype.HasSkill = function (values, env) {
        /*if ((this['Skill'] && this['Skill'].HasSkill && !this['Skill'].HasSkill.caller) || (this.HasSkill && !this.HasSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var name = values[0].GetString().toLowerCase();
        for (var i = 0; i < world.Player.Skills.length; i++)
            if (world.Player.Skills[i].Name.toLowerCase() == name)
                return new VariableValue(true);
        return new VariableValue(false);
    };
    EngineSkill.prototype.Verify_HasSkill = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineSkill.prototype.ActivateSkill = function (values, env) {
        /*if ((this['Skill'] && this['Skill'].ActivateSkill && !this['Skill'].ActivateSkill.caller) || (this.ActivateSkill && !this.ActivateSkill.caller))
        {
            play.devTools = true;
            world.Player.InformServer();
            return;
        }*/
        var oldSkill = world.Player.CurrentSkill;
        var selectedSkill = values[0].GetString();
        world.Player.CurrentSkill = selectedSkill;
        var skill = world.GetSkill(selectedSkill);
        var res = skill.InvokeFunction("Activate", []);
        // Prevent selection
        if (res !== null && res.GetBoolean() === false) {
            world.Player.CurrentSkill = oldSkill;
        }
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        return null;
    };
    EngineSkill.prototype.Verify_ActivateSkill = function (line, column, values) {
        if (!values || !values[0] || !world)
            return;
        if (typeof values[0] != "string")
            return;
        if (!world.GetSkill(values[0]))
            throw "The skill '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    return EngineSkill;
}());
__decorate([
    ApiMethod([{ name: "parameterName", description: "Skill parameter to read." }], "Returns the value of the current skill parameter.")
], EngineSkill.prototype, "RetreiveSetting", null);
__decorate([
    ApiMethod([{ name: "skillName", description: "Skill to given to the player." }], "Adds a skill to the player.")
], EngineSkill.prototype, "GiveSkill", null);
__decorate([
    ApiMethod([{ name: "skillName", description: "Skill to check." }], "Checks if the player has the skill.")
], EngineSkill.prototype, "HasSkill", null);
__decorate([
    ApiMethod([{ name: "skillName", description: "Skill to activate." }], "Activate a player skill.")
], EngineSkill.prototype, "ActivateSkill", null);
EngineSkill = __decorate([
    ApiClass
], EngineSkill);
/// <reference path="../CodeEnvironement.ts" />
var EngineSound = (function () {
    function EngineSound() {
    }
    EngineSound.prototype.Play = function (values, env) {
        Sounds.Play(values[0].GetString(), values[1] ? values[1].GetNumber() : 0.6);
        return null;
    };
    EngineSound.prototype.Verify_Play = function (line, column, values) {
        if (!values || !values[0] || !world || !world.art || !world.art.sounds)
            return;
        if (typeof values[0] != "string")
            return;
        for (var item in world.art.sounds)
            if (item.toLowerCase() == values[0].toLowerCase())
                return;
        throw "The sound '" + values[0] + "' is unknown at " + line + ":" + column;
    };
    EngineSound.prototype.StopAll = function (values, env) {
        Sounds.ClearSound();
        return null;
    };
    return EngineSound;
}());
__decorate([
    ApiMethod([{ name: "soundName", description: "The unique ID of the sound to be played." }, { name: "volume", description: "(optional) The volume at which to play the sound." }], "Plays a sound once at the specified level.")
], EngineSound.prototype, "Play", null);
__decorate([
    ApiMethod([], "Stops all the currently played music and sounds.")
], EngineSound.prototype, "StopAll", null);
EngineSound = __decorate([
    ApiClass
], EngineSound);
/// <reference path="../CodeEnvironement.ts" />
var engineStorage = new ((function () {
    function class_15() {
        this.lastRowId = null;
        this.nextQueryId = 1;
        this.openQueries = [];
        this.openCreate = [];
        this.tableList = [];
        this.columnList = [];
    }
    return class_15;
}()));
var charsRegex = /[\0\b\t\n\r\x1a\"\'\\]/g;
var charsMap = {
    '\0': '\\0',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\x1a': '\\Z',
    '"': '\\"',
    '\'': '\\\'',
    '\\': '\\\\'
};
var EngineStorage = EngineStorage_1 = (function () {
    function EngineStorage() {
    }
    EngineStorage.prototype.AddNewData = function (values, env) {
        var table = values[0].GetString();
        var found = null;
        for (var i = 0; i < engineStorage.openCreate.length; i++) {
            if (engineStorage.openCreate[i].table.toLowerCase() == table.toLowerCase()) {
                found = i;
                break;
            }
        }
        if (found === null) {
            engineStorage.openCreate.push({ table: table, headers: [], values: [] });
            found = engineStorage.openCreate.length - 1;
        }
        var header = values[1].GetString();
        var value = values[2].GetString();
        engineStorage.openCreate[found].headers.push(header);
        engineStorage.openCreate[found].values.push(value);
        return null;
    };
    EngineStorage.prototype.Verify_AddNewData = function (line, column, values) {
        if (typeof values[0] == "string") {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
        if (typeof values[1] == "string") {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The column name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    };
    EngineStorage.prototype.StoreData = function (values, env) {
        var table = values[0].GetString();
        var found = null;
        for (var i = 0; i < engineStorage.openCreate.length; i++) {
            if (engineStorage.openCreate[i].table.toLowerCase() == table.toLowerCase()) {
                found = i;
                break;
            }
        }
        if (found === null)
            return null;
        var token = framework.Preferences['token'];
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/SaveGameStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: engineStorage.openCreate[found].table,
                    headers: JSON.stringify(engineStorage.openCreate[found].headers),
                    values: JSON.stringify(engineStorage.openCreate[found].values)
                },
                success: function (msg) {
                    engineStorage.lastRowId = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    engineStorage.lastRowId = null;
                    env.RebuildStack();
                }
            });
            engineStorage.openCreate.splice(found, 1);
        });
        return null;
    };
    EngineStorage.prototype.Verify_StoreData = function (line, column, values) {
        if (typeof values[0] == "string") {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    };
    EngineStorage.prototype.GetLastRowId = function (values, env) {
        return new VariableValue(engineStorage.lastRowId);
    };
    EngineStorage.prototype.QueryData = function (values, env) {
        var id = engineStorage.nextQueryId++;
        engineStorage.openQueries.push({ id: id, condition: "", orderBy: "rowId desc", executed: false, headers: [], rows: [], table: values[0].GetString(), currentRow: 0 });
        return new VariableValue(id);
    };
    EngineStorage.prototype.Verify_QueryData = function (line, column, values) {
        if (typeof values[0] == "string") {
            if (!("" + values[0]).match(/^[a-z][a-z_0-9]+$/i))
                throw "The table name '" + values[2] + "' is not using a valid name at " + line + ":" + column;
            return;
        }
    };
    /*@ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "columnName", description: "The name of the column wished to be returned." }], "Add a column to the query to be returned.")
    QueryAddColumn(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        var id = values[0].GetNumber();

        for (var i = 0; i < engineStorage.openQueries.length; i++)
        {
            if (engineStorage.openQueries[i].id == id)
            {
                engineStorage.openQueries[i].headers.push(values[1].GetString());
                return null;
            }
        }

        return null;
    }*/
    EngineStorage.prototype.Where = function (values, env) {
        var cond = values[1].GetString();
        for (var i = 2; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage_1.EscapeString(values[i].GetString()) + "'");
        var id = values[0].GetNumber();
        var found = null;
        for (var i = 0; i < engineStorage.openQueries.length; i++) {
            if (engineStorage.openQueries[i].id == id) {
                engineStorage.openQueries[i].condition = cond;
                return values[0];
            }
        }
        return null;
    };
    EngineStorage.EscapeString = function (toEscape) {
        var chunkIndex = charsRegex.lastIndex = 0;
        var result = '';
        var match;
        while ((match = charsRegex.exec(toEscape))) {
            result += toEscape.slice(chunkIndex, match.index) + charsMap[match[0]];
            chunkIndex = charsRegex.lastIndex;
        }
        // Nothing was escaped
        if (chunkIndex === 0)
            return toEscape;
        if (chunkIndex < toEscape.length)
            return result + toEscape.slice(chunkIndex);
        return result;
        /*var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-_.,:;";
        var result = "";
        for (var i = 0; i < toEscape.length; i++)
        {
            var c = toEscape[i];
            if (allowedChars.indexOf(c) != -1)
                result += c;
            else if (c == "'")
                result += "''";
        }
        return result;*/
    };
    /*OrderBy(values: VariableValue[], env: CodeEnvironement): VariableValue
    {
        return null;
    }*/
    EngineStorage.prototype.ExecuteQuery = function (values, env) {
        var id = values[0].GetNumber();
        var found = null;
        for (var i = 0; i < engineStorage.openQueries.length; i++) {
            if (engineStorage.openQueries[i].id == id) {
                found = i;
                break;
            }
        }
        if (found === null)
            return null;
        var token = framework.Preferences['token'];
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/GetGameStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: engineStorage.openQueries[found].table,
                    headers: JSON.stringify(engineStorage.openQueries[found].headers),
                    condition: engineStorage.openQueries[found].condition,
                    orderBy: engineStorage.openQueries[found].orderBy
                },
                success: function (msg) {
                    var data = TryParse(msg);
                    engineStorage.openQueries[found].executed = true;
                    engineStorage.openQueries[found].headers = data.headers;
                    engineStorage.openQueries[found].rows = data.rows;
                    engineStorage.openQueries[found].currentRow = -1;
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    engineStorage.openQueries[found].executed = true;
                    engineStorage.openQueries[found].rows = null;
                    engineStorage.openQueries[found].error = msg;
                    env.RebuildStack();
                }
            });
        });
        return null;
    };
    EngineStorage.prototype.GetNbRows = function (values, env) {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++)
            if (engineStorage.openQueries[i].id == id)
                return new VariableValue(engineStorage.openQueries[i].rows.length);
        return new VariableValue(0);
    };
    EngineStorage.prototype.NextRow = function (values, env) {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++) {
            if (engineStorage.openQueries[i].id == id) {
                if (!engineStorage.openQueries[i].rows)
                    return new VariableValue(false);
                engineStorage.openQueries[i].currentRow++;
                return new VariableValue(engineStorage.openQueries[i].currentRow < engineStorage.openQueries[i].rows.length);
            }
        }
        return new VariableValue(false);
    };
    EngineStorage.prototype.GetValue = function (values, env) {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++) {
            if (engineStorage.openQueries[i].id == id) {
                var colNb = null;
                if (values[1].Type == ValueType.Number)
                    colNb = values[1].GetNumber();
                else {
                    var colName = values[1].GetString().toLowerCase();
                    for (var j = 0; j < engineStorage.openQueries[i].headers.length; j++) {
                        if (engineStorage.openQueries[i].headers[j].toLowerCase() == colName) {
                            colNb = j;
                            break;
                        }
                    }
                }
                if (colNb === null)
                    return new VariableValue(null);
                else {
                    var val = engineStorage.openQueries[i].rows[Math.max(0, engineStorage.openQueries[i].currentRow)][colNb];
                    return new VariableValue(val ? val : null);
                }
            }
        }
        return new VariableValue(null);
    };
    EngineStorage.prototype.CloseQuery = function (values, env) {
        var id = values[0].GetNumber();
        for (var i = 0; i < engineStorage.openQueries.length; i++) {
            if (engineStorage.openQueries[i].id == id) {
                engineStorage.openQueries.splice(i, 1);
                return new VariableValue(null);
            }
        }
        return new VariableValue(null);
    };
    EngineStorage.prototype.KeepOnlyLast = function (values, env) {
        var table = values[0].GetString();
        var nbToKeep = values[1].GetNumber();
        var token = framework.Preferences['token'];
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteOlderStorage',
                data: {
                    game: world.Id,
                    token: token,
                    table: table,
                    keep: nbToKeep
                },
                success: function (msg) {
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.DeleteRow = function (values, env) {
        var table = values[0].GetString();
        var rowid = values[1].GetNumber();
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteRowStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: table,
                    row: rowid
                },
                success: function (msg) {
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.Update = function (values, env) {
        var cond = values[3].GetString();
        for (var i = 4; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage_1.EscapeString(values[i].GetString()) + "'");
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/UpdateStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString(),
                    column: values[1].GetString(),
                    value: values[2].GetString(),
                    condition: cond
                },
                success: function (msg) {
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.Delete = function (values, env) {
        var cond = values[1].GetString();
        for (var i = 2; i < values.length; i++)
            cond = cond.replace("?", "'" + EngineStorage_1.EscapeString(values[i].GetString()) + "'");
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString(),
                    condition: cond
                },
                success: function (msg) {
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.Drop = function (values, env) {
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/DropTable',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    table: values[0].GetString()
                },
                success: function (msg) {
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.RetrieveTableList = function (values, env) {
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/ListStorage',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token']
                },
                success: function (msg) {
                    engineStorage.tableList = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.NBTables = function (values, env) {
        return new VariableValue(engineStorage.tableList.length);
    };
    EngineStorage.prototype.GetTableName = function (values, env) {
        return new VariableValue(engineStorage.tableList[values[0].GetNumber()].name);
    };
    EngineStorage.prototype.RetrieveColumnList = function (values, env) {
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/ListColumnsStorage',
                data: {
                    game: world.Id,
                    table: values[0].GetString(),
                    token: framework.Preferences['token']
                },
                success: function (msg) {
                    engineStorage.columnList = TryParse(msg);
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    EngineStorage.prototype.NBColumns = function (values, env) {
        return new VariableValue(engineStorage.columnList.length);
    };
    EngineStorage.prototype.GetColumnName = function (values, env) {
        return new VariableValue(engineStorage.columnList[values[0].GetNumber()].name);
    };
    EngineStorage.prototype.TableExists = function (values, env) {
        env.StoreStack(function () {
            $.ajax({
                type: 'POST',
                url: '/backend/StorageTableExists',
                data: {
                    game: world.Id,
                    table: values[0].GetString(),
                    token: framework.Preferences['token']
                },
                success: function (msg) {
                    stackResult = new VariableValue(JSON.parse(msg));
                    env.RebuildStack();
                },
                error: function (msg, textStatus) {
                    var data = TryParse(msg);
                    Main.AddErrorMessage(data.error);
                    env.RebuildStack();
                }
            });
        });
        return new VariableValue(null);
    };
    return EngineStorage;
}());
__decorate([
    ApiMethod([{ name: "tableName", description: "The table name." },
        { name: "columnName", description: "The name of the column where to store the data." },
        { name: "value", description: "The data to store." }], "Add a new column / row to the database.")
], EngineStorage.prototype, "AddNewData", null);
__decorate([
    ApiMethod([{ name: "tableName", description: "The table name." }], "Submit the data to add.")
], EngineStorage.prototype, "StoreData", null);
__decorate([
    ApiMethod([], "Returns the last rowId inserted.")
], EngineStorage.prototype, "GetLastRowId", null);
__decorate([
    ApiMethod([{ name: "tableName", description: "The table name." }], "Create a new read query and returns the id of the query.")
], EngineStorage.prototype, "QueryData", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "condition", description: "SQL Like condition." },
        { name: "parameters", description: "(...) Parameters" }], "Allows to add one ore more SQL like conditions (E.g.: column = value). Use ? in the condition and optional parameters to avoid code injections.")
], EngineStorage.prototype, "Where", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Execute a query.")
], EngineStorage.prototype, "ExecuteQuery", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Returns the number of rows returned.")
], EngineStorage.prototype, "GetNbRows", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Moves to the next (or first) row of the query and returns true if there is more data to be queried.")
], EngineStorage.prototype, "NextRow", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }, { name: "columnName", description: "The name of the column to read." }], "Returns the value of the column (identified either by the position or the name).")
], EngineStorage.prototype, "GetValue", null);
__decorate([
    ApiMethod([{ name: "queryId", description: "The ID of the query." }], "Close the query and free up the resources.")
], EngineStorage.prototype, "CloseQuery", null);
__decorate([
    ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "nbToKeep", description: "The number of rows to keep." }], "Delete all the rows beside the nbToKeep last rows.")
], EngineStorage.prototype, "KeepOnlyLast", null);
__decorate([
    ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "rowId", description: "The rowId to delete." }], "Delete a rowId.")
], EngineStorage.prototype, "DeleteRow", null);
__decorate([
    ApiMethod([{ name: "table", description: "The name of the table to cleanup." }, { name: "column", description: "The column to modify." },
        { name: "value", description: "The column to set." }, { name: "condition", description: "Rows must match the condition to be modified." },
        { name: "parameters", description: "(...) Parameters" }], "Modify data within the database.")
], EngineStorage.prototype, "Update", null);
__decorate([
    ApiMethod([{ name: "table", description: "The name of the table to cleanup." },
        { name: "condition", description: "Rows must match the condition to be deleted." },
        { name: "parameters", description: "(...) Parameters" }], "Delete data within the database.")
], EngineStorage.prototype, "Delete", null);
__decorate([
    ApiMethod([{ name: "table", description: "The name of the table to cleanup." }], "Drop completely a table of the database.")
], EngineStorage.prototype, "Drop", null);
__decorate([
    ApiMethod([], "Retrieve the list of all the tables stored by this game.")
], EngineStorage.prototype, "RetrieveTableList", null);
__decorate([
    ApiMethod([], "Number of tables retrieved with RetrieveTableList.")
], EngineStorage.prototype, "NBTables", null);
__decorate([
    ApiMethod([{ name: "position", description: "Position in the list." }], "Get the name of the table at the position.")
], EngineStorage.prototype, "GetTableName", null);
__decorate([
    ApiMethod([{ name: "table", description: "Name of the table to check." }], "Retrieve the list of all the columns of a given table stored by this game.")
], EngineStorage.prototype, "RetrieveColumnList", null);
__decorate([
    ApiMethod([], "Number of columns retrieved with RetrieveColumnList.")
], EngineStorage.prototype, "NBColumns", null);
__decorate([
    ApiMethod([{ name: "position", description: "Position in the list." }], "Get the name of the column at the position.")
], EngineStorage.prototype, "GetColumnName", null);
__decorate([
    ApiMethod([{ name: "table", description: "Name of the table to check." }], "Returns true if the table exists. Don't use directly the function, store the value within a variable and then use the value."),
    ApiWrapper("function Storage_TableExists(table) { Storage._TableExists(table); return stackResult; }")
], EngineStorage.prototype, "TableExists", null);
EngineStorage = EngineStorage_1 = __decorate([
    ApiClass
], EngineStorage);
var EngineStorage_1;
/// <reference path="../CodeParser.ts" />
var TokenAnd = (function (_super) {
    __extends(TokenAnd, _super);
    function TokenAnd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenAnd.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "&" && parser.PeekChar(1) == "&");
    };
    TokenAnd.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenAnd;
}(CodeToken));
TokenAnd = __decorate([
    Token
], TokenAnd);
/// <reference path="../CodeParser.ts" />
var TokenAssign = (function (_super) {
    __extends(TokenAssign, _super);
    function TokenAssign() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenAssign.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "=" && parser.PeekChar(1) != "=");
    };
    TokenAssign.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenAssign;
}(CodeToken));
TokenAssign = __decorate([
    Token
], TokenAssign);
/// <reference path="../CodeParser.ts" />
var TokenCloseParenthesis = (function (_super) {
    __extends(TokenCloseParenthesis, _super);
    function TokenCloseParenthesis() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenCloseParenthesis.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == ")");
    };
    TokenCloseParenthesis.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenCloseParenthesis;
}(CodeToken));
TokenCloseParenthesis = __decorate([
    Token
], TokenCloseParenthesis);
/// <reference path="../CodeParser.ts" />
var TokenCloseSquareBracket = (function (_super) {
    __extends(TokenCloseSquareBracket, _super);
    function TokenCloseSquareBracket() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenCloseSquareBracket.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "]");
    };
    TokenCloseSquareBracket.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenCloseSquareBracket;
}(CodeToken));
TokenCloseSquareBracket = __decorate([
    Token
], TokenCloseSquareBracket);
/// <reference path="../CodeParser.ts" />
var TokenCodeVariable = (function (_super) {
    __extends(TokenCodeVariable, _super);
    function TokenCodeVariable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenCodeVariable.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "@");
    };
    TokenCodeVariable.prototype.Extract = function (parser) {
        var extracted = parser.NextChar();
        while (parser.HasChar()) {
            var c = parser.NextChar();
            extracted += c;
            if (c == extracted.charAt(0))
                break;
        }
        return extracted.substr(1, extracted.length - 2);
    };
    ;
    return TokenCodeVariable;
}(CodeToken));
TokenCodeVariable = __decorate([
    Token
], TokenCodeVariable);
/// <reference path="../CodeToken.ts" />
/// <reference path="../CodeParser.ts" />
var TokenComment = (function (_super) {
    __extends(TokenComment, _super);
    function TokenComment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenComment.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        if (parser.PeekChar() == "/" && parser.PeekChar(1) == "/")
            return true;
        if (parser.PeekChar() == "/" && parser.PeekChar(1) == "*")
            return true;
    };
    TokenComment.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        // Skip the two slashes
        parser.SkipChar();
        var secondChar = parser.NextChar();
        var extracted = "";
        // Multi line comment
        if (secondChar == "*") {
            while (parser.HasChar()) {
                if (parser.PeekChar() == "*" && parser.PeekChar(1) == "/") {
                    parser.NextChar();
                    parser.NextChar();
                    return extracted;
                }
                extracted += parser.NextChar();
            }
        }
        // Single line comment
        while (parser.HasChar()) {
            if (parser.PeekChar() == "\n" || parser.PeekChar() == "\r")
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    };
    return TokenComment;
}(CodeToken));
TokenComment = __decorate([
    Token
], TokenComment);
/// <reference path="../CodeParser.ts" />
var TokenCompare = (function (_super) {
    __extends(TokenCompare, _super);
    function TokenCompare() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenCompare.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return ((parser.PeekChar() == "=" && parser.PeekChar(1) == "=") ||
            parser.PeekChar() == "<" ||
            parser.PeekChar() == ">" ||
            (parser.PeekChar() == "!" && parser.PeekChar(1) == "="));
    };
    TokenCompare.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        if ((parser.PeekChar() == "<" || parser.PeekChar() == ">") && parser.PeekChar(1) != "=")
            return parser.NextChar();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenCompare;
}(CodeToken));
TokenCompare = __decorate([
    Token
], TokenCompare);
/// <reference path="../CodeParser.ts" />
var TokenDecrement = (function (_super) {
    __extends(TokenDecrement, _super);
    function TokenDecrement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenDecrement.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "-" && parser.PeekChar(1) == "-");
    };
    TokenDecrement.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenDecrement;
}(CodeToken));
TokenDecrement = __decorate([
    Token
], TokenDecrement);
/// <reference path="../CodeParser.ts" />
var TokenDot = (function (_super) {
    __extends(TokenDot, _super);
    function TokenDot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberChar = "0123456789";
        return _this;
    }
    TokenDot.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "." && this.numberChar.indexOf(parser.PeekChar(1)) == -1);
    };
    TokenDot.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenDot;
}(CodeToken));
TokenDot = __decorate([
    Token
], TokenDot);
/// <reference path="../CodeParser.ts" />
var TokenEndBlock = (function (_super) {
    __extends(TokenEndBlock, _super);
    function TokenEndBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenEndBlock.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "}");
    };
    TokenEndBlock.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenEndBlock;
}(CodeToken));
TokenEndBlock = __decorate([
    Token
], TokenEndBlock);
/// <reference path="../CodeParser.ts" />
var TokenEndLine = (function (_super) {
    __extends(TokenEndLine, _super);
    function TokenEndLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenEndLine.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == ";");
    };
    TokenEndLine.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenEndLine;
}(CodeToken));
TokenEndLine = __decorate([
    Token
], TokenEndLine);
/// <reference path="../CodeParser.ts" />
var TokenIncrement = (function (_super) {
    __extends(TokenIncrement, _super);
    function TokenIncrement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenIncrement.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "+" && parser.PeekChar(1) == "+");
    };
    TokenIncrement.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenIncrement;
}(CodeToken));
TokenIncrement = __decorate([
    Token
], TokenIncrement);
/// <reference path="../CodeParser.ts" />
var TokenName = (function (_super) {
    __extends(TokenName, _super);
    function TokenName() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowedChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
        _this.secondChar = "0123456789";
        return _this;
    }
    TokenName.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return this.allowedChar.indexOf(parser.PeekChar()) != -1;
    };
    TokenName.prototype.Extract = function (parser) {
        var extracted = "";
        parser.SkipSpaces();
        while (parser.HasChar()) {
            if (extracted.length > 0 && this.allowedChar.indexOf(parser.PeekChar()) == -1 && this.secondChar.indexOf(parser.PeekChar()) == -1)
                break;
            else if (extracted.length == 0 && this.allowedChar.indexOf(parser.PeekChar()) == -1)
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    };
    return TokenName;
}(CodeToken));
TokenName = __decorate([
    Token
], TokenName);
/// <reference path="../CodeParser.ts" />
var TokenNot = (function (_super) {
    __extends(TokenNot, _super);
    function TokenNot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenNot.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "!" && parser.PeekChar(1) != "=");
    };
    TokenNot.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenNot;
}(CodeToken));
TokenNot = __decorate([
    Token
], TokenNot);
/// <reference path="../CodeParser.ts" />
var TokenNumber = (function (_super) {
    __extends(TokenNumber, _super);
    function TokenNumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowedChar = "0123456789";
        return _this;
    }
    TokenNumber.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        if (parser.PeekChar() == "." && this.allowedChar.indexOf(parser.PeekChar(1)) != -1)
            return true;
        return this.allowedChar.indexOf(parser.PeekChar()) != -1 && parser.PeekChar() != ".";
    };
    TokenNumber.prototype.Extract = function (parser) {
        var extracted = "";
        parser.SkipSpaces();
        while (parser.HasChar()) {
            if (this.allowedChar.indexOf(parser.PeekChar()) == -1 && parser.PeekChar() != ".")
                break;
            extracted += parser.NextChar();
        }
        return extracted;
    };
    return TokenNumber;
}(CodeToken));
TokenNumber = __decorate([
    Token
], TokenNumber);
/// <reference path="../CodeParser.ts" />
var TokenOpenParenthesis = (function (_super) {
    __extends(TokenOpenParenthesis, _super);
    function TokenOpenParenthesis() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenOpenParenthesis.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "(");
    };
    TokenOpenParenthesis.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenOpenParenthesis;
}(CodeToken));
TokenOpenParenthesis = __decorate([
    Token
], TokenOpenParenthesis);
/// <reference path="../CodeParser.ts" />
var TokenOpenSquareBracket = (function (_super) {
    __extends(TokenOpenSquareBracket, _super);
    function TokenOpenSquareBracket() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenOpenSquareBracket.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "[");
    };
    TokenOpenSquareBracket.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenOpenSquareBracket;
}(CodeToken));
TokenOpenSquareBracket = __decorate([
    Token
], TokenOpenSquareBracket);
/// <reference path="../CodeParser.ts" />
var TokenOperator = (function (_super) {
    __extends(TokenOperator, _super);
    function TokenOperator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowedChar = "+-*/";
        return _this;
    }
    TokenOperator.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (this.allowedChar.indexOf(parser.PeekChar()) != -1 && this.allowedChar.indexOf(parser.PeekChar(1)) == -1 && parser.PeekChar(1) != "=");
    };
    TokenOperator.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenOperator;
}(CodeToken));
TokenOperator = __decorate([
    Token
], TokenOperator);
/// <reference path="../CodeParser.ts" />
var TokenOperatorAssign = (function (_super) {
    __extends(TokenOperatorAssign, _super);
    function TokenOperatorAssign() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allowedChar = "+-*/";
        return _this;
    }
    TokenOperatorAssign.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (this.allowedChar.indexOf(parser.PeekChar()) != -1 && this.allowedChar.indexOf(parser.PeekChar(1)) == -1 && parser.PeekChar(1) == "=");
    };
    TokenOperatorAssign.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenOperatorAssign;
}(CodeToken));
TokenOperatorAssign = __decorate([
    Token
], TokenOperatorAssign);
/// <reference path="../CodeParser.ts" />
var TokenOr = (function (_super) {
    __extends(TokenOr, _super);
    function TokenOr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenOr.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "|" && parser.PeekChar(1) == "|");
    };
    TokenOr.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar() + parser.NextChar();
    };
    return TokenOr;
}(CodeToken));
TokenOr = __decorate([
    Token
], TokenOr);
/// <reference path="../CodeParser.ts" />
var TokenSplitParameter = (function (_super) {
    __extends(TokenSplitParameter, _super);
    function TokenSplitParameter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenSplitParameter.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == ",");
    };
    TokenSplitParameter.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenSplitParameter;
}(CodeToken));
TokenSplitParameter = __decorate([
    Token
], TokenSplitParameter);
/// <reference path="../CodeParser.ts" />
var TokenStartBlock = (function (_super) {
    __extends(TokenStartBlock, _super);
    function TokenStartBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenStartBlock.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "{");
    };
    TokenStartBlock.prototype.Extract = function (parser) {
        parser.SkipSpaces();
        return parser.NextChar();
    };
    return TokenStartBlock;
}(CodeToken));
TokenStartBlock = __decorate([
    Token
], TokenStartBlock);
/// <reference path="../CodeParser.ts" />
var TokenString = (function (_super) {
    __extends(TokenString, _super);
    function TokenString() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenString.prototype.CanBeUsed = function (parser) {
        parser.SkipSpaces();
        return (parser.PeekChar() == "\"" || parser.PeekChar() == "'");
    };
    TokenString.prototype.Extract = function (parser) {
        var extracted = parser.NextChar();
        while (parser.HasChar()) {
            var c = parser.NextChar();
            extracted += c;
            if (c == extracted.charAt(0))
                break;
        }
        return extracted.substr(1, extracted.length - 2);
    };
    ;
    return TokenString;
}(CodeToken));
TokenString = __decorate([
    Token
], TokenString);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Add'] = { help: "Add two values and return the result. If one of the two is a string a concatenation will be made.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var AddStatement = (function (_super) {
    __extends(AddStatement, _super);
    function AddStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    AddStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new AddCode());
    };
    AddStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    AddStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    AddStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " + " + this.BStatement.ToCode(0);
    };
    return AddStatement;
}(CodeStatement));
AddStatement = __decorate([
    StatementClass
], AddStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['And'] = { help: "Returns a boolean AND operation. Both values must be true to returns true otherwise returns false.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var AndStatement = (function (_super) {
    __extends(AndStatement, _super);
    function AndStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    AndStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new AndCode());
    };
    AndStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    AndStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    AndStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " && " + this.BStatement.ToCode(0);
    };
    return AndStatement;
}(CodeStatement));
AndStatement = __decorate([
    StatementClass
], AndStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Assign'] = { help: "Set the variable to the value passed. A variable is like a box allowing you to store a number or a string inside.", params: [{ name: 'Variable', type: 'string' }, { name: 'Statement', type: 'CodeStatement' }] };
var AssignStatement = (function (_super) {
    __extends(AssignStatement, _super);
    function AssignStatement(variable, statement) {
        var _this = _super.call(this) || this;
        _this.variableId = null;
        _this.index = null;
        _this.Variable = (variable ? variable : "myvar").toLowerCase();
        _this.Statement = statement;
        return _this;
    }
    AssignStatement.prototype.Compile = function (code) {
        this.Statement.Compile(code);
        if (this.index) {
            this.index.Compile(code);
            code.Code.push(new AssignCode(this.Variable, true));
        }
        else
            code.Code.push(new AssignCode(this.Variable));
    };
    AssignStatement.prototype.BlockVerify = function () {
        return (this.Statement !== null && this.Statement !== undefined ? true : false);
    };
    AssignStatement.prototype.Verify = function (env) {
        this.Statement.Verify(env);
        env.SetVariable(this.Variable, new VariableValue(null));
    };
    AssignStatement.prototype.ToCode = function (indent) {
        return this.Variable + (this.index ? "[" + this.index.ToCode(0) + "]" : "") + " = " + this.Statement.ToCode(0);
    };
    return AssignStatement;
}(CodeStatement));
AssignStatement = __decorate([
    TopBlockStatementClass,
    StatementClass
], AssignStatement);
/// <reference path="../CodeStatement.ts" />
var BlockStatement = (function (_super) {
    __extends(BlockStatement, _super);
    function BlockStatement(statements) {
        var _this = _super.call(this) || this;
        _this.Statements = statements;
        return _this;
    }
    BlockStatement.prototype.Compile = function (code) {
        for (var i = 0; i < this.Statements.length; i++)
            this.Statements[i].Compile(code);
    };
    BlockStatement.prototype.BlockVerify = function () {
        return true;
    };
    BlockStatement.prototype.Verify = function (env) {
        for (var i = 0; i < this.Statements.length; i++)
            this.Statements[i].Verify(env);
    };
    BlockStatement.prototype.ToCode = function (indent) {
        var code = "";
        if (this.Statements.length > 1)
            code += this.Indent(indent) + "{\n";
        for (var i = 0; i < this.Statements.length; i++) {
            var line = this.Statements[i].ToCode(indent + 1);
            if (line == ";")
                line = "";
            if (line.length > 0 && line[line.length - 1] == "\n")
                code += this.Indent(indent + 1) + line;
            else if (line == "" || (line.length > 0 && (line[line.length - 1] == "}" || line[line.length - 1] == "{")) || (line.length > 1 && line.substr(line.length - 2) == "*/"))
                code += this.Indent(indent + 1) + line + "\n";
            else
                code += this.Indent(indent + 1) + line + ";\n";
        }
        if (this.Statements.length > 1)
            code += this.Indent(indent) + "}";
        return code;
    };
    BlockStatement.prototype.HTMLBlocks = function (path, codeStatements) {
        var html = "";
        for (var i = 0; i < this.Statements.length; i++)
            html += this.Statements[i].HTMLBlocks(path + "." + i, codeStatements);
        html += "<span class='emptyBlock' path='" + path + "'>Empty</span>";
        return html;
    };
    return BlockStatement;
}(CodeStatement));
BlockStatement = __decorate([
    StatementClass
], BlockStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Boolean'] = { help: "A boolean value which can be either true or false. Click on the node to change from true to false and reverse.", params: [] };
var BooleanStatement = (function (_super) {
    __extends(BooleanStatement, _super);
    function BooleanStatement(value) {
        if (value === void 0) { value = true; }
        var _this = _super.call(this) || this;
        _this.value = new VariableValue(value);
        return _this;
    }
    BooleanStatement.prototype.Compile = function (code) {
        code.Code.push(new PushCode(this.value));
    };
    BooleanStatement.prototype.BlockVerify = function () {
        return true;
    };
    BooleanStatement.prototype.Verify = function (env) {
    };
    BooleanStatement.prototype.ToCode = function (indent) {
        return (this.value.GetBoolean() ? "true" : "false");
    };
    BooleanStatement.prototype.HTMLBlocks = function (path, codeStatements) {
        var html = "";
        html += "<div class='codeBlock' id='bl_" + path.replace(/\./g, "_") + "'><span class='simpleBlockType' block='boolean'>Boolean: " + (this.value.GetBoolean() ? "True" : "False") + "</span>";
        html += "</div>";
        return html;
    };
    return BooleanStatement;
}(CodeStatement));
BooleanStatement = __decorate([
    StatementClass
], BooleanStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Break'] = { help: "Stops the current loop (while, do while or for).", params: [] };
var BreakStatement = (function (_super) {
    __extends(BreakStatement, _super);
    function BreakStatement() {
        return _super.call(this) || this;
    }
    BreakStatement.prototype.Compile = function (code) {
        code.Code.push(code.LoopExitStack[code.LoopExitStack.length - 1]);
    };
    BreakStatement.prototype.ToCode = function (indent) {
        return "break";
    };
    BreakStatement.prototype.BlockVerify = function () {
        return true;
    };
    BreakStatement.prototype.Verify = function (env) {
    };
    return BreakStatement;
}(CodeStatement));
BreakStatement = __decorate([
    TopBlockStatementClass,
    StatementClass
], BreakStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['CodeVariable'] = { help: "Allows to create a parameter for extensions or stat / skills.", params: [{ name: 'Name', type: 'string' }] };
var CodeVariableStatement = (function (_super) {
    __extends(CodeVariableStatement, _super);
    function CodeVariableStatement(name, startLine, startColumn) {
        var _this = _super.call(this) || this;
        _this.Name = name;
        return _this;
    }
    CodeVariableStatement.prototype.Compile = function (code) {
        throw "Code variable @" + this.Name + "@ has not been set.";
    };
    CodeVariableStatement.prototype.BlockVerify = function () {
        return true;
    };
    CodeVariableStatement.prototype.Verify = function (env) {
    };
    CodeVariableStatement.prototype.ToCode = function (indent) {
        return "@" + this.Name + "@";
    };
    return CodeVariableStatement;
}(CodeStatement));
CodeVariableStatement = __decorate([
    StatementClass
], CodeVariableStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Comment'] = { help: "Allows to put a comment on the code. It doesn't influence the logic otherwise.", params: [{ name: 'Comment', type: 'string', display: 'embed' }] };
var CommentStatement = (function (_super) {
    __extends(CommentStatement, _super);
    function CommentStatement(comment) {
        var _this = _super.call(this) || this;
        _this.Comment = comment;
        return _this;
    }
    CommentStatement.prototype.Compile = function (code) {
    };
    CommentStatement.prototype.BlockVerify = function () {
        return true;
    };
    CommentStatement.prototype.Verify = function (env) {
    };
    CommentStatement.prototype.ToCode = function (indent) {
        return "/* " + this.Comment + " */";
    };
    return CommentStatement;
}(CodeStatement));
CommentStatement = __decorate([
    TopBlockStatementClass,
    StatementClass
], CommentStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Compare'] = { help: "Compares two values and if the comparison is correct returns true, otherwise returns false.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'Operator', type: 'string' }, { name: 'BStatement', type: 'CodeStatement' }] };
var CompareStatement = (function (_super) {
    __extends(CompareStatement, _super);
    function CompareStatement(statementA, operator, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.Operator = (operator ? operator : "==");
        _this.BStatement = statementB;
        return _this;
    }
    CompareStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new CompareCode(this.Operator));
    };
    CompareStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    CompareStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    CompareStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " " + this.Operator + " " + this.BStatement.ToCode(0);
    };
    return CompareStatement;
}(CodeStatement));
CompareStatement = __decorate([
    StatementClass
], CompareStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Divide'] = { help: "Divides A by B and returns the result.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var DivideStatement = (function (_super) {
    __extends(DivideStatement, _super);
    function DivideStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    DivideStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new DivideCode());
    };
    DivideStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    DivideStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    DivideStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " / " + this.BStatement.ToCode(0);
    };
    return DivideStatement;
}(CodeStatement));
DivideStatement = __decorate([
    StatementClass
], DivideStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['DoWhile'] = { help: "Repeat the code as long as the condition is matched but runs at least once the code.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] };
var DoWhileStatement = DoWhileStatement_1 = (function (_super) {
    __extends(DoWhileStatement, _super);
    function DoWhileStatement(condition, blockStatement) {
        var _this = _super.call(this) || this;
        _this.Condition = condition;
        _this.BlockStatement = (blockStatement ? blockStatement : new BlockStatement([]));
        // For single line statements convert them as block
        if (_this.BlockStatement.constructor !== BlockStatement)
            _this.BlockStatement = new BlockStatement([_this.BlockStatement]);
        return _this;
    }
    DoWhileStatement.Parse = function (parser) {
        var blockStatement = CodeStatement.Top(parser);
        if (!(parser.HasToken() && parser.PeekToken().Type == "TokenName" && parser.PeekToken().Value == "while"))
            throw "Was expecting a 'while' at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        if (parser.PeekToken().Type != "TokenEndLine")
            throw "Unexpected token " + parser.PeekToken().Type + " at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        return new DoWhileStatement_1(condition, blockStatement);
    };
    DoWhileStatement.prototype.Compile = function (code) {
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.BlockStatement.Compile(code);
        this.Condition.Compile(code);
        code.Code.push(new IfCode(startLine, code.Code.length + 1));
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
    };
    DoWhileStatement.prototype.BlockVerify = function () {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    };
    DoWhileStatement.prototype.Verify = function (env) {
        this.BlockStatement.Verify(env);
        this.Condition.Verify(env);
    };
    DoWhileStatement.prototype.ToCode = function (indent) {
        return "do\n" + this.BlockStatement.ToCode(indent) + " while(" + this.Condition.ToCode(0) + ")";
    };
    return DoWhileStatement;
}(CodeStatement));
DoWhileStatement = DoWhileStatement_1 = __decorate([
    TopBlockStatementClass,
    StatementClass
], DoWhileStatement);
var DoWhileStatement_1;
/// <reference path="../CodeStatement.ts" />
var EmptyArrayStatement = (function (_super) {
    __extends(EmptyArrayStatement, _super);
    function EmptyArrayStatement(startLine, startColumn) {
        return _super.call(this) || this;
    }
    EmptyArrayStatement.prototype.Compile = function (code) {
        code.Code.push(new NewArrayCode());
    };
    EmptyArrayStatement.prototype.BlockVerify = function () {
        return true;
    };
    EmptyArrayStatement.prototype.Verify = function (env) {
    };
    EmptyArrayStatement.prototype.ToCode = function (indent) {
        return "[]";
    };
    return EmptyArrayStatement;
}(CodeStatement));
EmptyArrayStatement = __decorate([
    StatementClass
], EmptyArrayStatement);
/// <reference path="../CodeStatement.ts" />
var EmptyStatement = (function (_super) {
    __extends(EmptyStatement, _super);
    function EmptyStatement() {
        return _super.call(this) || this;
    }
    EmptyStatement.prototype.Compile = function (code) {
    };
    EmptyStatement.prototype.BlockVerify = function () {
        return true;
    };
    EmptyStatement.prototype.Verify = function (env) {
    };
    EmptyStatement.prototype.ToCode = function (indent) {
        return "";
    };
    return EmptyStatement;
}(CodeStatement));
EmptyStatement = __decorate([
    StatementClass
], EmptyStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['For'] = { help: "First run the init code, then as long as the condition is matched runs the block code and at every repeatition runs the loop code.", params: [{ name: 'InitCode', type: 'CodeStatement' }, { name: 'Condition', type: 'CodeStatement' }, { name: 'LoopCode', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] };
var ForStatement = ForStatement_1 = (function (_super) {
    __extends(ForStatement, _super);
    function ForStatement(initCode, condition, loopCode, blockStatement) {
        var _this = _super.call(this) || this;
        _this.InitCode = initCode;
        _this.Condition = condition;
        _this.LoopCode = loopCode;
        _this.BlockStatement = (blockStatement ? blockStatement : new BlockStatement([]));
        // For single line statements convert them as block
        if (_this.BlockStatement.constructor !== BlockStatement)
            _this.BlockStatement = new BlockStatement([_this.BlockStatement]);
        return _this;
    }
    ForStatement.Parse = function (parser) {
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var initCode = CodeStatement.Top(parser);
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenEndLine")
            throw "Was expecting a ; at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var loopCode = CodeStatement.Expression(parser, false);
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var blockStatement = CodeStatement.Top(parser);
        return new ForStatement_1(initCode, condition, loopCode, blockStatement);
    };
    ForStatement.prototype.Compile = function (code) {
        this.InitCode.Compile(code);
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.Condition.Compile(code);
        var condition = new IfCode(code.Code.length + 1, null);
        code.Code.push(condition);
        this.BlockStatement.Compile(code);
        this.LoopCode.Compile(code);
        code.Code.push(new JumpCode(startLine));
        condition.FalseJump = code.Code.length;
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
    };
    ForStatement.prototype.BlockVerify = function () {
        return (!(this.InitCode === null || this.InitCode === undefined || this.Condition === null || this.Condition === undefined || this.LoopCode === null || this.LoopCode === undefined));
    };
    ForStatement.prototype.Verify = function (env) {
        this.InitCode.Verify(env);
        this.Condition.Verify(env);
        this.LoopCode.Verify(env);
        this.BlockStatement.Verify(env);
    };
    ForStatement.prototype.ToCode = function (indent) {
        return "for(" + this.InitCode.ToCode(0) + ";" + this.Condition.ToCode(0) + ";" + this.LoopCode.ToCode(0) + ")\n" + this.BlockStatement.ToCode(indent);
    };
    return ForStatement;
}(CodeStatement));
ForStatement = ForStatement_1 = __decorate([
    TopBlockStatementClass,
    StatementClass
], ForStatement);
var ForStatement_1;
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['FunctionCall'] = { help: "", params: [{ name: 'Name', type: 'string' }, { name: 'values', type: 'any[]' }] };
var FunctionCallStatement = FunctionCallStatement_1 = (function (_super) {
    __extends(FunctionCallStatement, _super);
    function FunctionCallStatement(name, values, startLine, startColumn) {
        var _this = _super.call(this) || this;
        _this.function = null;
        _this.functionType = "local";
        _this.Name = name.toLowerCase();
        _this.values = values;
        _this.startLine = startLine;
        _this.startColumn = startColumn - name.length;
        return _this;
    }
    FunctionCallStatement.Parse = function (name, parser) {
        var nodes = [];
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        var startToken = parser.NextToken();
        while (parser.HasToken() && parser.PeekToken().Type != "TokenCloseParenthesis") {
            nodes.push(CodeStatement.Element(parser));
            if (!parser.HasToken())
                throw "Unexpected end of script.";
            if (parser.PeekToken().Type == "TokenCloseParenthesis")
                continue;
            if (parser.PeekToken().Type != "TokenSplitParameter")
                throw "Was expecting a , at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            parser.NextToken();
        }
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        return new FunctionCallStatement_1(name, nodes, startToken.Line, startToken.Column);
    };
    FunctionCallStatement.prototype.Compile = function (code) {
        // Parameter calls
        for (var i = 0; i < this.values.length; i++)
            this.values[i].Compile(code);
        code.Code.push(new FunctionCallCode(this.Name, this.values.length));
    };
    FunctionCallStatement.prototype.BlockVerify = function () {
        return true;
    };
    FunctionCallStatement.prototype.Verify = function (env) {
        var parts = this.Name.toLowerCase().split('.');
        if (parts.length == 3) {
            if (parts[0] != "me")
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            var genericCode = world.GetCode(parts[1]);
            if (!genericCode)
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            if (!genericCode.code)
                genericCode.code = CodeParser.ParseWithParameters(genericCode.Source, genericCode.Parameters, false);
            if (!genericCode.code.HasFunction(parts[2]))
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            for (var i = 0; i < this.values.length; i++)
                this.values[i].Verify(env);
            return;
        }
        else if (parts.length != 2) {
            if (!env.HasFunction(this.Name))
                throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
            return;
        }
        if (!api[parts[0]])
            throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
        var lowerCase = parts[1].replace(/^_/, "");
        var correctCase = null;
        for (var funcName in api[parts[0]]) {
            if (funcName.toLowerCase() == lowerCase) {
                correctCase = funcName;
                break;
            }
        }
        if (!correctCase)
            throw "Unknown function call " + this.Name + " " + this.startLine + ":" + this.startColumn;
        var op = 0;
        for (var i = 0; i < apiFunctions.length; i++) {
            if (apiFunctions[i].name.toLowerCase() == this.Name.toLowerCase()) {
                var nb = 0;
                for (var j = 0; j < apiFunctions[i].parameters.length; j++) {
                    if (apiFunctions[i].parameters[j].description.indexOf("(...)") == 0)
                        op += 1000;
                    else if (apiFunctions[i].parameters[j].description.indexOf("(optional)") == -1)
                        nb++;
                }
                if (this.values.length < nb || this.values.length > apiFunctions[i].parameters.length + op)
                    throw "Incorrect function call " + this.Name + " (the number of parameters provided don't match the signature of the function) " + this.startLine + ":" + this.startColumn;
                break;
            }
        }
        for (var i = 0; i < this.values.length; i++)
            this.values[i].Verify(env);
        // A verify function exists, let's try to call it
        if (api[parts[0]]["Verify_" + correctCase])
            api[parts[0]]["Verify_" + correctCase](this.startLine, this.startColumn, this.ExtractConstants(this.values));
    };
    FunctionCallStatement.prototype.ToCode = function (indent) {
        var code = this.Name + "(";
        for (var i = 0; i < this.values.length; i++) {
            if (i != 0)
                code += ", ";
            code += this.values[i].ToCode(0);
        }
        return code + ")";
    };
    FunctionCallStatement.prototype.HTMLBlocks = function (path, codeStatements) {
        var params = [];
        var parts = this.Name.toLowerCase().split('.');
        var rightName = this.Name;
        // GenericCode
        if (parts.length == 3) {
            for (var i = 0; i < world.Codes.length; i++) {
                if (world.Codes[i].Name.toLowerCase() != parts[1].toLowerCase())
                    continue;
                try {
                    var parser = new CodeParser(world.Codes[i].Source);
                    var statements = parser.GetAllStatements();
                    for (var j = 0; j < statements.length; j++) {
                        if (statements[j].constructor != FunctionDefinitionStatement || statements[j].Name.toLowerCase() != parts[2].toLowerCase())
                            continue;
                        var funcDef = statements[j];
                        for (var k = 0; k < funcDef.Variables.length; k++)
                            params.push(funcDef.Variables[k]);
                        break;
                    }
                }
                catch (ex) {
                }
                break;
            }
        }
        else if (parts.length == 2) {
            for (var i = 0; i < apiFunctions.length; i++) {
                if (apiFunctions[i].name.toLowerCase() == this.Name.toLowerCase()) {
                    rightName = apiFunctions[i].name;
                    for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                        params.push(apiFunctions[i].parameters[j].name);
                    break;
                }
            }
        }
        else if (parts.length == 1) {
            for (var j = 0; j < codeStatements.length; j++) {
                if (codeStatements[j].constructor != FunctionDefinitionStatement || codeStatements[j].Name.toLowerCase() != parts[0].toLowerCase())
                    continue;
                var funcDef = codeStatements[j];
                for (var k = 0; k < funcDef.Variables.length; k++)
                    params.push(funcDef.Variables[k]);
                break;
            }
        }
        var html = "<div class='codeBlock' id='bl_" + path.replace(/\./g, "_") + "'><span class='" + (params.length == 0 ? "simpleBlockType" : "blockType") + "'>" + rightName + "</span>";
        for (var i = 0; i < params.length; i++) {
            html += "<div><span class='blockLabel'>" + (params[i] ? params[i].title() : "Parameter " + (i + 1)) + "</span>";
            html += "<span class='subBlock'>" + (this.values[i] ? this.values[i].HTMLBlocks(path + ".values." + i, codeStatements) : "<span class='emptyBlock' path='" + path + ".values." + i + "'>Empty</span>") + "</span>";
            html += "</div>";
        }
        if (params.length > 0)
            html += "<span class='endBlock'></span>";
        html += "</div>";
        return html;
    };
    return FunctionCallStatement;
}(CodeStatement));
FunctionCallStatement = FunctionCallStatement_1 = __decorate([
    TopBlockStatementClass,
    StatementClass
], FunctionCallStatement);
var FunctionCallStatement_1;
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['FunctionDefinition'] = { help: "Defines a new function which will can be used by yourself or can be invoked by the engine.", params: [{ name: 'Name', display: 'embed' }, { name: 'Variables', type: 'string[]', display: 'Parameter Names' }, { name: 'Statement', type: 'CodeStatement' }] };
var FunctionDefinitionStatement = FunctionDefinitionStatement_1 = (function (_super) {
    __extends(FunctionDefinitionStatement, _super);
    function FunctionDefinitionStatement(name, variables, statement) {
        var _this = _super.call(this) || this;
        _this.Name = (name ? name : "MyFunction");
        _this.Variables = (variables ? variables : []);
        _this.Statement = (statement ? statement : new BlockStatement([]));
        return _this;
    }
    FunctionDefinitionStatement.Parse = function (name, parser) {
        var variables = [];
        parser.NextToken();
        while (parser.HasToken() && parser.PeekToken().Type != "TokenCloseParenthesis") {
            if (!parser.HasToken())
                throw "Unexpected end of script.";
            if (parser.PeekToken().Type != "TokenName")
                throw "Was expecting a variable name at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            variables.push(parser.NextToken().Value);
            if (!parser.HasToken())
                throw "Unexpected end of script.";
            if (parser.PeekToken().Type == "TokenCloseParenthesis")
                continue;
            if (parser.PeekToken().Type != "TokenSplitParameter")
                throw "Was expecting a , at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
            parser.NextToken();
        }
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        if (!parser.HasToken())
            throw "Unexpected end of script.";
        if (parser.PeekToken().Type != "TokenStartBlock")
            throw "Was expecting a { at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        var statement = this.Top(parser);
        return new FunctionDefinitionStatement_1(name, variables, statement);
    };
    FunctionDefinitionStatement.prototype.Compile = function (code) {
        // Recover variables values
        for (var i = this.Variables.length - 1; i >= 0; i--)
            code.Code.push(new AssignCode(this.Variables[i]));
        this.Statement.Compile(code);
    };
    FunctionDefinitionStatement.prototype.BlockVerify = function () {
        return true;
    };
    FunctionDefinitionStatement.prototype.Verify = function (env) {
        for (var i = 0; i < this.Variables.length; i++)
            env.SetVariable(this.Variables[i], new VariableValue(null));
        if (this.Statement)
            this.Statement.Verify(env);
    };
    FunctionDefinitionStatement.prototype.ToCode = function (indent) {
        var code = "function " + this.Name + "(";
        code += this.Variables.join(",");
        code += ")\n";
        if (this.Statement && this.Statement.Statements.length > 0) {
            var sub = this.Statement.ToCode(indent);
            if (sub[0] == "{")
                code += sub;
            else
                code += "{\n" + sub + "}";
        }
        else
            code += "{\n}\n";
        return code + "\n";
    };
    return FunctionDefinitionStatement;
}(CodeStatement));
FunctionDefinitionStatement = FunctionDefinitionStatement_1 = __decorate([
    StatementClass
], FunctionDefinitionStatement);
var FunctionDefinitionStatement_1;
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['If'] = { help: "If the condition is matched the \"true\" code will be run, otherwise the \"false\" code will be.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'TrueStatement', type: 'CodeStatement' }, { name: 'FalseStatement', type: 'CodeStatement' }] };
var IfStatement = IfStatement_1 = (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement(condition, statement, elseStatement) {
        var _this = _super.call(this) || this;
        _this.Condition = condition;
        _this.FalseStatement = (elseStatement ? elseStatement : new BlockStatement([]));
        _this.TrueStatement = (statement ? statement : new BlockStatement([]));
        // For single line statements convert them as block
        if (_this.TrueStatement.constructor !== BlockStatement)
            _this.TrueStatement = new BlockStatement([_this.TrueStatement]);
        if (_this.FalseStatement.constructor !== BlockStatement)
            _this.FalseStatement = new BlockStatement([_this.FalseStatement]);
        return _this;
    }
    IfStatement.Parse = function (parser) {
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken(0, true).Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken(0, true).Line + ":" + parser.PeekToken(0, true).Column;
        parser.NextToken(true);
        var okStatement = CodeStatement.Top(parser);
        var elseStatement = null;
        if (parser.HasToken() && parser.PeekToken(0, true).Type == "TokenName" && parser.PeekToken(0, true).Value == "else") {
            parser.NextToken(true);
            elseStatement = CodeStatement.Top(parser);
        }
        return new IfStatement_1(condition, okStatement, elseStatement);
    };
    IfStatement.prototype.Compile = function (code) {
        this.Condition.Compile(code);
        var ifCode = new IfCode(code.Code.length + 1, null);
        code.Code.push(ifCode);
        this.TrueStatement.Compile(code);
        if (this.FalseStatement && !(this.FalseStatement.constructor == BlockStatement && this.FalseStatement.Statements.length == 0)) {
            var jmpEnd = new JumpCode(null);
            code.Code.push(jmpEnd);
            ifCode.FalseJump = code.Code.length;
            this.FalseStatement.Compile(code);
            jmpEnd.JumpLine = code.Code.length;
        }
        else
            ifCode.FalseJump = code.Code.length;
    };
    IfStatement.prototype.BlockVerify = function () {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    };
    IfStatement.prototype.Verify = function (env) {
        this.Condition.Verify(env);
        this.TrueStatement.Verify(env);
        if (this.FalseStatement)
            this.FalseStatement.Verify(env);
    };
    IfStatement.prototype.ToCode = function (indent) {
        var code = "if(" + this.Condition.ToCode(0) + ")\n";
        if (this.TrueStatement.Statements.length == 0)
            code += this.Indent(indent) + "{\n" + this.Indent(indent) + "}\n";
        else
            code += this.TrueStatement.ToCode(indent);
        if (this.FalseStatement && !(this.FalseStatement.constructor == BlockStatement && this.FalseStatement.Statements.length == 0)) {
            /*if (code[code.length - 1] != "}")
                code += ";";*/
            code += "\n";
            code += "else " + this.FalseStatement.ToCode(indent);
        }
        return code;
    };
    return IfStatement;
}(CodeStatement));
IfStatement = IfStatement_1 = __decorate([
    TopBlockStatementClass,
    StatementClass
], IfStatement);
var IfStatement_1;
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Multiply'] = { help: "Returns the multiplication of A by B.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var MultiplyStatement = (function (_super) {
    __extends(MultiplyStatement, _super);
    function MultiplyStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    MultiplyStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new MultiplyCode());
    };
    MultiplyStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    MultiplyStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    MultiplyStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " * " + this.BStatement.ToCode(0);
    };
    return MultiplyStatement;
}(CodeStatement));
MultiplyStatement = __decorate([
    StatementClass
], MultiplyStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Not'] = { help: "If the statement is true returns false otherwise returns true.", params: [{ name: 'Statement', type: 'CodeStatement' }] };
var NotStatement = (function (_super) {
    __extends(NotStatement, _super);
    function NotStatement(statement) {
        var _this = _super.call(this) || this;
        _this.Statement = statement;
        return _this;
    }
    NotStatement.prototype.Compile = function (code) {
        this.Statement.Compile(code);
        code.Code.push(new NotCode());
    };
    NotStatement.prototype.BlockVerify = function () {
        return (this.Statement !== null && this.Statement !== undefined ? true : false);
    };
    NotStatement.prototype.Verify = function (env) {
        if (!this.Statement)
            throw "Missing statement";
        this.Statement.Verify(env);
    };
    NotStatement.prototype.ToCode = function (indent) {
        return "!" + this.Statement.ToCode(0);
    };
    return NotStatement;
}(CodeStatement));
NotStatement = __decorate([
    StatementClass
], NotStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Null'] = { help: "Returns an (empty) or (null) value.", params: [] };
var NullStatement = (function (_super) {
    __extends(NullStatement, _super);
    function NullStatement() {
        var _this = _super.call(this) || this;
        _this.value = new VariableValue(null);
        return _this;
    }
    NullStatement.prototype.Compile = function (code) {
        code.Code.push(new PushCode(new VariableValue(null)));
    };
    NullStatement.prototype.BlockVerify = function () {
        return true;
    };
    NullStatement.prototype.Verify = function (env) {
    };
    NullStatement.prototype.ToCode = function (indent) {
        return "null";
    };
    return NullStatement;
}(CodeStatement));
NullStatement = __decorate([
    StatementClass
], NullStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Number'] = { help: "Returns a number.", params: [{ name: 'Value', display: 'embed', type: 'VariableValue', valueType: 'number' }] };
var NumberStatement = (function (_super) {
    __extends(NumberStatement, _super);
    function NumberStatement(stringValue, startLine, startColumn) {
        var _this = _super.call(this) || this;
        stringValue = (stringValue ? stringValue : "0").replace(/^\+/, "").replace(/(\.[0-9]*)0+$/, "$1").replace(/^[0]+/, "").replace(/^\./, "0.").replace(/\.$/, "");
        if (stringValue == "" || stringValue == "-0")
            stringValue = "0";
        _this.Value = new VariableValue(parseFloat(stringValue));
        if (_this.Value.GetNumber().toString() != stringValue)
            throw "Number is not correct " + startLine + ":" + startColumn;
        return _this;
    }
    NumberStatement.prototype.Compile = function (code) {
        code.Code.push(new PushCode(this.Value));
    };
    NumberStatement.prototype.BlockVerify = function () {
        return true;
    };
    NumberStatement.prototype.Verify = function (env) {
    };
    NumberStatement.prototype.ToCode = function (indent) {
        return "" + this.Value.GetNumber();
    };
    return NumberStatement;
}(CodeStatement));
NumberStatement = __decorate([
    StatementClass
], NumberStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Or'] = { help: "Returns a boolean OR operation. If any of the two values is true returns true ortherwise returns false.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var OrStatement = (function (_super) {
    __extends(OrStatement, _super);
    function OrStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    OrStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new OrCode());
    };
    OrStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    OrStatement.prototype.Verify = function (env) {
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    OrStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " || " + this.BStatement.ToCode(0);
    };
    return OrStatement;
}(CodeStatement));
OrStatement = __decorate([
    StatementClass
], OrStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Return'] = { help: "Exits the current function and pass an optional returning value.", params: [{ name: 'Statement', type: 'CodeStatement' }] };
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement(statement) {
        var _this = _super.call(this) || this;
        _this.Statement = statement;
        return _this;
    }
    ReturnStatement.prototype.Compile = function (code) {
        code.Code.push(new FlushVariableStackCode());
        if (this.Statement)
            this.Statement.Compile(code);
        code.Code.push(new ReturnCode());
    };
    ReturnStatement.prototype.BlockVerify = function () {
        return true;
    };
    ReturnStatement.prototype.Verify = function (env) {
        if (this.Statement)
            this.Statement.Verify(env);
    };
    ReturnStatement.prototype.ToCode = function (indent) {
        if (this.Statement)
            return "return " + this.Statement.ToCode(0);
        else
            return "return";
    };
    return ReturnStatement;
}(CodeStatement));
ReturnStatement = __decorate([
    TopBlockStatementClass,
    StatementClass
], ReturnStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['String'] = { help: "Returns a constant string value.", params: [{ name: 'Value', display: 'embed', type: 'VariableValue' }] };
var StringStatement = (function (_super) {
    __extends(StringStatement, _super);
    function StringStatement(value) {
        var _this = _super.call(this) || this;
        _this.Value = new VariableValue((value ? value : "").replace(/\\n/g, "\n"));
        return _this;
    }
    StringStatement.prototype.Compile = function (code) {
        code.Code.push(new PushCode(this.Value));
    };
    StringStatement.prototype.BlockVerify = function () {
        return true;
    };
    StringStatement.prototype.Verify = function (env) {
    };
    StringStatement.prototype.ToCode = function (indent) {
        return "\"" + this.Value.GetString().replace(/"/g, "\\\"") + "\"";
    };
    return StringStatement;
}(CodeStatement));
StringStatement = __decorate([
    StatementClass
], StringStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Substract'] = { help: "Returns the substraction of A by B.", params: [{ name: 'AStatement', type: 'CodeStatement' }, { name: 'BStatement', type: 'CodeStatement' }] };
var SubstractStatement = (function (_super) {
    __extends(SubstractStatement, _super);
    function SubstractStatement(statementA, statementB) {
        var _this = _super.call(this) || this;
        _this.AStatement = statementA;
        _this.BStatement = statementB;
        return _this;
    }
    SubstractStatement.prototype.Compile = function (code) {
        this.BStatement.Compile(code);
        this.AStatement.Compile(code);
        code.Code.push(new SubstractCode());
    };
    SubstractStatement.prototype.BlockVerify = function () {
        return (!(this.AStatement === null || this.AStatement === undefined || this.BStatement === null || this.BStatement === undefined));
    };
    SubstractStatement.prototype.Verify = function (env) {
        if (!this.AStatement || !this.BStatement)
            throw "Missing statement";
        this.AStatement.Verify(env);
        this.BStatement.Verify(env);
    };
    SubstractStatement.prototype.ToCode = function (indent) {
        return this.AStatement.ToCode(0) + " - " + this.BStatement.ToCode(0);
    };
    return SubstractStatement;
}(CodeStatement));
SubstractStatement = __decorate([
    StatementClass
], SubstractStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['Variable'] = { help: "Returns the value of the variable. A variable is like a box allowing you to store a number or a string inside.", params: [{ name: 'Name', display: 'embed' }] };
var VariableStatement = (function (_super) {
    __extends(VariableStatement, _super);
    function VariableStatement(name, line, column, index) {
        if (index === void 0) { index = null; }
        var _this = _super.call(this) || this;
        _this.variableId = null;
        _this.index = null;
        _this.Name = name.toLowerCase();
        _this.line = line;
        _this.column = column;
        _this.index = index;
        return _this;
    }
    VariableStatement.prototype.Compile = function (code) {
        if (this.index) {
            this.index.Compile(code);
            code.Code.push(new ReadCode(this.Name, true));
        }
        else
            code.Code.push(new ReadCode(this.Name, false));
    };
    VariableStatement.prototype.BlockVerify = function () {
        return true;
    };
    VariableStatement.prototype.Verify = function (env) {
        if (this.Name == "stackresult")
            return;
        if (env.HasVariable(this.Name) || this.Name.toLowerCase() == "null" || this.Name.toLocaleLowerCase() == "true" || this.Name.toLocaleLowerCase() == "false")
            //if (env.GetVariablePosition(this.name) != -1 || this.name.toLowerCase() == "null" || this.name.toLocaleLowerCase() == "true" || this.name.toLocaleLowerCase() == "false")        
            return;
        throw "Variable '" + this.Name + "' used before definition at " + this.line + ":" + this.column + ".";
    };
    VariableStatement.prototype.ToCode = function (indent) {
        return this.Name + (this.index ? "[" + this.index.ToCode(0) + "]" : "");
    };
    return VariableStatement;
}(CodeStatement));
VariableStatement = __decorate([
    StatementClass
], VariableStatement);
/// <reference path="../CodeStatement.ts" />
statementEditorInfo['While'] = { help: "Repeat the code as long as the condition is matched may never run the code if the condition is not matched at the begining.", params: [{ name: 'Condition', type: 'CodeStatement' }, { name: 'BlockStatement', type: 'CodeStatement' }] };
var WhileStatement = WhileStatement_1 = (function (_super) {
    __extends(WhileStatement, _super);
    function WhileStatement(condition, blockStatement) {
        var _this = _super.call(this) || this;
        _this.Condition = condition;
        _this.BlockStatement = (blockStatement ? blockStatement : new BlockStatement([]));
        // For single line statements convert them as block
        if (_this.BlockStatement.constructor !== BlockStatement)
            _this.BlockStatement = new BlockStatement([_this.BlockStatement]);
        return _this;
    }
    WhileStatement.Parse = function (parser) {
        if (parser.PeekToken().Type != "TokenOpenParenthesis")
            throw "Was expecting a ( at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var condition = CodeStatement.Element(parser);
        if (parser.PeekToken().Type != "TokenCloseParenthesis")
            throw "Was expecting a ) at " + parser.PeekToken().Line + ":" + parser.PeekToken().Column;
        parser.NextToken();
        var blockStatement = CodeStatement.Top(parser);
        return new WhileStatement_1(condition, blockStatement);
    };
    WhileStatement.prototype.Compile = function (code) {
        var jumpToEnd = new JumpCode(null);
        code.LoopExitStack.push(jumpToEnd);
        var startLine = code.Code.length;
        this.Condition.Compile(code);
        var condition = new IfCode(code.Code.length + 1, null);
        code.Code.push(condition);
        this.BlockStatement.Compile(code);
        code.Code.push(new JumpCode(startLine));
        condition.FalseJump = code.Code.length;
        jumpToEnd.JumpLine = code.Code.length;
        code.LoopExitStack.pop();
    };
    WhileStatement.prototype.BlockVerify = function () {
        return (this.Condition !== null && this.Condition !== undefined ? true : false);
    };
    WhileStatement.prototype.Verify = function (env) {
        this.Condition.Verify(env);
        this.BlockStatement.Verify(env);
    };
    WhileStatement.prototype.ToCode = function (indent) {
        return "while(" + this.Condition.ToCode(0) + ") " + this.BlockStatement.ToCode(indent);
    };
    return WhileStatement;
}(CodeStatement));
WhileStatement = WhileStatement_1 = __decorate([
    TopBlockStatementClass,
    StatementClass
], WhileStatement);
var WhileStatement_1;
///<reference path="../TilesetInformation.ts" />
defaultTilesets['tileset2'] = {
    "background": { "file": "/art/tileset2/background.png?v=2", "height": 32, "width": 32, "types": { "grass": [43, 61], "dark_grass": [51], "water": [7], "sand": [25, 33], "empty": [115], "dirt": [64] }, "mainType": "grass", "nbColumns": 6, "nonWalkable": [7, 0, 1, 2, 8, 14, 13, 12, 6, 3, 9, 4, 5, 11, 17, 35, 53, 69, 83, 101, 107, 106, 125, 112, 118, 124, 123, 143, 142, 141, 117, 111, 110, 116, 122, 121, 115, 109, 108, 114, 120, 119, 113, 15], "lastTile": 144, "paths": { "grass_path": [126, 139, 140, 133, 134, 131, 132, 129, 130, 127, 128, 135, 136, 137, 138] }, "transitions": [{ "from": "water", "to": "grass", "size": 12, "transition": [5, 3, 11, 9, 14, 12, 2, 0, 13, 8, 6, 1] }, { "from": "grass", "to": "sand", "size": 12, "transition": [18, 20, 30, 32, 27, 29, 21, 23, 19, 24, 26, 31] }, { "from": "dark_grass", "to": "grass", "size": 12, "transition": [36, 38, 48, 50, 45, 47, 39, 41, 37, 42, 44, 49] }, { "from": "grass", "to": "grass", "size": 12, "transition": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, { "from": "grass", "to": "dirt", "size": 12, "transition": [59, 57, 65, 63, 68, 66, 56, 54, 67, 62, 60, 55] }, { "from": "empty", "to": "dirt", "size": 12, "transition": [113, 111, 119, 117, 122, 120, 110, 108, 121, 116, 114, 109] }] },
    "panelStyle": {
        "file": "/art/tileset2/panel_style.png",
        "leftBorder": 7,
        "rightBorder": 7,
        "topBorder": 7,
        "header": 22,
        "bottomBorder": 9,
        "headerColor": "#e5d9c8",
        "contentColor": "#e5d9c8",
        "buttonBorder": "#b2a38f",
        "buttonBackground": "#60441d",
        "buttonBackgroundHover": "#b2a38f",
        "contentHeaderBackgroundColor": "#e5d9c8",
        "contentHeaderColor": "#000000",
        "contentSelectedColor": "#ac8958"
    },
    "quickslotStyle": {
        "file": "/art/tileset2/quick_slot_bar.png",
        "width": 380,
        "height": 40,
        "leftBorder": 5,
        "topBorder": 5,
        "itemSpacing": 5,
        "selectedSkillColor": "#b2a38f"
    },
    "statBarStyle": {
        "file": "/art/tileset2/main_stat_bars.png",
        "width": 90,
        "height": 100,
        "topBorder": 19,
        "bottomBorder": 18
    },
    characters: {
        "male_1": {
            "file": "/art/tileset2/hiro.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 65,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "woman_1": {
            "file": "/art/tileset2/bani.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "woman_2": {
            "file": "/art/tileset2/hana.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "skel_1": {
            "file": "/art/tileset2/skel.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "skul_1": {
            "file": "/art/tileset2/skul.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "slime_1": {
            "file": "/art/tileset2/slime.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "slime_2": {
            "file": "/art/tileset2/slyme.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "box_1": {
            "file": "/art/tileset2/box.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "rat_1": {
            "file": "/art/tileset2/gobo.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "rat_2": {
            "file": "/art/tileset2/gobi.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "bear_1": {
            "file": "/art/tileset2/kit.png",
            "frames": 3,
            "directions": 4,
            "groundX": 28,
            "groundY": 45,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        }
    },
    houses: {
        "house_1": {
            "collisionX": 2,
            "collisionY": 237,
            "collisionWidth": 145,
            "collisionHeight": 68,
            "parts": [
                {
                    "part": "body",
                    "x": 0,
                    "y": 195
                },
                {
                    "part": "roof",
                    "x": 0,
                    "y": 2
                },
                {
                    "part": "window_1",
                    "x": 18,
                    "y": 201
                },
                {
                    "part": "window_1",
                    "x": 92,
                    "y": 201
                },
                {
                    "part": "vent",
                    "x": 92,
                    "y": 24
                }
            ]
        },
        "house_2": {
            "collisionX": 2,
            "collisionY": 237,
            "collisionWidth": 145,
            "collisionHeight": 68,
            "parts": [
                {
                    "part": "body",
                    "x": 0,
                    "y": 195
                },
                {
                    "part": "roof",
                    "x": 0,
                    "y": 2
                },
                {
                    "part": "vent",
                    "x": 92,
                    "y": 24
                },
                {
                    "part": "window_2",
                    "x": 17,
                    "y": 204
                },
                {
                    "part": "window_2",
                    "x": 92,
                    "y": 204
                }
            ]
        }
    },
    house_parts: {
        "window_1": {
            "file": "/art/tileset2/houses.png",
            "x": 12,
            "y": 0,
            "width": 35,
            "height": 39
        },
        "window_2": {
            "file": "/art/tileset2/houses.png",
            "x": 57,
            "y": 0,
            "width": 37,
            "height": 39
        },
        "vent": {
            "file": "/art/tileset2/houses.png",
            "x": 95,
            "y": 0,
            "width": 32,
            "height": 53
        },
        "roof": {
            "file": "/art/tileset2/houses.png",
            "x": 0,
            "y": 58,
            "width": 148,
            "height": 193
        },
        "body": {
            "file": "/art/tileset2/houses.png",
            "x": 0,
            "y": 250,
            "width": 148,
            "height": 110
        }
    },
    objects: { "tree_1": { "file": "/art/tileset2/objects.png?v=2", "x": 2, "y": 2, "groundX": 27, "groundY": 52, "width": 53, "height": 62, "collision": { "radius": 16 } }, "tree_2": { "file": "/art/tileset2/objects.png?v=2", "x": 2, "y": 69, "groundX": 28, "groundY": 53, "width": 53, "height": 62, "collision": { "radius": 16 } }, "tree_3": { "file": "/art/tileset2/objects.png?v=2", "x": 62, "y": 35, "groundX": 15, "groundY": 22, "width": 29, "height": 29 }, "tree_4": { "file": "/art/tileset2/objects.png?v=2", "x": 62, "y": 102, "groundX": 16, "groundY": 22, "width": 29, "height": 29 }, "mediumGrass_1": { "file": "/art/tileset2/objects.png?v=2", "x": 105, "y": 125, "groundX": 4, "groundY": 6, "width": 15, "height": 22 }, "mediumGrass_2": { "file": "/art/tileset2/objects.png?v=2", "x": 133, "y": 130, "groundX": 7, "groundY": 9, "width": 14, "height": 17 }, "smallGrass_1": { "file": "/art/tileset2/objects.png?v=2", "x": 158, "y": 134, "groundX": 6, "groundY": 4, "width": 11, "height": 8 }, "smallGrass_2": { "file": "/art/tileset2/objects.png?v=2", "x": 177, "y": 134, "groundX": 6, "groundY": 4, "width": 11, "height": 8 }, "small_bag": { "file": "/art/tileset2/objects.png?v=2", "x": 95, "y": 88, "groundX": 15, "groundY": 12, "width": 29, "height": 23 }, "chest_1": { "file": "/art/tileset2/objects.png?v=2", "x": 129, "y": 58, "groundX": 15, "groundY": 15, "width": 29, "height": 29 }, "tombstone_1": { "file": "/art/tileset2/objects.png?v=2", "x": 96, "y": 10, "groundX": 16, "groundY": 15, "width": 32, "height": 29 }, "tombstone_2": { "file": "/art/tileset2/objects.png?v=2", "x": 96, "y": 55, "groundX": 15, "groundY": 12, "width": 29, "height": 23 }, "tombstone_3": { "file": "/art/tileset2/objects.png?v=2", "x": 162, "y": 7, "groundX": 12, "groundY": 16, "width": 23, "height": 32 }, "wall_1": { "file": "/art/tileset2/objects.png?v=2", "x": 162, "y": 58, "groundX": 15, "groundY": 15, "width": 29, "height": 29 }, "sign_1": { "file": "/art/tileset2/objects.png?v=2", "x": 167, "y": 93, "groundX": 12, "groundY": 16, "width": 23, "height": 32 }, "fence_1": { "file": "/art/tileset2/objects.png?v=2", "x": 127, "y": 96, "groundX": 18, "groundY": 10, "width": 35, "height": 20 }, "fire_camp": { "file": "/art/tileset2/objects.png?v=2", "x": 9, "y": 140, "groundX": 33, "groundY": 22, "width": 64, "height": 42, "collision": { "radius": 32 }, "particleEffect": "fire" } },
    "sounds": {
        "The Moldau": {
            mp3: '/Sounds/sm_mold_section.mp3',
            ogg: '/Sounds/sm_mold_section.ogg'
        }
    }
};
var mapEditor = new ((function () {
    function class_16() {
        this.currentCellTile = 0;
        this.currentCellType = "water";
        this.currentObject = "flower_1";
        this.currentOperation = "SmartTile";
        this.keys = [];
        this.currentZone = "Base";
        this.mouseDown = false;
        this.mouseButton = 0;
        this.showCoordinates = true;
        this.modified = false;
        this.currentMonster = null;
        this.previousBackgroundTiles = null;
        this.currentFragment = "Root";
        this.minimap = true;
        this.gridSnap = false;
        this.objectSnap = false;
        this.objectSpray = false;
        this.objectSprayRadius = 32;
        this.renderRectrangle = null;
        this.repeatTimer = 0;
    }
    return class_16;
}()));
var zoneEditor = new ((function () {
    function class_17() {
        this.selectedZone = null;
        this.selector = null;
        this.tempWorld = null;
        this.worldPreview = null;
        this.renderInterval = null;
        this.rebuildRender = null;
    }
    return class_17;
}()));
var chat = new ((function () {
    function class_18() {
        this.intervalCounter = 0;
        this.chatNewMessage = false;
        this.wasHidden = false;
        this.onMapChat = false;
        this.channels = {};
        this.smilies_txt = [[":-)", ":)"], [":-P", ":P", ":-p", ":p"], [":O", ":o", ":-o", ":-O"], [":-(", ":("], [":-/"], [";-)",
                ";)"], [":D", ":-D"], ["8)", "8-)"], ["B)", "B-)"], ["XD", "xD", "X-D"], ["T.T"], ["^^'", "^.^'"], ["^^", "^.^"], ["O.O", "o.o"],
            ["8|", "8-|"], ["\M/"], ["&gt;.&lt;"], ["XP", "X-P"], ["oO", "o.O", "o0", "o.0"], ["-.-"], ["(:&lt;"], ["'W'"], [":S", ":-S"],
            ["*.*"], [":X"], ["X.X", "x.x"], ["$.$"], ["o@@o"], ["9.9"], ["O:&lt;"], ["B|"], ["B("], ["B0"], ["@.@"], ["^**^"], ["9.6"],
            ["/.O"], ["d.b"], ["&gt;.&gt;"], ["=^_^="]];
    }
    return class_18;
}()));
var Chat = (function () {
    function Chat() {
    }
    Chat.AdditionalCSS = function () {
        var r = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(1, 2), 16);
        var g = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(3, 2), 16);
        var b = parseInt(Main.EnsureColor(world.art.panelStyle.buttonBackground).substr(5, 2), 16);
        return "#chatEntry\n\
{\n\
    width: calc(100% - " + (95 + world.art.panelStyle.leftBorder) + "px);\n\
    top: " + (("" + document.location).indexOf("maker.html") != -1 ? "35px" : "5px") + ";\n\
}\n\
#chatEntryLine {\n\
    background-color: rgba(" + r + "," + g + "," + b + ",0.6);\n\
    color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
    border: solid 1px " + Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}\n\
#chatContainer {\n\
    width: calc(100% - 95px);\n\
    top: " + (("" + document.location).indexOf("maker.html") != -1 ? "65px" : "35px") + ";\n\
}\n\
@media (min-width: 1000px)\n\
{\n\
    #chatContainer {\n\
        left: calc(50% + " + (parseInt("" + world.art.quickslotStyle.width) / 2 + 5) + "px);\n\
        top: auto;\n\
        bottom: 40px;\n\
        width: auto;\n\
    }\n\
    #chatEntry\n\
    {\n\
        left: calc(50% + " + (parseInt("" + world.art.quickslotStyle.width) / 2 + 5) + "px);\n\
        width: auto;\n\
        top: auto;\n\
        bottom: 5px;\n\
    }\n\
}\n\
#chatChannels div {\n\
    border: solid 1px " + Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}\n\
.selectedChannel {\n\
    background-color: " + Main.EnsureColor(world.art.panelStyle.buttonBorder) + ";\n\
}";
    };
    Chat.Init = function () {
        if (!framework.Preferences['token'] || world.Edition == EditorEdition.Demo || framework.Preferences['token'] == "demo" || window['io'] == undefined || window['io'] == null || world.ChatEnabled === false) {
            $("#chatEntry").hide();
            return;
        }
        if (world.Player.ChatBannedTill && typeof world.Player.ChatBannedTill == "string")
            world.Player.ChatBannedTill = new Date(world.Player.ChatBannedTill);
        if (world.Player.ChatMutedTill && typeof world.Player.ChatMutedTill == "string")
            world.Player.ChatMutedTill = new Date(world.Player.ChatMutedTill);
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() < (new Date()).getTime())
            world.Player.ChatBannedTill = null;
        if (world.Player.ChatMutedTill && world.Player.ChatMutedTill.getTime() < (new Date()).getTime())
            world.Player.ChatMutedTill = null;
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime()) {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }
        chat.socket = window['io']();
        chat.socket.on('connect', Chat.Connect);
        chat.socket.on('chat', Chat.Receive);
        chat.socket.on('join', Chat.Join);
        chat.socket.on('leave', Chat.Leave);
        chat.socket.on('channelUserList', Chat.ChannelUserList);
        chat.socket.on('chatBot', Chat.BotLine);
        chat.socket.on('mute', function (till) {
            world.Player.ChatMutedTill = new Date(till);
            world.Player.StoredCompare = world.Player.JSON();
            Framework.ShowMessage("You have been chat muted till " + world.Player.ChatMutedTill);
        });
        chat.socket.on('ban', function (till) {
            world.Player.ChatBannedTill = new Date(till);
            world.Player.StoredCompare = world.Player.JSON();
            Framework.ShowMessage("You have been chat banned till " + world.Player.ChatBannedTill);
            $("#chatContainer").hide();
            $("#chatEntry").hide();
        });
        $("#chatTitle").bind("click", Chat.ShowHide);
        $("#chatCollapsed").bind("click", Chat.ShowHide);
        if (!chat.chatInterval)
            chat.chatInterval = setInterval(Chat.ChatInterval, 500);
    };
    Chat.ChatInterval = function () {
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime()) {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }
        // We entered in a zone
        if (play.renderer && !chat.channels[world.Player.Zone.replace(/\./g, "_")]) {
            chat.socket.emit('join', world.Id, framework.Preferences['token'], world.Player.Zone.replace(/\./g, "_"));
            var items = [];
            for (var item in chat.channels)
                items.push(item);
            chat.channels[world.Player.Zone.replace(/\./g, "_")] = { newMessage: false, messages: [], users: [] };
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item == "#global" || item == world.Player.Zone.replace(/\./g, "_"))
                    continue;
                chat.socket.emit('leave', world.Id, framework.Preferences['token'], item.replace(/\./g, "_"));
                delete chat.channels[item];
            }
            Chat.UpdateChannels();
            if (chat.currentChannel != "#global" || items.length == 1)
                Chat.SelectChannel(world.Player.Zone.replace(/\./g, "_"));
        }
        // We left the play page
        if (!play.renderer) {
            var updated = false;
            var items = [];
            for (var item in chat.channels)
                items.push(item);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item == "#global")
                    continue;
                updated = true;
                delete chat.channels[item];
                chat.socket.emit('leave', world.Id, framework.Preferences['token'], item);
            }
            if (updated)
                Chat.UpdateChannels();
            Chat.SelectChannel("#global");
        }
        if (play.renderer && chat.onMapChat === false) {
            chat.onMapChat = true;
            $("#chatEntry").show();
            $("#chatLine").hide();
            $("#chatScroll").addClass("fullChatScroll");
            $("#chatUserList").addClass("fullChatScroll");
        }
        else if (!play.renderer && chat.onMapChat === true) {
            chat.onMapChat = false;
            $("#chatEntry").hide();
            $("#chatLine").show();
            $("#chatScroll").removeClass("fullChatScroll");
            $("#chatUserList").removeClass("fullChatScroll");
        }
        if ($("#chatCollapsed").is(":visible") && chat.chatNewMessage) {
            if (chat.intervalCounter % 2)
                $("#chatCollapsed .gamePanelContentNoHeader > div").html("- New message -");
            else
                $("#chatCollapsed .gamePanelContentNoHeader > div").html("Click to chat");
        }
        for (var item in chat.channels) {
            if (chat.channels[item].newMessage) {
                Chat.UpdateChannels();
                break;
            }
        }
        chat.intervalCounter = 1 - chat.intervalCounter;
    };
    Chat.Connect = function () {
        if (!framework.Preferences['token'] || world.Edition == EditorEdition.Demo || framework.Preferences['token'] == "demo" || window['io'] == undefined || window['io'] == null)
            return;
        chat.socket.emit('join', world.Id, framework.Preferences['token'], "#global");
        chat.channels["#global"] = { newMessage: false, messages: [], users: [] };
        Chat.UpdateChannels();
        Chat.SelectChannel("#global");
        if (framework.Preferences["ChatVisible"] === false) {
            $("#chatContainer").hide();
            $("#chatCollapsed").show();
        }
        else {
            $("#chatContainer").show();
            $("#chatCollapsed").hide();
        }
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() > (new Date()).getTime()) {
            $("#chatContainer").hide();
            $("#chatEntry").hide();
            return;
        }
    };
    Chat.Key = function (evt, field) {
        switch (evt.keyCode) {
            case 13:
                Chat.SendLine($("#" + field).val());
                $("#" + field).val("");
                break;
            case 27:
                $("#" + field).blur();
                if (chat.wasHidden == true)
                    Chat.ShowHide();
                break;
            default:
                break;
        }
    };
    Chat.SelectChannel = function (channel) {
        if (!chat.channels[channel])
            return;
        chat.currentChannel = channel;
        chat.channels[channel].newMessage = false;
        Chat.RedrawUserList();
        Chat.RedrawChannelHistory();
        /*$("#chatChannels div").removeClass("selectedChannel");
        $("#" + channel.id()).addClass("selectedChannel");*/
        Chat.UpdateChannels();
    };
    Chat.UpdateChannels = function () {
        var html = "<span>Channels:</span>";
        for (var item in chat.channels)
            html += "<div onclick=\"Chat.SelectChannel('" + item.replace(/'/g, "\\'") + "');\" id=\"" + item.id() + "\" class='" + (item == chat.currentChannel ? " selectedChannel" : "") + (chat.channels[item].newMessage && chat.intervalCounter % 2 ? " channelNewMessage" : "") + "'>" + item + "</div>";
        $("#chatChannels").html(html);
    };
    Chat.UpdateAllChannelsUserList = function () {
        for (var i in chat.channels) {
            Chat.UpdateChannelUserList(i);
        }
    };
    Chat.UpdateChannelUserList = function (channel) {
        chat.socket.emit('getChannelUserList', world.Id, channel);
    };
    Chat.ChannelUserList = function (channel, users) {
        if (!chat.channels[channel])
            return;
        for (var i = 0; i < world.ChatBots.length; i++) {
            // Skip the invisible bots
            if (world.ChatBots[i].Name[0] == "~")
                continue;
            if (world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase())
                users.push(world.ChatBots[i].Name);
        }
        chat.channels[channel].users = users;
        if (chat.currentChannel == channel)
            Chat.RedrawUserList();
    };
    Chat.Join = function (user, channel) {
        Chat.AddChatLine("", channel, "<b class='chatSystemMessage'>" + user + " joined " + channel + "</b>");
        Chat.UpdateChannelUserList(channel);
    };
    Chat.Leave = function (user, channel) {
        Chat.AddChatLine("", channel, "<b class='chatSystemMessage'>" + user + " left " + channel + "</b>");
        Chat.UpdateChannelUserList(channel);
    };
    Chat.BotLine = function (botname, fromUser, channel, line) {
        if (botname[0] == "~")
            Chat.AddChatLine(null, channel, line.htmlEntities(false).replace(/\n/g, "<br />"));
        else
            Chat.AddChatLine(botname, channel, line.htmlEntities(false).replace(/\n/g, "<br />"));
    };
    Chat.SendBotLine = function (botname, channel, line) {
        if (framework.Preferences['token'] == "demo") {
            Chat.AddChatLine(null, chat.currentChannel, "The chat is disabled in the demo.");
            return;
        }
        if (!chat || !chat.socket)
            return;
        if (!world.Player.ChatMutedTill || world.Player.ChatMutedTill.getTime() < (new Date()).getTime())
            chat.socket.emit('bot', botname, channel, line);
    };
    Chat.SendLine = function (line, channel) {
        if (channel === void 0) { channel = null; }
        if (world.Player.ChatMutedTill && world.Player.ChatMutedTill.getTime() >= (new Date()).getTime()) {
            Chat.AddChatLine(null, chat.currentChannel, "<b>!! you are chat muted till " + world.Player.ChatMutedTill + " !!</b>");
            return;
        }
        if (world.Player.ChatBannedTill && world.Player.ChatBannedTill.getTime() >= (new Date()).getTime()) {
            Chat.AddChatLine(null, chat.currentChannel, "<b>!! you are chat banned till " + world.Player.ChatBannedTill + " !!</b>");
            return;
        }
        if (!chat || !chat.socket)
            return;
        if (framework.Preferences['token'] == "demo") {
            Chat.AddChatLine(null, chat.currentChannel, "The chat is disabled in the demo.");
            return;
        }
        var line = line.trim();
        if (!line || line == "")
            return;
        var botToRun = 0;
        var botHandled = false;
        var normalHandling = function () {
            if (botHandled == true || botToRun > 0)
                return;
            if (line.toLowerCase().indexOf("/e ") == 0 || line.toLowerCase().indexOf("/emote ") == 0) {
                var emote = "--";
                try {
                    emote = line.split(' ')[1].toLowerCase();
                }
                catch (ex) {
                }
                if (EmotesArt[emote] !== undefined) {
                    world.Player.EmoteTimer = 0;
                    world.Player.CurrentEmote = EmotesArt[emote];
                }
                else
                    Chat.AddChatLine(null, channel ? channel : chat.currentChannel, "Unknown emote.");
            }
            else if (line.toLowerCase().indexOf("/") == 0 && line.toLowerCase().indexOf("/me ") != 0) {
                Chat.AddChatLine(null, channel ? channel : chat.currentChannel, "Unknown command.");
            }
            else
                chat.socket.emit('send', channel ? channel : chat.currentChannel, line);
        };
        var toExecute = [];
        for (var i = 0; i < world.ChatBots.length; i++) {
            if (!(world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase()))
                continue;
            botToRun++;
        }
        if (world.ChatBots.length > 0)
            for (var i = 0; i < world.ChatBots.length; i++) {
                if (!(world.ChatBots[i].Channel == "*" || world.ChatBots[i].Channel == "" || world.ChatBots[i].Channel.toLowerCase() == channel.toLowerCase()))
                    continue;
                var a = function () {
                    var bot = world.ChatBots[i];
                    bot.HandleChat(line, function (res) {
                        botToRun--;
                        if (res) {
                            //Chat.AddChatLine(username, chat.currentChannel, line);
                            //Chat.AddChatLine(world.ChatBots[i].Name, chat.currentChannel, res);
                            if (res[0] == "/")
                                chat.socket.emit('bot', bot.Name, channel ? channel : chat.currentChannel, "/" + res);
                            else if (res[0] == "!")
                                Chat.AddChatLine(bot.Name[0] == "~" ? null : bot.Name, channel ? channel : chat.currentChannel, res.substr(1).htmlEntities(false).replace(/\n/g, "<br />"));
                            else {
                                chat.socket.emit('send', channel ? channel : chat.currentChannel, line);
                                chat.socket.emit('bot', bot.Name, channel ? channel : chat.currentChannel, res);
                            }
                            botHandled = true;
                        }
                        else
                            normalHandling();
                    });
                }();
            }
        else
            normalHandling();
    };
    Chat.Receive = function (sender, channel, message) {
        if (!chat.channels[channel])
            return;
        if ($("#chatCollapsed").is(":visible"))
            chat.chatNewMessage = true;
        if (chat.currentChannel != channel)
            chat.channels[channel].newMessage = true;
        Chat.AddChatLine(sender, channel, message);
    };
    Chat.UrlChanger = function (str) {
        return str.replace(/(^|\s|\>)(http[s]{0,1}:\/\/[a-zA-Z0-9\/\-\+:\.\?=_\&\#\;\%\,~]{1,30})([a-zA-Z0-9\/\-\+:\.\?=_\&\#\;\%\,~]*)/g, "$1[<A HREF='$2$3' TARGET='_BLANK'>$2 ...</A>]");
    };
    Chat.Smilies = function (str) {
        if (!chat.smiliesDb) {
            chat.smiliesDb = [];
            for (var i = 0; i < chat.smilies_txt.length; i++) {
                for (var j = 0; j < chat.smilies_txt[i].length; j++) {
                    var e = chat.smilies_txt[i][j].replace(/([\.\+\|\\\$\^\(\)\:\?\*\/])/g, '\\$1');
                    chat.smiliesDb.push({ regexp: new RegExp("(^|\\s|\\>)" + e + "(\\s|\\<|$)", "g"), html: "$1<div style='background-image: url(\"/art/tileset2/smilies.png\"); display: inline-block; width: 20px; height: 16px; background-position: -" + (i * 20) + "px 0px;'></div>$2" });
                }
            }
        }
        for (var i = 0; i < chat.smiliesDb.length; i++)
            str = str.replace(chat.smiliesDb[i].regexp, chat.smiliesDb[i].html);
        return str;
    };
    Chat.AddChatLine = function (sender, channel, message) {
        if (!chat.channels[channel])
            return;
        //chat.channels[channel] = [];
        chat.channels[channel].messages.push({ sender: sender, message: message });
        while (chat.channels[channel].messages.length > 100)
            chat.channels[channel].messages.shift();
        if (channel == chat.currentChannel)
            Chat.AddChatScrollLine(sender, message);
    };
    Chat.AddChatScrollLine = function (sender, message) {
        if (!message || message.length == 0)
            return;
        if (message.toLowerCase().indexOf("/me ") == 0) {
            message = "<b>-- " + ("" + sender).htmlEntities(false) + " " + message.substr(3).trim().htmlEntities(false) + " --</b>";
            sender = null;
        }
        else if (message.indexOf("//") == 0 && sender != null) {
            return;
        }
        else if (message.indexOf("//") == 0) {
            message = "<b>** " + message.substr(2).trim() + " **</b>";
            sender = null;
        }
        if (sender != null && sender != "")
            message = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (world.ChatSmilies)
            message = Chat.Smilies(message);
        if (world.ChatLink)
            message = Chat.UrlChanger(message);
        var chatScroll = $("#chatScroll").first();
        while (chatScroll.children.length > 100)
            chatScroll.removeChild(chatScroll.children[0]);
        $("#chatScroll").html($("#chatScroll").html() + "<div><div" + (sender ? " onclick='PublicViewPlayer.Show(\"" + sender + "\");'" : "") + ">" + (!sender || sender == "" ? "&nbsp;" : sender.htmlEntities(false)) + "</div><div>" + message + "</div></div>");
        $("#chatScroll").scrollTop($("#chatScroll").scrollTop() + 60000);
    };
    Chat.RedrawUserList = function () {
        var html = "";
        var users = chat.channels[chat.currentChannel].users;
        if (users) {
            users.sort();
            for (var i = 0; i < users.length; i++) {
                html += "<div>" + users[i] + "</div>";
            }
        }
        $("#chatUserList").html(html);
    };
    Chat.RedrawChannelHistory = function () {
        $("#chatScroll").html("");
        for (var i = 0; i < chat.channels[chat.currentChannel].messages.length; i++)
            Chat.AddChatScrollLine(chat.channels[chat.currentChannel].messages[i].sender, chat.channels[chat.currentChannel].messages[i].message);
    };
    Chat.Focus = function () {
        if ($("#chatCollapsed").is(":visible")) {
            chat.wasHidden = true;
            Chat.ShowHide();
        }
        else
            chat.wasHidden = false;
        if (chat.onMapChat)
            $("#chatEntryLine").focus();
        else
            $("#chatLine").focus();
    };
    Chat.ShowHide = function () {
        if ($("#chatCollapsed").is(":visible")) {
            $("#chatContainer").show();
            $("#chatCollapsed").hide();
            chat.chatNewMessage = false;
            $("#chatCollapsed .gamePanelContentNoHeader > div").html("Click to chat");
        }
        else {
            $("#chatContainer").hide();
            $("#chatCollapsed").show();
        }
        framework.Preferences["ChatVisible"] = !$("#chatCollapsed").is(":visible");
        Framework.SavePreferences();
    };
    return Chat;
}());
var CodeGraphEditor = (function () {
    function CodeGraphEditor(element, isGenericCode, tab) {
        if (isGenericCode === void 0) { isGenericCode = false; }
        if (tab === void 0) { tab = null; }
        var _this = this;
        this.expandedBlocks = [];
        this.OnChange = null;
        this.inUpdate = false;
        this.isGenericCode = false;
        var hasHelp = false;
        this.element = element;
        this.isGenericCode = isGenericCode;
        this.parent = $("#" + element).first().parentElement.id;
        var elemHtml = $("#" + element).first().outerHTML;
        $("#" + element).first().outerHTML = "<div id='codeError_" + element + "' class='elementCodeWarning' style='position: absolute; left: 0px; right: 0px; top: 0px; width: auto;'>Error!</div><div class='codeGraphTextContainer'>" + elemHtml + "</div>";
        var html = "<div id='graph_" + this.element + "' class='codeGraphArea' path=''></div>";
        html += "<input type='text' id='search_graph_" + this.element + "' placeholder='Search...' class='codeGraphSearchNodes'>";
        html += "<div id='selector_" + this.element + "' class='codeGraphSelector'></div>";
        if ($($("#" + element).first().parentElement).height() > 400) {
            html += "<div id='node_help_" + this.element + "' class='codeGraphNodeHelp'></div>";
            hasHelp = true;
        }
        //if (("" + document.location).indexOf("localhost") != -1 || ("" + document.location).indexOf("test_grapheditor") != -1)
        html += "<div class='codeGraphTabs'><span id='btn_" + element + "_text'>Text</span><span id='btn_" + element + "_node'>Node</span></div>";
        html += "<div id='codeHelp_" + this.element + "' class='codeHelp'></div>";
        Framework.ReloadPreferences();
        //if (("" + document.location).indexOf("localhost") != -1 || ("" + document.location).indexOf("test_grapheditor") != -1)
        if (framework.Preferences && framework.Preferences['codeGraphEditor_help'] !== false && tab == null) {
            html += "<div id='codeGraphEditorHelp'>";
            html += "The code editor allows to edit the logic of the game, however a full flexible logic requires a complete scripting engine. ";
            html += "To help you with the task you can either type it if you are already a skilled developer, or you can use the node view. ";
            html += "At any time you can switch from one view to the other using the tabs under the editor (text / node).";
            html += "<br><br>";
            html += "While working with the nodes, simply drag drop the nodes to add, remove or change the orders. Clicking on the header of a node expands it.";
            html += "<br><br>";
            html += "<center><a href='/Help/node_script.html' target='engineHelp' class='button'>Help</a> <span class='button' onclick='CodeGraphEditor.HideWelcome()'>Hide</span></center></div>";
        }
        $("#" + this.parent).append(html);
        this.code = $("#" + element).val();
        this.editor = CodeEditor.Create(element);
        this.editor.on("change", function () {
            if (_this.inUpdate)
                return;
            // Currently we have the text editor as main one.
            if ($("#" + _this.parent + " .codeGraphTextContainer").is(":visible"))
                _this.statements = null;
            if (_this.OnChange)
                _this.OnChange();
        });
        this.statements = [];
        try {
            var parser = new CodeParser(this.code);
            this.statements = parser.GetAllStatements();
        }
        catch (ex) {
        }
        $("#search_graph_" + this.element).bind("keyup", function () {
            _this.RenderSelector();
        });
        $("#graph_" + this.element).bind("dragover", function (evt) {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "move";
        }).bind("drop", function (evt) {
            evt.preventDefault();
            var data = JSON.parse(evt.dataTransfer.getData("text"));
            if (data.type == "existing") {
                _this.DeleteNode(data.call);
                _this.FromNodeToCode();
                _this.RenderNodes();
            }
            else {
                _this.DropOnEmpty(evt);
            }
        });
        $("#btn_" + element + "_text").bind("click", function () {
            $("#btn_" + element + "_node").removeClass("codeGraphActiveTab");
            $("#btn_" + element + "_text").addClass("codeGraphActiveTab");
            framework.Preferences['codeGraphEditor_tab'] = 'text';
            Framework.SavePreferences();
            $("#" + _this.parent + " .codeGraphTextContainer").show();
            _this.editor.refresh();
            $("#graph_" + _this.element).hide();
            $("#selector_" + _this.element).hide();
            $("#search_graph_" + _this.element).hide();
            $("#node_help_" + _this.element).hide();
        });
        $("#btn_" + element + "_node").bind("click", function () {
            $("#btn_" + element + "_text").removeClass("codeGraphActiveTab");
            $("#btn_" + element + "_node").addClass("codeGraphActiveTab");
            framework.Preferences['codeGraphEditor_tab'] = 'node';
            Framework.SavePreferences();
            $("#" + _this.parent + " .codeGraphTextContainer").hide();
            $("#codeError_" + element).hide();
            if (!_this.statements) {
                _this.code = _this.editor.getValue();
                _this.statements = [];
                try {
                    var parser = new CodeParser(_this.code);
                    _this.statements = parser.GetAllStatements();
                }
                catch (ex) {
                }
                _this.RenderNodes();
            }
            $("#graph_" + _this.element).show();
            $("#selector_" + _this.element).show();
            $("#search_graph_" + _this.element).show();
            $("#node_help_" + _this.element).show();
        });
        if ((framework.Preferences['codeGraphEditor_tab'] === 'text' || tab === "text") && (tab !== "node" || !tab)) {
            $("#graph_" + this.element).hide();
            $("#selector_" + this.element).hide();
            $("#search_graph_" + this.element).hide();
            $("#node_help_" + this.element).hide();
            $("#btn_" + element + "_text").addClass("codeGraphActiveTab");
        }
        else {
            $("#" + this.parent + " .codeGraphTextContainer").hide();
            $("#btn_" + element + "_node").addClass("codeGraphActiveTab");
        }
        //}
        this.RenderNodes();
        this.RenderSelector();
        if (!hasHelp)
            $("#selector_" + this.element).css("bottom", "16px");
    }
    CodeGraphEditor.prototype.GetNode = function (path) {
        var p = path.split('.');
        var result = this.statements;
        while (p.length > 0) {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/)) {
                if (result.constructor == BlockStatement)
                    result = result.Statements[parseInt(currentPath)];
                else
                    result = result[parseInt(currentPath)];
            }
            else
                result = result[currentPath];
        }
        return result;
    };
    CodeGraphEditor.prototype.SetNode = function (path, value) {
        var p = path.split('.');
        var node = this.statements;
        while (p.length > 1) {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/)) {
                if (node.constructor == BlockStatement)
                    node = node.Statements[parseInt(currentPath)];
                else
                    node = node[parseInt(currentPath)];
            }
            else
                node = node[currentPath];
        }
        var className = ("" + node.constructor).match(/function ([^\(]+)\(/)[1];
        var info = statementEditorInfo[className.replace(/Statement$/, "")];
        if (typeof value !== "string")
            node[p[0]] = value;
        else if (info) {
            var found = false;
            for (var i = 0; i < info.params.length; i++) {
                if (info.params[i].name == p[0]) {
                    if (info.params[i].type == "VariableValue" && info.params[i].valueType == "number") {
                        var val = parseFloat(value);
                        if (!isNaN(val))
                            node[p[0]] = new VariableValue(val);
                    }
                    else if (info.params[i].type == "VariableValue")
                        node[p[0]] = new VariableValue(value);
                    else
                        node[p[0]] = value;
                    found = true;
                    break;
                }
            }
            if (!found)
                node[p[0]] = value;
        }
        else
            node[p[0]] = value;
    };
    CodeGraphEditor.prototype.DeleteNode = function (path) {
        var p = path.split('.');
        var node = this.statements;
        while (p.length > 1) {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/)) {
                if (node.constructor == BlockStatement)
                    node = node.Statements[parseInt(currentPath)];
                else
                    node = node[parseInt(currentPath)];
            }
            else
                node = node[currentPath];
        }
        if (p[0].match(/^[0-9]+$/)) {
            if (node.constructor == BlockStatement)
                return node.Statements.splice(parseInt(p[0]), 1)[0];
            else if (path.endsWith(".values." + p[0])) {
                var val = node[parseInt(p[0])];
                node[parseInt(p[0])] = null;
                return val;
            }
            else
                return node.splice(parseInt(p[0]), 1)[0];
        }
        else {
            var result = node[p[0]];
            node[p[0]] = null;
            return result;
        }
    };
    CodeGraphEditor.prototype.RenderNodes = function () {
        var _this = this;
        var html = "";
        for (var i = 0; i < this.statements.length; i++) {
            html += this.statements[i].HTMLBlocks("" + i, this.statements);
            if (this.statements[i].constructor == FunctionDefinitionStatement)
                html += "<div class='codeBlockSeparator'></div>";
        }
        html += "<span class='emptyBlock' path=''>Empty</span>";
        $("#graph_" + this.element).html(html);
        $("#graph_" + this.element + " .emptyBlock").bind("dragover", function (evt) {
            evt.preventDefault();
            // Set the dropEffect to move
            evt.dataTransfer.dropEffect = "move";
        });
        // Allow to drop new items on an empty block
        $("#graph_" + this.element + " .emptyBlock").bind("drop", function (evt) { _this.DropOnEmpty(evt); });
        // Highlight the block
        $("#graph_" + this.element + " .codeBlock").addClass("collapsedBlock").bind("mouseover", function (evt) { _this.MouseOver(evt); }).bind("mouseout", function (evt) { _this.MouseOut(evt); });
        // Expand / contract a block
        $("#graph_" + this.element + " .blockType, #graph_" + this.element + " .simpleBlockType").prop("draggable", true)
            .bind("dragstart", function (evt) { _this.Collapse(evt); evt.dataTransfer.setData("text", JSON.stringify({ type: "existing", call: evt.target.parentElement.id.substr(3).replace(/_/g, ".") })); })
            .bind("drop", function (evt) { _this.DropOnStatement(evt); })
            .bind("mousedown", function (evt) { _this.Collapse(evt); });
        $("#graph_" + this.element + " .endBlock").bind("mousedown", function (evt) { _this.Collapse(evt); });
        // Prevent expand / contract while clicking on a field
        $("#graph_" + this.element + " input").bind("mousedown", function (evt) { evt.cancelBubble = true; return false; }).bind("keyup", function (evt) { _this.UpdateField(evt); });
        // Boolean click => reverse it
        var booleanClick = function (evt) {
            var id = evt.target.parentElement.id;
            var path = id.substr(3).replace(/_/g, ".");
            var node = _this.GetNode(path);
            node.value = new VariableValue(!node.value.GetBoolean());
            $("#" + id).first().outerHTML = node.HTMLBlocks(path);
            $("#" + id).bind("mousedown", booleanClick);
            $("#" + id + " .simpleBlockType").prop("draggable", true)
                .bind("dragstart", function (evt) { _this.Collapse(evt); evt.dataTransfer.setData("text", JSON.stringify({ type: "existing", call: evt.target.parentElement.id.substr(3).replace(/_/g, ".") })); })
                .bind("drop", function (evt) { _this.DropOnStatement(evt); })
                .bind("mousedown", function (evt) { _this.Collapse(evt); });
            _this.FromNodeToCode();
            evt.cancelBubble = true;
            return false;
        };
        $("#graph_" + this.element + " span[block='boolean']").bind("mousedown", booleanClick);
        $("#graph_" + this.element + " .blockDeleteArrayEntry").bind("mousedown", function (evt) {
            var path = evt.target.getAttribute("path");
            var p = path.split('.');
            var entry = p.pop();
            var node = _this.GetNode(p.join('.'));
            node.splice(parseInt(entry), 1);
            _this.RenderNodes();
            _this.FromNodeToCode();
        });
        $("#graph_" + this.element + " .blockAddArrayEntry").bind("mousedown", function (evt) {
            var path = evt.target.getAttribute("path");
            var node = _this.GetNode(path);
            node.push("");
            _this.RenderNodes();
            _this.FromNodeToCode();
        });
        for (var i = 0; i < this.expandedBlocks.length; i++)
            $("#" + this.expandedBlocks[i]).removeClass("collapsedBlock");
    };
    CodeGraphEditor.prototype.UpdateField = function (evt) {
        var val = $(evt.target).val();
        var path = evt.target.getAttribute("path");
        this.SetNode(path, val);
        this.FromNodeToCode();
        var p = path.split('.');
        p.pop();
        var parentNode = this.GetNode(p.join('.'));
        if (parentNode.constructor == FunctionDefinitionStatement)
            this.RenderSelector();
    };
    CodeGraphEditor.prototype.DropOnStatement = function (evt) {
        evt.cancelBubble = true;
        evt.preventDefault();
        var path = evt.target.parentElement.id.substr(3).replace(/_/g, ".");
        if (!path)
            return;
        var p = path.split('.');
        var lastPath = p.pop();
        var parentPath = p.join(".");
        var node = this.GetNode(parentPath);
        if (parentPath == "")
            node = this.statements;
        // Get the id of the target and add the moved element to the target's DOM
        var data = JSON.parse(evt.dataTransfer.getData("text"));
        evt.dataTransfer.clearData();
        var newNode = null;
        switch (data.type) {
            case "base":
                newNode = new window[data.call]();
                break;
            case "api":
                var params = [];
                for (var i = 0; i < apiFunctions.length; i++) {
                    if (apiFunctions[i].name.toLowerCase() == data.call.toLowerCase()) {
                        for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                            params.push(null);
                        break;
                    }
                }
                newNode = new FunctionCallStatement(data.call, params, 0, 0);
                break;
            case "existing":
                newNode = this.DeleteNode(data.call);
                break;
        }
        if (!newNode)
            return;
        if (node && node.constructor === BlockStatement)
            node = node.Statements;
        if (path.endsWith(".values." + lastPath))
            node[parseInt(lastPath)] = newNode;
        else if (node && node.constructor === Array)
            node.splice(parseInt(lastPath), 0, newNode);
        else
            this.SetNode(parentPath, newNode);
        this.FromNodeToCode();
        this.RenderNodes();
    };
    CodeGraphEditor.prototype.DropOnEmpty = function (evt) {
        evt.cancelBubble = true;
        evt.preventDefault();
        var path = evt.target.getAttribute("path");
        var node = null;
        if (path === "")
            node = this.statements;
        else
            node = this.GetNode(path);
        // Get the id of the target and add the moved element to the target's DOM
        var data = JSON.parse(evt.dataTransfer.getData("text"));
        evt.dataTransfer.clearData();
        var newNode = null;
        switch (data.type) {
            case "base":
                newNode = new window[data.call]();
                break;
            case "api":
                var params = [];
                for (var i = 0; i < apiFunctions.length; i++) {
                    if (apiFunctions[i].name.toLowerCase() == data.call.toLowerCase()) {
                        for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                            params.push(null);
                        break;
                    }
                }
                newNode = new FunctionCallStatement(data.call, params, 0, 0);
                break;
            case "existing":
                newNode = this.DeleteNode(data.call);
                break;
        }
        if (node === this.statements) {
            if (newNode.constructor != CommentStatement && newNode.constructor != FunctionDefinitionStatement) {
                Framework.ShowMessage("Only comments and functions definitions can be placed on the top level.");
                return;
            }
        }
        else if (newNode.constructor == FunctionDefinitionStatement) {
            Framework.ShowMessage("Function definitions can be placed only on the top level.");
            return;
        }
        if (node && node.constructor === BlockStatement) {
            var className = ("" + newNode.constructor).match(/function ([^\(]+)\(/)[1];
            if (!topBlockStatements.contains(className)) {
                Framework.ShowMessage("This block cannot be placed here.");
                return;
            }
        }
        if (!newNode)
            return;
        if (node && node.constructor === BlockStatement)
            node.Statements.push(newNode);
        else if (node && node.constructor === Array)
            node.push(newNode);
        else
            this.SetNode(path, newNode);
        this.FromNodeToCode();
        this.RenderNodes();
        if (newNode.constructor == FunctionDefinitionStatement)
            this.RenderSelector();
        //console.log("Dragged: " + data);
        //ev.target.appendChild(document.getElementById(data));
    };
    CodeGraphEditor.prototype.RenderSelector = function () {
        var _this = this;
        var search = $("#search_graph_" + this.element).val().toLowerCase();
        var html = "";
        var isFirst = true;
        knownStatements.sort();
        for (var i = 0; i < knownStatements.length; i++) {
            if (knownStatements[i].replace(/Statement$/, "").toLowerCase().indexOf(search) == -1)
                continue;
            if (knownStatements[i] == "FunctionCallStatement" || knownStatements[i] == "BlockStatement" || knownStatements[i] == "EmptyStatement" || knownStatements[i] == "EmptyArrayStatement")
                continue;
            if (isFirst) {
                html += "<div class='codeGroup'><span>Logic:</span>";
                isFirst = false;
            }
            html += "<p type='base' call='" + knownStatements[i] + "'>" + knownStatements[i].replace(/Statement$/, "").title() + "</p>";
        }
        if (!isFirst)
            html += "</div>";
        var apiGroups = [];
        for (var item in api)
            apiGroups.push(item);
        var isFirst = true;
        for (var i = 0; i < apiGroups.length; i++) {
            var functions = [];
            for (var j = 0; j < apiFunctions.length; j++) {
                if (apiFunctions[j].name.toLowerCase().indexOf(search) == -1)
                    continue;
                if (apiFunctions[j].name.split('.')[0].toLowerCase() == apiGroups[i].toLowerCase())
                    functions.push(apiFunctions[j].name.split('.')[1]);
            }
            functions.sort();
            if (functions.length == 0)
                continue;
            if (isFirst) {
                html += "<div class='codeGroup'><span>API:</span>";
                isFirst = false;
            }
            html += "<div class='codeGroup'><span>" + apiGroups[i].capitalize() + ":</span>";
            for (var j = 0; j < functions.length; j++)
                html += "<p type='api' call='" + apiGroups[i].capitalize() + "." + functions[j] + "'>" + functions[j] + "</p>";
            html += "</div>";
        }
        if (!isFirst)
            html += "</div>";
        if (!this.isGenericCode) {
            isFirst = true;
            for (var i = 0; i < this.statements.length; i++) {
                if (this.statements[i].constructor != FunctionDefinitionStatement)
                    continue;
                if (this.statements[i].Name.toLowerCase().indexOf(search) == -1)
                    continue;
                if (isFirst) {
                    html += "<div class='codeGroup'><span>Functions:</span>";
                    isFirst = false;
                }
                html += "<p type='api' call='" + this.statements[i].Name + "'>" + this.statements[i].Name + "</p>";
            }
            if (!isFirst)
                html += "</div>";
        }
        isFirst = true;
        if (world && world.Codes)
            for (var i = 0; i < world.Codes.length; i++) {
                if (!world.Codes[i].code) {
                    try {
                        world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                    }
                    catch (ex) {
                    }
                }
                if (!world.Codes[i].code)
                    continue;
                for (var item in world.Codes[i].code.FunctionCodes) {
                    if (item.toLowerCase().indexOf(search) == -1)
                        continue;
                    if (isFirst) {
                        html += "<div class='codeGroup'><span>Generic Functions:</span>";
                        isFirst = false;
                    }
                    html += "<p type='api' call='me." + world.Codes[i].Name + "." + item + "'>" + item + "</p>";
                }
            }
        if (!isFirst)
            html += "</div>";
        $("#selector_" + this.element).html(html);
        $("#selector_" + this.element + " p").prop("draggable", true).bind("dragstart", function (evt) {
            //console.log(evt.target.innerHTML);
            //evt.initDragEvent();
            evt.dataTransfer.setData("text", JSON.stringify({ type: evt.target.getAttribute("type"), call: evt.target.getAttribute("call") }));
        }).bind("mouseover", function (evt) {
            var type = evt.target.getAttribute("type");
            var call = evt.target.getAttribute("call").replace(/Statement$/, "");
            $("#node_help_" + _this.element).html("");
            if (type == "base" && statementEditorInfo[call])
                $("#node_help_" + _this.element).html(statementEditorInfo[call].help);
            else if (type == "api") {
                call = ("" + call).toLowerCase();
                var p = call.split('.');
                if (p.length == 2) {
                    for (var i = 0; i < apiFunctions.length; i++) {
                        if (apiFunctions[i].name.toLowerCase() == call) {
                            $("#node_help_" + _this.element).html(GetApiSignature(call) + GetApiDescription(call));
                            break;
                        }
                    }
                }
                else
                    $("#node_help_" + _this.element).html("Calls the function '" + call + "' and pass the parameters.");
            }
        }).bind("mouseout", function (evt) {
            $("#node_help_" + _this.element).html("");
        });
    };
    CodeGraphEditor.prototype.Collapse = function (evt) {
        var obj = evt.target;
        while (obj.className.indexOf("codeBlock") == -1)
            obj = obj.parentElement;
        $(obj).toggleClass("collapsedBlock");
        var id = obj.id;
        // Not collapsed
        if (obj.className.indexOf("collapsedBlock") == -1)
            this.expandedBlocks.push(id);
        else {
            for (var i = 0; i < this.expandedBlocks.length; i++) {
                if (this.expandedBlocks[i] == id) {
                    this.expandedBlocks.splice(i, 1);
                    break;
                }
            }
        }
    };
    CodeGraphEditor.prototype.GetCode = function () {
        return this.editor.getDoc().getValue();
    };
    CodeGraphEditor.prototype.SetCode = function (source) {
        this.inUpdate = true;
        this.code = source;
        this.statements = [];
        try {
            var parser = new CodeParser(this.code);
            this.statements = parser.GetAllStatements();
            this.RenderNodes();
            this.RenderSelector();
        }
        catch (ex) {
        }
        this.editor.getDoc().setValue(source);
        this.editor.refresh();
        CodeMirror.signal(this.editor, "change");
        this.inUpdate = false;
    };
    CodeGraphEditor.prototype.SetReadonly = function (readonly) {
        this.editor.readOnly = readonly;
    };
    CodeGraphEditor.prototype.FromNodeToCode = function () {
        try {
            var code = "";
            for (var i = 0; i < this.statements.length; i++) {
                code += this.statements[i].ToCode(0) + "\n";
            }
            code = code.trim();
            this.code = code;
            this.editor.getDoc().setValue(code);
            this.editor.refresh();
            CodeMirror.signal(this.editor, "change");
        }
        catch (ex) {
        }
    };
    CodeGraphEditor.prototype.Refresh = function () {
        this.editor.refresh();
    };
    CodeGraphEditor.prototype.MouseOver = function (evt) {
        $(".overBlock").removeClass("overBlock");
        var obj = evt.target;
        while (obj.className.indexOf("codeBlock") == -1)
            obj = obj.parentElement;
        $(obj).addClass("overBlock");
        $("#node_help_" + this.element).html("");
        var path = obj.id.substr(3).replace(/_/g, ".");
        if (path) {
            var node = this.GetNode(path);
            if (node) {
                if (node.constructor == FunctionCallStatement) {
                    var call = node.Name.toLowerCase();
                    var p = call.split('.');
                    if (p.length == 2) {
                        for (var i = 0; i < apiFunctions.length; i++) {
                            if (apiFunctions[i].name.toLowerCase() == call) {
                                $("#node_help_" + this.element).html(GetApiSignature(call) + GetApiDescription(call));
                                break;
                            }
                        }
                    }
                    else
                        $("#node_help_" + this.element).html("Calls the function '" + call + "' and pass the parameters.");
                }
                else {
                    var className = ("" + node.constructor).match(/function ([^\(]+)\(/)[1].replace("Statement", "");
                    if (statementEditorInfo[className])
                        $("#node_help_" + this.element).html(statementEditorInfo[className].help);
                }
            }
        }
    };
    CodeGraphEditor.prototype.MouseOut = function (evt) {
        $(".overBlock").removeClass("overBlock");
        $("#node_help_" + this.element).html("");
    };
    CodeGraphEditor.HideWelcome = function () {
        Framework.ReloadPreferences();
        framework.Preferences['codeGraphEditor_help'] = false;
        Framework.SavePreferences();
        $("#codeGraphEditorHelp").hide();
    };
    return CodeGraphEditor;
}());
var inventoryMenu = new ((function () {
    function class_19() {
        this.inventoryDisplayed = false;
    }
    return class_19;
}()));
var InventoryMenu = (function () {
    function InventoryMenu() {
    }
    InventoryMenu.AdditionalCSS = function () {
        return "#inventoryIcon\n\
{\n\
    position: absolute;\n\
    left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 80px;\n\
}\n\
#inventoryIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
#inventoryObjectDetails\n\
{\n\
    position: absolute;\n\
    left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
    bottom: " + parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
    overflow: hidden;\n\
    height: 150px;\n\
    padding: 7px;\n\
    box-sizing: border-box;\n\
}\n\
\n\
#inventoryObjectList\n\
{\n\
    position: absolute;\n\
    left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
    top: " + parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
    bottom: " + (parseInt("" + world.art.panelStyle.bottomBorder) + 150) + "px;\n\
    overflow-y: scroll;\n\
}\n\
\n\
#inventoryObjectList h1\n\
{\n\
    border-bottom: solid 1px " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
    margin-bottom: 5px;\n\
}\n\
";
    };
    InventoryMenu.Init = function (position) {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowInventory === false))) {
            $("#inventoryIcon").hide();
            return position;
        }
        $("#inventoryIcon").css("top", position + "px");
        if (game)
            $("#inventoryIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/inventory_icon.png'>");
        else
            $("#inventoryIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/inventory_icon.png'>");
        return position + 64 + world.art.panelStyle.topBorder;
    };
    InventoryMenu.Toggle = function () {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowInventory === false)))
            return;
        $("#profileIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;
        if (inventoryMenu.inventoryDisplayed) {
            $("#gameMenuPanel").hide();
            $("#inventoryIcon").removeClass("openPanelIcon");
            inventoryMenu.inventoryDisplayed = false;
        }
        else {
            inventoryMenu.inventoryDisplayed = true;
            $("#gameMenuPanel").show();
            $("#inventoryIcon").addClass("openPanelIcon");
            InventoryMenu.Update();
        }
    };
    InventoryMenu.Update = function () {
        if (!inventoryMenu.inventoryDisplayed)
            return;
        var html = "";
        var wearSomething = false;
        for (var slot in world.Player.EquipedObjects) {
            wearSomething = true;
            break;
        }
        html += "<div id='inventoryObjectList'>";
        if (wearSomething) {
            html += "<h1>Wearing</h1>";
            html += "<table class='inventoryList'>";
            for (var slot in world.Player.EquipedObjects) {
                html += "<tr>";
                var wearedItem = world.Player.EquipedObjects[slot];
                var details = world.GetInventoryObject(wearedItem.Name);
                if (!details)
                    continue;
                if (details.CanUnwear())
                    html += "<td><div class='gameButton' onclick='InventoryMenu.Unwear(\"" + slot.htmlEntities() + "\");'>Unwear</div></td>";
                else
                    html += "<td>&nbsp;</td>";
                html += "<td>" + (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32'>" : "") + "</td>";
                html += "<td>" + world.Player.EquipedObjects[slot].Name.htmlEntities() + "</td>";
                html += "<td>" + slot.title().htmlEntities() + "</td>";
                html += "</tr>";
            }
            html += "</table>";
        }
        html += "<h1>Inventory</h1>";
        if (!world.Player.Inventory || !world.Player.Inventory.length) {
            $("#gameMenuPanelContent").html(html);
            return;
        }
        world.Player.Inventory.sort(function (a, b) {
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        world.Player.StoredCompare = world.Player.JSON();
        html += "<table class='inventoryList'>";
        html += "<thead>";
        html += "<tr><td>&nbsp;</td><td>&nbsp;</td><td>Item</td><td>Quantity</td></tr>";
        html += "</thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Inventory.length; i++) {
            var details = world.Player.Inventory[i].GetDetails();
            if (details == null) {
                world.Player.Inventory.splice(i, 1);
                i--;
                world.Player.StoredCompare = world.Player.JSON();
                continue;
            }
            html += "<tr onmouseover='InventoryMenu.ShowDetails(" + i + ");' onmouseout='InventoryMenu.HideDetails();'>";
            html += "<td>";
            if (details.CanWear())
                html += "<div class='gameButton' onclick='InventoryMenu.Wear(" + i + ");'>Equip</div>";
            if (details.ActionLabel() && details.CanUse())
                html += "<div class='gameButton' onclick='InventoryMenu.Use(" + i + ");'>" + details.ActionLabel().htmlEntities() + "</div>";
            if (details.CanDrop())
                html += "<div class='gameButton' onclick='InventoryMenu.Drop(" + i + ");'>Drop</div>";
            if (details.CanWear() || (details.ActionLabel() && details.CanUse()))
                html += "<div class='gameButton' onclick='InventoryMenu.Quickslot(" + i + ");'>Quickslot</div>";
            html += "</td>";
            html += "<td>" + (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32'>" : "") + "</td>";
            html += "<td><div>" + world.Player.Inventory[i].Name.htmlEntities() + "</div></td>";
            html += "<td>" + ("" + world.Player.Inventory[i].Count).htmlEntities() + "</td>";
            html += "</tr>";
        }
        html += "</tbody></table></div>";
        html += "<div id='inventoryObjectDetails'></div>";
        $("#gameMenuPanelContent").html(html);
    };
    InventoryMenu.ShowDetails = function (rowId) {
        var details = world.Player.Inventory[rowId].GetDetails();
        var html = "";
        html += (details.Image ? "<img src='" + details.Image.htmlEntities() + "' width='32' height='32' style='vertical-align: middle;'>" : "");
        html += "<b>" + details.Name.htmlEntities() + ":</b><br>";
        html += Main.TextTransform(details.Description, true);
        $("#inventoryObjectDetails").html(html);
    };
    InventoryMenu.HideDetails = function () {
        $("#inventoryObjectDetails").html("");
    };
    InventoryMenu.Wear = function (rowId) {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanWear())
            world.Player.Wear(world.Player.Inventory[rowId].Name);
    };
    InventoryMenu.Unwear = function (slotName) {
        var wearedItem = world.Player.EquipedObjects[slotName];
        var details = world.GetInventoryObject(wearedItem.Name);
        if (details.CanUnwear())
            world.Player.Unwear(slotName);
    };
    InventoryMenu.Drop = function (rowId) {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanDrop())
            world.Player.RemoveItem(world.Player.Inventory[rowId].Name);
    };
    InventoryMenu.Use = function (rowId) {
        var details = world.Player.Inventory[rowId].GetDetails();
        if (details.CanUse())
            details.Use();
    };
    InventoryMenu.Quickslot = function (rowId) {
        profileMenu.profileDisplayed = false;
        var html = "<h1>Quickslot</h1>";
        for (var i = 0; i < 10; i++) {
            var q = world.Player.QuickSlot[i];
            var skill = null;
            if (!q)
                q = "-- Empty --";
            else if (q.substring(0, 2) == "S/") {
                var skill = world.GetSkill(q.substring(2));
                q = "Skill " + q.substring(2).title().htmlEntities();
            }
            else
                q = "Item " + q.substring(2).title().htmlEntities();
            if (skill && skill.CodeVariable("QuickslotEditable") === "false") {
                html += "Slot " + (i + 1) + " " + q + "<br>";
            }
            else
                html += "<div class='gameButton' onclick='InventoryMenu.SetQuickslot(" + rowId + "," + i + ");'>Slot " + (i + 1) + "</div>" + q + "<br>";
        }
        html += "<center><div class='gameButton' onclick='InventoryMenu.Update();'>Cancel</div></center>";
        $("#gameMenuPanelContent").html(html);
    };
    InventoryMenu.SetQuickslot = function (rowId, slotId) {
        var details = world.Player.Inventory[rowId].GetDetails();
        var itemName = details.Name;
        for (var i = 0; i < 10; i++)
            if (world.Player.QuickSlot[i] == "I/" + itemName)
                world.Player.QuickSlot[i] = null;
        world.Player.QuickSlot[slotId] = "I/" + itemName;
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        InventoryMenu.Update();
    };
    return InventoryMenu;
}());
var journalMenu = new ((function () {
    function class_20() {
        this.journalDisplayed = false;
    }
    return class_20;
}()));
var JournalMenu = (function () {
    function JournalMenu() {
    }
    JournalMenu.AdditionalCSS = function () {
        return "#journalIcon\n\
{\n\
    position: absolute;\n\
    left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 245px;\n\
}\n\
#journalIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    };
    JournalMenu.Init = function (position) {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowJournal === false))) {
            $("#journalIcon").hide();
            return position;
        }
        $("#journalIcon").css("top", position + "px");
        if (game)
            $("#journalIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/journal_icon.png'>");
        else
            $("#journalIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/journal_icon.png'>");
        return position + 64 + world.art.panelStyle.topBorder;
    };
    JournalMenu.Toggle = function () {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowJournal === false)))
            return;
        inventoryMenu.inventoryDisplayed = false;
        $("#inventoryIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#profileIcon").removeClass("openPanelIcon");
        if (journalMenu.journalDisplayed) {
            $("#gameMenuPanel").hide();
            $("#journalIcon").removeClass("openPanelIcon");
            journalMenu.journalDisplayed = false;
        }
        else {
            journalMenu.journalDisplayed = true;
            $("#gameMenuPanel").show();
            $("#journalIcon").addClass("openPanelIcon");
            JournalMenu.Update();
        }
    };
    JournalMenu.Update = function () {
        if (!journalMenu.journalDisplayed)
            return;
        world.Player.Quests.sort(JournalMenu.SortQuests);
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        var html = "<h1>Quest Journal</h1>";
        if (world.Player.Quests.length > 0) {
            var showCompleted = false;
            if (!world.Player.Quests[0].Completed)
                html += "<h2>Open quests</h2>";
            for (var i = 0; i < world.Player.Quests.length; i++) {
                var quest = world.GetQuest(world.Player.Quests[i].Name);
                if (!quest)
                    continue;
                if (!showCompleted && world.Player.Quests[i].Completed) {
                    showCompleted = true;
                    html += "<h2>Completed quests</h2>";
                }
                html += "<b>" + quest.Name.htmlEntities() + "</b><br>";
                html += Main.TextTransform(quest.Description, true) + "<br>";
                for (var j = 0; j < world.Player.Quests[i].JournalEntries.length; j++) {
                    var entry = JournalMenu.GetJournal(quest, world.Player.Quests[i].JournalEntries[j].EntryId);
                    if (!entry)
                        continue;
                    html += Main.TextTransform(entry) + "<br>";
                }
            }
        }
        $("#gameMenuPanelContent").html(html);
    };
    JournalMenu.GetJournal = function (quest, id) {
        for (var i = 0; i < quest.JournalEntries.length; i++)
            if (quest.JournalEntries[i].Id == id)
                return quest.JournalEntries[i].Entry;
        return null;
    };
    JournalMenu.SortQuests = function (a, b) {
        if (a.Completed && b.Completed) {
            if (a.Completed > b.Completed)
                return -1;
            if (a.Completed < b.Completed)
                return 1;
            return 0;
        }
        if (a.Completed && !b.Completed)
            return 1;
        if (!a.Completed && b.Completed)
            return -1;
        if (a.JournalEntries && a.JournalEntries.length > 0 && b.JournalEntries && b.JournalEntries.length > 0) {
            if (a.JournalEntries[a.JournalEntries.length - 1] > b.JournalEntries[b.JournalEntries.length - 1])
                return 1;
            if (a.JournalEntries[a.JournalEntries.length - 1] < b.JournalEntries[b.JournalEntries.length - 1])
                return -1;
            return 0;
        }
        if (a.JournalEntries && a.JournalEntries.length > 0 && (!b.JournalEntries || b.JournalEntries.length == 0))
            return 1;
        if ((!a.JournalEntries || a.JournalEntries.length == 0) && b.JournalEntries && b.JournalEntries.length > 0)
            return -1;
        if (a.Started > b.Started)
            return 1;
        if (a.Started < b.Started)
            return -1;
        return 0;
    };
    return JournalMenu;
}());
/**
A small replacement for JQuery
*/
Object.cast = function cast(rawObj, constructor) {
    var obj = new constructor();
    for (var i in rawObj)
        obj[i] = rawObj[i];
    return obj;
};
function TryParse(json) {
    try {
        return JSON.parse(json);
    }
    catch (ex) {
        return null;
    }
}
var $ = function (param) {
    if (typeof param === "string") {
        // We don't have access to the dom?
        try {
            if (!document)
                return new MiniQuery([]);
        }
        catch (ex) {
            return new MiniQuery([]);
        }
        var elements = [];
        var src = document.querySelectorAll(param);
        for (var i = 0; i < src.length; i++)
            elements.push(src[i]);
        return new MiniQuery(elements);
    }
    else if (typeof param === "function") {
        window.addEventListener("load", param);
    }
    return new MiniQuery([param]);
};
$.ajax = function (settings) {
    var http;
    try {
        http = new XMLHttpRequest();
    }
    catch (e) {
        try {
            http = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (e2) {
            http = false;
        }
    }
    if (!http) {
        return;
    }
    http.open(settings.method ? settings.method : (settings.type ? settings.type : "GET"), settings.url);
    if (settings.contentType)
        http.setRequestHeader("Content-type", settings.contentType);
    http.onreadystatechange = function () {
        if (http.readyState != 4)
            return;
        if (http.status == 200 && settings.success)
            settings.success(http.responseText);
        else if (http.status != 200 && settings.error)
            settings.error(http.responseText);
    };
    if (settings.dataType === "json")
        http.setRequestHeader("Accept", "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01");
    if (settings.data) {
        var destData = "";
        if (!settings.contentType || settings.contentType == "application/x-www-form-urlencoded") {
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            for (var i in settings.data) {
                if (destData != "")
                    destData += "&";
                destData += i + "=";
                destData += encodeURIComponent(settings.data[i]);
            }
        }
        else
            destData = JSON.stringify(settings.data);
        http.send(destData);
    }
    else
        http.send(null);
    return http;
};
var MiniQuery = (function () {
    function MiniQuery(elements) {
        this.parentMiniQuery = null;
        this.elements = elements;
        this.length = elements.length;
    }
    MiniQuery.prototype.first = function () {
        if (this.elements && this.elements.length > 0)
            return this.elements[0];
        return null;
    };
    MiniQuery.prototype.html = function (source) {
        if (source == undefined)
            return this.elements[0].innerHTML;
        this.elements.forEach(function (c) {
            c.innerHTML = source;
        });
        return this;
    };
    MiniQuery.prototype.text = function (source) {
        if (source == undefined)
            return this.elements[0].innerText;
        this.elements.forEach(function (c) {
            c.innerText = source;
        });
        return this;
    };
    MiniQuery.prototype.scrollTop = function (value) {
        if (value === undefined)
            return this.first().scrollTop;
        this.elements.forEach(function (c) {
            c.scrollTop = value;
        });
        return this;
    };
    MiniQuery.prototype.submit = function () {
        this.elements.forEach(function (c) {
            c.submit();
        });
        return this;
    };
    MiniQuery.prototype.val = function (source) {
        if (this.elements.length === 0) {
            if (source === undefined)
                return null;
            else
                return this;
        }
        if (source === undefined) {
            if (this.elements[0].nodeName == "SELECT") {
                var s = this.elements[0];
                if (s.multiple) {
                    var result = [];
                    for (var i = 0; i < s.options.length; i++)
                        if (s.options[i].selected)
                            result.push(s.options[i].value);
                    return result;
                }
                else {
                    if (s.selectedIndex == -1)
                        return s.options[0].value;
                    return s.options[s.selectedIndex].value;
                }
            }
            return this.elements[0].value;
        }
        this.elements.forEach(function (c) {
            if (c.nodeName == "SELECT") {
                var s = c;
                for (var i = 0; i < s.options.length; i++) {
                    if (s.options[i].value == source) {
                        s.selectedIndex = i;
                        break;
                    }
                }
            }
            else
                c.value = source;
        });
        return this;
    };
    MiniQuery.prototype.show = function () {
        this.elements.forEach(function (c) {
            c.style.display = "block";
            c.style.visibility = "visible";
        });
        return this;
    };
    MiniQuery.prototype.hide = function () {
        this.elements.forEach(function (c) {
            c.style.display = "none";
            c.style.visibility = "hidden";
        });
        return this;
    };
    MiniQuery.prototype.mouseover = function (callback) {
        this.bind("mouseover", callback);
        return this;
    };
    MiniQuery.prototype.mouseout = function (callback) {
        this.bind("mouseout", callback);
        return this;
    };
    MiniQuery.prototype.bind = function (event, callback) {
        this.elements.forEach(function (c) {
            if (!c['mini_event_list'])
                c['mini_event_list'] = [];
            c['mini_event_list'].push(callback);
            c.addEventListener(event, callback);
            if (event.toLowerCase() == "mousewheel")
                c.addEventListener("DOMMouseScroll", callback);
        });
        return this;
    };
    MiniQuery.prototype.unbind = function (event, callback) {
        if (!callback) {
            this.elements.forEach(function (c) {
                if (c['mini_event_list']) {
                    for (var i = 0; i < c['mini_event_list'].length; i++)
                        c.removeEventListener(event, c['mini_event_list'][i]);
                    c['mini_event_list'] = [];
                }
                c["on" + event] = null;
                if (event.toLowerCase() == "mousewheel")
                    c["onDOMMouseScroll"] = null;
            });
            return this;
        }
        this.elements.forEach(function (c) {
            for (var i = 0; i < c['mini_event_list'].length;) {
                if (c['mini_event_list'][i] == callback)
                    c['mini_event_list'].splice(i, 1);
                else
                    i++;
            }
            c.removeEventListener(event, callback);
            if (event.toLowerCase() == "mousewheel")
                c.removeEventListener("DOMMouseScroll", callback);
        });
        return this;
    };
    MiniQuery.prototype.focus = function () {
        this.elements.forEach(function (c) {
            c.focus();
        });
        return this;
    };
    MiniQuery.prototype.blur = function () {
        this.elements.forEach(function (c) {
            c.blur();
        });
        return this;
    };
    MiniQuery.prototype.eq = function (id) {
        if (this.elements[id])
            return new MiniQuery([this.elements[id]]);
        return new MiniQuery([]);
    };
    MiniQuery.prototype.css = function (name, value) {
        if (value === null || value === undefined)
            return window.getComputedStyle(this.elements[0])[name];
        if (typeof name == "string") {
            var propName = name;
            name = {};
            name[propName] = value;
        }
        this.elements.forEach(function (c) {
            for (var i in name) {
                c.style[i] = value;
            }
        });
        return this;
    };
    MiniQuery.prototype.height = function (val) {
        if (val === null || val === undefined)
            return this.elements[0].clientHeight;
        this.elements[0].style.height = "" + val + "px";
        return this;
    };
    MiniQuery.prototype.width = function (val) {
        if (val === null || val === undefined) {
            if (this.elements.length > 0)
                return this.elements[0].clientWidth;
            return null;
        }
        for (var i = 0; i < this.elements.length; i++)
            this.elements[i].style.width = "" + val + "px";
        return this;
    };
    MiniQuery.prototype.animate = function (properties, time, callback) {
        return this;
    };
    MiniQuery.prototype.toggleClass = function (className) {
        this.elements.forEach(function (c) {
            if ((c.className ? c.className : "").indexOf(className) == -1)
                c.className += " " + className;
            else
                c.className = c.className.replace(className, "");
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });
        return this;
    };
    MiniQuery.prototype.addClass = function (className) {
        this.elements.forEach(function (c) {
            if ((c.className ? c.className : "").indexOf(className) == -1)
                c.className += " " + className;
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });
        return this;
    };
    MiniQuery.prototype.removeClass = function (className) {
        this.elements.forEach(function (c) {
            c.className = c.className.replace(className, "");
            c.className = c.className.replace(/ {2,}/g, " ").trim();
        });
        return this;
    };
    MiniQuery.prototype.position = function () {
        var parent = this.elements[0];
        var result = { left: 0, top: 0 };
        while (parent != null) {
            result.left += parent.offsetLeft;
            result.top += parent.offsetTop;
            parent = parent.parentElement;
        }
        return result;
    };
    MiniQuery.prototype.prop = function (property, value) {
        if (value === undefined)
            return this.elements[0][property];
        this.elements.forEach(function (c) {
            c[property] = value;
        });
        return this;
    };
    MiniQuery.prototype.find = function (toSearch) {
        var elements = [];
        this.elements.forEach(function (c) {
            var src = c.querySelectorAll(toSearch);
            for (var i = 0; i < src.length; i++)
                elements.push(src[i]);
        });
        var result = new MiniQuery(elements);
        result.parentMiniQuery = this;
        return result;
    };
    MiniQuery.prototype.end = function () {
        return this.parentMiniQuery;
    };
    MiniQuery.prototype.remove = function () {
        this.elements.forEach(function (c) {
            try {
                c.remove();
            }
            catch (ex) {
            }
        });
        return this;
    };
    MiniQuery.prototype.append = function (content) {
        this.elements.forEach(function (c) {
            c.innerHTML += content;
        });
        return this;
    };
    MiniQuery.prototype.is = function (attribute) {
        if (attribute != ":visible")
            return false;
        if (this.elements.length == 0)
            return false;
        return (this.first().offsetParent !== null && this.first().offsetParent !== undefined ? true : false);
    };
    MiniQuery.prototype.before = function (toAdd) {
        this.elements.forEach(function (c) {
            c.insertAdjacentHTML('beforebegin', toAdd);
        });
        return this;
    };
    return MiniQuery;
}());
/// <reference path="../../Common/Libs/MiniQuery.ts"/>
var Routing = (function () {
    function Routing(action, callback) {
        this.Action = action;
        this.Callback = callback;
    }
    return Routing;
}());
var GuiPart = (function () {
    function GuiPart(position, callback) {
        this.Position = position;
        this.Callback = callback;
    }
    return GuiPart;
}());
String.prototype.endsWith = function (toCheck) {
    return (this.substr(this.length - toCheck.length) == toCheck);
};
String.prototype.title = function () {
    return this.replace(/(\w)([A-Z][a-z])/g, "$1 $2");
};
String.prototype.padLeft = function (c, nb) {
    if (this.length >= nb)
        return this;
    return Array(nb - this.length + 1).join(c) + this;
};
String.prototype.htmlEntities = function (escapeQuotes) {
    if (escapeQuotes === void 0) { escapeQuotes = true; }
    if (!escapeQuotes)
        return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    return this.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
};
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substr(1);
};
/**
* Transorms the string into a CSS valid ID
*/
String.prototype.id = function () {
    return this.replace(/ /g, "_").replace(/\//g, "_").replace(/#/g, "_").replace(/\./g, "_").replace(/</g, "_")
        .replace(/:/g, "_").replace(/\+/g, "_").replace(/\*/g, "_").replace(/\-/g, "_").replace(/\\/g, "_")
        .replace(/\(/g, "_").replace(/\)/g, "_").replace(/\&/g, "_").replace(/,/g, "_").replace(/\=/g, "_").replace(/\'/g, "_");
};
Array.prototype.contains = function (toFind) {
    for (var i = 0; i < this.length; i++)
        if (this[i] == toFind)
            return true;
    return false;
};
function FirstItem(dictionary) {
    for (var item in dictionary)
        return item;
    return null;
}
function Keys(dictionary) {
    var keys = [];
    for (var item in dictionary)
        keys.push(item);
    return keys;
}
function isString(variable) {
    return (typeof variable == 'string' || variable instanceof String);
}
function IsNull(value) {
    return (value === null || value === undefined);
}
function IfIsNull(value, defaultValue) {
    return ((value === null || value === undefined) ? defaultValue : value);
}
/**
 * Don't use static properties as it may trigger Typescript bugs. Therefore an instance of an anonymous class
 * containting the needed values is the current solution.
 * Sadly with this solution we loose the visibility of the properties.
 *
 * https://github.com/Microsoft/TypeScript/issues/5549
 *
 */
var framework = new ((function () {
    function class_21() {
        this.DefaultModule = "Play";
        this.Routing = [];
        this.HandleUrl = true;
        this.LastRoute = null;
        this.CurrentHandler = null;
        this.Preferences = {};
        this.eventRouteCall = null;
        this.cachedTemplates = [];
        this.CurrentUrl = {};
        this.GuiParts = [];
        this.Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.WeekDays = ["M", "T", "W", "T", "F", "S", "S"];
        this.MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.keyPressed = [];
        this.specialKeyHandling = [];
        this.isPrompt = false;
        this.RoutePrefix = "/Engine/Module/";
    }
    return class_21;
}()));
/**
 * Base framework class
 *
 * Page sections must implement:
 * static Recover(url)
 * The function will receive an "url" object (dictionary) containing all the URL parameters.
 *
 * Any class can implement the following function which will be called during the framework initialization:
 * static InitFunction(): void
 * The framework will need a corresponding Templates/XXX.html or
 * an <script id="XXX" type="text/html"> tag in the index.html where XXX is the name of the typescript class.
 *
 */
var Framework = (function () {
    function Framework() {
    }
    /**
     * Calculates an MD5 of a given string
     */
    Framework.MD5 = function (source) {
        return window["md5"](source);
    };
    /**
     * Parse the URL and returns an object (dictionary) of the parsed URL.
     * @param url the string of the url (the # part of the url is the important piece).
     */
    Framework.ParseUrl = function (url) {
        if (url === void 0) { url = null; }
        if (!url) {
            url = ("" + document.location);
            if (url.indexOf("#") == -1)
                url = "";
            else
                url = url.substr(url.indexOf("#") + 1);
        }
        else
            url = url.substr(url.indexOf("#") + 1);
        var parts = url.split("&");
        var result = {};
        parts.forEach(function (row) { return result[row.split("=")[0]] = decodeURIComponent(row.split("=")[1]); });
        return result;
    };
    Framework.ParseQuery = function (url) {
        if (url === void 0) { url = null; }
        if (!url) {
            url = ("" + document.location);
            if (url.indexOf("?") == -1)
                url = "";
            else
                url = url.substr(url.indexOf("?") + 1);
        }
        else
            url = url.substr(url.indexOf("?") + 1);
        if (url.indexOf('#') != -1)
            url = url.substr(0, url.indexOf('#'));
        var parts = url.split("&");
        var result = {};
        parts.forEach(function (row) { return result[row.split("=")[0]] = decodeURIComponent(row.split("=")[1]); });
        return result;
    };
    /**
    * Re-execute the routing
    */
    Framework.Recall = function () {
        Framework.ExecuteRoute();
    };
    /**
     * Internal function used to re-route the URL to the right class and passing the parsed URL to the callback.
     */
    Framework.ExecuteRoute = function (reload) {
        if (reload === void 0) { reload = false; }
        if (!framework.HandleUrl)
            return;
        var url = Framework.ParseUrl();
        if (!url["action"])
            url["action"] = framework.DefaultModule;
        framework.CurrentUrl = url;
        var found = false;
        for (var i = 0; i < framework.Routing.length; i++) {
            if (framework.Routing[i].Action == url["action"]) {
                found = true;
                break;
            }
        }
        if (!found)
            url["action"] = framework.DefaultModule;
        Framework.RoutePage(url["action"], reload);
    };
    Framework.Rerun = function () {
        Framework.ExecuteRoute(true);
    };
    Framework.RoutePage = function (page, reload) {
        if (reload === void 0) { reload = false; }
        for (var i = 0; i < framework.Routing.length; i++) {
            if (framework.Routing[i].Action == page) {
                var isReady = true;
                if (framework.LastRoute != page || reload === true) {
                    if (framework.LastRoute != null) {
                        try {
                            window[framework.LastRoute].Dispose();
                        }
                        catch (ex) {
                            //alert(ex);
                        }
                    }
                    if ($("#" + framework.Routing[i].Action).length) {
                        $("#contentArea").html($("#" + framework.Routing[i].Action).html());
                        framework.LastRoute = page;
                    }
                    else if (framework.cachedTemplates[framework.Routing[i].Action]) {
                        $("#contentArea").html(framework.cachedTemplates[framework.Routing[i].Action]);
                        framework.LastRoute = page;
                    }
                    else {
                        isReady = false;
                        $.ajax({
                            type: "GET",
                            url: framework.RoutePrefix + framework.Routing[i].Action + "/Template.html",
                            success: function (msg) {
                                if (msg.toLocaleLowerCase().indexOf("<body>")) {
                                    var m = msg.match(/\<body\>((.|\n|\r)*)\<\/body\>/i);
                                    if (m && m[1])
                                        msg = m[1];
                                }
                                framework.cachedTemplates[framework.Routing[i].Action] = msg;
                                $("#contentArea").html(msg);
                                framework.LastRoute = page;
                                framework.CurrentHandler = page;
                                framework.Routing[i].Callback(framework.CurrentUrl);
                                document.dispatchEvent(framework.eventRouteCall);
                            }
                        });
                    }
                }
                if (isReady) {
                    framework.CurrentHandler = page;
                    framework.Routing[i].Callback(framework.CurrentUrl);
                    document.dispatchEvent(framework.eventRouteCall);
                }
                return;
            }
        }
    };
    /**
     * Changes the title of the page
     * @param title component added to the page title
     */
    Framework.SetTitle = function (title) {
        if (!title || title == "")
            document.title = "Dot World Maker";
        else
            document.title = "Dot World Maker - " + title;
    };
    Framework.MakeUrl = function (newData) {
        var s = "";
        var props = [];
        for (var i in newData)
            props.push(i);
        props.sort();
        for (var j = 0; j < props.length; j++) {
            if (!newData[props[j]] || newData[props[j]] == "")
                continue;
            if (s != "")
                s += "&";
            s += props[j] + "=" + encodeURIComponent(newData[props[j]]);
        }
        return s;
    };
    /**
     * Change the URL
     * @param newData should be a dictionary which will build hash part of the URL
     * @skipHandler will avoid to call the routing (by default it's true)
     */
    Framework.SetLocation = function (newData, skipHandler, replace) {
        if (skipHandler === void 0) { skipHandler = true; }
        if (replace === void 0) { replace = false; }
        // We need to compose it ourself
        if (isString(newData))
            newData = JSON.parse(newData);
        if (!newData['action'])
            newData['action'] = framework.CurrentHandler;
        framework.CurrentUrl = newData;
        newData = Framework.MakeUrl(newData);
        var oldUrl = "" + document.location;
        var url = ("" + document.location);
        if (url.indexOf("#") != -1)
            url = url.substr(0, url.indexOf("#"));
        if (skipHandler)
            framework.HandleUrl = false;
        url += "#" + newData;
        if (replace)
            document.location.replace(url);
        else
            document.location.assign(url);
        if (skipHandler) {
            setTimeout(function () {
                framework.HandleUrl = true;
            }, 100);
        }
        else if (oldUrl == url)
            Framework.ExecuteRoute();
    };
    /**
     * Set a callback in case the routing change
     */
    Framework.OnRouteCall = function (callback) {
        document.addEventListener("RouteCall", callback, false);
    };
    /**
     * Save the preference object to local storage
     */
    Framework.SavePreferences = function () {
        localStorage.setItem("preferences", JSON.stringify(framework.Preferences));
    };
    /**
     * Store the routings
     */
    Framework.AutoLinkRoutes = function () {
        for (var i in window) {
            try {
                if (i.substr(0, 3) != "web" && window[i] && window[i].Recover) {
                    if (!(window[i].IsAccessible && window[i].IsAccessible() == false))
                        framework.Routing.push(new Routing(i, window[i].Recover));
                }
            }
            catch (ex) {
            }
        }
    };
    /**
     * Store the gui parts
     */
    Framework.AutoLinkGuiParts = function () {
        for (var i in window) {
            try {
                if (i.substr(0, 3) != "web" && window[i] && window[i].GuiPart) {
                    var p = window[i].GuiPart();
                    if (p)
                        framework.GuiParts.push(p);
                }
            }
            catch (ex) {
            }
        }
        framework.GuiParts.sort(function (a, b) { return a.Position - b.Position; });
    };
    Framework.FixObjectDates = function (source) {
        var dest = JSON.parse(JSON.stringify(source));
        for (var i in dest) {
            if (source[i] instanceof Date)
                dest[i] = Framework.FullDateFormat(source[i]);
        }
        return dest;
    };
    Framework.NetDate = function (source) {
        return "/Date(" + source.getTime() + ")/";
    };
    Framework.DateFormat = function (source) {
        if (!source)
            return "";
        return source.getFullYear() + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + source.getDate()).padLeft("0", 2);
        //return ("" + source.getDate()).padLeft("0", 2) + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + source.getFullYear();
    };
    Framework.FullDateFormat = function (source) {
        if (!source)
            return "";
        return source.getFullYear() + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + source.getDate()).padLeft("0", 2) + " " +
            ("" + source.getHours()).padLeft("0", 2) + ":" + ("" + source.getMinutes()).padLeft("0", 2) + ":" + ("" + source.getSeconds()).padLeft("0", 2);
        /*return ("" + source.getDate()).padLeft("0", 2) + "/" + ("" + (source.getMonth() + 1)).padLeft("0", 2) + "/" + source.getFullYear() + " " +
            ("" + source.getHours()).padLeft("0", 2) + ":" + ("" + source.getMinutes()).padLeft("0", 2) + ":" + ("" + source.getSeconds()).padLeft("0", 2);*/
    };
    Framework.ParseDate = function (source) {
        if (!source || source == "")
            return null;
        if (source.charAt(source.length - 1) == "Z")
            return new Date(source);
        source = source.replace(/\./g, "/").replace(/\-/g, "/");
        if (source.charAt(2) == "/") {
            return new Date(parseInt(source.substr(6, 4)), parseInt(source.substr(3, 2)) - 1, parseInt(source.substr(0, 2)));
        }
        else if (source.charAt(4) == "/") {
            return new Date(parseInt(source.substr(0, 4)), parseInt(source.substr(5, 2)) - 1, parseInt(source.substr(8, 2)));
        }
        return new Date(parseInt(source));
    };
    /**
     * Calls all the InitFunction
     */
    Framework.CallInits = function () {
        for (var i in window) {
            try {
                if (i.substr(0, 3) != "web" && window[i] && window[i].InitFunction) {
                    window[i].InitFunction();
                }
            }
            catch (ex) {
            }
        }
    };
    Framework.HandleError = function (returnedError) {
        if (returnedError.status == 0)
            return "";
        try {
            var err = JSON.parse(returnedError.responseText);
            if (err.ExceptionType == "IV4.Backend.IvException") {
                var msg = err.Message;
                return msg.substr(msg.indexOf(":") + 1);
            }
            else {
                /*Framework.RoutePage("ErrorHandling");
                ErrorHandling.SetError(err.Message + "\n" + err.ExceptionType + "\n" + err.StackTrace);*/
                return "";
            }
        }
        catch (ex) {
            /*Framework.RoutePage("ErrorHandling");
            ErrorHandling.SetError(returnedError.responseText);*/
            return "";
        }
    };
    Framework.IsKeyPressed = function (code) {
        if (framework.keyPressed[code] === true)
            return true;
        return false;
    };
    Framework.RegisterKey = function (keyCode, callback) {
        framework.specialKeyHandling[keyCode] = callback;
    };
    Framework.keyDown = function (e) {
        e = e ? e : event;
        framework.keyPressed[e.keyCode] = true;
        //console.log(e.keyCode);
        if (framework.specialKeyHandling[e.keyCode]) {
            if (framework.specialKeyHandling[e.keyCode](e.keyCode) === true) {
                // Firefox
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                catch (er) {
                }
                // IE
                try {
                    e.cancelBubble = true;
                    e.returnValue = false;
                }
                catch (er) {
                }
                return false;
            }
        }
        else
            return true;
    };
    Framework.keyUp = function (e) {
        e = e ? e : event;
        framework.keyPressed[e.keyCode] = false;
        if (framework.specialKeyHandling[e.keyCode]) {
            // Firefox
            try {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            catch (er) {
            }
            // IE
            try {
                e.cancelBubble = true;
                e.returnValue = false;
            }
            catch (er) {
            }
            return false;
        }
        else
            return true;
    };
    Framework.Confirm = function (displayQuestion, yesCallback, noCallback) {
        if (noCallback === void 0) { noCallback = null; }
        framework.isPrompt = false;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").hide();
        $("#confirmYes").show().html("Yes");
        $("#confirmNo").show().html("No");
        $("#confirmLabel").html(displayQuestion);
        //$("#confirmDialog").css("top", "0px");
        $("#confirmDialog").animate({
            top: ($(window).height() / 2 - 50) + "px"
        }, 200);
        framework.yesCallback = yesCallback;
        framework.noCallback = noCallback;
    };
    Framework.Prompt = function (displayQuestion, defaultValue, yesCallback, noCallback, confirmLabel, cancelLabel) {
        if (noCallback === void 0) { noCallback = null; }
        if (confirmLabel === void 0) { confirmLabel = "Confirm"; }
        if (cancelLabel === void 0) { cancelLabel = "Cancel"; }
        framework.isPrompt = true;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").hide();
        $("#confirmYes").show().html(confirmLabel);
        $("#confirmNo").show().html(cancelLabel);
        $("#confirmLabel").html(displayQuestion + "<br><input type='text' id='promptField' value='" + (defaultValue ? defaultValue.htmlEntities() : "") + "'>");
        //$("#confirmDialog").css("top", "0px");
        $("#confirmDialog").animate({
            top: ($(window).height() / 2 - 50) + "px"
        }, 200, function () {
            $("#promptField").focus();
        });
        $("#promptField").focus();
        framework.yesCallback = yesCallback;
        framework.noCallback = noCallback;
    };
    Framework.Alert = function (displayLabel, okCallback) {
        if (okCallback === void 0) { okCallback = null; }
        framework.isPrompt = false;
        $("#backgroundConfirm").show();
        $("#confirmDialog").show();
        $("#confirmOk").show();
        $("#confirmYes").hide();
        $("#confirmNo").hide();
        $("#confirmLabel").html(displayLabel);
        $("#backgroundConfirm").bind("click", Framework.ConfirmOk);
        //$("#confirmDialog").css("top", "0px");
        try {
            $("#confirmDialog").animate({
                top: ($(window).height() / 2 - 50) + "px"
            }, 200);
        }
        catch (ex) {
        }
        framework.yesCallback = okCallback;
    };
    Framework.ShowMessage = function (displayText) {
        if (framework.MessageTimeout)
            clearTimeout(framework.MessageTimeout);
        $("#displayMessage").show().first().className = "displayMessageVisible";
        $("#displayMessageContent").html(displayText);
        framework.MessageTimeout = setTimeout(function () {
            $("#displayMessage").first().className = "displayMessageHidden";
            framework.MessageTimeout = setTimeout(function () {
                $("#displayMessage").hide();
                framework.MessageTimeout = null;
            }, 500);
        }, 5000);
    };
    Framework.ConfirmOk = function () {
        $("#backgroundConfirm").unbind("click", Framework.ConfirmOk);
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();
        if (framework.yesCallback)
            framework.yesCallback();
    };
    Framework.ConfirmYes = function () {
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();
        if (framework.isPrompt && framework.yesCallback)
            framework.yesCallback($("#promptField").val());
        else if (framework.yesCallback)
            framework.yesCallback();
    };
    Framework.ConfirmNo = function () {
        $("#backgroundConfirm").hide();
        $("#confirmDialog").hide();
        if (framework.noCallback)
            framework.noCallback();
    };
    Framework.ReloadPreferences = function () {
        framework.Preferences = {};
        if (localStorage.getItem("preferences") != null && localStorage.getItem("preferences") != undefined)
            framework.Preferences = JSON.parse(localStorage.getItem("preferences"));
    };
    Framework.SetRoutePrefix = function (prefix) {
        framework.RoutePrefix = prefix;
    };
    /**
     * Initialization of the framework.
     */
    Framework.Init = function (withExecuteRoute) {
        if (withExecuteRoute === void 0) { withExecuteRoute = true; }
        $(document).bind("keydown", Framework.keyDown);
        $(document).bind("keyup", Framework.keyUp);
        // Used to place the debugger at the start
        //alert("init");
        if (localStorage.getItem("preferences") != null && localStorage.getItem("preferences") != undefined)
            framework.Preferences = JSON.parse(localStorage.getItem("preferences"));
        framework.eventRouteCall = document.createEvent("Event");
        framework.eventRouteCall.initEvent("RouteCall", true, true);
        Framework.CallInits();
        Framework.AutoLinkRoutes();
        Framework.AutoLinkGuiParts();
        if (withExecuteRoute)
            Framework.ExecuteRoute();
        window.addEventListener("hashchange", function () {
            Framework.ExecuteRoute();
        });
    };
    return Framework;
}());
/// <reference path="../../../Common/Libs/Framework.ts" />
var listSelector = new ((function () {
    function class_22() {
        this.CurrentSelectors = {};
    }
    return class_22;
}()));
var ListSelector = (function () {
    /**
     * Creates a selection list (sorted) with search box.
     * @param HTML element id to put the list on (should be a div)
     * @param data source (an array or an object)
     * @param displayColumn (optional) the field name to display, valid only for an array source
     */
    function ListSelector(element, data, displayColumn) {
        this.Sort = true;
        listSelector[element] = this;
        this.element = element;
        this.data = data;
        this.displayColumn = displayColumn;
        if (displayColumn) {
            this.sortedDirect = [];
            for (var i = 0; i < data.length; i++)
                this.sortedDirect.push(i);
            this.sortedDirect.sort(function (a, b) {
                if (data[a][displayColumn] > data[b][displayColumn])
                    return 1;
                if (data[a][displayColumn] < data[b][displayColumn])
                    return -1;
                return 0;
            });
        }
        $("#" + this.element).addClass("listSelector");
        this.Render();
    }
    ListSelector.prototype.Dispose = function () {
        $("#" + this.element).html("");
        delete listSelector[this.element];
    };
    ListSelector.prototype.Rebind = function () {
        var _this = this;
        $("#list_selector_" + this.element).bind("keyup", function () {
            $("#display_list_selector_" + _this.element).html(_this.RenderList());
        });
    };
    ListSelector.prototype.Render = function () {
        var _this = this;
        var html = "";
        html += "<input type='text' id='list_selector_" + this.element + "' placeholder='Search...'>";
        html += "<div id='display_list_selector_" + this.element + "'>";
        html += this.RenderList();
        html += "</div>";
        $("#" + this.element).html(html);
        $("#list_selector_" + this.element).bind("keyup", function () {
            $("#display_list_selector_" + _this.element).html(_this.RenderList());
        });
    };
    ListSelector.prototype.UpdateList = function (newData) {
        if (newData)
            this.data = newData;
        else
            newData = this.data;
        if (this.displayColumn) {
            this.sortedDirect = [];
            for (var i = 0; i < this.data.length; i++)
                this.sortedDirect.push(i);
            var displayColumn = this.displayColumn;
            this.sortedDirect.sort(function (a, b) {
                if (newData[a][displayColumn] > newData[b][displayColumn])
                    return 1;
                if (newData[a][displayColumn] < newData[b][displayColumn])
                    return -1;
                return 0;
            });
        }
        $("#display_list_selector_" + this.element).html(this.RenderList());
    };
    ListSelector.prototype.RenderList = function () {
        var html = "";
        html += "<table>";
        var searchTxt = $("#list_selector_" + this.element).val();
        var search = (searchTxt ? searchTxt : "").trim().toLowerCase();
        if (this.displayColumn) {
            for (var i = 0; i < this.data.length; i++) {
                var val = "" + this.data[this.sortedDirect[i]][this.displayColumn];
                if (search && search != "" && (!val || val.toLowerCase().indexOf(search) == -1))
                    continue;
                html += "<tr id='display_list_selector_" + this.element + "_" + this.sortedDirect[i] + "' onclick='ListSelector.Find(\"" + this.element + "\").Select(" + this.sortedDirect[i] + ");'" + (this.selectedRow == this.sortedDirect[i] ? " class='listSelectorSelectedRow'" : "") + "><td>" + val + "</td></tr>";
            }
        }
        else {
            var names = [];
            for (var item in this.data)
                names.push(item);
            if (this.Sort)
                names.sort();
            for (var i = 0; i < names.length; i++) {
                var val = names[i];
                if (search && search != "" && (!val || val.toLowerCase().indexOf(search) == -1))
                    continue;
                html += "<tr id='display_list_selector_" + this.element + "_" + val.id() + "' onclick='ListSelector.Find(\"" + this.element + "\").Select(\"" + val + "\");'" + (this.selectedRow == val ? " class='listSelectorSelectedRow'" : "") + "><td>" + val + "</td></tr>";
            }
        }
        html += "</table>";
        return html;
    };
    ListSelector.Find = function (name) {
        return listSelector[name];
    };
    ListSelector.prototype.Select = function (row) {
        this.selectedRow = row;
        $("#display_list_selector_" + this.element + " tr").removeClass("listSelectorSelectedRow");
        if (this.displayColumn)
            $("#display_list_selector_" + this.element + "_" + row).addClass("listSelectorSelectedRow");
        else if (row !== null)
            $("#display_list_selector_" + this.element + "_" + row.id()).addClass("listSelectorSelectedRow");
        if (this.OnSelect)
            this.OnSelect(row);
    };
    return ListSelector;
}());
/// <reference path="../../../Common/Libs/MiniQuery.ts"/>
/// <reference path="../../../Common/Libs/Framework.ts"/>
var MenuItem = (function () {
    function MenuItem(label, link) {
        this.Label = label;
        this.Link = link;
    }
    return MenuItem;
}());
var menubarStatic = new ((function () {
    function class_23() {
        this.previousItem = null;
        this.KnownItems = [];
        this.hoverHideTimer = null;
    }
    return class_23;
}()));
var Menubar = (function () {
    function Menubar() {
    }
    Menubar.InitFunction = function () {
        var menu = document.getElementById("menubar");
        if (!menu)
            return;
        /*var pos = 5;
        for (var i = 0; i < menu.children.length; i++)
        {
            var item: HTMLElement = <HTMLElement>menu.children[i];
            item.style.left = pos + "px";
            pos += $(item).width();
        }*/
        $("#menubar a").bind("dragstart", function () { return false; }).bind("drop", function () { return false; });
        $("#hideMenu").mouseover(Menubar.HoverHideMenus).mouseout(Menubar.StopHoverHideMenus);
        $("#searchPanel").mouseover(Menubar.HoverHideMenus);
        for (var i = 0; i < menu.children.length; i++) {
            var item = menu.children[i];
            if (item.children.length > 0) {
                item.onmouseover = function () {
                    var currentSubmenu = item.children[0];
                    return function () {
                        if (menubarStatic.previousItem == currentSubmenu.textContent)
                            return;
                        Menubar.HideMenus();
                        menubarStatic.previousItem = currentSubmenu.textContent;
                        $("#hideMenu").show();
                        $(currentSubmenu).show();
                    };
                }();
                Menubar.HookSubmenu(item.children[0]);
            }
            else
                item.onmouseover = Menubar.HideMenus;
        }
        Menubar.ExtractItems();
    };
    Menubar.ExtractItems = function (menuItem) {
        if (menuItem === void 0) { menuItem = null; }
        if (!menuItem) {
            menubarStatic.KnownItems = [];
            menuItem = document.getElementById("menubar");
        }
        for (var i = 0; i < menuItem.children.length; i++) {
            var item = menuItem.children[i];
            if (item.children.length > 0) {
                //if($(item).is(":visible"))
                if (item.style.display !== "none")
                    Menubar.ExtractItems(item.children[0]);
            }
            else if (item.style.display !== "none") {
                var n = new MenuItem((item.attributes["label"] ? item.attributes["label"].textContent : item.textContent), (item.attributes["href"] ? item.attributes["href"].textContent : ""));
                if (item.onclick && (!n.Link || n.Link == "" || n.Link == "#"))
                    n.Link = item.onclick;
                menubarStatic.KnownItems.push(n);
            }
            if (item.tagName.toLowerCase() == "a") {
                $(item).bind("click", function () {
                    $("#hideMenu").hide();
                    Menubar.HideMenus();
                });
            }
        }
    };
    Menubar.HookSubmenu = function (menuItem) {
        for (var i = 0; i < menuItem.children.length; i++) {
            var item = menuItem.children[i];
            if (item.children.length > 0) {
                item.onmouseover = function () {
                    var child = item.children[0];
                    $(child).addClass("childMenuBar");
                    return function (e) {
                        $("#menubar .childMenuBar").hide();
                        $(child).show();
                        e.stopPropagation();
                    };
                }();
            }
            else
                item.onmouseover = function () {
                    $("#menubar .childMenuBar").hide();
                };
        }
    };
    Menubar.HideMenus = function () {
        menubarStatic.previousItem = null;
        menubarStatic.hoverHideTimer = null;
        $("#hideMenu").hide();
        $("#menubar > div > div").hide();
        $("#menubar .childMenuBar").hide();
    };
    Menubar.HoverHideMenus = function () {
        if (menubarStatic.hoverHideTimer)
            clearTimeout(menubarStatic.hoverHideTimer);
        menubarStatic.hoverHideTimer = setTimeout(Menubar.HideMenus, 500);
    };
    Menubar.StopHoverHideMenus = function () {
        if (menubarStatic.hoverHideTimer)
            clearTimeout(menubarStatic.hoverHideTimer);
        menubarStatic.hoverHideTimer = null;
    };
    /**
     * Allows to disable a menu entry
     * @param menuPath searched path in the form Main>Child>SubChild
     */
    Menubar.DisableMenu = function (menuPath, menuSection, currentPath) {
        if (menuSection === void 0) { menuSection = null; }
        if (currentPath === void 0) { currentPath = ""; }
        if (!menuSection)
            menuSection = document.getElementById("menubar");
        for (var i = 0; i < menuSection.children.length; i++) {
            var t = menuSection.children[i].textContent.trim();
            var p = currentPath + t.split('\n')[0];
            if (p == menuPath) {
                $(menuSection.children[i]).hide();
                Menubar.ExtractItems();
                return true;
            }
            else if (menuSection.children[i].children.length > 0) {
                var r = Menubar.DisableMenu(menuPath, menuSection.children[i].children[0], p + ">");
                if (r == true)
                    return true;
            }
        }
        return false;
    };
    /**
     * Allows to enable a menu entry
     * @param menuPath searched path in the form Main>Child>SubChild
     */
    Menubar.EnableMenu = function (menuPath, menuSection, currentPath) {
        if (menuSection === void 0) { menuSection = null; }
        if (currentPath === void 0) { currentPath = ""; }
        if (!menuSection)
            menuSection = document.getElementById("menubar");
        for (var i = 0; i < menuSection.children.length; i++) {
            var t = menuSection.children[i].textContent.trim();
            var p = currentPath + t.split('\n')[0];
            if (p == menuPath) {
                $(menuSection.children[i]).show();
                Menubar.ExtractItems();
                return true;
            }
            else if (menuSection.children[i].children.length > 0) {
                var r = Menubar.EnableMenu(menuPath, menuSection.children[i].children[0], p + ">");
                if (r == true)
                    return true;
            }
        }
        return false;
    };
    return Menubar;
}());
var messageMenu = new ((function () {
    function class_24() {
        this.messageDisplayed = false;
        this.firstInit = true;
        this.selectedMessage = null;
        this.nonRead = 0;
        this.attachments = null;
    }
    return class_24;
}()));
var MessageMenu = (function () {
    function MessageMenu() {
    }
    MessageMenu.AdditionalCSS = function () {
        return "#messageIcon\n\
{\n\
    position: absolute;\n\
    left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 330px;\n\
}\n\
#messageIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    };
    MessageMenu.Init = function (position) {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo" || game) {
            $("#messageIcon").hide();
            return position;
        }
        $("#messageIcon").css("top", position + "px");
        $("#messageIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/message_icon.png'><div>10</div>");
        $("#messageIcon div.gamePanelContentNoHeader > div").html("0").hide();
        if (messageMenu.firstInit && chat.socket) {
            messageMenu.firstInit = false;
            chat.socket.on('new_message', function () {
                for (var i = 0; i < world.Codes.length; i++) {
                    if (world.Codes[i].Enabled === false)
                        continue;
                    if (!world.Codes[i].code)
                        world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                    if (world.Codes[i].code.HasFunction("OnPrivateMessage"))
                        world.Codes[i].code.ExecuteFunction("OnPrivateMessage", []);
                }
                MessageMenu.CheckCounter();
                MessageMenu.UpdateReceived();
            });
        }
        MessageMenu.CheckCounter();
        return position + 64 + world.art.panelStyle.topBorder;
    };
    MessageMenu.CheckCounter = function () {
        $.ajax({
            type: 'POST',
            url: '/backend/CheckNewGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data) {
                    messageMenu.nonRead = data;
                    $("#messageIcon div.gamePanelContentNoHeader > div").html(data).show();
                }
                else {
                    $("#messageIcon div.gamePanelContentNoHeader > div").html("0").hide();
                }
            },
            error: function (msg) {
            }
        });
    };
    MessageMenu.Toggle = function () {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo")
            return;
        $("#inventoryIcon").removeClass("openPanelIcon");
        inventoryMenu.inventoryDisplayed = false;
        $("#profileIcon").removeClass("openPanelIcon");
        profileMenu.profileDisplayed = false;
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;
        if (messageMenu.messageDisplayed) {
            $("#gameMenuPanel").hide();
            $("#messageIcon").removeClass("openPanelIcon");
            messageMenu.messageDisplayed = false;
        }
        else {
            messageMenu.messageDisplayed = true;
            $("#gameMenuPanel").show();
            $("#messageIcon").addClass("openPanelIcon");
            MessageMenu.Update();
        }
    };
    MessageMenu.Update = function () {
        var html = "";
        html += "<table class='panelContentTableWithHeader'>";
        html += "<thead><tr><td>Date</td><td>Sender</td><td>Subject</td></tr></thead>";
        html += "</table>";
        html += "<div id='messageList'>";
        html += "</div>";
        html += "<div id='messageDetails'></div>";
        $("#gameMenuPanelContent").html(html);
        MessageMenu.UpdateReceived();
        MessageMenu.ShowCompose();
    };
    MessageMenu.UpdateReceived = function () {
        if (!messageMenu.messageDisplayed)
            return;
        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessageList',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
            },
            success: function (msg) {
                var data = TryParse(msg);
                var html = "";
                if (data) {
                    html += "<table>";
                    for (var i = 0; i < data.length; i++) {
                        html += "<tr onclick='MessageMenu.Read(" + data[i].id + ");' class='" + (data[i].newMessage ? "newMessage" : "") + (messageMenu.selectedMessage == data[i].id ? " panelContentSelected" : "") + "'>";
                        html += "<td>" + Main.FormatDateTime(data[i].sentDate) + "</td><td>" + data[i].from + "</td><td>" + data[i].subject + "</td>";
                        html += "</tr>";
                    }
                    html += "</table>";
                }
                $("#messageList").html(html);
            },
            error: function (msg) {
            }
        });
    };
    MessageMenu.Read = function (id) {
        messageMenu.selectedMessage = id;
        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: function (msg) {
                var data = TryParse(msg);
                var html = "";
                if (data) {
                    if (data.isNew === true) {
                        MessageMenu.CheckCounter();
                        MessageMenu.UpdateReceived();
                        if (data.attachments) {
                            var attachments = TryParse(data.attachments);
                            if (attachments && attachments.length > 0)
                                for (var i = 0; i < attachments.length; i++) {
                                    world.Player.AddItem(attachments[i].name, attachments[i].quantity);
                                }
                        }
                    }
                    html += "<table>";
                    html += "<tr><td>From:</td><td>" + ("" + data.from).htmlEntities() + "</td></tr>";
                    html += "<tr><td>To:</td><td>" + ("" + data.to).htmlEntities() + "</td></tr>";
                    html += "<tr><td>Date:</td><td>" + Main.FormatDateTime(data.sentDate) + "</td></tr>";
                    html += "<tr><td>Subject:</td><td>" + ("" + data.subject).htmlEntities() + "</td></tr>";
                    html += "<tr><td>Message:</td><td>" + Main.TextTransform("" + data.message) + "</td></tr>";
                    if (data.attachments) {
                        var attachments = TryParse(data.attachments);
                        if (attachments && attachments.length > 0)
                            html += "<tr><td>Attachments:</td><td>";
                        for (var i = 0; i < attachments.length; i++) {
                            html += "" + attachments[i].quantity + "x " + attachments[i].name + "<br>";
                        }
                        html += "</td></tr>";
                    }
                    html += "</table>";
                    html += "<center>";
                    html += "<div class='gameButton' onclick='MessageMenu.ShowCompose()'>New</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Reply(" + id + ")'>Reply</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Delete(" + id + ")'>Delete</div>";
                    html + "</center>";
                }
                $("#messageDetails").html(html);
            },
            error: function (msg) {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    };
    MessageMenu.Reply = function (id) {
        $.ajax({
            type: 'POST',
            url: '/backend/GetGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: function (msg) {
                var data = TryParse(msg);
                var html = "";
                if (data) {
                    messageMenu.selectedMessage = null;
                    MessageMenu.CheckCounter();
                    MessageMenu.UpdateReceived();
                    html += "<table>";
                    var dest = data.to.replace(/,/g, ";").replace(/ /g, "").split(';');
                    for (var i = 0; i < dest.length; i++)
                        if (dest[i].toLowerCase() == world.Player.Username.toLowerCase())
                            dest[i] = data.from;
                    dest = dest.join(", ");
                    html += "<tr><td>To:</td><td><input type='text' id='message_to' value='" + dest.htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
                    html += "<tr><td>Subject:</td><td><input type='text' id='message_subject' value='" + ("Re: " + data.subject.replace(/^re: /i, "")).htmlEntities() + "' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
                    html += "<tr><td>Message:</td><td>&nbsp;</td></tr>";
                    html += "<tr><td colspan='2'><textarea id='message_text' rows='10' onfocus='play.inField=true;' onblur='play.inField=false;'>\n\n\n" + data.message.replace(/<\//gi, "").replace(/^/gm, "> ") + "</textarea></td></tr>";
                    html += "<tr><td>Attach:</td><td colspan='2'><select onchange='MessageMenu.Attach()' id='new_attach'><option>-- Select an item to attach --</option>";
                    for (var i = 0; i < world.Player.Inventory.length; i++) {
                        var canShow = true;
                        if (messageMenu.attachments)
                            for (var j = 0; j < messageMenu.attachments.length; j++) {
                                if (messageMenu.attachments[j].name == world.Player.Inventory[i].Name) {
                                    canShow = false;
                                    break;
                                }
                            }
                        if (!canShow)
                            continue;
                        html += "<option value='" + encodeURIComponent(world.Player.Inventory[i].Name) + "'>" + world.Player.Inventory[i].Name + " (" + world.Player.Inventory[i].Count + ")</option>";
                    }
                    html += "</select></td></tr>";
                    html += "</table>";
                    html += "<center>";
                    html += "<div class='gameButton' onclick='MessageMenu.ShowCompose()'>New</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Send()'>Send</div>";
                    html += "<div class='gameButton' onclick='MessageMenu.Read(" + id + ")'>Cancel</div>";
                    html + "</center>";
                    setTimeout(function () {
                        $("#message_text").focus();
                    }, 100);
                }
                $("#messageDetails").html(html);
            },
            error: function (msg) {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    };
    MessageMenu.Delete = function (id) {
        $.ajax({
            type: 'POST',
            url: '/backend/DeleteGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                id: id
            },
            success: function (msg) {
                messageMenu.selectedMessage = null;
                MessageMenu.CheckCounter();
                MessageMenu.UpdateReceived();
                MessageMenu.ShowCompose();
            },
            error: function (msg) {
                var data = TryParse(msg);
                $("#messageDetails").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    };
    MessageMenu.ShowCompose = function () {
        messageMenu.selectedMessage = null;
        MessageMenu.UpdateReceived();
        var html = "<div id='messageResult'></div><table>";
        html += "<tr><td>To:</td><td colspan='2'><input type='text' id='message_to' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "<tr><td>Subject:</td><td colspan='2'><input type='text' id='message_subject' onfocus='play.inField=true;' onblur='play.inField=false;'></td></tr>";
        html += "<tr><td>Message:</td><td colspan='2'>&nbsp;</td></tr>";
        html += "<tr><td colspan='3'><textarea id='message_text' rows='10' onfocus='play.inField=true;' onblur='play.inField=false;'></textarea></td></tr>";
        if (messageMenu.attachments && messageMenu.attachments.length > 0) {
            html += "<tr><td>Attachments:</td><td>&nbsp;</td><td>&nbsp;</td></tr>";
            for (var i = 0; i < messageMenu.attachments.length; i++) {
                html += "<tr><td>&nbsp;</td><td>";
                html += "<div class='removeAttachement' onclick='MessageMenu.RemoveAttachment(" + i + ");'>X</div>";
                html += messageMenu.attachments[i].name + " (" + world.Player.GetInventoryQuantity(messageMenu.attachments[i].name) + ")</td>";
                html += "<td><input type='text' id='attach_" + i + "' value='" + messageMenu.attachments[i].quantity + "' onfocus='play.inField=true;' onblur='play.inField=false;' onkeyup='MessageMenu.ChangeAttach(" + i + ")'></tr>";
            }
            html += "</td></tr>";
        }
        html += "<tr><td>Attach:</td><td colspan='2'><select onchange='MessageMenu.Attach()' id='new_attach'><option>-- Select an item to attach --</option>";
        for (var i = 0; i < world.Player.Inventory.length; i++) {
            var canShow = true;
            if (messageMenu.attachments)
                for (var j = 0; j < messageMenu.attachments.length; j++) {
                    if (messageMenu.attachments[j].name == world.Player.Inventory[i].Name) {
                        canShow = false;
                        break;
                    }
                }
            if (!canShow)
                continue;
            html += "<option value='" + encodeURIComponent(world.Player.Inventory[i].Name) + "'>" + world.Player.Inventory[i].Name + " (" + world.Player.Inventory[i].Count + ")</option>";
        }
        html += "</select></td></tr>";
        html += "</table>";
        html += "<center><div class='gameButton' onclick='MessageMenu.Send()'>Send</div></center>";
        $("#messageDetails").html(html);
        setTimeout(function () {
            $("#message_to").focus();
        }, 100);
    };
    MessageMenu.RemoveAttachment = function (rowId) {
        var to = $("#message_to").val();
        var subject = $("#message_subject").val();
        var message = $("#message_text").val();
        messageMenu.attachments.splice(rowId, 1);
        MessageMenu.ShowCompose();
        $("#message_to").val(to);
        $("#message_subject").val(subject);
        $("#message_text").val(message);
    };
    MessageMenu.Attach = function () {
        var to = $("#message_to").val();
        var subject = $("#message_subject").val();
        var message = $("#message_text").val();
        if (!messageMenu.attachments)
            messageMenu.attachments = [];
        messageMenu.attachments.push({
            name: decodeURIComponent($("#new_attach").val()),
            quantity: 1
        });
        MessageMenu.ShowCompose();
        $("#message_to").val(to);
        $("#message_subject").val(subject);
        $("#message_text").val(message);
    };
    MessageMenu.ChangeAttach = function (rowId) {
        $("#attach_" + rowId).css("background-color", "");
        var val = 0;
        try {
            val = parseInt($("#attach_" + rowId).val());
        }
        catch (ex) {
            $("#attach_" + rowId).css('backgroundColor', '#FFE0E0');
        }
        if (val <= 0 || world.Player.GetInventoryQuantity(messageMenu.attachments[rowId].name) < val) {
            $("#attach_" + rowId).css('backgroundColor', '#FFE0E0');
            val = 0;
        }
        messageMenu.attachments[rowId].quantity = val;
    };
    MessageMenu.Send = function () {
        if (messageMenu.attachments) {
            for (var i = 0; i < messageMenu.attachments.length; i++) {
                if (world.Player.GetInventoryQuantity(messageMenu.attachments[i].name) < messageMenu.attachments[i].quantity) {
                    $("#messageResult").html("Error: you don't have " + messageMenu.attachments[i].quantity + " " + messageMenu.attachments[i].name);
                    return;
                }
            }
        }
        $.ajax({
            type: 'POST',
            url: '/backend/AddGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                to: $("#message_to").val(),
                subject: $("#message_subject").val() && $("#message_subject").val().trim() != "" ? $("#message_subject").val() : "(no subject)",
                message: $("#message_text").val(),
                attachments: JSON.stringify(messageMenu.attachments ? messageMenu.attachments : null)
            },
            success: function (msg) {
                if (messageMenu.attachments && messageMenu.attachments.length > 0) {
                    $("#messageDetails table tr:nth-child(5)").remove();
                    for (var i = 0; i < messageMenu.attachments.length; i++) {
                        world.Player.RemoveItem(messageMenu.attachments[i].name, messageMenu.attachments[i].quantity);
                        $("#messageDetails table tr:nth-child(5)").remove();
                    }
                }
                messageMenu.attachments = null;
                $("#messageResult").html("Message sent successfully");
                $("#message_to").val("");
                $("#message_subject").val("");
                $("#message_text").val("");
            },
            error: function (msg) {
                var data = TryParse(msg);
                $("#messageResult").html("Error: " + (data && data.error ? data.error : msg));
            }
        });
    };
    MessageMenu.SendMessage = function (destination, subject, message) {
        if (!framework.Preferences['token'] || (world && world.ShowMessage === false) || framework.Preferences['token'] == "demo" || game) {
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/AddGameMessage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                to: destination,
                subject: subject,
                message: message
            },
            success: function (msg) {
            },
            error: function (msg) {
            }
        });
    };
    return MessageMenu;
}());
var profileMenu = new ((function () {
    function class_25() {
        this.profileDisplayed = false;
    }
    return class_25;
}()));
var ProfileMenu = (function () {
    function ProfileMenu() {
    }
    ProfileMenu.AdditionalCSS = function () {
        return "#profileIcon\n\
{\n\
    position: absolute;\n\
    left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
    top: 165px;\n\
}\n\
#profileIcon .gamePanelContentNoHeader\n\
{\n\
    width: 74px;\n\
}\n\
";
    };
    ProfileMenu.Init = function (position) {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowStats === false))) {
            $("#profileIcon").hide();
            return position;
        }
        $("#profileIcon").css("top", position + "px");
        if (game)
            $("#profileIcon .gamePanelContentNoHeader").html("<img src='art/tileset2/profile_icon.png'><div>+</div>");
        else
            $("#profileIcon .gamePanelContentNoHeader").html("<img src='/art/tileset2/profile_icon.png'><div>+</div>");
        if (!ProfileMenu.HasToUpgrade())
            $("#profileIcon div.gamePanelContentNoHeader > div").hide();
        return position + 64 + world.art.panelStyle.topBorder;
    };
    ProfileMenu.Toggle = function () {
        if (!game && ((!framework.Preferences['token'] && !Main.CheckNW()) || (world && world.ShowStats === false)))
            return;
        inventoryMenu.inventoryDisplayed = false;
        $("#inventoryIcon").removeClass("openPanelIcon");
        messageMenu.messageDisplayed = false;
        $("#messageIcon").removeClass("openPanelIcon");
        $("#journalIcon").removeClass("openPanelIcon");
        journalMenu.journalDisplayed = false;
        if (profileMenu.profileDisplayed) {
            $("#gameMenuPanel").hide();
            $("#profileIcon").removeClass("openPanelIcon");
            profileMenu.profileDisplayed = false;
        }
        else {
            profileMenu.profileDisplayed = true;
            $("#gameMenuPanel").show();
            $("#profileIcon").addClass("openPanelIcon");
            ProfileMenu.Update();
        }
    };
    ProfileMenu.HasToUpgrade = function () {
        for (var i = 0; i < world.Player.Stats.length; i++) {
            if (world.Player.Stats[i].BaseStat.CodeVariable('PlayerVisible') === "false")
                continue;
            var res = world.Player.Stats[i].BaseStat.InvokeFunction("CanUpgrade", []);
            if (res && res.GetBoolean() == true)
                return true;
        }
        return false;
    };
    ProfileMenu.Update = function () {
        if (ProfileMenu.HasToUpgrade())
            $("#profileIcon div.gamePanelContentNoHeader > div").show();
        else
            $("#profileIcon div.gamePanelContentNoHeader > div").hide();
        if (!profileMenu.profileDisplayed)
            return;
        var html = "";
        html = "<h1>Profile<h1>";
        html += "<h2>Stats</h2>";
        html += "<table class='profileList'>";
        html += "<thead><tr><td>Name:</td><td>Value:</td><td>Max:</td><td>&nbsp;</td></tr></thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Stats.length; i++) {
            if (world.Player.Stats[i].BaseStat.CodeVariable('PlayerVisible') === "false")
                continue;
            html += "<tr>";
            html += "<td>" + (world.Player.Stats[i].BaseStat.CodeVariable('DisplayName') ? world.Player.Stats[i].BaseStat.CodeVariable('DisplayName') : world.Player.Stats[i].Name).htmlEntities() + "</td>";
            html += "<td>" + world.Player.Stats[i].Value + "</td>";
            html += "<td>" + (world.Player.GetStatMaxValue(world.Player.Stats[i].Name) ? world.Player.GetStatMaxValue(world.Player.Stats[i].Name) : "&nbsp;") + "</td>";
            var res = world.Player.Stats[i].BaseStat.InvokeFunction("CanUpgrade", []);
            if (res && res.GetBoolean() == true)
                html += "<td><div class='gameButton' onclick='ProfileMenu.UpgradeStat(\"" + world.Player.Stats[i].Name + "\")')>+</div></td>";
            else
                html += "<td>&nbsp;</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        html += "<h2>Skills</h2>";
        html += "<table class='profileList'>";
        html += "<thead><tr><td>Name:</td><td>Level:</td><td>&nbsp;</td></tr></thead>";
        html += "<tbody>";
        for (var i = 0; i < world.Player.Skills.length; i++) {
            html += "<tr>";
            html += "<td>" + (world.Player.Skills[i].BaseSkill.CodeVariable('DisplayName') ? world.Player.Skills[i].BaseSkill.CodeVariable('DisplayName') : world.Player.Skills[i].Name).htmlEntities() + "</td><td>" + (world.Player.Skills[i].Level ? ("" + world.Player.Skills[i].Level).htmlEntities() : "&nbsp;") + "</td>";
            html += "<td>";
            if (world.Player.Skills[i].BaseSkill.CodeVariable("Quickslot") == "true" && world.Player.Skills[i].BaseSkill.CodeVariable("QuickslotEditable") !== "false")
                html += "<div class='gameButton' onclick='ProfileMenu.Quickslot(\"" + world.Player.Skills[i].Name.htmlEntities() + "\");'>Quickslot</div>";
            else
                html += "&nbsp;";
            html += "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        html += "<br><br>";
        html += "<center><div class='gameButton' onclick='ProfileMenu.ResetPlayer();'>Reset your player</div></center>";
        $("#gameMenuPanelContent").html(html);
    };
    ProfileMenu.DoResetPlayer = function () {
        if (Main.CheckNW()) {
            var saves = {};
            if (framework.Preferences['gameSaves'])
                saves = JSON.parse(framework.Preferences['gameSaves']);
            delete saves["S" + world.Id];
            framework.Preferences['gameSaves'] = JSON.stringify(saves);
            Framework.SavePreferences();
            world.Init();
            Main.GenerateGameStyle();
            world.ResetAreas();
            world.ResetGenerator();
            Framework.Rerun();
            return;
        }
        if (!framework.Preferences['token'] || framework.Preferences['token'] == "demo") {
            document.location.reload();
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/ResetPlayer',
            data: {
                game: world.Id,
                token: framework.Preferences['token']
            },
            success: function (msg) {
                document.location.reload();
            },
            error: function (msg, textStatus) {
                if (msg.d && msg.d.error)
                    Framework.ShowMessage(msg.d.error);
                else
                    Framework.ShowMessage(msg);
            }
        });
    };
    ProfileMenu.ResetPlayer = function () {
        Framework.Confirm("Are you sure you want to reset your player? You lose all the stats, items, and quests and start as a fresh new player.", ProfileMenu.DoResetPlayer);
    };
    ProfileMenu.UpgradeStat = function (statName) {
        var res = world.Player.FindStat(statName).BaseStat.InvokeFunction("CanUpgrade", []);
        if (!res || res.GetBoolean() !== true)
            return;
        world.Player.SetStat(statName, world.Player.GetStat(statName) + 1);
        //world.Player.FindStat(statName).Value++;
        ProfileMenu.Update();
    };
    ProfileMenu.Quickslot = function (skillName) {
        profileMenu.profileDisplayed = false;
        var html = "<h1>Quickslot</h1>";
        for (var i = 0; i < 10; i++) {
            var q = world.Player.QuickSlot[i];
            var skill = null;
            if (!q)
                q = "-- Empty --";
            else if (q.substring(0, 2) == "S/") {
                var skill = world.GetSkill(q.substring(2));
                q = "Skill " + q.substring(2).title().htmlEntities();
            }
            else
                q = "Item " + q.substring(2).title().htmlEntities();
            if (skill && skill.CodeVariable("QuickslotEditable") === "false") {
                html += "Slot " + (i + 1) + " " + q + "<br>";
            }
            else
                html += "<div class='gameButton' onclick='ProfileMenu.SetQuickslot(\"" + skillName.htmlEntities() + "\"," + i + ");'>Slot " + (i + 1) + "</div>" + q + "<br>";
        }
        html += "<center><div class='gameButton' onclick='ProfileMenu.Show();'>Cancel</div></center>";
        $("#gameMenuPanelContent").html(html);
    };
    ProfileMenu.Show = function () {
        profileMenu.profileDisplayed = true;
        ProfileMenu.Update();
    };
    ProfileMenu.SetQuickslot = function (skillName, slotId) {
        for (var i = 0; i < 10; i++)
            if (world.Player.QuickSlot[i] == "S/" + skillName)
                world.Player.QuickSlot[i] = null;
        world.Player.QuickSlot[slotId] = "S/" + skillName;
        world.Player.StoredCompare = world.Player.JSON();
        world.Player.Save();
        ProfileMenu.Show();
    };
    return ProfileMenu;
}());
var PublicViewPlayer = (function () {
    function PublicViewPlayer() {
    }
    PublicViewPlayer.Show = function (name) {
        $.ajax({
            type: 'POST',
            url: '/backend/PublicViewPlayer',
            data: {
                game: world.Id,
                name: name
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (!data)
                    return;
                $("#npcDialog").show();
                $("#npcDialog .gamePanelHeader").html("View: " + name.htmlEntities());
                var html = "";
                html += "<table>";
                html += "<tr><td>Name:</td><td>" + ("" + data.name).htmlEntities() + "</td></tr>";
                html += "<tr><td>X:</td><td>" + ("" + data.x).htmlEntities() + "</td></tr>";
                html += "<tr><td>Y:</td><td>" + ("" + data.x).htmlEntities() + "</td></tr>";
                html += "<tr><td>Zone:</td><td>" + ("" + data.zone).htmlEntities() + "</td></tr>";
                html += "</table>";
                html += "<h3>Equiped with</h3>";
                var items = [];
                for (var item in data.equipedObjects)
                    items.push(data.equipedObjects[item]);
                items.sort();
                for (var i = 0; i < items.length; i++)
                    html += ("" + items[i].Name).htmlEntities() + "<br>";
                html += "<h3>Stats</h3>";
                html += "<table>";
                data.stats.sort(function (a, b) {
                    if (a.Name > b.Name)
                        return 1;
                    if (a.Name < b.Name)
                        return -1;
                    return 0;
                });
                for (var i = 0; i < data.stats.length; i++) {
                    var stat = world.GetStat(data.stats[i].Name);
                    if (!stat)
                        continue;
                    if (stat.CodeVariable("PlayerVisible") === "false")
                        continue;
                    html += "<tr><td>" + ("" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : stat.Name)).htmlEntities() + "</td><td>" + ("" + data.stats[i].Value).htmlEntities() + "</td></tr>";
                }
                html += "<h3>Skills</h3>";
                data.skills.sort(function (a, b) {
                    if (a.Name > b.Name)
                        return 1;
                    if (a.Name < b.Name)
                        return -1;
                    return 0;
                });
                for (var i = 0; i < data.skills.length; i++) {
                    var skill = world.GetSkill(data.skills[i].Name);
                    if (!skill)
                        continue;
                    html += ("" + (skill.CodeVariable("DisplayName") ? skill.CodeVariable("DisplayName") : skill.Name)).htmlEntities() + "<br>";
                }
                $("#dialogSentence").html(html);
                play.onDialogPaint = [];
                $("#dialogAnswers").html("<div onclick='PublicViewPlayer.Close();' class='gameButton'>Close</div>");
            },
            error: function (msg, textStatus) {
            }
        });
    };
    PublicViewPlayer.Close = function () {
        $("#npcDialog").hide();
    };
    return PublicViewPlayer;
}());
var codeEditor = new ((function () {
    function class_26() {
        this.hideHelpTimer = null;
        this.currentEditor = null;
        this.currentSelection = null;
        this.currentList = null;
        this.currentSelectedCompletion = null;
        this.currentTextToTheEnd = null;
    }
    return class_26;
}()));
var CodeEditor = (function () {
    function CodeEditor() {
    }
    CodeEditor.Create = function (element) {
        var editor = CodeMirror.fromTextArea($("#" + element).first(), {
            lineNumbers: true,
            matchBrackets: true,
            continueComments: "Enter",
            showCursorWhenSelecting: true,
            tabSize: 4,
            indentUnit: 4
        });
        codeEditor.currentEditor = editor;
        editor.on("blur", function () {
            if (codeEditor.hideHelpTimer) {
                clearTimeout(codeEditor.hideHelpTimer);
                codeEditor.hideHelpTimer = null;
            }
            codeEditor.hideHelpTimer = setTimeout(function () { CodeEditor.HideHelp(element); }, 500);
        });
        editor.setOption("extraKeys", {
            "Enter": function () {
                if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null) {
                    CodeEditor.Add(codeEditor.currentList[codeEditor.currentSelectedCompletion]);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                return CodeMirror.Pass;
            },
            "Tab": function () {
                if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null) {
                    CodeEditor.Add(codeEditor.currentList[codeEditor.currentSelectedCompletion]);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                return CodeMirror.Pass;
            },
            "Up": function () {
                if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null && codeEditor.currentList[0].indexOf(".") != -1) {
                    codeEditor.currentSelectedCompletion--;
                    if (codeEditor.currentSelectedCompletion < 0)
                        codeEditor.currentSelectedCompletion = codeEditor.currentList.length - 1;
                    CodeEditor.UpdateList(element);
                    $("#codeHelp_" + element + " .selectedInsertion").first().scrollIntoView();
                    return false;
                }
                return CodeMirror.Pass;
            },
            "Down": function () {
                if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null && codeEditor.currentList[0].indexOf(".") != -1) {
                    codeEditor.currentSelectedCompletion++;
                    if (codeEditor.currentSelectedCompletion >= codeEditor.currentList.length)
                        codeEditor.currentSelectedCompletion = 0;
                    CodeEditor.UpdateList(element);
                    $("#codeHelp_" + element + " .selectedInsertion").first().scrollIntoView();
                    return false;
                }
                return CodeMirror.Pass;
            },
            "Esc": function () {
                if (codeEditor.hideHelpTimer) {
                    if (codeEditor.hideHelpTimer) {
                        clearTimeout(codeEditor.hideHelpTimer);
                        codeEditor.hideHelpTimer = null;
                    }
                    CodeEditor.HideHelp(element);
                    return false;
                }
                return CodeMirror.Pass;
            },
            "Ctrl-Q": "toggleComment"
        });
        editor.on("cursorActivity", function () {
            codeEditor.currentList = null;
            codeEditor.currentSelectedCompletion = null;
            if (codeEditor.hideHelpTimer) {
                clearTimeout(codeEditor.hideHelpTimer);
                codeEditor.hideHelpTimer = null;
            }
            var line = editor.getCursor().line;
            var char = editor.getCursor().ch;
            var code = editor.getValue();
            var lines = code.split('\n');
            if (lines[line]) {
                var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._";
                var overText = "";
                var toTheEnd = 0;
                char--;
                for (var i = char; i >= 0; i--) {
                    //var c = lines[line].charAt(i);
                    var c = CodeEditor.GetCharAt(line, i);
                    if (allowedChars.indexOf(c) == -1)
                        break;
                    overText = c + overText;
                }
                if (overText.length > 0)
                    for (var i = char + 1; i < lines[line].length; i++) {
                        var c = CodeEditor.GetCharAt(line, i);
                        if (allowedChars.indexOf(c) == -1)
                            break;
                        overText += c;
                        toTheEnd++;
                    }
                codeEditor.currentTextToTheEnd = toTheEnd;
                codeEditor.currentSelection = overText;
                var foundApi = GetApiDescription(overText);
                if (foundApi) {
                    var domLine = $(".CodeMirror-line").eq(line + 1);
                    var coords = codeEditor.currentEditor.cursorCoords(true, "page");
                    var y = coords.top;
                    var x = coords.left - 150;
                    $("#codeHelp_" + element).show();
                    if (y + 200 > window.innerHeight - 35)
                        $("#codeHelp_" + element).css("top", "" + (y - 110) + "px");
                    else
                        $("#codeHelp_" + element).css("top", "" + (y + 20) + "px");
                    if (x < 0)
                        x = 0;
                    if (x > window.innerHeight - 310)
                        x = window.innerHeight - 310;
                    $("#codeHelp_" + element).css("left", "" + x + "px");
                    $("#codeHelp_" + element).html(GetApiSignature(overText) + foundApi);
                    codeEditor.hideHelpTimer = setTimeout(function () { CodeEditor.HideHelp(element); }, 5000);
                }
                else {
                    // We still have to choose an API
                    var list = [];
                    if (overText != "") {
                        if (overText.indexOf(".") == -1) {
                            var last = null;
                            for (var i = 0; i < apiFunctions.length; i++) {
                                var f = apiFunctions[i].name.split('.')[0];
                                if (last == f)
                                    continue;
                                if (f.toLowerCase().indexOf(overText.toLowerCase()) == 0)
                                    list.push(f);
                                last = f;
                            }
                        }
                        else {
                            for (var i = 0; i < apiFunctions.length; i++)
                                if (apiFunctions[i].name.toLowerCase().indexOf(overText.toLowerCase()) == 0)
                                    list.push(apiFunctions[i].name);
                        }
                        list.sort();
                    }
                    if (list && list.length > 0) {
                        codeEditor.currentList = list;
                        codeEditor.currentSelectedCompletion = 0;
                        CodeEditor.UpdateList(element);
                        var domLine = $(".CodeMirror-line").eq(line + 1);
                        var coords = codeEditor.currentEditor.cursorCoords(true, "page");
                        var y = coords.top;
                        var x = coords.left - 150;
                        $("#codeHelp_" + element).show();
                        if (y + 200 > window.innerHeight - 35)
                            $("#codeHelp_" + element).css("top", "" + (y - 110) + "px");
                        else
                            $("#codeHelp_" + element).css("top", "" + (y + 20) + "px");
                        if (x < 0)
                            x = 0;
                        if (x > window.innerHeight - 310)
                            x = window.innerHeight - 310;
                        $("#codeHelp_" + element).css("left", "" + x + "px");
                    }
                    else
                        CodeEditor.HideHelp(element);
                }
            }
            else
                CodeEditor.HideHelp(element);
        });
        editor.on('change', function () {
            $("#codeError_" + element).hide();
            var nblines = editor.getDoc().lineCount();
            for (var i = 0; i < nblines; i++)
                editor.removeLineClass(i, 'background', "line-error");
            var code = editor.getValue();
            try {
                CodeParser.Parse(code.replace(/\@[a-z0-9_]+\@/gi, "1"));
            }
            catch (ex) {
                var m = ("" + ex).match(/ ([0-9]+):([0-9]+)/);
                if (m != null)
                    editor.addLineClass(parseInt(m[1]) - 1, 'background', "line-error");
                setTimeout(function () { $("#codeError_" + element).show().html(ex); }, 10);
            }
        });
        return editor;
    };
    CodeEditor.GetCharAt = function (line, col) {
        return codeEditor.currentEditor.getRange({ line: line, ch: col }, { line: line, ch: col + 1 });
    };
    CodeEditor.UpdateList = function (element) {
        if (codeEditor.hideHelpTimer) {
            clearTimeout(codeEditor.hideHelpTimer);
            codeEditor.hideHelpTimer = null;
        }
        var html = "";
        for (var i = 0; i < codeEditor.currentList.length; i++) {
            html += "<div onclick='CodeEditor.Add(\"" + codeEditor.currentList[i] + "\");'" + (codeEditor.currentSelectedCompletion == i ? " class='selectedInsertion'" : "") + ">" + codeEditor.currentList[i] + "</div>";
        }
        $("#codeHelp_" + element).html(html);
        codeEditor.hideHelpTimer = setTimeout(function () { CodeEditor.HideHelp(element); }, 5000);
    };
    CodeEditor.Add = function (text) {
        if (codeEditor.hideHelpTimer) {
            clearTimeout(codeEditor.hideHelpTimer);
            codeEditor.hideHelpTimer = null;
        }
        if (text.indexOf('.') == -1)
            text += '.';
        else {
            var api = GetApiSignature(text).replace(/<.{0,1}span[^>]*>/gi, "").replace(";", "");
            text += api.substr(text.length);
        }
        var pos = codeEditor.currentEditor.getCursor();
        codeEditor.currentEditor.replaceRange(text.substr(codeEditor.currentSelection.length), { line: pos.line, ch: pos.ch + (codeEditor.currentTextToTheEnd > 0 ? codeEditor.currentTextToTheEnd + 1 : 0) });
    };
    CodeEditor.HideHelp = function (element) {
        $("#codeHelp_" + element).hide();
        codeEditor.hideHelpTimer = null;
        codeEditor.currentList = null;
        codeEditor.currentSelectedCompletion = null;
    };
    return CodeEditor;
}());
var searchPanel = new ((function () {
    function class_27() {
        this.links = [];
    }
    return class_27;
}()));
var SearchPanel = (function () {
    function SearchPanel() {
    }
    SearchPanel.InitFunction = function () {
        if (!$("#searchPanel").first())
            return;
        if (Main.CheckNW()) {
            $("#searchPanel").css("top", "0px");
        }
        $("#game_Search").bind("click", SearchPanel.ShowHide);
        $("#generalSearch").bind("keyup", SearchPanel.KeyUp);
        // Control Q => quick search
        $(document).bind('keydown', function (e) {
            if (e.ctrlKey && (e.which == 81)) {
                e.preventDefault();
                SearchPanel.ShowHide();
                return false;
            }
        });
    };
    SearchPanel.ShowHide = function () {
        if ($("#searchPanel").is(":visible")) {
            $("#searchPanel").hide();
        }
        else {
            $("#searchPanel").show();
            $("#generalSearch").focus();
            SearchPanel.RenderResult();
        }
    };
    SearchPanel.KeyUp = function (evt) {
        switch (evt.keyCode) {
            case 27:
                $("#generalSearch").blur();
                $("#searchPanel").hide();
                break;
            case 13:
                if (searchPanel.links && searchPanel.links.length > 0)
                    document.location.assign(searchPanel.links[0]);
                break;
        }
        SearchPanel.RenderResult();
    };
    SearchPanel.Update = function () {
        SearchPanel.RenderResult();
    };
    SearchPanel.RenderResult = function () {
        if (!$("#searchPanel").is(":visible"))
            return;
        var toSearch = $("#generalSearch").val().toLowerCase();
        searchPanel.links = [];
        var html = "";
        var itemsToSearch = [
            { object: world.art.characters, title: "Characters", action: "ArtCharacterEditor" },
            { object: world.art.houses, title: "Houses", action: "HouseEditor" },
            { object: world.art.house_parts, title: "House parts", action: "HousePart" },
            { object: world.art.objects, title: "Map Objects", action: "ArtObjectEditor" },
            { object: world.art.sounds, title: "Sounds &amp; Musics", action: "ArtSoundEditor" },
            { object: world.Codes, title: "Generic Code", action: "GenericCodeEditor" },
            { object: world.InventorySlots, title: "Inventory Slots", action: "InventorySlotEditor" },
            { object: world.Monsters, title: "Monsters", action: "MonsterEditor" },
            { object: world.NPCs, title: "NPCs", action: "NPCEditor" },
            { object: world.InventoryObjects, title: "Objects", action: "ObjectEditor" },
            { object: world.InventoryObjectTypes, title: "Object Types", action: "ObjectTypeEditor" },
            { object: world.ParticleEffects, title: "Particles Effects", action: "ParticleEditor" },
            { object: world.Quests, title: "Quests", action: "QuestEditor" },
            { object: world.Skills, title: "Skills", action: "SkillEditor" },
            { object: world.Stats, title: "Stats", action: "StatEditor" },
            { object: world.TemporaryEffects, title: "Temporary Effects", action: "TemporaryEffectEditor" },
            { object: world.Zones, title: "Zones", action: "ZoneEditor" },
            { object: world.ChatBots, title: "Chat Bots", action: "ChatBotEditor" },
        ];
        itemsToSearch.sort(function (a, b) {
            if (a.title > b.title)
                return 1;
            if (a.title < b.title)
                return -1;
            return 0;
        });
        for (var j = 0; j < itemsToSearch.length; j++) {
            var items = [];
            if (itemsToSearch[j].object.length) {
                for (var i = 0; i < itemsToSearch[j].object.length; i++) {
                    if (itemsToSearch[j].object[i].Name.toLowerCase().indexOf(toSearch) == -1)
                        continue;
                    items.push(itemsToSearch[j].object[i].Name);
                }
            }
            else {
                for (var item in itemsToSearch[j].object) {
                    if (item == "contains")
                        continue;
                    if (item.toLowerCase().indexOf(toSearch) == -1)
                        continue;
                    items.push(item);
                }
            }
            if (items.length > 0) {
                html += "<span>" + itemsToSearch[j].title + ":</span>";
                html += "<div>";
                items.sort();
                for (var i = 0; i < items.length; i++) {
                    var link = "#action=" + itemsToSearch[j].action + "&id=" + encodeURIComponent(items[i]);
                    searchPanel.links.push(link);
                    html += "<a href='" + link + "'>" + items[i] + "</a>";
                }
                html += "</div>";
            }
        }
        $("#generalSearchResult").html(html);
    };
    return SearchPanel;
}());
var skillBar = new ((function () {
    function class_28() {
        this.SkillIcons = {};
        this.lastCheckInventory = 0;
    }
    return class_28;
}()));
var SkillBar = (function () {
    function SkillBar() {
    }
    SkillBar.Render = function () {
        if (!framework.Preferences['token'] && !game && !Main.CheckNW())
            return;
        var canvas = document.getElementById("gameCanvas");
        var height = canvas.height;
        var width = canvas.width;
        var ctx = canvas.getContext("2d");
        if (!skillBar.SlotBar) {
            skillBar.SlotBar = new Image();
            skillBar.SlotBar.src = world.art.quickslotStyle.file;
        }
        if (!skillBar.StatBar) {
            skillBar.StatBar = new Image();
            skillBar.StatBar.src = world.art.statBarStyle.file;
        }
        if (!skillBar.SlotBar || !skillBar.SlotBar.width)
            return;
        ctx.save();
        if (world.art.statBarStyle.barsToDisplay === null || world.art.statBarStyle.barsToDisplay === undefined)
            world.art.statBarStyle.barsToDisplay = 1;
        if ((world.art.statBarStyle.barsToDisplay == 1 || world.art.statBarStyle.barsToDisplay == 2) && skillBar.StatBar && skillBar.StatBar.width) {
            var v = world.Player.GetStat('Life');
            var maxV = world.Player.GetStatMaxValue('Life');
            v = Math.min(Math.max(v, 0), maxV);
            var h = Math.round((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder)) * (maxV - v) / maxV);
            //h = Math.min(Math.max(h, 0), 100);
            ctx.drawImage(skillBar.StatBar, 0, 0, skillBar.StatBar.width / 3, skillBar.StatBar.height, 10, height - (skillBar.StatBar.height + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height);
            try {
                ctx.drawImage(skillBar.StatBar, skillBar.StatBar.width / 3, world.art.statBarStyle.topBorder + h, skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h), 10, height - ((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + h)) + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h));
            }
            catch (ex) {
            }
        }
        if ((world.art.statBarStyle.barsToDisplay == 2) && skillBar.StatBar && skillBar.StatBar.width) {
            var v = world.Player.GetStat('Energy');
            var maxV = world.Player.GetStatMaxValue('Energy');
            v = Math.min(Math.max(v, 0), maxV);
            var h = Math.round((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder)) * (maxV - v) / maxV);
            //h = Math.min(Math.max(h, 0), 100);
            ctx.drawImage(skillBar.StatBar, 0, 0, skillBar.StatBar.width / 3, skillBar.StatBar.height, 10 + skillBar.StatBar.width / 3, height - (skillBar.StatBar.height + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height);
            try {
                ctx.drawImage(skillBar.StatBar, skillBar.StatBar.width * 2 / 3, world.art.statBarStyle.topBorder + h, skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h), 10 + skillBar.StatBar.width / 3, height - ((skillBar.StatBar.height - (world.art.statBarStyle.topBorder + h)) + 10), skillBar.StatBar.width / 3, skillBar.StatBar.height - (world.art.statBarStyle.topBorder + world.art.statBarStyle.bottomBorder + h));
            }
            catch (ex) {
            }
        }
        if (world.art.quickslotStyle.quickslotVisible === false) {
            ctx.restore();
            return;
        }
        var pos = Math.round(width / 2 - skillBar.SlotBar.width / 2);
        ctx.drawImage(skillBar.SlotBar, pos, height - skillBar.SlotBar.height);
        pos += world.art.quickslotStyle.leftBorder;
        for (var i = 0; i < world.Player.QuickSlot.length; i++) {
            var q = world.Player.QuickSlot[i];
            if (q == null) {
                pos += 32 + world.art.quickslotStyle.itemSpacing;
                continue;
            }
            var name = q.substring(2);
            // Skill quickslot
            if (q.substring(0, 2) == "S/") {
                if (!skillBar.SkillIcons[q] && world.GetSkill(name)) {
                    var skillInfo = world.GetSkill(name);
                    skillBar.SkillIcons[q] = new Image();
                    skillBar.SkillIcons[q].src = (skillInfo.CodeVariable("icon") ? skillInfo.CodeVariable("icon") : "/art/tileset2/fist_icon.png");
                }
                if (!skillBar.SkillIcons[q])
                    continue;
                ctx.drawImage(skillBar.SkillIcons[q], pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder);
                var timer = world.Player.GetTimer(name);
                if (timer && !timer.IsOver()) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.globalAlpha = 0.8;
                    var h = Math.round(Math.max(timer.Length - timer.Ellapsed(), 0) * 32 / timer.Length);
                    ctx.fillRect(pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder + (32 - h), 32, h);
                }
                if (world.Player.CurrentSkill.toLowerCase() == name.toLowerCase()) {
                    ctx.strokeStyle = world.art.quickslotStyle.selectedSkillColor;
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.strokeRect(pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder, 32, 32);
                    ctx.stroke();
                }
            }
            else if (q.substring(0, 2) == "I/") {
                var details = world.GetInventoryObject(name);
                if (skillBar.lastCheckInventory <= 0) {
                    if (world.Player.GetInventoryQuantity(name) <= 0) {
                        world.Player.QuickSlot[i] = null;
                        world.Player.StoredCompare = world.Player.JSON();
                        world.Player.Save();
                        continue;
                    }
                }
                if (!skillBar.SkillIcons[q] && details) {
                    skillBar.SkillIcons[q] = new Image();
                    skillBar.SkillIcons[q].src = (details.Image ? details.Image : "/art/tileset2/inventory_object.png");
                }
                if (!skillBar.SkillIcons[q])
                    continue;
                ctx.drawImage(skillBar.SkillIcons[q], pos, height - skillBar.SlotBar.height + world.art.quickslotStyle.topBorder);
            }
            pos += 32 + world.art.quickslotStyle.itemSpacing;
        }
        ctx.restore();
        skillBar.lastCheckInventory--;
        if (skillBar.lastCheckInventory < 0)
            skillBar.lastCheckInventory = 30;
    };
    SkillBar.SelectQuickslot = function (slot) {
        if (slot == 0)
            slot = 9;
        else
            slot--;
        if (world.Player.QuickSlot[slot] && world.Player.QuickSlot[slot].substring(0, 2) == "S/") {
            var oldSkill = world.Player.CurrentSkill;
            var selectedSkill = world.Player.QuickSlot[slot].substring(2);
            world.Player.CurrentSkill = selectedSkill;
            var skill = world.GetSkill(selectedSkill);
            var res = skill.InvokeFunction("Activate", []);
            // Prevent selection
            if (res !== null && res.GetBoolean() === false) {
                world.Player.CurrentSkill = oldSkill;
            }
            world.Player.StoredCompare = world.Player.JSON();
            world.Player.Save();
        }
        else if (world.Player.QuickSlot[slot] && world.Player.QuickSlot[slot].substring(0, 2) == "I/") {
            var name = world.Player.QuickSlot[slot].substring(2);
            var details = world.GetInventoryObject(name);
            if (!details)
                return;
            if (world.Player.GetInventoryQuantity(name) > 0) {
                if (details.CanWear())
                    world.Player.Wear(name);
                else if (details.ActionLabel() && details.CanUse())
                    details.Use();
            }
        }
    };
    SkillBar.HandleClick = function (x, y) {
        if (world.art.quickslotStyle.quickslotVisible === false)
            return false;
        if (!skillBar.StatBar)
            return;
        var canvas = document.getElementById("gameCanvas");
        y -= $("#gameCanvas").position().top;
        var width = canvas.width;
        var height = canvas.height;
        var barX = Math.round(width / 2 - skillBar.SlotBar.width / 2);
        var barY = height - skillBar.SlotBar.height;
        if (x >= barX && x <= barX + skillBar.SlotBar.width && y >= barY && y <= barY + skillBar.SlotBar.height) {
            var s = Math.floor((x - (barX + world.art.quickslotStyle.leftBorder)) / (32 + world.art.quickslotStyle.itemSpacing));
            if (s >= 0 && s <= 9) {
                s = (s + 1) % 10;
                SkillBar.SelectQuickslot(s);
            }
            return true;
        }
        return false;
    };
    return SkillBar;
}());
var ColorHandling = (function () {
    function ColorHandling() {
    }
    ColorHandling.RgbToHex = function (r, g, b) {
        return "#" + Math.round(r).toString(16).padLeft("0", 2) + Math.round(g).toString(16).padLeft("0", 2) + Math.round(b).toString(16).padLeft("0", 2);
    };
    ColorHandling.HexToRgb = function (str) {
        if (str.length != 7)
            return null;
        var r = parseInt(str.substr(1, 2), 16);
        var g = parseInt(str.substr(3, 2), 16);
        var b = parseInt(str.substr(5, 2), 16);
        return { r: r, g: g, b: b };
    };
    ColorHandling.HSVtoRGB = function (h, s, v) {
        if (s == 0)
            return { Red: v, Green: v, Blue: v };
        h /= 60;
        var i = Math.floor(h);
        var f = h - i; // factorial part of h
        var p = v * (1 - s);
        var q = v * (1 - s * f);
        var t = v * (1 - s * (1 - f));
        switch (i) {
            case 0:
                return { Red: v, Green: t, Blue: p };
            case 1:
                return { Red: q, Green: v, Blue: p };
            case 2:
                return { Red: p, Green: v, Blue: t };
            case 3:
                return { Red: p, Green: q, Blue: v };
            case 4:
                return { Red: t, Green: p, Blue: v };
            default:
                return { Red: v, Green: p, Blue: q };
        }
    };
    ColorHandling.RGBtoHSV = function (r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var v = max; // v
        var s = 0;
        var h = 0;
        var delta = max - min;
        if (max != 0)
            s = delta / max; // s
        else {
            // r = g = b = 0		// s = 0, v is undefined
            s = 0;
            h = -1;
            return { h: h, s: s, v: v };
        }
        if (r == max)
            h = (g - b) / delta; // between yellow & magenta
        else if (g == max)
            h = 2 + (b - r) / delta; // between cyan & yellow
        else
            h = 4 + (r - g) / delta; // between magenta & cyan
        h *= 60; // degrees
        if (h < 0)
            h += 360;
        if (isNaN(h))
            h = 0;
        return { h: h, s: s, v: v };
    };
    return ColorHandling;
}());
// Translated to Typescript by Alain Bertrand
//
// From
// https://gist.github.com/banksean/304522
// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com
/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
var Perlin = (function () {
    function Perlin(rnd) {
        this.dot = function (g, x, y) {
            return g[0] * x + g[1] * y;
        };
        this.Noise = function (xin, yin) {
            var n0, n1, n2; // Noise contributions from the three corners 
            // Skew the input space to determine which simplex cell we're in 
            var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
            var s = (xin + yin) * F2; // Hairy factor for 2D 
            var i = Math.floor(xin + s);
            var j = Math.floor(yin + s);
            var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
            var t = (i + j) * G2;
            var X0 = i - t; // Unskew the cell origin back to (x,y) space 
            var Y0 = j - t;
            var x0 = xin - X0; // The x,y distances from the cell origin 
            var y0 = yin - Y0;
            // For the 2D case, the simplex shape is an equilateral triangle. 
            // Determine which simplex we are in. 
            var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
            if (x0 > y0) {
                i1 = 1;
                j1 = 0;
            } // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
            else {
                i1 = 0;
                j1 = 1;
            } // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
            // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
            // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
            // c = (3-sqrt(3))/6 
            var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
            var y1 = y0 - j1 + G2;
            var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
            var y2 = y0 - 1.0 + 2.0 * G2;
            // Work out the hashed gradient indices of the three simplex corners 
            var ii = i & 255;
            var jj = j & 255;
            var gi0 = this.perm[ii + this.perm[jj]] % 12;
            var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
            var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
            // Calculate the contribution from the three corners 
            var t0 = 0.5 - x0 * x0 - y0 * y0;
            if (t0 < 0)
                n0 = 0.0;
            else {
                t0 *= t0;
                n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient 
            }
            var t1 = 0.5 - x1 * x1 - y1 * y1;
            if (t1 < 0)
                n1 = 0.0;
            else {
                t1 *= t1;
                n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
            }
            var t2 = 0.5 - x2 * x2 - y2 * y2;
            if (t2 < 0)
                n2 = 0.0;
            else {
                t2 *= t2;
                n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
            }
            // Add contributions from each corner to get the final noise value. 
            // The result is scaled to return values in the interval [-1,1]. 
            return 70.0 * (n0 + n1 + n2);
        };
        if (!rnd)
            rnd = new SeededRandom();
        this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        this.p = [];
        for (var i = 0; i < 256; i++) {
            this.p[i] = Math.floor(rnd.Next() * 256);
        }
        // To remove the need for index wrapping, double the permutation table length 
        this.perm = [];
        for (var i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
        // A lookup table to traverse the simplex around a given point in 4D. 
        // Details can be found where this table is used, in the 4D noise method. 
        this.simplex = [
            [0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0],
            [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0],
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
            [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0],
            [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0],
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
            [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0],
            [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]
        ];
    }
    ;
    return Perlin;
}());
// Conversion to Typescript by Alain Bertrand
// seedrandom.js version 2.1.
// Author: David Bau
// Date: 2013 Mar 16
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// http://davidbau.com/encode/seedrandom.js
// http://davidbau.com/encode/seedrandom-min.js
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yay.');  Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from a server.
//
// More advanced examples:
//
//   Math.seedrandom("hello.");           // Use "hello." as the seed.
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   Math.random = rng1;                  // Continue "hello." prng sequence.
//   document.write(Math.random());       // Always 0.7316977468919549
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// Version 2.0 changed the sequence for non-string seeds.
// Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args, it uses a seed
// drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
// seedrandom() without crypto   - avg about 12 milliseconds per call
//
// On a 2012 windows 7 1.5ghz i5 laptop, Chrome, Firefox 19, IE 10, and
// Opera have similarly fast timings.  Slowest numbers are on Opera, with
// about 0.0005 milliseconds per seeded Math.random() and 15 milliseconds
// for autoseeding.
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
var SeededRandom = (function () {
    function SeededRandom(width, chunks, digits) {
        this.pool = [];
        // width: each RC4 output is 0 <= x < 256
        this.width = 256;
        // chunks: at least six RC4 outputs for each double
        this.chunks = 6;
        // digits: there are 52 significant digits in a double
        this.digits = 52;
        if (width)
            this.width = width;
        if (chunks)
            this.chunks = chunks;
        if (digits)
            this.digits = digits;
        this.startdenom = Math.pow(this.width, this.chunks);
        this.significance = Math.pow(2, digits);
        this.overflow = this.significance * 2;
        this.mask = this.width - 1;
        this.mixkey(Math.random(), this.pool);
    }
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    SeededRandom.prototype.Seed = function (seed, use_entropy) {
        var key = [];
        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = this.mixkey(this.flatten(use_entropy ? [seed, this.tostring(this.pool)] :
            0 in arguments ? seed : this.autoseed(), 3), key);
        // Use the seed to initialize an ARC4 generator.
        this.arc4 = new ARC4(key, this.width, this.mask);
        // Mix the randomness into accumulated entropy.
        this.mixkey(this.tostring(this.arc4.S), this.pool);
        // Override Math.random
        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        // Return the seed that was used
        return shortseed;
    };
    ;
    SeededRandom.prototype.Next = function (min, max) {
        if (!min)
            return this.next();
        if (!max)
            return Math.round(this.next() * min);
        return Math.round(this.next() * (max - min)) + min;
    };
    SeededRandom.prototype.next = function () {
        var n = this.arc4.g(this.chunks), // Start with a numerator n < 2 ^ 48
        d = this.startdenom, //   and denominator d = 2 ^ 48.
        x = 0; //   and no 'extra last byte'.
        while (n < this.significance) {
            n = (n + x) * this.width; //   shifting numerator and
            d *= this.width; //   denominator and generating a
            x = this.arc4.g(1); //   new least-significant-byte.
        }
        while (n >= this.overflow) {
            n /= 2; //   last byte, shift everything
            d /= 2; //   right using integer math until
            x >>>= 1; //   we have exactly the desired bits.
        }
        return (n + x) / d; // Form the number within [0, 1).
    };
    ;
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    SeededRandom.prototype.flatten = function (obj, depth) {
        var result = [], typ = (typeof obj)[0], prop;
        if (depth && typ == 'o') {
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    try {
                        result.push(this.flatten(obj[prop], depth - 1));
                    }
                    catch (e) {
                    }
                }
            }
        }
        return (result.length ? result : typ == 's' ? obj : obj + '\0');
    };
    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    SeededRandom.prototype.mixkey = function (seed, key) {
        var stringseed = seed + '', smear, j = 0;
        while (j < stringseed.length) {
            key[this.mask & j] =
                this.mask & ((smear ^= key[this.mask & j] * 19) + stringseed.charCodeAt(j++));
        }
        return this.tostring(key);
    };
    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto if available.
    //
    /** @param {Uint8Array=} seed */
    SeededRandom.prototype.autoseed = function (seed) {
        try {
            window.crypto.getRandomValues(seed = new Uint8Array(this.width));
            return this.tostring(seed);
        }
        catch (e) {
            return [+new Date, window.document, window.history,
                window.navigator, window.screen, this.tostring(this.pool)];
        }
    };
    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    SeededRandom.prototype.tostring = function (a) {
        return String.fromCharCode.apply(0, a);
    };
    return SeededRandom;
}());
//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
var ARC4 = (function () {
    function ARC4(key, width, mask) {
        this.S = [];
        this.i = 0;
        this.j = 0;
        this.keylen = key.length;
        this.width = width;
        this.mask = mask;
        this.S = [];
        // The empty key [] is treated as [0].
        if (!this.keylen) {
            key = [this.keylen++];
        }
        // Set up S using the standard key scheduling algorithm.
        while (this.i < width) {
            this.S[this.i] = this.i++;
        }
        for (this.i = 0; this.i < width; this.i++) {
            this.S[this.i] = this.S[this.j = mask & (this.j + key[this.i % this.keylen] + (this.t = this.S[this.i]))];
            this.S[this.j] = this.t;
        }
    }
    ARC4.prototype.g = function (count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0;
        while (count--) {
            t = this.S[this.i = this.mask & (this.i + 1)];
            r = r * this.width + this.S[this.mask & ((this.S[this.i] = this.S[this.j = this.mask & (this.j + t)]) + (this.S[this.j] = t))];
        }
        return r;
        // For robust unpredictability discard an initial batch of values.
        // See http://www.rsa.com/rsalabs/node.asp?id=2009
    };
    return ARC4;
}());
///<reference path="../Common/Libs/MiniQuery.ts" />
// (c) 2016 - 2017 - Alain Bertrand
// Entry point of the engine while using the normal site.
// For standalone maker, the standalone_maker.ts is used.
var world;
var username;
var userRoles;
var selfHosted = false;
var databaseNameRule = new RegExp("[^a-z _01-9\(\)\-]", "gi");
var Main = (function () {
    function Main() {
    }
    Main.NbCores = function () {
        if (window['Worker'] && (!game || Main.CheckNW() || isHtmlStandalone) && (("" + document.location).substr(0, 4) == "http" || Main.CheckNW()))
            return (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 2);
        return 1;
    };
    Main.CheckTouch = function () {
        if (world && world.Id > 1)
            return false;
        return (('ontouchstart' in window)
            || (navigator.MaxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0));
    };
    Main.CheckNW = function () {
        try {
            if (!window)
                return false;
        }
        catch (ex) {
            return false;
        }
        if (window["nw"] && window["nw"].App)
            return true;
        return false;
    };
    Main.Base64decode = function (source) {
        // Node 5.10+
        if (typeof (window['Buffer']).from === "function")
            return (window['Buffer']).from(source, 'base64');
        else
            return new window['Buffer'](source, 'base64');
    };
    Main.GameLogin = function () {
        $("#resultText").html("Login in...");
        $("#loginInput").hide();
        $.ajax({
            type: 'POST',
            url: '/backend/Login',
            data: {
                user: $("#loginUser").val(),
                password: $("#loginPassword").val(),
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data && data.token) {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    framework.Preferences['user'] = $("#loginUser").val();
                    framework.Preferences['password'] = Main.Encrypt($("#loginUser").val(), $("#loginPassword").val());
                    Framework.SavePreferences();
                    $("#resultText").html("Login succeed...");
                    document.location.reload();
                }
                else {
                    $("#resultText").html("Login failed...");
                    $("#loginInput").show();
                    $("#loginUser").focus();
                }
            },
            error: function (msg, textStatus) {
                $("#resultText").html("Login failed...");
                $("#loginInput").show();
                $("#loginUser").focus();
            }
        });
    };
    Main.Encrypt = function (username, password) {
        var salt = username.toLowerCase().trim();
        var result = [];
        for (var i = 0; i < password.length; i++)
            result.push(password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
        return result;
    };
    Main.Decryprt = function (username, crpytedPass) {
        var salt = username.toLowerCase().trim();
        var result = "";
        for (var i = 0; i < crpytedPass.length; i++)
            result += String.fromCharCode(crpytedPass[i] ^ salt.charCodeAt(i % salt.length));
        return result;
    };
    Main.ShowRegister = function () {
        $("#loginForm .gamePanelHeader").html("Register:");
        $("#loginForm").height(215);
        $("#loginForm .gamePanelContent").html("<div id='resultText'></div><table id='registerInput'>\n\
                <tr>\n\
                    <td>Username:</td>\n\
                    <td><input type='text' id='registerUser' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Password:</td>\n\
                    <td><input type='password' id='registerPassword' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Confirm:</td>\n\
                    <td><input type='password' id='registerPasswordConfirm' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>EMail (optional):</td>\n\
                    <td><input type='text' id='registerEmail' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td colspan='2'>\n\
                        <center>\n\
                            <div class='button' onclick='Main.GameRegisterPlayer();'>Register</div>\n\
                            <div class='button' onclick='Main.ShowLogin();'>Cancel</div>\n\
                        </center>\n\
                    </td>\n\
                </tr>\n\
            </table>");
        $("#registerUser").focus();
        $("#resultText").html("");
    };
    Main.ShowLogin = function () {
        if (world && world.art && world.art.splashImage) {
            $("#loginBackground").css("background", "url('" + world.art.splashImage + "')").css("backgroundSize", "cover");
            $("#branding").css("backgroundColor", "rgba( 255,255,255,0.5)").css("padding", "10px").css("border", "solid 1px black");
        }
        $("#loginForm").height(235);
        $("#loginForm .gamePanelContent").html((world && world.Name ? "<h3>Welcome to " + world.Name.htmlEntities() + "</h3>" : "") + "<div id='resultText'></div>\n\
            <table id='loginInput'>\n\
                <tr>\n\
                    <td>Login:</td>\n\
                    <td><input type='text' id='loginUser' onkeydown='Main.LoginKeyPress(event);' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td>Password:</td>\n\
                    <td><input type='password' id='loginPassword' onkeydown='Main.LoginKeyPress(event);' /></td>\n\
                </tr>\n\
                <tr>\n\
                    <td colspan='2'>\n\
                        <center>\n\
                            <div class='button' onclick='Main.GameLogin();'>Login</div>\n\
                            <div class='button' onclick='Main.ShowRegister();'>Register</div>\n\
                        </center>\n\
                    </td>\n\
                </tr>\n\
            </table>" + (world ? (world.Description && world.Description.trim() != "" ? "<br>" + Main.TextTransform(world.Description) : "- Please set a description! -") : ""));
        $("#loginForm .gamePanelHeader").html("Login:");
        $("#loginUser").focus();
        $("#resultText").html("");
    };
    Main.GameRegisterPlayer = function () {
        var reserved = ["root", "admin", "administrator", "boss", "master", "moderator", "helper"];
        if (!$("#registerUser").val() || $("#registerUser").val().trim() == "" || $("#registerUser").val().trim().length < 5) {
            $("#resultText").html("The user name must be at least 5 characters long.");
            $("#registerUser").focus();
            return;
        }
        if ($("#registerUser").val().trim().replace(/[a-z0-9]+/gi, "").length > 0) {
            $("#resultText").html("The user name can contain only letters and numbers.");
            $("#registerUser").focus();
            return;
        }
        if (!$("#registerPassword").val() || $("#registerPassword").val().trim() == "" || $("#registerPassword").val().trim().length < 6) {
            $("#resultText").html("The password must be at least 6 characters long.");
            $("#registerPassword").focus();
            return;
        }
        if ($("#registerPassword").val() != $("#registerPasswordConfirm").val()) {
            $("#resultText").html("The confirmation of the password don't match with the first password entry.");
            $("#registerPassword").focus();
            return;
        }
        if (reserved.indexOf($("#registerUser").val().trim().toLowerCase()) != -1) {
            $("#resultText").html("Reserved username.");
            return;
        }
        $("#resultText").html("Creating account...");
        $("#registerInput").hide();
        $.ajax({
            type: 'POST',
            url: '/backend/RegisterUser',
            data: {
                user: $("#registerUser").val().trim(),
                password: $("#registerPassword").val().trim(),
                email: $("#registerEmail").val().trim()
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data && data.token) {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    framework.Preferences['user'] = $("#registerUser").val();
                    framework.Preferences['password'] = Main.Encrypt($("#registerUser").val(), $("#registerPassword").val());
                    Framework.SavePreferences();
                    $("#resultText").html("Registration and login succeed...");
                    document.location.reload();
                }
                else {
                    $("#resultText").html(data.error);
                    $("#registerInput").show();
                }
            },
            error: function (msg, textStatus) {
                var data = TryParse(msg);
                if (data && data.error)
                    msg = data.error;
                $("#resultText").html(msg.htmlEntities(false));
                $("#registerInput").show();
                $("#registerUser").focus();
            }
        });
    };
    Main.FindId = function (name) {
        name = name.replace(/_/g, " ");
        $.ajax({
            type: 'POST',
            url: '/backend/SearchGameByName',
            data: {
                name: name,
            },
            success: function (msg) {
                if (msg && msg != "" && msg != "-") {
                    window['gameId'] = parseInt(msg.trim());
                    Main.InitGameMaker();
                }
            },
            error: function (msg, textStatus) {
                $("#loading").hide();
            }
        });
    };
    Main.HideError = function () {
        $("#errorWindow").hide();
    };
    Main.AddErrorMessage = function (message) {
        var now = new Date();
        $("#errorWindow").show();
        var logElement = $("#errorWindow > div:nth-child(2)");
        var log = logElement.first();
        while (log.childNodes.length > 200)
            log.removeChild(log.childNodes[0]);
        logElement.html(logElement.html() + ("<div>" + now.getHours()).padLeft('0', 2) + ":" + ("" + now.getMinutes()).padLeft('0', 2) + ":" + ("" + now.getSeconds()).padLeft('0', 2) + " " + message.htmlEntities() + "</div>").scrollTop(6000000);
    };
    Main.InitGameMaker = function () {
        $("#loadingScreen").hide();
        $(window).bind("error", function (error, url, lineNumber) {
            if (("" + error.message).indexOf("__gCrWeb") != -1)
                return true;
            //error.error.stack.toString()
            Main.AddErrorMessage(error.filename + "@" + error.lineno + ": " + error.message);
            return true;
        });
        // Running within NW.JS
        if (Main.CheckNW()) {
            $("#loginBackground").hide();
            $("#loginForm").hide();
            $("#branding").hide();
            $("#gameNewsDisplay").hide();
            world = new World();
            world.Id = Math.round((new Date()).getTime() / 1000);
            world.Name = "Not existing...";
            world.Init();
            Framework.Init();
            Main.GenerateGameStyle();
            return;
        }
        if (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW()) {
            $(document).bind('keydown', function (e) {
                if (e.ctrlKey && ((e.which || e.keyCode) == 83)) {
                    e.preventDefault();
                    if (world.ReadyToSave)
                        world.SaveMapChanges();
                    return false;
                }
                else if ((e.which || e.keyCode) == 112 && e.key == "F1") {
                    e.preventDefault();
                    window['cancelKeypress'] = true;
                    e.cancelBubble = true;
                    window['event']['keyCode'] = 0;
                    window.open("/Help/welcome.html", "engineHelp");
                    return false;
                }
            });
            $(document).bind('keypress', function (e) {
                if ((e.which || e.keyCode) == 112 && e.key == "F1") {
                    e.preventDefault();
                    window['cancelKeypress'] = true;
                    e.cancelBubble = true;
                    window['event']['keyCode'] = 0;
                    window.open("/Help/welcome.html", "engineHelp");
                    return false;
                }
            });
            if (window["onhelp"]) {
                window["onhelp"] = document["onhelp"] = function () {
                    return false;
                };
            }
        }
        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];
        if (!query.id && query.game) {
            Main.FindId(query.game);
            return;
        }
        if ((!framework.Preferences || !framework.Preferences['token']) && query.id != 1 && query.demo != "true") {
            if (!query || (!query.id && !query.game))
                document.location.replace("/");
            else {
                Main.LoadGame(query.id);
                $("#loginUser").focus();
                Main.ShowLogin();
                Main.LoadNews(query.id);
            }
            return;
        }
        Main.CheckAccess();
    };
    Main.CheckAccess = function () {
        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];
        if (query.demo == "true") {
            Main.AfterAccessCheck();
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/GetRoles',
            data: {
                token: framework.Preferences['token'],
                game: query.id
            },
            success: function (msg) {
                userRoles = TryParse(msg);
                if (("" + document.location).indexOf("/maker.html") == -1 && (userRoles.indexOf(100) != -1 || userRoles.indexOf(1000) != -1) && selfHosted)
                    document.location.replace("/maker.html");
                else if (("" + document.location).indexOf("/maker.html") == -1) {
                    Main.AfterAccessCheck();
                    return;
                }
                $.ajax({
                    type: 'POST',
                    url: '/backend/CanEdit',
                    data: {
                        token: framework.Preferences['token'],
                        game: query.id
                    },
                    success: function (msg) {
                        var res = TryParse(msg);
                        if (res !== true) {
                            delete framework.Preferences['token'];
                            Framework.SavePreferences();
                            document.location.replace("/");
                            return;
                        }
                        Main.AfterAccessCheck();
                    },
                    error: function (msg, textStatus) {
                        //if (("" + document.location).indexOf("dotworld.me") == -1 && ("" + document.location).indexOf("/play.html") == -1)
                        if (("" + document.location).indexOf("maker.html") != -1)
                            Main.ReLogin(Main.CheckAccess);
                        else
                            Main.AfterAccessCheck();
                        return;
                    }
                });
            },
            error: function (msg, textStatus) {
                //if (("" + document.location).indexOf("dotworld.me") == -1 && ("" + document.location).indexOf("/play.html") == -1)
                if (("" + document.location).indexOf("maker.html") != -1)
                    Main.ReLogin(Main.CheckAccess);
                else
                    Main.AfterAccessCheck();
                return;
            }
        });
    };
    Main.LoadNews = function (gameId) {
        $.ajax({
            type: 'POST',
            url: '/backend/GameNews',
            data: {
                game: gameId
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (!data || data.length == 0) {
                    $("#gameNewsDisplay").hide();
                    return;
                }
                var html = "";
                for (var i = 0; i < data.length && i < 10; i++) {
                    if (i != 0)
                        html += "<br><br>";
                    var dt = new Date(data[i].postedOn);
                    html += "<b>" + dt.getFullYear() + "/" + ("" + (dt.getMonth() + 1)).padLeft("0", 2) + "/" + ("" + dt.getDate()).padLeft("0", 2) + ":</b><br>";
                    html += Main.TextTransform("By " + data[i].username + ": " + data[i].news);
                }
                $("#gameNewsDisplay .gamePanelContent").html(html);
            },
            error: function (msg, textStatus) {
            }
        });
    };
    Main.AfterAccessCheck = function () {
        Framework.ReloadPreferences();
        var query = Framework.ParseQuery();
        var url = Framework.ParseUrl();
        if (window['gameId'])
            query.id = window['gameId'];
        if (query.id == 1 && query.demo == "true") {
            framework.Preferences['token'] = "demo";
            Framework.SavePreferences();
            Main.LoadGame(query.id);
            username = "demo_" + Math.floor(Number.MAX_VALUE * Math.random());
            $("#loginBackground").hide();
            $("#loginForm").hide();
            $("#branding").hide();
            $("#gameNewsDisplay").hide();
            return;
        }
        else if (!framework.Preferences || !framework.Preferences['token']) {
            if (!query || !query.id)
                document.location.replace("/");
            else {
                Main.LoadGame(query.id);
                $("#loginUser").focus();
                Main.ShowLogin();
                Main.LoadNews(query.id);
            }
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/VerifyToken',
            data: {
                token: framework.Preferences['token']
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data && data.valid !== true) {
                    delete framework.Preferences['token'];
                    Framework.SavePreferences();
                    if (!query || !query.id)
                        document.location.replace("/");
                    else {
                        Main.LoadGame(query.id);
                        $("#loginUser").focus();
                    }
                    return;
                }
                username = data.username;
                $("#loginBackground").hide();
                $("#loginForm").hide();
                $("#branding").hide();
                $("#gameNewsDisplay").hide();
                if (query && query.id !== null && query.id !== undefined) {
                    if (url && url.action == "GameList")
                        document.location.replace("?id=" + query.id + "#");
                    else
                        Main.LoadGame(query.id);
                }
                else {
                    if (url.action != "GameList")
                        document.location.replace("/play.html#action=GameList");
                    Framework.Init();
                }
            },
            error: function (msg, textStatus) {
                delete framework.Preferences['token'];
                Framework.SavePreferences();
                document.location.replace("/");
                return;
            }
        });
        if (!Main.CheckNW()) {
            setTimeout(Main.CheckDebugger, 100);
            setInterval(Main.RefreshToken, 30000);
        }
    };
    Main.CheckDebugger = function () {
        if (game || Main.CheckNW())
            return;
        var start = new Date();
        if (play.devTools == false && ("" + document.location).indexOf("localhost") == -1)
            debugger;
        var end = new Date();
        var diff = end.getTime() - start.getTime();
        if (diff > 50)
            play.devTools = true;
        if (!play.devTools)
            setTimeout(Main.CheckDebugger, 100);
    };
    Main.RefreshToken = function () {
        if (framework.Preferences['token'] == "demo" && world.Id == 1) {
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/VerifyToken',
            data: {
                token: framework.Preferences['token']
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (!data || data.valid !== true)
                    Main.ReLogin();
            },
            error: function (msg, textStatus) {
                Main.ReLogin();
            }
        });
    };
    Main.ReLogin = function (callback) {
        Framework.ReloadPreferences();
        if (!framework.Preferences['user'] || !framework.Preferences['password']) {
            delete framework.Preferences['token'];
            Framework.SavePreferences();
            document.location.replace("/");
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/Login',
            data: {
                user: framework.Preferences['user'],
                password: Main.Decryprt(framework.Preferences['user'], framework.Preferences['password']),
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data && data.token) {
                    Framework.ReloadPreferences();
                    framework.Preferences['token'] = data.token;
                    Framework.SavePreferences();
                    if (callback)
                        callback();
                }
                else {
                    delete framework.Preferences['token'];
                    Framework.SavePreferences();
                    document.location.replace("/");
                    return;
                }
            },
            error: function (msg, textStatus) {
                setTimeout(function () {
                    Main.ReLogin(callback);
                }, 10000);
            }
        });
    };
    Main.LoginKeyPress = function (evt) {
        if (evt.keyCode == 13) {
            Main.GameLogin();
        }
    };
    Main.LoadGame = function (id) {
        $.ajax({
            type: 'POST',
            url: '/backend/GetWorld',
            data: {
                game: id
            },
            success: function (msg) {
                world = null;
                var data = null;
                if (msg != "" && msg != null)
                    data = TryParse(msg);
                if (data) {
                    if (data.data && data.data != "") {
                        try {
                            world = World.Rebuild(data.data);
                            world.Id = id;
                            world.Name = data.name;
                            world.Edition = (data.edition == "s" ? EditorEdition.Standard : EditorEdition.Demo);
                        }
                        catch (ex) {
                            world = null;
                            Framework.Alert("Error while rebuilding the world...");
                        }
                    }
                    else {
                        world = new World();
                        world.Id = id;
                        world.Name = data.name;
                        world.Edition = (data.edition == "s" ? EditorEdition.Standard : EditorEdition.Demo);
                    }
                }
                if (world == null) {
                    world = new World();
                    world.Id = id;
                    if (data && data.name)
                        world.Name = data.name;
                    else
                        world.Name = "Not existing...";
                }
                if (!framework.Preferences['token']) {
                    Main.ShowLogin();
                    Main.LoadNews(id);
                }
                world.Init();
                Framework.Init();
                Main.GenerateGameStyle();
                Chat.Init();
            },
            error: function (msg) {
            }
        });
    };
    Main.EnsureColor = function (color) {
        var m = ("" + color).match(/^\#[0-9abcdef]{6}$/i);
        if (!m)
            return "#000000";
        return "" + color;
    };
    Main.ExtractImagePart = function (source, x, y, width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
        try {
            return canvas.toDataURL();
        }
        catch (ex) {
            return "";
        }
    };
    Main.GenerateGameStyle = function () {
        var source = new Image();
        source.src = world.art.panelStyle.file;
        source.onload = function () {
            var html = ".gamePanel { }\n\
.gamePanelTopBorder {\n\
width: calc(100% - " + (parseInt("" + world.art.panelStyle.leftBorder) + parseInt("" + world.art.panelStyle.rightBorder)) + "px);\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, 0, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.topBorder) + "');\n\
height: " + parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
margin-left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelTopBorder:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, 0, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder) + "');\n\
width: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelTopBorder:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, 0, world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder) + "');\n\
width: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.topBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelHeader {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.header) + "');\n\
color: " + Main.EnsureColor(world.art.panelStyle.headerColor) + ";\n\
font-weight: bold;\n\
text-align: center;\n\
width: calc(100% - " + (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder) + "px);\n\
margin-left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
height: " + parseInt("" + world.art.panelStyle.header) + "px;\n\
vertical-align: top;\n\
}\n\
.gamePanelHeader:before {\n\
display: inline-block;\n\
position: absolute;\n\
left: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder, world.art.panelStyle.leftBorder, world.art.panelStyle.header) + "');\n\
width: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.header) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelHeader:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder, world.art.panelStyle.rightBorder, world.art.panelStyle.header) + "');\n\
width: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.header) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelContent {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
overflow-y: auto;\n\
height: calc(100% - " + (world.art.panelStyle.header + world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder) + "px);\n\
margin-left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelContent a {\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
font-weight: bold;\n\
}\n\
.gamePanelContent:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -" + world.art.panelStyle.leftBorder + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.leftBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: calc(100% - " + (parseInt("" + world.art.panelStyle.header) + parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContent:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
top: " + (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.header)) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.rightBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: calc(100% - " + (parseInt("" + world.art.panelStyle.header) + parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContentNoHeader {\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
overflow-y: auto;\n\
height: calc(100% - " + (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
margin-left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelContentNoHeader:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.leftBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: calc(100% - " + (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelContentNoHeader:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
top: " + (parseInt("" + world.art.panelStyle.topBorder)) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, world.art.panelStyle.topBorder + world.art.panelStyle.header, world.art.panelStyle.rightBorder, source.height - (world.art.panelStyle.topBorder + world.art.panelStyle.bottomBorder + world.art.panelStyle.header)) + "');\n\
width: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: calc(100% - " + (parseInt("" + world.art.panelStyle.topBorder) + parseInt("" + world.art.panelStyle.bottomBorder)) + "px);\n\
overflow: hidden;\n\
}\n\
.gamePanelBottomBorder {\n\
width: calc(100% - " + (parseInt("" + world.art.panelStyle.leftBorder) + parseInt("" + world.art.panelStyle.rightBorder)) + "px);\n\
background: url('" + Main.ExtractImagePart(source, world.art.panelStyle.leftBorder, source.height - world.art.panelStyle.bottomBorder, source.width - (world.art.panelStyle.leftBorder + world.art.panelStyle.rightBorder), world.art.panelStyle.bottomBorder) + "');\n\
height: " + parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
margin-left: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
margin-right: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
box-sizing: border-box;\n\
}\n\
.gamePanelBottomBorder:before {\n\
display: inline-block;\n\
position: absolute;\n\
margin-left: -" + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, 0, source.height - world.art.panelStyle.bottomBorder, world.art.panelStyle.leftBorder, world.art.panelStyle.bottomBorder) + "');\n\
width: " + parseInt("" + world.art.panelStyle.leftBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gamePanelBottomBorder:after {\n\
display: inline-block;\n\
position: absolute;\n\
right: 0px;\n\
content: ' ';\n\
background: url('" + Main.ExtractImagePart(source, source.width - world.art.panelStyle.rightBorder, source.height - world.art.panelStyle.bottomBorder, world.art.panelStyle.rightBorder, world.art.panelStyle.bottomBorder) + "');\n\
width: " + parseInt("" + world.art.panelStyle.rightBorder) + "px;\n\
height: " + parseInt("" + world.art.panelStyle.bottomBorder) + "px;\n\
overflow: hidden;\n\
}\n\
.gameButton {\n\
border: solid 1px " + Main.EnsureColor("" + world.art.panelStyle.buttonBorder) + ";\n\
background-color: " + world.art.panelStyle.buttonBackground + ";\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
font-weight: bold;\n\
padding: 2px;\n\
cursor: pointer;\n\
display: inline-block;\n\
margin: 2px;\n\
}\n\
.gameButton:hover {\n\
background-color: " + Main.EnsureColor(world.art.panelStyle.buttonBackgroundHover) + ";\n\
}\n\
#mapLoadingPage {\n\
background-color: " + Main.EnsureColor(world.art.panelStyle.buttonBackground) + ";\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentColor) + ";\n\
}\n\
#chatLine { border: solid 1px " + Main.EnsureColor("" + world.art.panelStyle.buttonBorder) + ";}\n\
.panelContentTableWithHeader {\n\
width: 100%;\n\
border-collapse: collapse;\n\
}\n\
.panelContentTableWithHeader thead td {\n\
background-color: " + Main.EnsureColor(world.art.panelStyle.contentHeaderBackgroundColor) + ";\n\
color: " + Main.EnsureColor(world.art.panelStyle.contentHeaderColor) + ";\n\
font-weight: bold;\n\
}\n\
.panelContentSelected {\n\
background-color: " + Main.EnsureColor(world.art.panelStyle.contentSelectedColor) + ";\n\
}\n\
";
            if (world.art.panelStyle.chatPlaceholderColor) {
                html += "#chatLine::-webkit-input-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine:-moz-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine::-moz-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
                html += "#chatLine:-ms-input-placeholder { color: " + Main.EnsureColor(world.art.panelStyle.chatPlaceholderColor) + "}\n";
            }
            if (world.art.panelStyle.chatNormalColor) {
                html += "#chatScroll div { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
                html += "#chatLine { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
                html += "#chatLine a { color: " + Main.EnsureColor(world.art.panelStyle.chatNormalColor) + "; }\n";
            }
            if (world.art.panelStyle.chatSeparatorColor) {
                html += "#chatScroll > div { border-bottom: dashed 1px " + Main.EnsureColor(world.art.panelStyle.chatSeparatorColor) + "; }\n";
            }
            if (world.art.panelStyle.chatSystemMessageColor) {
                html += "#chatScroll .chatSystemMessage {color: " + Main.EnsureColor(world.art.panelStyle.chatSystemMessageColor) + "; }\n";
            }
            for (var i in window) {
                if (i.indexOf("webkit") == 0)
                    continue;
                try {
                    if (window[i]['AdditionalCSS'] && typeof window[i]['AdditionalCSS'] == "function")
                        html += window[i]['AdditionalCSS']();
                }
                catch (ex) {
                }
            }
            $("#gameStyle").html(html);
        };
    };
    Main.FormatDate = function (source) {
        var dt = null;
        if (typeof source == "string")
            dt = new Date(source);
        else
            dt = source;
        return dt.getFullYear() + "." +
            ("" + (dt.getMonth() + 1)).padLeft("0", 2) +
            "." + ("" + dt.getDate()).padLeft("0", 2);
    };
    Main.FormatDateTime = function (source) {
        var dt = null;
        if (typeof source == "string")
            dt = new Date(source);
        else
            dt = source;
        return dt.getFullYear() + "." +
            ("" + (dt.getMonth() + 1)).padLeft("0", 2) +
            "." + ("" + dt.getDate()).padLeft("0", 2) +
            " " + ("" + dt.getHours()).padLeft("0", 2) +
            ":" + ("" + dt.getMinutes()).padLeft("0", 2);
    };
    Main.TextTransform = function (source, transformUserInfo) {
        if (transformUserInfo === void 0) { transformUserInfo = false; }
        source = source.replace(/&/g, "&amp;");
        source = source.replace(/</g, "&lt;");
        source = source.replace(/>/g, "&gt;");
        if (transformUserInfo && world && world.Player && world.Player.Username)
            source = source.replace(/@name@/gi, world.Player.Username.htmlEntities());
        else
            source = source.replace(/@name@/gi, "Player");
        source = source.replace(/\n/g, "<br>\n");
        source = source.replace(/\[big\]/gi, "<span style='font-size: 20px;'>");
        source = source.replace(/\[\/big\]/gi, "</span>");
        source = source.replace(/\[red\]/gi, "<span style='color: red;'>");
        source = source.replace(/\[\/red\]/gi, "</span>");
        source = source.replace(/\[blue\](.*)\[\/blue\]/gi, "<span style='color: blue;'>");
        source = source.replace(/\[\/blue\]/gi, "</span>");
        source = source.replace(/\[green\]/gi, "<span style='color: green;'>");
        source = source.replace(/\[\/green\]/gi, "</span>");
        source = source.replace(/\[yellow\](.*)\[\/yellow\]/gi, "<span style='color: yellow;'>");
        source = source.replace(/\[\/yellow\]/gi, "</span>");
        source = source.replace(/\[white\](.*)\[\/white\]/gi, "<span style='color: white;'>");
        source = source.replace(/\[\/white\]/gi, "</span>");
        source = source.replace(/\[black\](.*)\[\/black\]/gi, "<span style='color: black;'>");
        source = source.replace(/\[\/black\]/gi, "</span>");
        source = source.replace(/\[pink\](.*)\[\/pink\]/gi, "<span style='color: pink;'>");
        source = source.replace(/\[\/pink\]/gi, "</span>");
        source = source.replace(/\[b\]/gi, "<b>");
        source = source.replace(/\[\/b\]/gi, "</b>");
        source = source.replace(/\[hr\]/gi, "<hr>");
        source = source.replace(/\[i\]/gi, "<i>");
        source = source.replace(/\[\/i\]/gi, "</i>");
        source = source.replace(/([ \t\n\r]*\*[ \t]*)(.*)([ \t\n\r]*)/gi, "<li>$2</li>");
        source = source.replace(/\[list\]((.|\n|\r)*)\[\/list\]/gi, "<ul>$1</ul>");
        return source;
    };
    return Main;
}());
var isHtmlStandalone = false;
var Runtime = (function () {
    function Runtime() {
    }
    Runtime.HtmlInit = function () {
        isHtmlStandalone = true;
        world = World.Rebuild(JSON.stringify(game.data));
        world.Edition = EditorEdition.Standard;
        world.Id = 2;
        world.ShowFPS = false;
        world.Init();
        Main.GenerateGameStyle();
        world.ResetAreas();
        world.ResetGenerator();
        Framework.ReloadPreferences();
        Play.Recover();
        Main.GenerateGameStyle();
        if (("" + document.location).substr(0, 4) != "http" && !Main.CheckNW())
            Main.AddErrorMessage("You must host your project with a web server otherwise some features will work correctly. For example the panels will not be displayed.");
        setTimeout(function () {
            $("#branding").hide();
        }, 10000);
    };
    return Runtime;
}());
/// <reference path="../Common/Libs/MiniQuery.ts" />
/// <reference path="Libs/nwjs.d.ts" />
var menuBar = {
    "File": {
        "New": function () {
            StandaloneMaker.NewProject();
        },
        "&Open": function () {
            StandaloneMaker.OpenProject();
        },
        "&Save": function () {
            StandaloneMaker.SaveProject();
        },
        "Save As...": function () {
            StandaloneMaker.SaveAsProject();
        },
        "Export As HTML...": function () {
            StandaloneMaker.ExportHTML();
        },
        "Export As EXE...": function () {
            StandaloneMaker.ExportEXE();
        },
        "Exit": function () { nw.Window.get().close(); }
    },
    "Game": {
        "&Play": "#action=Play",
        "&Quick Search": function () {
            SearchPanel.ShowHide();
        },
        "Reset": "#action=GameReset"
    },
    "Art": {
        "Characters": "#action=ArtCharacterEditor",
        "Houses": "#action=HouseEditor",
        "House Parts": "#action=HousePart",
        "Map Objects": "#action=ArtObjectEditor",
        "Panel Style": "#action=ArtPanelEditor",
        "Quickslot Style": "#action=ArtQuickslotEditor",
        "Sounds & Musics": "#action=ArtSoundEditor",
        "Statbars Style": "#action=ArtStartBarEditor",
        "Tiles": "#action=ArtTileEditor"
    },
    "Editors": {
        "Game": "#action=GameEditor",
        "Generic Code": "#action=GenericCodeEditor ",
        "Inventory Slot": "#action=InventorySlotEditor ",
        "&Maps": "#action=MapEditor ",
        "Monsters": "#action=MonsterEditor ",
        "NPC": "#action=NPCEditor ",
        "Objects": "#action=ObjectEditor",
        "Object Types": "#action=ObjectTypeEditor",
        "Particles System Editor": "#action=ParticleEditor",
        "Quests": "#action=QuestEditor ",
        "Skills": "#action=SkillEditor ",
        "Stats": "#action=StatEditor",
        "Temporary Effects": "#action=TemporaryEffectEditor ",
        "Zones": "#action=ZoneEditor"
    },
    /*"Admin":
    {
        "File Explorer": "#action=FileExplorer",
        "Game News": "#action=GameNews",
        "Game Stats": "#action=GameStats",
        "View Player": "#action=ViewPlayer"
    },*/
    "Help": {
        "Help": function () {
            StandaloneMaker.Help("/Help/welcome.html");
        },
        "About": "#action=About"
    }
};
var nwjsFiles = ["credits.html",
    "d3dcompiler_47.dll",
    "ffmpeg.dll",
    "icudtl.dat",
    "libEGL.dll",
    "libGLESv2.dll",
    "natives_blob.bin",
    "node.dll",
    "nw.dll",
    "nw_100_percent.pak",
    "nw_200_percent.pak",
    "nw_elf.dll",
    "resources.pak",
    "snapshot_blob.bin",
    "locales/am.pak",
    "locales/ar.pak",
    "locales/bg.pak",
    "locales/bn.pak",
    "locales/ca.pak",
    "locales/cs.pak",
    "locales/da.pak",
    "locales/de.pak",
    "locales/el.pak",
    "locales/en-GB.pak",
    "locales/en-US.pak",
    "locales/es-419.pak",
    "locales/es.pak",
    "locales/et.pak",
    "locales/fa.pak",
    "locales/fi.pak",
    "locales/fil.pak",
    "locales/fr.pak",
    "locales/gu.pak",
    "locales/he.pak",
    "locales/hi.pak",
    "locales/hr.pak",
    "locales/hu.pak",
    "locales/id.pak",
    "locales/it.pak",
    "locales/ja.pak",
    "locales/kn.pak",
    "locales/ko.pak",
    "locales/lt.pak",
    "locales/lv.pak",
    "locales/ml.pak",
    "locales/mr.pak",
    "locales/ms.pak",
    "locales/nb.pak",
    "locales/nl.pak",
    "locales/pl.pak",
    "locales/pt-BR.pak",
    "locales/pt-PT.pak",
    "locales/ro.pak",
    "locales/ru.pak",
    "locales/sk.pak",
    "locales/sl.pak",
    "locales/sr.pak",
    "locales/sv.pak",
    "locales/sw.pak",
    "locales/ta.pak",
    "locales/te.pak",
    "locales/th.pak",
    "locales/tr.pak",
    "locales/uk.pak",
    "locales/vi.pak",
    "locales/zh-CN.pak",
    "locales/zh-TW.pak"];
var standaloneMaker = new ((function () {
    function class_29() {
        this.currentFile = null;
    }
    return class_29;
}()));
var StandaloneMaker = (function () {
    function StandaloneMaker() {
    }
    StandaloneMaker.Init = function () {
        var menu = new nw.Menu({ type: 'menubar' });
        for (var menuSection in menuBar) {
            var submenu = new nw.Menu();
            for (var item in menuBar[menuSection]) {
                var label = item.replace(/&/g, "");
                var key = null;
                var modifier = null;
                var m = item.match(/&(.)/);
                if (m) {
                    key = m[1];
                    modifier = "ctrl";
                }
                if (label == "Help") {
                    key = "F1";
                }
                /*else if (label == "Exit")
                {
                    key = "F4";
                    modifier = "alt";
                }*/
                if (typeof menuBar[menuSection][item] === "function") {
                    var a = function () {
                        var func = menuBar[menuSection][item];
                        submenu.append(new nw.MenuItem({
                            label: label,
                            click: func,
                            key: key,
                            modifiers: modifier
                        }));
                    };
                    a();
                }
                else {
                    var a = function () {
                        var url = menuBar[menuSection][item];
                        submenu.append(new nw.MenuItem({
                            label: label,
                            click: function () {
                                document.location.assign(url);
                            },
                            key: key,
                            modifiers: modifier
                        }));
                    };
                    a();
                }
            }
            var label = menuSection.replace(/&/g, "");
            var key = null;
            var m = menuSection.match(/&(.)/);
            if (m)
                key = m[1];
            menu.append(new nw.MenuItem({
                label: label,
                submenu: submenu,
                key: key
            }));
        }
        nw.Window.get().menu = menu;
        nw.Window.get().on('close', function () {
            if (standaloneMaker.helpWindow)
                standaloneMaker.helpWindow.close();
            nw.Window.get().close(true);
        });
        Framework.ReloadPreferences();
        if (framework.Preferences['lastProject']) {
            var fs = require('fs');
            if (fs.existsSync(framework.Preferences['lastProject'])) {
                $("#loginBackground").hide();
                $("#loginForm").hide();
                $("#branding").hide();
                $("#gameNewsDisplay").hide();
                standaloneMaker.currentFile = framework.Preferences['lastProject'];
                StandaloneMaker.DoOpenFile();
                Framework.Init();
                Main.GenerateGameStyle();
            }
            else {
                delete framework.Preferences['lastProject'];
                Framework.SavePreferences();
            }
        }
        else {
            Main.InitGameMaker();
            world.Id = Math.round((new Date()).getTime() / 1000);
            world.Edition = EditorEdition.Standard;
        }
    };
    StandaloneMaker.Filename = function (source) {
        return source.match(/[^\\\/]*$/)[0].split('?')[0];
    };
    StandaloneMaker.Help = function (url) {
        nw.Window.open(url, { id: 'HelpWin', icon: "images/icon_help.png" }, function (newWin) {
            standaloneMaker.helpWindow = newWin;
        });
    };
    StandaloneMaker.NewProject = function () {
        Framework.Confirm("Are you sure you want to create a new project?", function () {
            game = null;
            workerGenerator = null;
            world = new World();
            world.Id = Math.round((new Date()).getTime() / 1000);
            world.Edition = EditorEdition.Standard;
            world.Name = "Not existing...";
            world.Init();
            Main.GenerateGameStyle();
            world.ResetAreas();
            world.ResetGenerator();
            Framework.Rerun();
            standaloneMaker.currentFile = null;
            document.title = "Dot World Maker - No name";
            Framework.ReloadPreferences();
            delete framework.Preferences['lastProject'];
            Framework.SavePreferences();
        });
    };
    StandaloneMaker.OpenProject = function () {
        $("#fileOpenDialog").unbind("change");
        $("#fileSaveDialog").prop("accept", ".dwmproject");
        var chooser = $("#fileOpenDialog").bind("change", StandaloneMaker.OpenProjectFile).first().click();
    };
    StandaloneMaker.OpenProjectFile = function () {
        standaloneMaker.currentFile = $("#fileOpenDialog").val();
        $("#fileOpenDialog").unbind("change", StandaloneMaker.OpenProjectFile);
        $("#fileOpenDialog").val("");
        StandaloneMaker.DoOpenFile();
        Framework.Rerun();
    };
    StandaloneMaker.DoOpenFile = function () {
        var fs = require('fs');
        game = JSON.parse(fs.readFileSync(standaloneMaker.currentFile));
        workerGenerator = null;
        world = World.Rebuild(game.data);
        world.Edition = EditorEdition.Standard;
        world.Init();
        Main.GenerateGameStyle();
        world.ResetAreas();
        world.ResetGenerator();
        document.title = "Dot World Maker - " + StandaloneMaker.Filename(standaloneMaker.currentFile).replace(".dwmproject", "");
        Framework.ReloadPreferences();
        framework.Preferences['lastProject'] = standaloneMaker.currentFile;
        Framework.SavePreferences();
    };
    StandaloneMaker.SaveProject = function () {
        if (standaloneMaker.currentFile) {
            if (!game)
                game = { maps: [], data: null };
            game.data = world.Stringify();
            var fs = require('fs');
            fs.writeFile(standaloneMaker.currentFile, JSON.stringify(window["game"]));
            return;
        }
        StandaloneMaker.SaveAsProject();
    };
    StandaloneMaker.SaveAsProject = function () {
        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        $("#fileSaveDialog").prop("accept", ".dwmproject");
        $("#fileSaveDialog").prop("nwsaveas", "");
        game.data = world.Stringify();
        $("#fileSaveDialog").unbind("change");
        $("#fileSaveDialog").val("").bind("change", StandaloneMaker.SaveProjectFile).first().click();
    };
    StandaloneMaker.SaveProjectFile = function () {
        standaloneMaker.currentFile = $("#fileSaveDialog").val();
        $("#fileSaveDialog").unbind("change", StandaloneMaker.SaveProjectFile);
        $("#fileSaveDialog").val("");
        var fs = require('fs');
        fs.writeFile(standaloneMaker.currentFile, JSON.stringify(game));
        document.title = "Dot World Maker - " + StandaloneMaker.Filename(standaloneMaker.currentFile).replace(".dwmproject", "");
        Framework.ReloadPreferences();
        framework.Preferences['lastProject'] = standaloneMaker.currentFile;
        Framework.SavePreferences();
    };
    StandaloneMaker.ExportHTML = function () {
        $("#directoryDialog").unbind("change").val("").bind("change", StandaloneMaker.DoExportHTML).first().click();
    };
    StandaloneMaker.DoExportHTML = function () {
        var directory = $("#directoryDialog").val();
        $("#directoryDialog").unbind("change", StandaloneMaker.DoExportHTML).val("");
        StandaloneMaker.ExportToDirectory(directory);
    };
    StandaloneMaker.ExportEXE = function () {
        $("#directoryDialog").unbind("change").val("").bind("change", StandaloneMaker.DoExportEXE).first().click();
    };
    StandaloneMaker.DoExportEXE = function () {
        var directory = $("#directoryDialog").val();
        $("#directoryDialog").unbind("change", StandaloneMaker.DoExportEXE).val("");
        var fs = require('fs');
        if (!fs.existsSync(directory + "/locales"))
            fs.mkdirSync(directory + "/locales");
        var path = require('path');
        var nwPath = process.execPath;
        var nwDir = path.dirname(nwPath);
        StandaloneMaker.copyFile(nwDir + "/Dot World Maker.exe", directory + '/game.exe');
        for (var i = 0; i < nwjsFiles.length; i++) {
            StandaloneMaker.copyFile(nwDir + "/" + nwjsFiles[i], directory + '/' + nwjsFiles[i]);
        }
        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        var data = JSON.parse(world.Stringify());
        var zip = new (require('node-zip'))();
        zip.file("css/runtime.css", fs.readFileSync(process.cwd() + "/runtime.css"));
        zip.file("index.html", fs.readFileSync(process.cwd() + "/runtime.html"));
        zip.file("engine.js", fs.readFileSync(process.cwd() + "/maker.js"));
        zip.file("art/simple_small_logo.png", fs.readFileSync(process.cwd() + "/images/simple_small_logo.png"));
        zip.file("art/tileset2/emotes.png", fs.readFileSync(process.cwd() + "/art/tileset2/emotes.png"));
        zip.file("art/tileset2/inventory_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/inventory_icon.png"));
        zip.file("art/tileset2/journal_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/journal_icon.png"));
        zip.file("art/tileset2/profile_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/profile_icon.png"));
        StandaloneMaker.ChangeGameUrls(data, "art/", function (origName, newName) {
            if (origName.indexOf("/art/") == 0 || origName.indexOf("/Sounds/") == 0)
                origName = process.cwd() + origName;
            zip.file("art/" + newName, fs.readFileSync(origName));
        });
        game.data = data;
        zip.file('game.js', "var game=" + JSON.stringify(game) + ";");
        zip.file("package.json", '{\n\
    "id": "DotWorldMaker",\n\
    "name": "Dot World Maker",\n\
    "main": "index.html",\n\
    "window": {\n\
        "width": 800,\n\
        "height": 600,\n\
        "icon": "art/icon.png"\n\
    },\n\
    "icon": "art/icon.png"\n\
}');
        fs.writeFileSync(directory + '/package.nw', zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
    };
    StandaloneMaker.copyFile = function (source, target) {
        var fs = require('fs');
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            console.log("error while copy '" + source + "' to '" + target + "': " + err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            console.log("error while copy '" + source + "' to '" + target + "': " + err);
        });
        wr.on("close", function (ex) {
        });
        rd.pipe(wr);
    };
    StandaloneMaker.ExportToDirectory = function (directory) {
        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        var data = JSON.parse(world.Stringify());
        var fs = require('fs');
        if (!fs.existsSync(directory + "/art"))
            fs.mkdirSync(directory + "/art");
        if (!fs.existsSync(directory + "/art/tileset2"))
            fs.mkdirSync(directory + "/art/tileset2");
        if (!fs.existsSync(directory + "/css"))
            fs.mkdirSync(directory + "/css");
        StandaloneMaker.copyFile(process.cwd() + "/runtime.css", directory + "/css/runtime.css");
        StandaloneMaker.copyFile(process.cwd() + "/runtime.html", directory + "/index.html");
        StandaloneMaker.copyFile(process.cwd() + "/maker.js", directory + "/engine.js");
        StandaloneMaker.copyFile(process.cwd() + "/images/simple_small_logo.png", directory + "/art/simple_small_logo.png");
        StandaloneMaker.copyFile(process.cwd() + "/art/tileset2/emotes.png", directory + "/art/tileset2/emotes.png");
        StandaloneMaker.copyFile(process.cwd() + "/art/tileset2/inventory_icon.png", directory + "/art/tileset2/inventory_icon.png");
        StandaloneMaker.copyFile(process.cwd() + "/art/tileset2/journal_icon.png", directory + "/art/tileset2/journal_icon.png");
        StandaloneMaker.copyFile(process.cwd() + "/art/tileset2/profile_icon.png", directory + "/art/tileset2/profile_icon.png");
        StandaloneMaker.ChangeGameUrls(data, "art/", function (origName, newName) {
            try {
                if (fs.existsSync(directory + "/" + newName))
                    fs.unlinkSync(directory + "/" + newName);
                if (origName.indexOf("/art/") == 0 || origName.indexOf("/Sounds/") == 0)
                    origName = process.cwd() + origName;
                StandaloneMaker.copyFile(origName, directory + "/art/" + newName);
            }
            catch (ex) {
                console.log(ex);
            }
        });
        game.data = data;
        fs.writeFile(directory + "/" + "game.js", "var game=" + JSON.stringify(game) + ";");
    };
    StandaloneMaker.CleanupUrl = function (url, prefix, changeCallback) {
        if (changeCallback)
            changeCallback(url.split("?")[0], url.replace(/\?.*$/, "").replace(/^(.*[\\\/])([a-z0-9_\-.]+)$/i, "$2"));
        return prefix + url.replace(/\?.*$/, "").replace(/^(.*[\\\/])([a-z0-9_\-.]+)$/i, "$2");
        /*if (changeCallback)
            changeCallback(url.split("?")[0], url.replace(/^\/Sounds\//, "").replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
        return prefix + url.replace(/^\/Sounds\//, "").replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, "");*/
    };
    StandaloneMaker.CleanupFileCodeVariable = function (code, prefix, changeCallback) {
        var m = code.match(/\/\/\/ [a-z]+:\s+([^,]+),image_upload/i);
        if (changeCallback)
            changeCallback(m[1].replace(/\?.*$/, ""), m[1].replace(/\?.*$/, "").replace(/^(.*[\\\/])([a-z0-9_\-.]+)$/i, "$2"));
        /// Icon: /art/tileset1/fast_attack.png,image_upload
        return code.replace(/(\/\/\/ [a-z]+:\s+)(.*[\/\\])([^,]+,image_upload)/gi, "$1" + prefix + "$3");
        /*var m = code.match(/\/\/\/ [a-z]+:\s+(\/[^\/]+\/[^\/]+\/[^,]+),image_upload/i);
        if (changeCallback)
            changeCallback(m[1].replace(/\?.*$/, ""), m[1].replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
        /// Icon: /art/tileset1/fast_attack.png,image_upload
        return code.replace(/(\/\/\/ [a-z]+:\s+)\/[^\/]+\/[^\/]+\/([^,]+,image_upload)/gi, "$1" + prefix + "$2");*/
    };
    StandaloneMaker.ChangeGameUrls = function (world, urlPrefix, changeCallback) {
        if (urlPrefix === void 0) { urlPrefix = ""; }
        if (changeCallback === void 0) { changeCallback = null; }
        if (world.Tileset.background.file)
            world.Tileset.background.file = StandaloneMaker.CleanupUrl(world.Tileset.background.file, urlPrefix, changeCallback);
        if (world.Tileset.splashImage)
            world.Tileset.splashImage = StandaloneMaker.CleanupUrl(world.Tileset.splashImage, urlPrefix, changeCallback);
        if (world.Tileset.panelStyle.file)
            world.Tileset.panelStyle.file = StandaloneMaker.CleanupUrl(world.Tileset.panelStyle.file, urlPrefix, changeCallback);
        if (world.Tileset.statBarStyle.file)
            world.Tileset.statBarStyle.file = StandaloneMaker.CleanupUrl(world.Tileset.statBarStyle.file, urlPrefix, changeCallback);
        if (world.Tileset.quickslotStyle.file)
            world.Tileset.quickslotStyle.file = StandaloneMaker.CleanupUrl(world.Tileset.quickslotStyle.file, urlPrefix, changeCallback);
        for (var item in world.Tileset.characters)
            world.Tileset.characters[item].file = StandaloneMaker.CleanupUrl(world.Tileset.characters[item].file, urlPrefix, changeCallback);
        for (var item in world.Tileset.objects)
            world.Tileset.objects[item].file = StandaloneMaker.CleanupUrl(world.Tileset.objects[item].file, urlPrefix, changeCallback);
        for (var item in world.Tileset.house_parts)
            world.Tileset.house_parts[item].file = StandaloneMaker.CleanupUrl(world.Tileset.house_parts[item].file, urlPrefix, changeCallback);
        for (var item in world.Tileset.sounds)
            world.Tileset.sounds[item].mp3 = StandaloneMaker.CleanupUrl(world.Tileset.sounds[item].mp3, urlPrefix, changeCallback);
        for (var i = 0; i < world.Skills.length; i++)
            world.Skills[i].Source = StandaloneMaker.CleanupFileCodeVariable(world.Skills[i].Source, urlPrefix, changeCallback);
    };
    return StandaloneMaker;
}());
///<reference path="../../Logic/MovingActors/PathSolver.ts" />
var play = new ((function () {
    function class_30() {
        this.keys = [];
        this.path = null;
        this.mouseDown = false;
        this.selectedActor = null;
        this.fps = null;
        this.firstClick = false;
        this.nbLoopsMouseDown = 0;
        this.inField = false;
        this.lastAction = null;
        this.afterTeleport = false;
        this.lastZone = null;
        this.devTools = false;
        this.lastRun = null;
        this.loopTimeRemains = 0;
        this.isFullScreen = false;
        this.currentFragment = "";
        this.loopCycle = 0;
        this.onPaint = [];
        this.showMinimap = false;
        this.onDialogPaint = [];
    }
    return class_30;
}()));
var Play = (function () {
    function Play() {
    }
    Play.Dispose = function () {
        if (play.renderer)
            play.renderer.Dispose();
        play.renderer = null;
        play.onDialogPaint = [];
        if (play.looper !== null && play.looper !== undefined) {
            if (window['mozRequestAnimationFrame'])
                window['mozCancelAnimationFrame'](play.looper);
            else if (window['requestAnimationFrame'])
                cancelAnimationFrame(play.looper);
            else
                clearTimeout(play.looper);
            play.looper = null;
        }
        if (world.ShowFPS)
            play.fps.hide();
        play.lastAction = null;
        play.path = null;
        $(window).unbind("keydown", Play.KeyDown);
        $(window).unbind("keyup", Play.KeyUp);
        $("#gameCanvas").unbind("mousedown", Play.MouseDown);
        $("#gameCanvas").unbind("mousemove", Play.MouseMove);
        $("#gameCanvas").unbind("mouseup", Play.MouseUp);
        $("#gameCanvas").unbind('touchstart', Play.TouchStart);
        $("#gameCanvas").unbind('touchend', Play.TouchEnd);
        $("#gameCanvas").unbind('touchmove', Play.TouchMove);
        Sounds.ClearSound();
    };
    Play.Recover = function () {
        if (play.renderer || !world)
            return;
        play.onDialogPaint = [];
        play.currentFragment = "";
        play.keyHook = {};
        play.loopCycle = 0;
        play.showMinimap = false;
        if (("" + document.location).indexOf("maker.html") == -1 || world.PublicView === true || framework.Preferences['LastNonPublicWarning'] == Main.FormatDate(new Date()) || selfHosted)
            $("#releaseGameMessage").hide();
        else {
            framework.Preferences['LastNonPublicWarning'] = Main.FormatDate(new Date());
            Framework.SavePreferences();
            setTimeout(function () {
                $("#releaseGameMessage").hide();
            }, 30000);
        }
        if (!world)
            return;
        if (!$("#menubar").first())
            $("#gameMapContainer").first().style.top = "0px";
        Sounds.Init();
        play.renderer = new WorldRender(world);
        play.inField = false;
        play.keys = [];
        play.onPaint = [];
        world.ResetAreas();
        world.Player.InDialog = false;
        world.Player.ResetVariables();
        for (var i = 0; i < world.Codes.length; i++) {
            if (world.Codes[i].Enabled === false)
                continue;
            try {
                if (!world.Codes[i].code)
                    world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                if (world.Codes[i].code.HasFunction("AutoRun"))
                    world.Codes[i].code.ExecuteFunction("AutoRun", []);
                if (world.Codes[i].code.HasFunction("OnPaint"))
                    play.onPaint.push(world.Codes[i].code);
            }
            catch (ex) {
                Main.AddErrorMessage("Error in extension '" + world.Codes[i].Name + "': " + ex);
            }
        }
        if (play.onPaint && play.onPaint.length > 0) {
            play.renderer.OnRender = function (ctx) {
                // Run all the "OnPaint" functions defined
                engineGraphics.currentContext = ctx;
                //engineGraphics.currentCanvas = null;
                for (var i = 0; i < play.onPaint.length; i++)
                    play.onPaint[i].ExecuteFunction("OnPaint", []);
            };
        }
        $(window).bind("keydown", Play.KeyDown);
        $(window).bind("keyup", Play.KeyUp);
        $("#gameCanvas").bind("mousedown", Play.MouseDown);
        $("#gameCanvas").bind("touchstart", Play.TouchStart);
        if (world.ShowFPS) {
            if (play.fps)
                play.fps.show();
            else
                play.fps = new window['FPSMeter']({
                    top: (("" + document.location).indexOf("/maker.html") == -1 ? "5px" : "32px"), graph: 1, history: 40
                });
        }
        world.VisibleCenter(world.Player.AX, world.Player.AY, world.Player.Zone);
        play.mouseDown = false;
        play.firstClick = false;
        if ($("#loginBackground").is(":visible")) {
            play.inField = true;
            world.Player.InDialog = true;
        }
        var pos = InventoryMenu.Init(74);
        pos = ProfileMenu.Init(pos);
        pos = JournalMenu.Init(pos);
        pos = MessageMenu.Init(pos);
        Play.GameLoop();
        play.lastZone = null;
        play.lastRun = null;
        play.loopTimeRemains = 0;
    };
    // Switches to full screen mode on the first touch
    Play.FullScreen = function () {
        try {
            var doc = window.document;
            var docEl = doc.documentElement;
            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                requestFullScreen.call(docEl);
                play.isFullScreen = true;
            }
            else {
                cancelFullScreen.call(doc);
            }
        }
        catch (ex) {
            play.isFullScreen = true;
        }
    };
    Play.MouseDown = function (evt, isTouch) {
        if (isTouch === void 0) { isTouch = false; }
        if (SkillBar.HandleClick(evt.pageX, evt.pageY))
            return;
        play.mouseDown = true;
        play.firstClick = true;
        play.nbLoopsMouseDown = 0;
        if (!isTouch) {
            $("#gameCanvas").bind("mousemove", Play.MouseMove);
            $("#gameCanvas").bind("mouseup", Play.MouseUp);
        }
        play.lastMouseX = evt.pageX;
        play.lastMouseY = evt.pageY;
    };
    Play.MouseMove = function (evt) {
        play.lastMouseX = evt.pageX;
        play.lastMouseY = evt.pageY;
    };
    Play.HandleMouseDown = function () {
        if (!play.mouseDown)
            return;
        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;
        var coord = play.renderer.ScreenToMap(play.lastMouseX, play.lastMouseY);
        var x = coord.TileX * tileWidth + coord.OffsetX;
        var y = coord.TileY * tileHeight + coord.OffsetY;
        var area = world.GetArea(coord.AreaX, coord.AreaY, world.Player.Zone);
        if (play.firstClick) {
            var actors = area.ActorAt(x, y, true);
            if (actors && actors.length > 0) {
                for (var i = actors.length - 1; i >= 0; i--)
                    if (actors[i].PlayerMouseInteract(area.X, area.Y))
                        return;
            }
            var objects = area.HitObjects(x, y);
            if (objects && objects.length > 0) {
                for (var i = objects.length - 1; i >= 0; i--) {
                    if (objects[i].PlayerMouseInteract(area.X, area.Y)) {
                        play.mouseDown = false;
                        $("#gameCanvas").unbind("mousemove", Play.MouseMove);
                        $("#gameCanvas").unbind("mouseup", Play.MouseUp);
                        play.firstClick = false;
                        return;
                    }
                }
            }
        }
        play.nbLoopsMouseDown++;
        var actors = area.ActorAt(x, y, false);
        if (actors.length > 0)
            play.selectedActor = actors[actors.length - 1].Id;
        else if (play.selectedActor)
            play.selectedActor = null;
        if (play.firstClick || play.nbLoopsMouseDown % 20 == 0) {
            play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + coord.OffsetY, 20);
            if (!play.path) {
                play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + world.art.background.height, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth + world.art.background.height * 2, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth - world.art.background.height, 20);
                if (!play.path)
                    play.path = world.Player.PathTo(coord.RelativeX * tileWidth + coord.OffsetX, coord.RelativeY * tileWidth - world.art.background.height * 2, 20);
            }
        }
        if (!play.path) {
            var ax = play.lastMouseX - play.renderer.width / 2;
            var ay = play.lastMouseY - play.renderer.height / 2;
            var d = Math.round(EngineMath.CalculateAngle(ax, ay) * 7 / (Math.PI * 2));
            for (var i = 0; i < 4; i++)
                play.keys[i] = false;
            switch (d) {
                case 0:
                    play.keys[2] = true;
                    break;
                case 1:
                    play.keys[2] = true;
                    play.keys[3] = true;
                    break;
                case 2:
                    play.keys[3] = true;
                    break;
                case 3:
                    play.keys[3] = true;
                    play.keys[0] = true;
                    break;
                case 4:
                    play.keys[0] = true;
                    break;
                case 5:
                    play.keys[0] = true;
                    play.keys[1] = true;
                    break;
                case 6:
                    play.keys[1] = true;
                    break;
                case 7:
                    play.keys[1] = true;
                    play.keys[2] = true;
                    break;
                default:
                    break;
            }
        }
        play.firstClick = false;
    };
    Play.MouseUp = function (evt, isTouch) {
        if (isTouch === void 0) { isTouch = false; }
        for (var i = 0; i < 4; i++)
            play.keys[i] = false;
        play.mouseDown = false;
        if (play.nbLoopsMouseDown > 20)
            play.path = null;
        if (!isTouch) {
            $("#gameCanvas").unbind("mousemove", Play.MouseMove);
            $("#gameCanvas").unbind("mouseup", Play.MouseUp);
        }
    };
    // Re-route the touch to the mouse down
    Play.TouchStart = function (evt) {
        if (!play.isFullScreen)
            Play.FullScreen();
        var touch = null;
        for (var i = 0; i < evt.touches.length; i++) {
            touch = evt.touches[i];
            break;
        }
        if (touch != null)
            Play.MouseDown(touch, true);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        $("#gameCanvas").bind('touchend', Play.TouchEnd);
        $("#gameCanvas").bind('touchmove', Play.TouchMove);
        return false;
    };
    // Re-route to mouse up, and removes the bindings
    Play.TouchEnd = function (evt) {
        var touch = null;
        for (var i = 0; i < evt.changedTouches.length; i++) {
            touch = evt.changedTouches[i];
            break;
        }
        if (touch != null) {
            Play.MouseUp(touch, true);
        }
        $("#gameCanvas").unbind('touchend', Play.TouchEnd);
        $("#gameCanvas").unbind('touchmove', Play.TouchMove);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        return false;
    };
    // Re-route to mouse move
    Play.TouchMove = function (evt) {
        var touch = null;
        for (var i = 0; i < evt.changedTouches.length; i++) {
            touch = evt.changedTouches[i];
            break;
        }
        if (touch != null)
            Play.MouseMove(touch);
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.cancelBubble = true;
        evt.returnValue = false;
        return false;
    };
    Play.KeyDown = function (evt) {
        if (play.inField)
            return;
        var keyString = evt.key.toLowerCase();
        if (play.keys[16])
            keyString = keyString.toUpperCase();
        if (play.keys[17])
            keyString = "^" + keyString;
        if (play.keys[18])
            keyString = "!" + keyString;
        if (play.keyHook[keyString]) {
            ExecuteCodeFunction.ExecuteFunction([play.keyHook[keyString]]);
            return;
        }
        // http://keycode.info/
        switch (evt.keyCode) {
            case 13:
                Chat.Focus();
                break;
            case 73:
                InventoryMenu.Toggle();
                break;
            case 74:
                JournalMenu.Toggle();
                break;
            case 77:
                MessageMenu.Toggle();
                break;
            case 80:
                ProfileMenu.Toggle();
                break;
            case 48: // 0
            case 49: // 1
            case 50: // 2
            case 51: // 3
            case 52: // 4
            case 53: // 5
            case 54: // 6
            case 55: // 7
            case 56: // 8
            case 57:
                SkillBar.SelectQuickslot(evt.keyCode - 48);
                break;
            default:
                play.keys[evt.keyCode] = true;
                break;
        }
        //console.log(evt.keyCode);
    };
    Play.KeyUp = function (evt) {
        if (play.inField)
            return;
        play.keys[evt.keyCode] = false;
    };
    Play.HandleKeys = function () {
        if (!world.Player.CurrentArea)
            return;
        var updateFrame = false;
        var nx = world.Player.X;
        var ny = world.Player.Y;
        // Up key
        if (play.keys[1] === true || play.keys[38] === true || play.keys[87] === true) {
            ny -= world.Player.Speed;
            world.Player.Direction = 3;
            updateFrame = true;
            play.path = null;
        }
        // Left key
        if (play.keys[0] === true || play.keys[37] === true || play.keys[65] === true) {
            nx -= world.Player.Speed;
            world.Player.Direction = 1;
            updateFrame = true;
            play.path = null;
        }
        // Right key
        if (play.keys[2] === true || play.keys[39] === true || play.keys[68] === true) {
            nx += world.Player.Speed;
            world.Player.Direction = 2;
            updateFrame = true;
            play.path = null;
        }
        // Down key
        if (play.keys[3] === true || play.keys[40] === true || play.keys[83] === true) {
            ny += world.Player.Speed;
            world.Player.Direction = 0;
            updateFrame = true;
            play.path = null;
        }
        if (play.path && play.path.length > 0) {
            var p = play.path[0];
            var sx = Math.abs(p.x - world.Player.X);
            var sy = Math.abs(p.y - world.Player.Y);
            if (sx <= world.Player.Speed && sy <= world.Player.Speed) {
                nx = p.x;
                ny = p.y;
                play.path.shift();
            }
            else {
                if (p.x > nx && sx > world.Player.Speed) {
                    nx += world.Player.Speed;
                    world.Player.Direction = 2;
                    updateFrame = true;
                }
                else if (p.x < nx && sx > world.Player.Speed) {
                    nx -= world.Player.Speed;
                    world.Player.Direction = 1;
                    updateFrame = true;
                }
                if (p.y > ny && sy > world.Player.Speed) {
                    ny += world.Player.Speed;
                    world.Player.Direction = 0;
                    updateFrame = true;
                }
                else if (p.y < ny && sy > world.Player.Speed) {
                    ny -= world.Player.Speed;
                    world.Player.Direction = 3;
                    updateFrame = true;
                }
            }
        }
        var tileWidth = world.art.background.width;
        var tileHeight = world.art.background.height;
        if (nx != world.Player.X || ny != world.Player.Y) {
            //console.log("" + world.Player.X + ", " + world.Player.Y);
            if (world.Player.CanWalkOn(nx, ny)) {
                var ox = Math.floor(world.Player.X / tileWidth);
                var oy = Math.floor(world.Player.Y / tileHeight);
                world.Player.X = nx;
                world.Player.Y = ny;
                var ax = world.Player.CurrentArea.X;
                var ay = world.Player.CurrentArea.Y;
                if (updateFrame) {
                    if (world.art.characters[world.Player.Name].animationCycle == "simple")
                        world.Player.Frame = (world.Player.Frame + 1) % (world.art.characters[world.Player.Name].frames * world.art.characters[world.Player.Name].imageFrameDivider);
                    else
                        world.Player.Frame = (world.Player.Frame + 1) % ((world.art.characters[world.Player.Name].frames + 1) * world.art.characters[world.Player.Name].imageFrameDivider);
                }
                world.Player.UpdatePosition();
                //var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone, world.art.background.width * 2);
                if (!world.Player.CurrentArea)
                    return;
                var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone);
                if (action && action.Check()) {
                    if (action != play.lastAction)
                        action.Execute();
                    play.lastAction = action;
                }
                else
                    play.lastAction = action;
                if (world.Player.CurrentArea) {
                    var objects = world.Player.CurrentArea.GetObjects(Math.floor(world.Player.X / world.art.background.width), Math.floor(world.Player.Y / world.art.background.height), world.Player.Zone);
                    for (var i = 0; i < objects.length; i++) {
                        if (!(objects[i] instanceof WorldObject))
                            continue;
                        var objInfo = world.art.objects[objects[i].Name];
                        if (objInfo && objInfo.walkActions && objInfo.walkActions.length > 0) {
                            //var hoverObj = "" + objects[i].Name + "," + world.Player.Zone + "," + (objects[i].X + world.Player.AX * world.areaWidth * world.art.background.width) + "," + (objects[i].Y + world.Player.AY * world.areaHeight * world.art.background.height);
                            var hoverObj = objects[i].GetId(world.Player.AX, world.Player.AY, world.Player.Zone);
                            if (play.lastObjectHover != hoverObj) {
                                play.lastObjectHover = hoverObj;
                                objects[i].PlayerInteract(world.Player.AX, world.Player.AY);
                            }
                        }
                    }
                }
                // Update path after crossing the border
                if (play.path && play.path.length > 0) {
                    if (ax > world.Player.CurrentArea.X)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].x += (world.areaWidth - 0) * tileWidth;
                    if (ax < world.Player.CurrentArea.X)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].x -= (world.areaWidth - 0) * tileWidth;
                    if (ay > world.Player.CurrentArea.Y)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].y += (world.areaHeight - 0) * tileHeight;
                    if (ay < world.Player.CurrentArea.Y)
                        for (var i = 0; i < play.path.length; i++)
                            play.path[i].y -= (world.areaHeight - 0) * tileHeight;
                }
            }
            else {
                play.path = null;
                // Currently walking?
                if (updateFrame) {
                    var collidedWith = world.Player.CollideObject(nx, ny);
                    if (collidedWith)
                        collidedWith.PlayerInteract(world.Player.AX, world.Player.AY);
                }
            }
        }
        else
            world.Player.UpdatePosition();
    };
    Play.DeveloperTools = function () {
        if (("" + document.location).indexOf("localhost") != -1 || Main.CheckNW())
            return false;
        if (!window['devChromeDetect']) {
            window['devChromeDetect'] = new Image();
            window['devChromeDetect']['__defineGetter__']('id', function () {
                play.devTools = true;
            });
        }
        if (!play.devTools) {
            if (window['__IE_DEVTOOLBAR_CONSOLE_COMMAND_LINE'])
                play.devTools = true;
            if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) == true) {
                console.log(window['devChromeDetect']);
                console.clear();
            }
        }
        return play.devTools;
    };
    Play.GameLoop = function () {
        if (world.IsLoading()) {
            if (window['mozRequestAnimationFrame'])
                play.looper = window['mozRequestAnimationFrame'](Play.GameLoop);
            else if (window['requestAnimationFrame'])
                play.looper = window['requestAnimationFrame'](Play.GameLoop);
            else
                play.looper = setTimeout(Play.GameLoop, 16);
            play.lastRun = new Date();
            play.loopTimeRemains = 0;
            return;
        }
        if (Play.DeveloperTools()) {
            $("#cheatDetected").show();
        }
        if (!play.renderer)
            return;
        if (play.loopCycle % 15 && play.loopCycle != 0) {
            var newFrag = AreaFragment.AllCurrentFragments(world.Player.Zone);
            if (newFrag != play.currentFragment)
                world.ResetFragments();
            play.currentFragment = newFrag;
            play.loopCycle = 0;
        }
        play.loopCycle++;
        if (world.ShowFPS)
            play.fps.tickStart();
        if (window['mozRequestAnimationFrame'])
            play.looper = window['mozRequestAnimationFrame'](Play.GameLoop);
        else if (window['requestAnimationFrame'])
            play.looper = window['requestAnimationFrame'](Play.GameLoop);
        else
            play.looper = setTimeout(Play.GameLoop, 16);
        if (!world.Player.CurrentArea || world.Player.CurrentArea.Zone != world.Player.Zone) {
            world.Player.CurrentArea = world.GetArea(world.Player.AX, world.Player.AY, world.Player.Zone);
            if (world.Player.CurrentArea)
                world.Player.CurrentArea.actors.push(world.Player);
            else {
                return;
            }
        }
        if (!world.Player.CurrentArea) {
            play.lastRun = new Date();
            play.loopTimeRemains = 0;
            return;
        }
        play.renderer.minimap = play.showMinimap;
        play.renderer.offsetX = world.Player.X - Math.round(play.renderer.width / 2);
        play.renderer.offsetY = world.Player.Y - Math.round(play.renderer.height / 2);
        play.renderer.areaX = world.Player.CurrentArea.X;
        play.renderer.areaY = world.Player.CurrentArea.Y;
        play.renderer.zone = world.Player.Zone;
        play.renderer.Render();
        //Play.RenderPlayerPath();
        if (world.Player.InDialog) {
            for (var i = 0; i < play.onDialogPaint.length; i++) {
                CodeParser.ExecuteStatement(play.onDialogPaint[i]);
            }
        }
        var now = new Date();
        if (!play.lastRun)
            play.lastRun = now;
        var diff = now.getTime() - play.lastRun.getTime();
        play.loopTimeRemains += diff;
        play.lastRun = now;
        var i = 0;
        var maxRun = 4;
        for (; i < maxRun && play.loopTimeRemains >= 16 && ((new Date()).getDate() - now.getDate()) < 35; i++) {
            Play.GameLogic();
            play.loopTimeRemains -= 16;
        }
        if (play.loopTimeRemains > 16 * (maxRun - 1))
            play.loopTimeRemains = 16 * (maxRun - 1);
        if (diff < 22)
            play.loopTimeRemains = 0;
        SkillBar.Render();
        if (world.ShowFPS)
            play.fps.tick();
    };
    Play.GameLogic = function () {
        if (!world.Player.CurrentArea)
            return;
        // Still running
        if (world.CountAreaToLoad() > 0 && play.afterTeleport)
            return;
        if (play.lastZone != world.Player.Zone) {
            var zoneInfo = world.GetZone(world.Player.Zone);
            play.currentFragment = "";
            play.lastZone = world.Player.Zone;
            Sounds.Init();
            if (zoneInfo.MapMusic)
                Sounds.Play(zoneInfo.MapMusic, 0.6, true);
            if (world.Edition != EditorEdition.Demo && zoneInfo.MapEffect && zoneInfo.MapEffect != "None")
                play.renderer.mapEffect = new window[zoneInfo.MapEffect + "Effect"]();
            else
                play.renderer.mapEffect = null;
        }
        if (play.afterTeleport) {
            var action = world.Player.CurrentArea.GetActions(world.Player.X, world.Player.Y, world.Player.Zone);
            if (action && action.Check())
                play.lastAction = action;
            else
                play.lastAction = null;
            play.afterTeleport = false;
        }
        // Handles the actors around
        for (var a = -1; a < 2; a++) {
            for (var b = -1; b < 2; b++) {
                if (!world.Player.CurrentArea)
                    return;
                var area = world.GetArea(world.Player.CurrentArea.X + a, world.Player.CurrentArea.Y + b, world.Player.Zone);
                if (area)
                    area.HandleActors();
            }
        }
        if (!world.Player.InDialog && !$("#mapLoadingPage").is(":visible")) {
            Play.HandleMouseDown();
            if (play.selectedActor) {
                if (MovingActor.FindActorById(play.selectedActor))
                    world.Player.InvokeSkillFunction(world.Player.CurrentSkill, "Action", [new VariableValue(play.selectedActor)]);
                else
                    play.selectedActor = null;
            }
            Play.HandleKeys();
        }
    };
    Play.RenderPlayerPath = function () {
        if (!play.path || play.path.length == 0)
            return;
        var ctx = $("#gameCanvas").first().getContext("2d");
        ctx.fillStyle = "#FF0000";
        for (var i = 0; i < play.path.length; i++) {
            var p = play.renderer.MapToScreen(play.path[i].x, play.path[i].y);
            ctx.fillRect(p.X + world.art.background.width / 2 - 4, p.Y + world.art.background.height / 2 - 4, 8, 8);
        }
    };
    Play.EnterField = function () {
        play.inField = true;
    };
    Play.ExitField = function () {
        play.inField = false;
    };
    return Play;
}());
var gameList = new ((function () {
    function class_31() {
    }
    return class_31;
}()));
var GameList = (function () {
    function GameList() {
    }
    GameList.Dispose = function () {
    };
    GameList.Recover = function () {
        if (Main.CheckNW())
            $("#helpLink").first().onclick = function () {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
        GameList.Search();
    };
    GameList.Search = function () {
        if (gameList.searchTimeout)
            clearTimeout(gameList.searchTimeout);
        gameList.searchTimeout = setTimeout(GameList.DoSearch, 500);
    };
    GameList.DoSearch = function () {
        gameList.searchTimeout = null;
        $.ajax({
            type: 'POST',
            url: '/backend/GameList',
            data: {
                token: framework.Preferences['token'],
                search: $("#searchGame").val().trim()
            },
            success: function (msg) {
                var data = TryParse(msg);
                gameList.data = data.games;
                GameList.ShowList();
            },
            error: function (msg) {
                var data = TryParse(msg);
                if (data && data.error)
                    $("#gameList").html(data.error);
                else
                    $("#gameList").html(("" + msg).htmlEntities());
            }
        });
    };
    GameList.ShowList = function () {
        var html = "";
        html += "<table>";
        html += "<thead>";
        html += "<tr><td>&nbsp;</td><td>Name</td><td>Description</td></tr>";
        html += "</thead>";
        html += "<tbody>";
        for (var i = 0; i < gameList.data.length; i++) {
            html += "<tr>";
            html += "<td>";
            if (gameList.data[i].can_edit == 'Y')
                html += "<a class='button' href='/maker.html?game=" + gameList.data[i].name.replace(/ /g, "_") + "'>Manage</a>";
            else
                html += "<a class='button' href='/play.html?game=" + gameList.data[i].name.replace(/ /g, "_") + "'>Play</a>";
            html += "</td>";
            html += "<td>" + (gameList.data[i].name ? gameList.data[i].name.htmlEntities() : "") + "</td>";
            html += "<td>" + Main.TextTransform(gameList.data[i].description ? gameList.data[i].description : "") + "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        $("#gameList").html(html);
    };
    GameList.ShowCreateGame = function () {
        $("#showCreateGame").show();
    };
    GameList.HideCreateGame = function () {
        $("#showCreateGame").hide();
    };
    GameList.CreateGame = function () {
        var name = $("#newGameName").val().trim();
        if (name.replace(/[a-z 0-9]+/gi, "").length > 0) {
            Framework.Alert("Only letters, numbers and spaces are allowed within a game name");
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/backend/OwnerCreateGame',
            data: {
                token: framework.Preferences['token'],
                name: name
            },
            success: function (msg) {
                var data = TryParse(msg);
                if (data.error) {
                    $("#result").html(data.error);
                    return;
                }
                document.location.replace("/maker.html?id=" + data.id);
            },
            error: function (msg) {
                var data = TryParse(msg);
                if (data.error)
                    $("#result").html(data.error);
                else
                    $("#result").html(("" + msg).htmlEntities());
            }
        });
    };
    return GameList;
}());
var Logout = (function () {
    function Logout() {
    }
    Logout.Dispose = function () {
    };
    Logout.Recover = function () {
        delete framework.Preferences['token'];
        delete framework.Preferences['user'];
        Framework.SavePreferences();
        var query = Framework.ParseQuery();
        if (selfHosted)
            document.location.assign("/");
        else if (("" + document.location).indexOf("/maker.html?") != -1)
            document.location.assign("/");
        else
            document.location.assign("/play.html?game=" + query.game);
    };
    return Logout;
}());

//# sourceMappingURL=runtime-self-hosted.js.map
