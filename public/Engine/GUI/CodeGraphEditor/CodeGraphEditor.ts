class CodeGraphEditor
{
    private parent: string;
    private element: string;
    private code: string;
    private statements: CodeStatement[];
    private expandedBlocks: string[] = [];
    private editor: CodeMirror.EditorFromTextArea;
    public OnChange: () => void = null;
    private inUpdate: boolean = false;
    private isGenericCode: boolean = false;

    constructor(element: string, isGenericCode: boolean = false, tab: string = null)
    {
        var hasHelp = false;
        this.element = element;
        this.isGenericCode = isGenericCode;
        this.parent = $("#" + element).first().parentElement.id;
        var elemHtml = $("#" + element).first().outerHTML;
        $("#" + element).first().outerHTML = "<div id='codeError_" + element + "' class='elementCodeWarning' style='position: absolute; left: 0px; right: 0px; top: 0px; width: auto;'>Error!</div><div class='codeGraphTextContainer'>" + elemHtml + "</div>";

        var html = "<div id='graph_" + this.element + "' class='codeGraphArea' path=''></div>";
        html += "<input type='text' id='search_graph_" + this.element + "' placeholder='Search...' class='codeGraphSearchNodes'>";
        html += "<div id='selector_" + this.element + "' class='codeGraphSelector'></div>";
        if ($($("#" + element).first().parentElement).height() > 400)
        {
            html += "<div id='node_help_" + this.element + "' class='codeGraphNodeHelp'></div>";
            hasHelp = true;
        }
        //if (("" + document.location).indexOf("localhost") != -1 || ("" + document.location).indexOf("test_grapheditor") != -1)
        html += "<div class='codeGraphTabs'><span id='btn_" + element + "_text'>Text</span><span id='btn_" + element + "_node'>Node</span></div>";
        html += "<div id='codeHelp_" + this.element + "' class='codeHelp'></div>";
        Framework.ReloadPreferences();
        //if (("" + document.location).indexOf("localhost") != -1 || ("" + document.location).indexOf("test_grapheditor") != -1)
        if (framework.Preferences && framework.Preferences['codeGraphEditor_help'] !== false && tab == null)
        {
            html += "<div id='codeGraphEditorHelp'>";
            html += "The code editor allows to edit the logic of the game, however a full flexible logic requires a complete scripting engine. "
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
        this.editor.on("change", () =>
        {
            if (this.inUpdate)
                return;
            // Currently we have the text editor as main one.
            if ($("#" + this.parent + " .codeGraphTextContainer").is(":visible"))
                this.statements = null;
            if (this.OnChange)
                this.OnChange();
        });

        this.statements = [];
        try
        {
            var parser = new CodeParser(this.code);
            this.statements = parser.GetAllStatements();
        }
        catch (ex)
        {
        }

        $("#search_graph_" + this.element).bind("keyup", () =>
        {
            this.RenderSelector();
        });
        $("#graph_" + this.element).bind("dragover", (evt) =>
        {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "move";
        }).bind("drop", (evt) =>
        {
            evt.preventDefault();
            var data = JSON.parse(evt.dataTransfer.getData("text"));
            if (data.type == "existing")
            {
                this.DeleteNode(data.call);
                this.FromNodeToCode();
                this.RenderNodes();
            }
            // Try to add at the bottom
            else
            {
                this.DropOnEmpty(evt);
            }
        });
        $("#btn_" + element + "_text").bind("click", () =>
        {
            $("#btn_" + element + "_node").removeClass("codeGraphActiveTab");
            $("#btn_" + element + "_text").addClass("codeGraphActiveTab");

            framework.Preferences['codeGraphEditor_tab'] = 'text';
            Framework.SavePreferences();

            $("#" + this.parent + " .codeGraphTextContainer").show();
            this.editor.refresh();

            $("#graph_" + this.element).hide();
            $("#selector_" + this.element).hide();
            $("#search_graph_" + this.element).hide();
            $("#node_help_" + this.element).hide();
        });
        $("#btn_" + element + "_node").bind("click", () =>
        {
            $("#btn_" + element + "_text").removeClass("codeGraphActiveTab");
            $("#btn_" + element + "_node").addClass("codeGraphActiveTab");

            framework.Preferences['codeGraphEditor_tab'] = 'node';
            Framework.SavePreferences();

            $("#" + this.parent + " .codeGraphTextContainer").hide();
            $("#codeError_" + element).hide();

            if (!this.statements)
            {
                this.code = this.editor.getValue();
                this.statements = [];
                try
                {
                    var parser = new CodeParser(this.code);
                    this.statements = parser.GetAllStatements();
                }
                catch (ex)
                {
                }
                this.RenderNodes();
            }

            $("#graph_" + this.element).show();
            $("#selector_" + this.element).show();
            $("#search_graph_" + this.element).show();
            $("#node_help_" + this.element).show();
        });

        if ((framework.Preferences['codeGraphEditor_tab'] === 'text' || tab === "text") && (tab !== "node" || !tab))
        {
            $("#graph_" + this.element).hide();
            $("#selector_" + this.element).hide();
            $("#search_graph_" + this.element).hide();
            $("#node_help_" + this.element).hide();

            $("#btn_" + element + "_text").addClass("codeGraphActiveTab");
        }
        else
        {
            $("#" + this.parent + " .codeGraphTextContainer").hide();

            $("#btn_" + element + "_node").addClass("codeGraphActiveTab");
        }
        //}
        this.RenderNodes();
        this.RenderSelector();

        if (!hasHelp)
            $("#selector_" + this.element).css("bottom", "16px");
    }

    public GetNode(path: string)
    {
        var p = path.split('.');
        var result = <any>this.statements;
        while (p.length > 0)
        {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/))
            {
                if (result.constructor == BlockStatement)
                    result = result.Statements[parseInt(currentPath)];
                else
                    result = result[parseInt(currentPath)];
            }
            else
                result = result[currentPath];
        }
        return result;
    }

    public SetNode(path: string, value: any)
    {
        var p = path.split('.');
        var node = <any>this.statements;
        while (p.length > 1)
        {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/))
            {
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
        else if (info)
        {
            var found = false;
            for (var i = 0; i < info.params.length; i++)
            {
                if (info.params[i].name == p[0])
                {
                    if (info.params[i].type == "VariableValue" && info.params[i].valueType == "number")
                    {
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
    }

    private DeleteNode(path: string)
    {
        var p = path.split('.');
        var node = <any>this.statements;
        while (p.length > 1)
        {
            var currentPath = p.shift();
            // Must be a number => it's an index of an array
            if (currentPath.match(/^[0-9]+$/))
            {
                if (node.constructor == BlockStatement)
                    node = node.Statements[parseInt(currentPath)];
                else
                    node = node[parseInt(currentPath)];
            }
            else
                node = node[currentPath];
        }
        if (p[0].match(/^[0-9]+$/))
        {
            if (node.constructor == BlockStatement)
                return node.Statements.splice(parseInt(p[0]), 1)[0];
            else if (path.endsWith(".values." + p[0]))
            {
                var val = node[parseInt(p[0])];
                node[parseInt(p[0])] = null;
                return val;
            }
            else
                return node.splice(parseInt(p[0]), 1)[0];
        }
        else
        {
            var result = node[p[0]];
            node[p[0]] = null;
            return result;
        }
    }

    public RenderNodes()
    {
        var html = "";
        for (var i = 0; i < this.statements.length; i++)
        {
            html += this.statements[i].HTMLBlocks("" + i, this.statements);
            if (this.statements[i].constructor == FunctionDefinitionStatement)
                html += "<div class='codeBlockSeparator'></div>";
        }
        html += "<span class='emptyBlock' path=''>Empty</span>";
        $("#graph_" + this.element).html(html);

        $("#graph_" + this.element + " .emptyBlock").bind("dragover", (evt) =>
        {
            evt.preventDefault();
            // Set the dropEffect to move
            evt.dataTransfer.dropEffect = "move";
        });

        // Allow to drop new items on an empty block
        $("#graph_" + this.element + " .emptyBlock").bind("drop", (evt) => { this.DropOnEmpty(evt); });
        // Highlight the block
        $("#graph_" + this.element + " .codeBlock").addClass("collapsedBlock").bind("mouseover", (evt) => { this.MouseOver(evt); }).bind("mouseout", (evt) => { this.MouseOut(evt); });
        // Expand / contract a block
        $("#graph_" + this.element + " .blockType, #graph_" + this.element + " .simpleBlockType").prop("draggable", true)
            .bind("dragstart", (evt) => { this.Collapse(evt); evt.dataTransfer.setData("text", JSON.stringify({ type: "existing", call: evt.target.parentElement.id.substr(3).replace(/_/g, ".") })); })
            .bind("drop", (evt) => { this.DropOnStatement(evt); })
            .bind("mousedown", (evt) => { this.Collapse(evt); });
        $("#graph_" + this.element + " .endBlock").bind("mousedown", (evt) => { this.Collapse(evt); });
        // Prevent expand / contract while clicking on a field
        $("#graph_" + this.element + " input").bind("mousedown", (evt) => { evt.cancelBubble = true; return false; }).bind("keyup", (evt) => { this.UpdateField(evt); });
        // Boolean click => reverse it
        var booleanClick = (evt) =>
        {
            var id = (<HTMLElement>evt.target).parentElement.id;
            var path = id.substr(3).replace(/_/g, ".");
            var node = this.GetNode(path);
            node.value = new VariableValue(!node.value.GetBoolean());
            $("#" + id).first().outerHTML = node.HTMLBlocks(path);
            $("#" + id).bind("mousedown", booleanClick);
            $("#" + id + " .simpleBlockType").prop("draggable", true)
                .bind("dragstart", (evt) => { this.Collapse(evt); evt.dataTransfer.setData("text", JSON.stringify({ type: "existing", call: evt.target.parentElement.id.substr(3).replace(/_/g, ".") })); })
                .bind("drop", (evt) => { this.DropOnStatement(evt); })
                .bind("mousedown", (evt) => { this.Collapse(evt); });
            this.FromNodeToCode();
            evt.cancelBubble = true;
            return false;
        };
        $("#graph_" + this.element + " span[block='boolean']").bind("mousedown", booleanClick);
        $("#graph_" + this.element + " .blockDeleteArrayEntry").bind("mousedown", (evt) =>
        {
            var path = evt.target.getAttribute("path");
            var p: string[] = path.split('.');
            var entry = p.pop();
            var node = this.GetNode(p.join('.'));
            node.splice(parseInt(entry), 1);
            this.RenderNodes();
            this.FromNodeToCode();
        });
        $("#graph_" + this.element + " .blockAddArrayEntry").bind("mousedown", (evt) =>
        {
            var path = evt.target.getAttribute("path");
            var node = this.GetNode(path);
            node.push("");
            this.RenderNodes();
            this.FromNodeToCode();
        });

        for (var i = 0; i < this.expandedBlocks.length; i++)
            $("#" + this.expandedBlocks[i]).removeClass("collapsedBlock");
    }

    private UpdateField(evt: KeyboardEvent)
    {
        var val = $(evt.target).val();
        var path = (<HTMLElement>evt.target).getAttribute("path");
        this.SetNode(path, val);

        this.FromNodeToCode();

        var p = path.split('.');
        p.pop();
        var parentNode = this.GetNode(p.join('.'));
        if (parentNode.constructor == FunctionDefinitionStatement)
            this.RenderSelector();
    }

    private DropOnStatement(evt: DragEvent)
    {
        evt.cancelBubble = true;
        evt.preventDefault();
        var path = (<HTMLElement>evt.target).parentElement.id.substr(3).replace(/_/g, ".");
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
        switch (data.type)
        {
            case "base":
                newNode = new window[data.call]();
                break;
            case "api":
                var params = [];
                for (var i = 0; i < apiFunctions.length; i++)
                {
                    if (apiFunctions[i].name.toLowerCase() == data.call.toLowerCase())
                    {
                        for (var j = 0; j < apiFunctions[i].parameters.length; j++)
                            params.push(null);
                        break;
                    }
                }

                newNode = new FunctionCallStatement(data.call, params, 0, 0)
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
            this.SetNode(parentPath, newNode)
        this.FromNodeToCode();
        this.RenderNodes();
    }

    private DropOnEmpty(evt: DragEvent)
    {
        evt.cancelBubble = true;
        evt.preventDefault();
        var path = (<HTMLElement>evt.target).getAttribute("path");
        var node = null;
        if (path === "")
            node = this.statements;
        else
            node = this.GetNode(path);
        // Get the id of the target and add the moved element to the target's DOM
        var data = JSON.parse(evt.dataTransfer.getData("text"));
        evt.dataTransfer.clearData();

        var newNode = null;
        switch (data.type)
        {
            case "base":
                newNode = new window[data.call]();
                break;
            case "api":
                var params = [];
                for (var i = 0; i < apiFunctions.length; i++)
                {
                    if (apiFunctions[i].name.toLowerCase() == data.call.toLowerCase())
                    {
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

        if (node === this.statements)
        {
            if (newNode.constructor != CommentStatement && newNode.constructor != FunctionDefinitionStatement)
            {
                Framework.ShowMessage("Only comments and functions definitions can be placed on the top level.");
                return;
            }
        }
        else if (newNode.constructor == FunctionDefinitionStatement)
        {
            Framework.ShowMessage("Function definitions can be placed only on the top level.");
            return;
        }

        if (node && node.constructor === BlockStatement)
        {
            var className = ("" + newNode.constructor).match(/function ([^\(]+)\(/)[1];
            if (!topBlockStatements.contains(className))
            {
                Framework.ShowMessage("This block cannot be placed here.");
                return;
            }
        }

        if (!newNode)
            return;
        if (node && node.constructor === BlockStatement)
            node.Statements.push(newNode)
        else if (node && node.constructor === Array)
            node.push(newNode)
        else
            this.SetNode(path, newNode);
        this.FromNodeToCode();
        this.RenderNodes();

        if (newNode.constructor == FunctionDefinitionStatement)
            this.RenderSelector();
        //console.log("Dragged: " + data);
        //ev.target.appendChild(document.getElementById(data));
    }

    public RenderSelector()
    {
        var search = $("#search_graph_" + this.element).val().toLowerCase();

        var html = "";

        var isFirst = true;
        knownStatements.sort();
        for (var i = 0; i < knownStatements.length; i++)
        {
            if (knownStatements[i].replace(/Statement$/, "").toLowerCase().indexOf(search) == -1)
                continue;
            if (knownStatements[i] == "FunctionCallStatement" || knownStatements[i] == "BlockStatement" || knownStatements[i] == "EmptyStatement" || knownStatements[i] == "EmptyArrayStatement")
                continue;
            if (isFirst)
            {
                html += "<div class='codeGroup'><span>Logic:</span>";
                isFirst = false;
            }
            html += "<p type='base' call='" + knownStatements[i] + "'>" + knownStatements[i].replace(/Statement$/, "").title() + "</p>";
        }
        if (!isFirst)
            html += "</div>";

        var apiGroups: string[] = [];
        for (var item in api)
            apiGroups.push(item);
        var isFirst = true;
        for (var i = 0; i < apiGroups.length; i++)
        {
            var functions: string[] = [];
            for (var j = 0; j < apiFunctions.length; j++)
            {
                if (apiFunctions[j].name.toLowerCase().indexOf(search) == -1)
                    continue;
                if (apiFunctions[j].name.split('.')[0].toLowerCase() == apiGroups[i].toLowerCase())
                    functions.push(apiFunctions[j].name.split('.')[1]);
            }
            functions.sort();
            if (functions.length == 0)
                continue;

            if (isFirst)
            {
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

        if (!this.isGenericCode)
        {
            isFirst = true;
            for (var i = 0; i < this.statements.length; i++)
            {
                if (this.statements[i].constructor != FunctionDefinitionStatement)
                    continue;
                if ((<FunctionDefinitionStatement>this.statements[i]).Name.toLowerCase().indexOf(search) == -1)
                    continue;
                if (isFirst)
                {
                    html += "<div class='codeGroup'><span>Functions:</span>";
                    isFirst = false;
                }
                html += "<p type='api' call='" + (<FunctionDefinitionStatement>this.statements[i]).Name + "'>" + (<FunctionDefinitionStatement>this.statements[i]).Name + "</p>";
            }
            if (!isFirst)
                html += "</div>";
        }

        isFirst = true;
        if (world && world.Codes) for (var i = 0; i < world.Codes.length; i++)
        {
            if (!world.Codes[i].code)
            {
                try
                {
                    world.Codes[i].code = CodeParser.ParseWithParameters(world.Codes[i].Source, world.Codes[i].Parameters);
                }
                catch (ex)
                {
                }
            }
            if (!world.Codes[i].code)
                continue;
            for (var item in world.Codes[i].code.FunctionCodes)
            {
                if (item.toLowerCase().indexOf(search) == -1)
                    continue;

                if (isFirst)
                {
                    html += "<div class='codeGroup'><span>Generic Functions:</span>";
                    isFirst = false;
                }
                html += "<p type='api' call='me." + world.Codes[i].Name + "." + item + "'>" + item + "</p>";
            }
        }
        if (!isFirst)
            html += "</div>";

        $("#selector_" + this.element).html(html);
        $("#selector_" + this.element + " p").prop("draggable", true).bind("dragstart", (evt) =>
        {
            //console.log(evt.target.innerHTML);
            //evt.initDragEvent();
            evt.dataTransfer.setData("text", JSON.stringify({ type: evt.target.getAttribute("type"), call: evt.target.getAttribute("call") }));
        }).bind("mouseover", (evt) =>
        {
            var type = evt.target.getAttribute("type");
            var call = evt.target.getAttribute("call").replace(/Statement$/, "");

            $("#node_help_" + this.element).html("");

            if (type == "base" && statementEditorInfo[call])
                $("#node_help_" + this.element).html(statementEditorInfo[call].help);
            else if(type == "api")
            {
                call = ("" + call).toLowerCase();
                var p = call.split('.');
                if (p.length == 2)
                {
                    for (var i = 0; i < apiFunctions.length; i++)
                    {
                        if (apiFunctions[i].name.toLowerCase() == call)
                        {
                            $("#node_help_" + this.element).html(GetApiSignature(call) + GetApiDescription(call));
                            break;
                        }
                    }
                }
                else
                    $("#node_help_" + this.element).html("Calls the function '" + call + "' and pass the parameters.");
            }

        }).bind("mouseout", (evt) =>
        {
            $("#node_help_" + this.element).html("");
        });
    }

    private Collapse(evt)
    {
        var obj = evt.target;
        while (obj.className.indexOf("codeBlock") == -1)
            obj = obj.parentElement;
        $(obj).toggleClass("collapsedBlock");
        var id = (<HTMLElement>obj).id;
        // Not collapsed
        if ((<HTMLElement>obj).className.indexOf("collapsedBlock") == -1)
            this.expandedBlocks.push(id);
        else
        {
            for (var i = 0; i < this.expandedBlocks.length; i++)
            {
                if (this.expandedBlocks[i] == id)
                {
                    this.expandedBlocks.splice(i, 1);
                    break;
                }
            }
        }
    }

    public GetCode(): string
    {
        return this.editor.getDoc().getValue();
    }

    public SetCode(source: string)
    {
        this.inUpdate = true;
        this.code = source;
        this.statements = [];
        try
        {
            var parser = new CodeParser(this.code);
            this.statements = parser.GetAllStatements();

            this.RenderNodes();
            this.RenderSelector();
        }
        catch (ex)
        {
        }

        this.editor.getDoc().setValue(source);
        this.editor.refresh();
        CodeMirror.signal(this.editor, "change");
        this.inUpdate = false;
    }

    public SetReadonly(readonly: boolean)
    {
        (<any>this.editor).readOnly = readonly;
    }

    private FromNodeToCode()
    {
        try
        {
            var code = "";
            for (var i = 0; i < this.statements.length; i++)
            {
                code += this.statements[i].ToCode(0) + "\n";
            }
            code = code.trim();
            this.code = code;
            this.editor.getDoc().setValue(code);
            this.editor.refresh();
            CodeMirror.signal(this.editor, "change");
        }
        catch (ex)
        {
        }
    }

    public Refresh()
    {
        this.editor.refresh();
    }

    private MouseOver(evt)
    {
        $(".overBlock").removeClass("overBlock");
        var obj = evt.target;
        while (obj.className.indexOf("codeBlock") == -1)
            obj = obj.parentElement;
        $(obj).addClass("overBlock");

        $("#node_help_" + this.element).html("");

        var path = obj.id.substr(3).replace(/_/g, ".");
        if (path)
        {
            var node = this.GetNode(path);
            if (node)
            {
                if (node.constructor == FunctionCallStatement)
                {
                    var call = (<FunctionCallStatement>node).Name.toLowerCase();
                    var p = call.split('.');
                    if (p.length == 2)
                    {
                        for (var i = 0; i < apiFunctions.length; i++)
                        {
                            if (apiFunctions[i].name.toLowerCase() == call)
                            {
                                $("#node_help_" + this.element).html(GetApiSignature(call) + GetApiDescription(call));
                                break;
                            }
                        }
                    }
                    else
                        $("#node_help_" + this.element).html("Calls the function '" + call + "' and pass the parameters.");
                }
                else
                {
                    var className = ("" + node.constructor).match(/function ([^\(]+)\(/)[1].replace("Statement", "");
                    if (statementEditorInfo[className])
                        $("#node_help_" + this.element).html(statementEditorInfo[className].help);
                }
            }
        }
    }

    private MouseOut(evt)
    {
        $(".overBlock").removeClass("overBlock");
        $("#node_help_" + this.element).html("");
    }

    static HideWelcome()
    {
        Framework.ReloadPreferences();
        framework.Preferences['codeGraphEditor_help'] = false;
        Framework.SavePreferences();
        $("#codeGraphEditorHelp").hide();
    }
}