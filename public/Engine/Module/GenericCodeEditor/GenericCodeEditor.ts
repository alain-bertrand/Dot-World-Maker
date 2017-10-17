var genericCodeEditor = new (class
{
    selector: ListSelector = null;
    //editor: CodeMirror.EditorFromTextArea = null;
    editor: CodeGraphEditor = null;
    selected: KnownCode;
    itemsTypes: SearchGameItem[];
});

class GenericCodeEditor
{
    public static Dispose()
    {
        genericCodeEditor.editor = null;
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        genericCodeEditor.itemsTypes = [
            { object: world.art.characters, title: "Characters", action: "ArtCharacterEditor", },
            { object: world.art.houses, title: "Houses", action: "HouseEditor" },
            { object: world.art.house_parts, title: "House parts", action: "HousePart" },
            { object: world.art.objects, title: "Map Objects", action: "ArtObjectEditor" },
            { object: world.InventorySlots, title: "Inventory Slots", action: "InventorySlotEditor" },
            { object: world.Monsters, title: "Monsters", action: "MonsterEditor", store: (o) => { return o.Store(); }, map: (o) => { return KnownMonster.Rebuild(o); } },
            { object: world.NPCs, title: "NPCs", action: "NPCEditor" },
            { object: world.InventoryObjects, title: "Objects", action: "ObjectEditor", map: (o) => { return Object.cast(o, KnownObject); } },
            { object: world.InventoryObjectTypes, title: "Object Types", action: "ObjectTypeEditor", map: (o) => { return Object.cast(o, ObjectType); } },
            { object: world.ParticleEffects, title: "Particles Effects", action: "ParticleEditor" },
            { object: world.Quests, title: "Quests", action: "QuestEditor" },
            { object: world.Skills, title: "Skills", action: "SkillEditor", store: (o) => { return o.Store(); }, map: (o) => { return KnownSkill.Rebuild(o); } },
            { object: world.Stats, title: "Stats", action: "StatEditor", store: (o) => { return o.Store(); }, map: (o) => { return KnownStat.Rebuild(o); } },
            { object: world.TemporaryEffects, title: "Temporary Effects", action: "TemporaryEffectEditor" },
            { object: world.Zones, title: "Zones", action: "ZoneEditor" },
            { object: world.ChatBots, title: "Chat Bots", action: "ChatBotEditor", map: (o) => { return ChatBot.Rebuild(o); }, store: (o) => { return o.Store(); } },
        ];

        genericCodeEditor.itemsTypes.sort((a, b) =>
        {
            if (a.title > b.title)
                return 1;
            if (a.title < b.title)
                return -1;
            return 0;
        });

        if (Main.CheckNW())
        {
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };
            $("#objectList").css("top", "5px");
            $("#codeNameProperty").css("top", "5px");
            $(".elementCodeWarning").css("top", "40px");
            $("#genericCodeContainer").css("top", "60px");
        }

        if (!genericCodeEditor.editor)
        {
            //genericCodeEditor.editor = CodeEditor.Create("#baseCode");
            genericCodeEditor.editor = new CodeGraphEditor("baseCode", true);
            genericCodeEditor.editor.OnChange = GenericCodeEditor.ChangeCode;
        }

        genericCodeEditor.selector = new ListSelector("objectList", world.Codes, "Name");
        genericCodeEditor.selector.OnSelect = GenericCodeEditor.SelectObject;
        if (framework.CurrentUrl.id)
        {
            var found = false;
            for (var i = 0; i < world.Codes.length; i++)
            {
                if (world.Codes[i].Name == framework.CurrentUrl.id)
                {
                    genericCodeEditor.selector.Select(i);
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                Framework.SetLocation({
                    action: "GenericCodeEditor"
                });
                genericCodeEditor.selector.Select(null);
                return;
            }
        }
        else
            genericCodeEditor.selector.Select(null);
    }

    public static SelectObject(rowId: number)
    {
        Framework.SetLocation({
            action: "GenericCodeEditor", id: rowId === null ? null : world.Codes[rowId].Name
        });
        $("#codeName").css('backgroundColor', '');
        if (rowId == null)
        {
            $("#genericCodeParameters").html("");
            $("#codeName").val("").prop("disabled", true);
            genericCodeEditor.editor.SetCode("");
            genericCodeEditor.selected = null;
            GenericCodeEditor.ShowIncludeLists();
            genericCodeEditor.editor.SetReadonly(true);

            $("#genericCodeDescriptionText").val("").prop("disabled", true);
            $("#extEnabled").val("Yes").prop("disabled", true);
            $("#extCodePrice").val("").prop("disabled", true);
            $("#extCodeVersion").val("").prop("disabled", true);
            $("#extCodeBrowsing").val("Yes").prop("disabled", true);
            $("#extAllowEdit").val("Yes").prop("disabled", true);
            return;
        }

        genericCodeEditor.selected = world.Codes[rowId];
        $("#codeName").val(genericCodeEditor.selected.Name).prop("disabled", false);
        genericCodeEditor.editor.SetCode(genericCodeEditor.selected.Source.trim());

        $(".elementCodeWarning").hide();
        var code = $("#baseCode").val();
        /*try
        {
            CodeParser.ParseWithParameters(genericCodeEditor.selected.Source, genericCodeEditor.selected.Parameters);
        }
        catch (ex)
        {
            var m = ("" + ex).match(/ ([0-9]+):([0-9]+)/);
            if (m != null)
                genericCodeEditor.editor.addLineClass(parseInt(m[1]) - 1, 'background', "line-error");

            $(".elementCodeWarning").show().html(ex);
        }*/

        // Must show the description
        if (genericCodeEditor.selected.Description)
            GenericCodeEditor.ShowDescription();
        // Must show parameters
        else if (genericCodeEditor.selected.Parameters && Keys(genericCodeEditor.selected.Parameters).length > 0)
            GenericCodeEditor.ShowParameters();
        // Must show code
        else if (!genericCodeEditor.selected.Parameters || Keys(genericCodeEditor.selected.Parameters).length == 0)
        {
            GenericCodeEditor.ShowCode();
            genericCodeEditor.editor.Refresh();
        }

        GenericCodeEditor.UpdateParameters();
        $("#extCodePrice").val(genericCodeEditor.selected.Price ? genericCodeEditor.selected.Price : "0").prop("disabled", false);
        $("#extCodeVersion").val(genericCodeEditor.selected.Version ? genericCodeEditor.selected.Version : "1.0.0").prop("disabled", false);
        $("#codeName").prop("disabled", false);
        $("#genericCodeDescriptionText").prop("disabled", false).val(genericCodeEditor.selected.Description ? genericCodeEditor.selected.Description : "");
        $("#extEnabled").prop("disabled", false).val(genericCodeEditor.selected.Enabled === false ? "No" : "Yes");
        $("#extCodeBrowsing").prop("disabled", false).val(genericCodeEditor.selected.CodeBrowsing === false ? "No" : "Yes");
        $("#extAllowEdit").prop("disabled", false).val(genericCodeEditor.selected.AllowEditing === false ? "No" : "Yes");
        genericCodeEditor.editor.SetReadonly(false);
        $("#extCodeEditorButton").css("display", "inline-block");
        $("#extExport").css("display", "inline-block");

        if (genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username)
        {
            $("#extCodePrice").prop("disabled", true);
            $("#extCodeVersion").prop("disabled", true);
            $("#extExport").css("display", "none");
            if (genericCodeEditor.selected.AllowEditing === false)
            {
                genericCodeEditor.editor.SetReadonly(true);
                $("#codeName").prop("disabled", true);
                $("#extCodeBrowsing").prop("disabled", true);
                $("#extAllowEdit").prop("disabled", true);
                $("#genericCodeDescriptionText").prop("disabled", true);
            }
            if (genericCodeEditor.selected.CodeBrowsing === false)
            {
                GenericCodeEditor.ShowDescription();
                $("#extCodeEditorButton").css("display", "none");
            }
        }
    }

    public static UpdateParameters()
    {
        var html = "<table>";
        for (var item in genericCodeEditor.selected.Parameters)
        {
            html += "<tr><td>";
            html += "<div class='dialogBlockDelete' onclick='GenericCodeEditor.DeleteParam(\"" + item + "\")'>X</div>";
            html += genericCodeEditor.selected.Parameters[item].name.title() + ":";
            html += "</td><td>";
            var val = genericCodeEditor.selected.Parameters[item].value;
            switch (genericCodeEditor.selected.Parameters[item].type)
            {
                case "boolean":
                    html += "<select id='var_" + item + "' onkeyup='GenericCodeEditor.ChangeParam(\"" + item + "\")'><option" + (val.trim().toLowerCase() == "true" ? " selected" : "") + ">true</option><option" + (val.trim().toLowerCase() == "true" ? "" : " selected") + ">false</option></select>";
                    break;
                case "art":
                    html += "<select id='var_" + item + "' onchange='GenericCodeEditor.ChangeParam(\"" + item + "\")'>";
                    var found = false;
                    var names: string[] = [];
                    for (var mName in world.art.characters)
                        names.push(mName);
                    names.sort();
                    for (var i = 0; i < names.length; i++)
                    {
                        html += "<option value='" + names[i].htmlEntities() + "'" + (val == names[i] ? " selected" : "") + ">" + names[i] + "</option>";
                    }
                    if (!found)
                        html += "<option value='" + val.htmlEntities + "' selected>" + val + "</option>";
                    html += "</select>";
                    break;
                default:
                    html += "<input type='text' value='" + val.htmlEntities() + "' id='var_" + item + "' onkeyup='GenericCodeEditor.ChangeParam(\"" + item + "\")'>";
            }
            html += "</td></tr>";
        }
        html += "</table>";

        html += "<table>";
        html += "<tr><td>New parameter:</td>";
        html += "<td><input type='text' id='new_param_name'></td>";
        html += "<td><select id='new_param_type'><option value='boolean'>Boolean</option><option value='number'>Number</option></select></td>";
        html += "<td><div class='button' onclick='GenericCodeEditor.AddParam()'>Add</td></tr></table>";
        $("#genericCodeParameters").html(html);
    }

    static AddParam()
    {
        var name = $("#new_param_name").val();
        if (!name.match(/^[a-z]+$/i))
        {
            Framework.Alert("The parameter name must contains just characters");
            return;
        }
        if (!genericCodeEditor.selected.Parameters)
            genericCodeEditor.selected.Parameters = {};
        genericCodeEditor.selected.Parameters[name.toLowerCase()] = { name: name, type: $("#new_param_type").val(), value: ($("#new_param_type").val() == "boolean" ? "true" : "0") };
        $("#new_param_name").val("");
        GenericCodeEditor.UpdateParameters();
    }

    static DeleteParam(name: string)
    {
        delete genericCodeEditor.selected.Parameters[name];
        genericCodeEditor.selected.code = null;
        GenericCodeEditor.UpdateParameters();
    }

    static ChangeParam(name: string)
    {
        var val = $("#var_" + name).val().trim();
        genericCodeEditor.selected.Parameters[name].value = val;
        genericCodeEditor.selected.code = null;
    }

    public static Rename()
    {
        if (!genericCodeEditor.selected)
            return;
        var val = $("#codeName").val();
        if ((!val.match(/^[a-z][a-z_01-9]*$/i) || !val || val.length < 1) || (world.GetCode(val) && world.GetCode(val) != genericCodeEditor.selected))
        {
            $("#codeName").css('backgroundColor', '#FFE0E0');
            return;
        }
        $("#codeName").css('backgroundColor', '');

        genericCodeEditor.selected.Name = val;
        genericCodeEditor.selector.UpdateList();
        SearchPanel.Update();
    }

    public static ChangeCode()
    {
        if (!genericCodeEditor.selected)
            return;

        if (genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username && (genericCodeEditor.selected.AllowEditing === false || genericCodeEditor.selected.CodeBrowsing === false))
        {
            return;
        }
        var code = genericCodeEditor.editor.GetCode();
        genericCodeEditor.selected.Source = code;
        genericCodeEditor.selected.code = null;
    }

    public static ChangeDescription()
    {
        if (!genericCodeEditor.selected)
            return;
        genericCodeEditor.selected.Description = $("#genericCodeDescriptionText").val();
    }

    public static New()
    {
        var nextId = 1;
        while (world.GetCode("extension_" + nextId))
            nextId++;
        var code = new KnownCode();
        code.Author = username;
        code.Name = "extension_" + nextId;
        code.Source = "// Function run during the installation. Used specially if shared as plug-in\n\
// function Install()\n\
// {\n\
// }\n\
\n\
// Function run when the game starts to play (auto-run)\n\
// function AutoRun()\n\
// {\n\
// }\n\
\n";
        world.Codes.push(code);
        genericCodeEditor.selector.Select(world.Codes.length - 1);
        genericCodeEditor.selector.UpdateList();
        SearchPanel.Update();
    }

    public static Delete()
    {
        if (!genericCodeEditor.selected)
            return;
        Framework.Confirm("Are you sure you want to delete this code?", () =>
        {
            for (var i = 0; i < world.Codes.length; i++)
            {
                if (world.Codes[i] == genericCodeEditor.selected)
                {
                    world.Codes.splice(i, 1);
                    genericCodeEditor.selector.UpdateList();
                    genericCodeEditor.selector.Select(null);
                    SearchPanel.Update();
                    return;
                }
            }
        });
    }

    public static ShowCode()
    {
        if (genericCodeEditor.selected && genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username && genericCodeEditor.selected.CodeBrowsing === false)
        {
            GenericCodeEditor.ShowParameters();
            return;
        }
        $("#genericCodeParameters").hide();
        $("#genericCodeContainer").show();
        $("#genericCodeDescription").hide();
        $("#genericCodeIncludes").hide();
        genericCodeEditor.editor.Refresh();
    }

    public static ShowParameters()
    {
        $("#genericCodeParameters").show();
        $("#genericCodeContainer").hide();
        $("#genericCodeDescription").hide();
        $("#genericCodeIncludes").hide();
    }

    public static ShowDescription()
    {
        $("#genericCodeParameters").hide();
        $("#genericCodeContainer").hide();
        $("#genericCodeIncludes").hide();
        $("#genericCodeDescription").show();
        $("#genericCodeDescriptionText").focus();
    }

    public static ChangeField(fieldName: string, property: string)
    {
        if (!genericCodeEditor.selected)
            return;
        var val: any = $("#" + fieldName).val();
        if (property == "Price")
        {
            val = parseFloat(val);
            if (isNaN(val))
                return;
        }
        else if ($("#" + fieldName).first().tagName.toLowerCase() == "select")
            val = (val == "Yes" ? true : false);
        if (property != "Enabled" && genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username && (genericCodeEditor.selected.CodeBrowsing === false || genericCodeEditor.selected.AllowEditing === false))
            return;
        genericCodeEditor.selected[property] = val;
    }

    public static ShowIncludes()
    {
        $("#genericCodeParameters").hide();
        $("#genericCodeContainer").hide();
        $("#genericCodeDescription").hide();
        $("#genericCodeIncludes").show();

        GenericCodeEditor.ShowIncludeLists();
    }

    public static HasArtIncluded(type: string, name: string)
    {
        for (var i = 0; i < genericCodeEditor.selected.Includes.length; i++)
            if (genericCodeEditor.selected.Includes[i].Type == type && genericCodeEditor.selected.Includes[i].Name == name)
                return true;
        return false;
    }

    public static ShowIncludeLists()
    {
        if (!genericCodeEditor.selected)
        {
            $("#listAvailableIncludes").html("");
            $("#listIncluded").html("");
            return;
        }

        var html = "";

        for (var j = 0; j < genericCodeEditor.itemsTypes.length; j++)
        {
            html += "<span>" + genericCodeEditor.itemsTypes[j].title + ":</span>";
            var items: string[] = [];
            if (genericCodeEditor.itemsTypes[j].object.length) for (var i = 0; i < genericCodeEditor.itemsTypes[j].object.length; i++)
                items.push(genericCodeEditor.itemsTypes[j].object[i].Name);
            else for (var item in genericCodeEditor.itemsTypes[j].object)
                items.push(item);
            items.sort();
            for (var i = 0; i < items.length; i++)
            {
                if (GenericCodeEditor.HasArtIncluded(genericCodeEditor.itemsTypes[j].action, items[i]))
                    continue;
                html += "<div onclick='GenericCodeEditor.AddInclude(\"" + genericCodeEditor.itemsTypes[j].action + "\",\"" + items[i] + "\");'>" + items[i] + "</div>";
            }
        }
        $("#listAvailableIncludes").html(html);

        html = "";
        genericCodeEditor.selected.Includes.sort((a, b) =>
        {
            if (a.Type > b.Type)
                return 1;
            if (a.Type < b.Type)
                return -1;
            if (a.Name > b.Name)
                return 1;
            if (a.Name < b.Name)
                return -1;
            return 0;
        });
        var lastType = null;
        for (var i = 0; i < genericCodeEditor.selected.Includes.length; i++)
        {
            if (genericCodeEditor.selected.Includes[i].Type != lastType)
            {
                for (var j = 0; j < genericCodeEditor.itemsTypes.length; j++)
                {
                    if (genericCodeEditor.selected.Includes[i].Type == genericCodeEditor.itemsTypes[j].action)
                    {
                        html += "<span>" + genericCodeEditor.itemsTypes[j].title + ":</span>";
                        break;
                    }
                }
                lastType = genericCodeEditor.selected.Includes[i].Type;
            }
            html += "<div onclick='GenericCodeEditor.RemoveInclude(\"" + genericCodeEditor.selected.Includes[i].Type + "\",\"" + genericCodeEditor.selected.Includes[i].Name + "\");'>" + genericCodeEditor.selected.Includes[i].Name + "</div>";
        }
        $("#listIncluded").html(html);
    }

    public static RemoveInclude(type: string, name: string)
    {
        if (!genericCodeEditor.selected)
            return;
        if (genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username && genericCodeEditor.selected.AllowEditing === false)
            return;

        for (var i = 0; i < genericCodeEditor.selected.Includes.length; i++)
        {
            if (genericCodeEditor.selected.Includes[i].Name == name && genericCodeEditor.selected.Includes[i].Type == type)
            {
                genericCodeEditor.selected.Includes.splice(i, 1);
                GenericCodeEditor.ShowIncludeLists();
                return;
            }
        }
    }

    public static AddInclude(type: string, name: string)
    {
        if (!genericCodeEditor.selected)
            return;
        if (genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username && genericCodeEditor.selected.AllowEditing === false)
            return;

        var data = null;
        var typeInfo = null;
        var store: (o: any) => any;
        for (var i = 0; i < genericCodeEditor.itemsTypes.length; i++)
        {
            if (genericCodeEditor.itemsTypes[i].action == type)
            {
                typeInfo = genericCodeEditor.itemsTypes[i].object;
                store = genericCodeEditor.itemsTypes[i].store;
                break;
            }
        }

        if (typeInfo.length)
        {
            for (var i = 0; i < typeInfo.length; i++)
            {
                if (typeInfo[i].Name == name)
                {
                    data = typeInfo[i];
                    break;
                }
            }
        }
        else
        {
            data = typeInfo[name];
        }
        if (!data)
            throw "Cannot find object '" + name + "'";
        else if (store)
            data = store(data);
        else
            data = JSON.parse(JSON.stringify(data));

        genericCodeEditor.selected.Includes.push({
            Type: type,
            Name: name,
            Info: data
        });
        GenericCodeEditor.ShowIncludeLists();
    }

    public static Export()
    {
        if (!genericCodeEditor.selected)
            return;
        if (genericCodeEditor.selected.Author && genericCodeEditor.selected.Author != username)
            return;

        var code = <GenericCodeInterface>JSON.parse(JSON.stringify(genericCodeEditor.selected.Store()));

        var nbToLoad = 0;

        var allLoaded = () =>
        {
            for (var i = 0; i < code.Includes.length; i++)
            {
                // Remove path from the file information
                if (code.Includes[i].Info.file && code.Includes[i].Info.file.indexOf("/") != -1)
                    code.Includes[i].Info.file = code.Includes[i].Info.file.substr(code.Includes[i].Info.file.lastIndexOf("/") + 1);
                if (code.Includes[i].Info.file && code.Includes[i].Info.file.indexOf("?") != -1)
                    code.Includes[i].Info.file = code.Includes[i].Info.file.substr(0, code.Includes[i].Info.file.indexOf("?"));
            }

            var data = "DWMP-" + btoa(JSON.stringify(code));

            try
            {
                var ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf('chrome') != -1)
                {
                    var link = <any>document.createElement('a');
                    link.download = genericCodeEditor.selected.Name + ".dwmp";
                    link.href = "data:application/binary;filename=" + genericCodeEditor.selected.Name + ".dwmp;base64," + btoa(data);
                    link.click();
                }
                else
                    document.location.href = "data:application/binary;filename=" + genericCodeEditor.selected.Name + ".dwmp;base64," + btoa(data);
            }
            catch (ex)
            {
                Framework.Alert("ERROR: Was not able to produce the export.");
            }
        };

        var filesLoaded: string[] = [];

        for (var i = 0; i < code.Includes.length; i++)
        {
            // Remove path from the file information
            if (code.Includes[i].Info.file)
            {
                if (filesLoaded.contains(code.Includes[i].Info.file))
                    continue;
                filesLoaded.push(code.Includes[i].Info.file);
                var b = () =>
                {
                    nbToLoad++;
                    var art = code.Includes[i]
                    var img = new Image();
                    img.src = art.Info.file;
                    img.onload = () =>
                    {
                        var canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
                        if (art.Info.file.toLowerCase().indexOf(".jpg") != -1 || art.Info.file.toLowerCase().indexOf(".jpeg") != -1)
                            art.Data = canvas.toDataURL('image/jpeg', 1.0);
                        else
                            art.Data = canvas.toDataURL();
                        nbToLoad--;
                        if (nbToLoad <= 0)
                            allLoaded();
                    }
                };
                b();
            }
        }
        if (nbToLoad == 0)
            allLoaded();
    }

    static ShowUpload()
    {
        if (Main.CheckNW())
        {
            $("#fileOpenDialog").prop("accept", ".dwmp");
            $("#fileOpenDialog").unbind("change");
            $("#fileOpenDialog").val("").bind("change", GenericCodeEditor.ImportFile).first().click();
            return;
        }

        $("#uploadArtObject").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
    }

    static ImportFile()
    {
        var fs = require('fs');
        var data = fs.readFileSync($("#fileOpenDialog").val(), "utf-8");
        GenericCodeEditor.FinishUpload(data);
        $("#fileOpenDialog").unbind("change", GenericCodeEditor.ImportFile).val("");
    }

    static CloseUpload()
    {
        $("#uploadArtObject").hide();
    }

    static Upload()
    {
        $("#uploadArtObject").hide();
        $("#artObjectUploadForm").submit();
    }

    static Result(result: string)
    {
        var data = JSON.parse(result);
        if (data.error)
        {
            Framework.Alert(data.error);
            return;
        }
        else if (data.file && data.data)
        {
            GenericCodeEditor.FinishUpload(data.data);
        }
    }

    static FinishUpload(data: string)
    {
        if (data.substr(0, 5) != "DWMP-")
        {
            Framework.Alert("Invalid file format.");
            return;
        }
        var code = <GenericCodeInterface>TryParse(atob(data.substr(5)));
        if (!code)
        {
            Framework.Alert("Invalid file format.");
            return;
        }
        var newCode = <KnownCode>Object.cast(code, KnownCode);
        if (world.GetCode(code.Name))
        {
            Framework.Confirm("You have the same code already, do you want to over-write?", () =>
            {
                for (var i = 0; i < world.Codes.length; i++)
                {
                    if (world.Codes[i].Name.toLowerCase() == code.Name.toLowerCase())
                    {
                        var oldCode = world.Codes[i];
                        if (!newCode.Parameters)
                            newCode.Parameters = {};
                        if (oldCode.Parameters) for (var item in oldCode.Parameters)
                            newCode.Parameters[item] = oldCode.Parameters[item];
                        world.Codes.splice(i, 1);
                        genericCodeEditor.selector.Select(null);
                        break;
                    }
                }
                GenericCodeEditor.FinishImport(newCode);
            });
        }
        else
        {
            GenericCodeEditor.FinishImport(newCode);
        }
    }

    static FinishImport(code: KnownCode)
    {
        world.Codes.push(code);
        genericCodeEditor.selector.UpdateList();
        genericCodeEditor.selector.Select(world.Codes.length - 1);
        SearchPanel.Update();

        GenericCodeEditor.Install();
    }

    public static Install()
    {
        if (!genericCodeEditor.selected)
            return;

        var knownCode = genericCodeEditor.selected;
        if (!knownCode.code)
            knownCode.code = CodeParser.ParseWithParameters(knownCode.Source, knownCode.Parameters);

        if (knownCode.code.HasFunction("install") || (knownCode.Includes && knownCode.Includes.length))
        {
            var sentence = "Do you want to run the plug-in installer?";
            if (!knownCode.code.HasFunction("install") && (knownCode.Includes && knownCode.Includes.length))
                sentence = "Do you want to install the included content?";
            else if (knownCode.code.HasFunction("install") && (knownCode.Includes && knownCode.Includes.length))
                sentence = "Do you want to run the plug-in installer and install the included content?";

            var doInstall = (doOverwrite: boolean) =>
            {
                var randomIds = {};
                if (knownCode && knownCode.Includes) for (var i = 0; i < knownCode.Includes.length; i++)
                {
                    var found = false;

                    for (var j = 0; j < genericCodeEditor.itemsTypes.length; j++)
                    {
                        if (genericCodeEditor.itemsTypes[j].action == knownCode.Includes[i].Type)
                        {
                            var data = knownCode.Includes[i].Info;
                            if (genericCodeEditor.itemsTypes[j].map)
                                data = genericCodeEditor.itemsTypes[j].map(data);

                            if (genericCodeEditor.itemsTypes[j].object.length)
                            {
                                for (var k = 0; k < genericCodeEditor.itemsTypes[j].object.length; k++)
                                {
                                    if (genericCodeEditor.itemsTypes[j].object[k].Name == knownCode.Includes[i].Name)
                                    {
                                        found = true;
                                        if (doOverwrite)
                                            genericCodeEditor.itemsTypes[j].object[k] = data;
                                        break;
                                    }
                                }
                                if (!found)
                                    genericCodeEditor.itemsTypes[j].object.push(data);
                            }
                            else
                            {
                                if (genericCodeEditor.itemsTypes[j].object[knownCode.Includes[i].Name] && !doOverwrite)
                                    found = true;
                                else
                                    genericCodeEditor.itemsTypes[j].object[knownCode.Includes[i].Name] = data;
                            }
                            break;
                        }
                    }

                    if ((!found || doOverwrite) && knownCode.Includes[i].Info.file && knownCode.Includes[i].Info.file.indexOf("/") == -1)
                    {
                        if (knownCode.Includes[i].Data)
                            GenericCodeEditor.UploadFile(knownCode.Includes[i].Info.file, knownCode.Includes[i].Data);
                        if (!randomIds[knownCode.Includes[i].Info.file])
                            randomIds[knownCode.Includes[i].Info.file] = Math.round((new Date()).getTime() / 1000);
                        knownCode.Includes[i].Info.file = "/user_art/" + EngineDisplay.GameDir(world.Id) + "/" + knownCode.Includes[i].Info.file + "?v=" + randomIds[knownCode.Includes[i].Info.file];
                    }
                }

                if (knownCode.code.HasFunction("install"))
                    knownCode.code.ExecuteFunction("install", []);
            };

            Framework.Confirm(sentence, () =>
            {
                var objectWillOverwrite = false;
                if (knownCode && knownCode.Includes) for (var i = 0; i < knownCode.Includes.length; i++)
                {

                    for (var j = 0; j < genericCodeEditor.itemsTypes.length && objectWillOverwrite == false; j++)
                    {
                        if (genericCodeEditor.itemsTypes[j].action == knownCode.Includes[i].Type)
                        {
                            if (genericCodeEditor.itemsTypes[j].object.length)
                            {
                                for (var k = 0; k < genericCodeEditor.itemsTypes[j].object.length; k++)
                                {
                                    if (genericCodeEditor.itemsTypes[j].object[k].Name == knownCode.Includes[i].Name)
                                    {
                                        objectWillOverwrite = true;
                                        break;
                                    }
                                }
                            }
                            else
                            {
                                if (genericCodeEditor.itemsTypes[j].object[knownCode.Includes[i].Name])
                                    objectWillOverwrite = true;
                            }
                            break;
                        }
                    }
                }

                if (objectWillOverwrite)
                    Framework.Confirm("Do you want to overwrite the existing objects?", () => { doInstall(true); }, () => { doInstall(false); });
                else
                    doInstall(false);

            });
        }
        else
            Framework.ShowMessage("The code doesn't contain an \"Install\" function nor any content.");
    }

    static UploadFile(filename: string, data: string)
    {
        $.ajax({
            type: 'POST',
            url: '/upload/SaveBase64Art',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                file: filename,
                data: data
            },
            success: (msg) =>
            {
            },
            error: function (msg, textStatus)
            {
                console.log(filename);
                Framework.ShowMessage(msg);
            }
        });
    }

    static UploadModule()
    {
        if (!genericCodeEditor.selected)
        {
            Framework.Alert('You must select a file in the left panel');
            return;
        }
        else
        {
            ModuleManager.CreateModule(genericCodeEditor.selected);
        }
    }
}