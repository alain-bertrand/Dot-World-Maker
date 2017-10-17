var particleEditor = new (class
{
    public listObject: ListSelector;
    public selected: number;
    public refreshInterval: number = null;
    public system: ParticleSystem;
});

class ParticleEditor
{
    public static Dispose()
    {
        if (particleEditor.listObject)
            particleEditor.listObject.Dispose();
        particleEditor.listObject = null;
        $(window).unbind("resize", ParticleEditor.Resize);
        if (particleEditor.refreshInterval)
            clearInterval(particleEditor.refreshInterval);
        particleEditor.refreshInterval = null;
        particleEditor.system = null;
    }

    public static IsAccessible()
    {
        if (world.Edition == EditorEdition.Demo && !Main.CheckNW())
            return false;
        return (("" + document.location).indexOf("/maker.html") != -1 || ("" + document.location).indexOf("/demo_particles.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#listObject").css("top", "5px");
            $("#particleDetails").css("top", "5px");
        }

        particleEditor.listObject = new ListSelector("listObject", world.ParticleEffects, "Name");
        particleEditor.listObject.OnSelect = (rowId: number) =>
        {
            Framework.SetLocation({
                action: "ParticleEditor", id: rowId === null ? null : world.ParticleEffects[rowId].Name
            });

            particleEditor.selected = rowId;
            if (particleEditor.selected !== null)
                particleEditor.system = ParticleSystem.Rebuild(world.ParticleEffects[rowId]);
            else
                particleEditor.system = null;
            ParticleEditor.UpdateEditor();
        };

        $(window).bind("resize", ParticleEditor.Resize);
        ParticleEditor.Resize();

        particleEditor.refreshInterval = setInterval(ParticleEditor.Update, 16);
        if (("" + document.location).indexOf("/demo_particles.html") !== -1)
        {
            $("#mainCommands .button").eq(3).hide();
            particleEditor.listObject.Select(1);
            $("#listObject").css("top", "5px");
            $("#particleDetails").css("top", "5px");
        }

        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.ParticleEffects.length; i++)
            {
                if (world.ParticleEffects[i].Name == framework.CurrentUrl.id)
                {
                    particleEditor.listObject.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "ParticleEditor"
                });
                particleEditor.listObject.Select(null);
                return;
            }
        }
        else
            particleEditor.listObject.Select(null);
    }

    static Restart()
    {
        if (!particleEditor.system)
            return;
        particleEditor.system.Reset();
    }

    static New()
    {
        var nextId = 1;
        while (world.GetParticleSystem("system_" + nextId))
            nextId++;
        var newSystem = new ParticleSystem();
        newSystem.Name = "system_" + nextId;
        world.ParticleEffects.push(newSystem.Serialize());
        particleEditor.selected = world.ParticleEffects.length - 1;
        particleEditor.system = newSystem;
        ParticleEditor.UpdateEditor();
        particleEditor.listObject.UpdateList();
        particleEditor.listObject.Select(particleEditor.selected);
        SearchPanel.Update();
    }

    static Clone()
    {
        if (!particleEditor.system)
            return;
        var nextId = 1;
        while (world.GetParticleSystem("system_" + nextId))
            nextId++;
        var newSystem = ParticleSystem.Rebuild(particleEditor.system.Serialize());
        newSystem.Name = "system_" + nextId;
        world.ParticleEffects.push(newSystem.Serialize());
        particleEditor.selected = world.ParticleEffects.length - 1;
        particleEditor.system = newSystem;
        ParticleEditor.UpdateEditor();
        particleEditor.listObject.UpdateList();
        particleEditor.listObject.Select(particleEditor.selected);
        SearchPanel.Update();
    }

    static Delete()
    {
        if (!particleEditor.system)
            return;
        var oldName = particleEditor.system.Name;
        world.ParticleEffects.splice(particleEditor.selected, 1);
        particleEditor.selected = null;
        particleEditor.listObject.UpdateList();
        particleEditor.listObject.Select(null);
        SearchPanel.Update();

        for (var item in world.art.objects)
        {
            if (world.art.objects[item].particleEffect == oldName)
                world.art.objects[item].particleEffect = null;
        }
    }

    static UpdateEditor()
    {
        if (!particleEditor.system)
        {
            $("#particleDetails").html("");
            return;
        }

        var html = "";
        html += "<h2>System</h2>";
        html += "<table>";
        for (var i = 0; i < particleSystemParameters.length; i++)
        {
            var param = particleSystemParameters[i];
            if (param == "Effectors")
                continue;
            if (param == "ParticleType")
            {
                html += "<tr><td>Particle Type:</td><td><select id='" + param + "' onchange='ParticleEditor.Change(\"" + param + "\")'>";
                html += "<option value='0'" + (!particleEditor.system.ParticleType ? " selected" : "") + ">Blocks</option>";
                html += "<option value='1'" + (particleEditor.system.ParticleType == 1 ? " selected" : "") + ">Blobs</option>";
                html += "<option value='2'" + (particleEditor.system.ParticleType == 2 ? " selected" : "") + ">Sparkles</option>";
                html += "<option value='3'" + (particleEditor.system.ParticleType == 3 ? " selected" : "") + ">Disks</option>";
                html += "</select></td></tr>";
            }
            else
                html += "<tr><td>" + param.title() + ":</td><td><input type='text' id='" + param + "' onkeyup='ParticleEditor.Change(\"" + param + "\")' value='" + ("" + particleEditor.system[param]).htmlEntities() + "'/></td></tr>";
        }
        html += "</table>";

        html += "<h2>Emitter</h2>";
        html += "<table>";
        html += "<tr><td>Emitter Type:</td><td>";
        html += "<select id='changeEmitter' onchange='ParticleEditor.ChangeEmitter()'>";
        var currentEmitter = ("" + particleEditor.system.Emitter.constructor).match(/function ([^\(]+)\(/)[1];
        for (var i = 0; i < knownParticleEmitters.length; i++)
        {
            html += "<option value='" + knownParticleEmitters[i] + "'" + (currentEmitter == knownParticleEmitters[i] ? " selected" : "") + ">" + knownParticleEmitters[i].substr(15) + "</option>";
        }
        html += "</select></td></tr>";
        for (var item in particleEditor.system.Emitter)
        {
            if (typeof particleEditor.system.Emitter[item] == "function" || item.charAt(0) == "_")
                continue;
            html += "<tr><td>" + item.title() + ":</td><td><input type='text' id='emitter_" + item + "' onkeyup='ParticleEditor.ChangeEmitterValue(\"" + item + "\")' value='" + ("" + (particleEditor.system.Emitter[item] === null ? "" : particleEditor.system.Emitter[item])).htmlEntities() + "'/></td></tr>";
        }
        html += "</table>";

        for (var i = 0; i < particleEditor.system.Effectors.length; i++)
        {
            var effector = particleEditor.system.Effectors[i];
            var className = ("" + effector.constructor).match(/function ([^\(]+)\(/)[1];
            html += "<h2>" + className.substr(8) + " <span class='button' onclick='ParticleEditor.RemoveEffect(" + i + ");'>Remove</span></h2>";
            html += "<table>";
            for (var item in effector)
            {
                if (typeof effector[item] == "function")
                    continue;
                html += "<tr><td>" + item.title() + ":</td><td><input type='text' id='effect_" + i + "_" + item + "' onkeyup='ParticleEditor.ChangeEffect(" + i + ",\"" + item + "\")' value='" + ("" + (effector[item] === null ? "" : effector[item])).htmlEntities() + "'/></td></tr>";
            }
            html += "</table>";
        }

        html += "<br><br>";
        html += "<select id='addEffect' onchange='ParticleEditor.AddEffect()'>";
        html += "<option value=''>-- Add a new effect --</option>";
        for (var i = 0; i < knownParticleEffectors.length; i++)
        {
            html += "<option value='" + knownParticleEffectors[i] + "'>" + knownParticleEffectors[i].substr(8) + "</option>";
        }
        html += "</select>";

        $("#particleDetails").html(html);
    }

    static ChangeEmitter()
    {
        var newEmitter: ParticleEmitter = <ParticleEmitter>new window[$("#changeEmitter").val()]();
        var oldEmiter = particleEditor.system.Emitter;

        for (var item in newEmitter)
        {
            if (typeof newEmitter[item] == "function")
                continue;
            if (oldEmiter[item] !== null && oldEmiter[item] !== undefined)
                newEmitter[item] = oldEmiter[item];
        }

        particleEditor.system.Emitter = newEmitter;
        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
        particleEditor.system.Reset();
        ParticleEditor.UpdateEditor();
    }

    static ChangeEmitterValue(field)
    {
        var n = parseFloat($("#emitter_" + field).val());
        var fieldName = field + "@" + ("" + particleEditor.system.Emitter.constructor).match(/function ([^\(]+)\(/)[1];
        var fieldName2 = field + "@ParticleEmitter";
        if (isNaN(n))
        {
            if (knownParticleEffectorsNullableProperties.indexOf(fieldName) != -1 || knownParticleEffectorsNullableProperties.indexOf(fieldName2) != -1)
                particleEditor.system.Emitter[field] = null;
        }
        else
            particleEditor.system.Emitter[field] = n;
        particleEditor.system.Reset();
        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
    }

    static AddEffect()
    {
        var name = $("#addEffect").val();
        (<HTMLSelectElement>$("#addEffect").first()).selectedIndex = 0;

        if (name != "ParticleAttractor" && name != "ParticleRepulsor")
        {
            var found = false;
            for (var i = 0; i < particleEditor.system.Effectors.length; i++)
            {
                var className = ("" + particleEditor.system.Effectors[i].constructor).match(/function ([^\(]+)\(/)[1];
                if (className == name)
                {
                    found = true;
                    break;
                }
            }
            if (found)
                return;
        }
        particleEditor.system.Effectors.push(new window[name]());
        particleEditor.system.Reset();
        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
        ParticleEditor.UpdateEditor();
    }

    static RemoveEffect(effectId: number)
    {
        particleEditor.system.Effectors.splice(effectId, 1);
        particleEditor.system.Reset();
        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
        ParticleEditor.UpdateEditor();
    }

    static ChangeEffect(effectId: number, field: string)
    {
        var val = $("#effect_" + effectId + "_" + field).val();

        var fieldName = field + "@" + ("" + particleEditor.system.Effectors[effectId].constructor).match(/function ([^\(]+)\(/)[1];
        if (knownParticleEffectorsNumberProperties.indexOf(fieldName) != -1)
        {
            var n = parseFloat(val);
            if (isNaN(n))
            {
                if (knownParticleEffectorsNullableProperties.indexOf(fieldName) != -1)
                    particleEditor.system.Effectors[effectId][field] = null;
            }
            else
                particleEditor.system.Effectors[effectId][field] = n;
        }
        else
        {
            particleEditor.system.Effectors[effectId][field] = val;
        }

        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
        particleEditor.system.Reset();
    }

    static Change(field: string)
    {
        var val = $("#" + field).val();
        var fieldName = field + "@ParticleSystem";

        if (field == "Name")
        {
            if ((val.match(databaseNameRule) || !val || val.length < 1) || (world.GetParticleSystem(val) && world.GetParticleSystem(val).Serialize() != particleEditor.system.Serialize()))
            {
                $("#" + field).css('backgroundColor', '#FFE0E0');
                return;
            }
            else
                $("#" + field).css('backgroundColor', '');
            var oldName = particleEditor.system.Name;
            var newName = val;
            particleEditor.system[field] = val;
            world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
            particleEditor.listObject.UpdateList();
            SearchPanel.Update();

            for (var item in world.art.objects)
            {
                if (world.art.objects[item].particleEffect == oldName)
                    world.art.objects[item].particleEffect = newName;
            }
        }
        else
        {
            if (knownParticleEffectorsNullableProperties.indexOf(fieldName) !== -1 && (!val || val.trim() == ""))
                particleEditor.system[field] = null;
            else if (!isNaN(parseFloat(val)))
                particleEditor.system[field] = parseFloat(val);
        }
        particleEditor.system.Reset();
        world.ParticleEffects[particleEditor.selected] = particleEditor.system.Serialize();
    }

    static Resize()
    {
        var canvas = <HTMLCanvasElement>$("#particlePreview").first();
        canvas.width = $("#particlePreviewContainer").width();
        canvas.height = $("#particlePreviewContainer").height();
    }

    static Update()
    {
        var canvas = <HTMLCanvasElement>$("#particlePreview").first();
        if (!canvas)
            return;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!particleEditor.system)
            return;

        var start = new Date();
        ctx.save();
        ctx.translate(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
        particleEditor.system.Draw(ctx);
        var end = new Date();

        particleEditor.system.Emitter.Draw(ctx);
        for (var i = 0; i < particleEditor.system.Effectors.length; i++)
            particleEditor.system.Effectors[i].Draw(ctx);

        ctx.restore();

        var diff = end.getTime() - start.getTime();
        if (diff > 6)
            ctx.fillStyle = "#FF0000";
        else if (diff > 2)
            ctx.fillStyle = "#FFE000";
        else
            ctx.fillStyle = "#00FF00";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeText("Speed: " + diff + " msec., particles: " + particleEditor.system.particles.length, 5, 20);
        ctx.fillText("Speed: " + diff + " msec., particles: " + particleEditor.system.particles.length, 5, 20);
    }
}