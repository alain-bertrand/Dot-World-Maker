var codeEditor = new (class
{
    public hideHelpTimer: number = null;
    public currentEditor: CodeMirror.EditorFromTextArea = null;
    public currentSelection: string = null;
    public currentList: string[] = null;
    public currentSelectedCompletion: number = null;
    public currentTextToTheEnd: number = null;
});

class CodeEditor
{
    public static Create(element: string)
    {
        var editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$("#"+element).first(),
            {
                lineNumbers: true,
                matchBrackets: true,
                continueComments: "Enter",
                showCursorWhenSelecting: true,
                tabSize: 4,
                indentUnit: 4
            });
        codeEditor.currentEditor = editor;


        editor.on("blur", () =>
        {
            if (codeEditor.hideHelpTimer)
            {
                clearTimeout(codeEditor.hideHelpTimer);
                codeEditor.hideHelpTimer = null;
            }
            codeEditor.hideHelpTimer = setTimeout(() => { CodeEditor.HideHelp(element); }, 500);
        });
        editor.setOption("extraKeys",
            {
                "Enter": function ()
                {
                    if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null)
                    {
                        CodeEditor.Add(codeEditor.currentList[codeEditor.currentSelectedCompletion]);
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                    return CodeMirror.Pass;
                },
                "Tab": function ()
                {
                    if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null)
                    {
                        CodeEditor.Add(codeEditor.currentList[codeEditor.currentSelectedCompletion]);
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                    return CodeMirror.Pass;
                },
                "Up": function ()
                {
                    if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null && codeEditor.currentList[0].indexOf(".") != -1)
                    {
                        codeEditor.currentSelectedCompletion--;
                        if (codeEditor.currentSelectedCompletion < 0)
                            codeEditor.currentSelectedCompletion = codeEditor.currentList.length - 1;
                        CodeEditor.UpdateList(element);
                        $("#codeHelp_" + element + " .selectedInsertion").first().scrollIntoView();
                        return false;
                    }
                    return CodeMirror.Pass;
                },
                "Down": function ()
                {
                    if (codeEditor.currentList && codeEditor.currentSelectedCompletion !== null && codeEditor.currentList[0].indexOf(".") != -1)
                    {
                        codeEditor.currentSelectedCompletion++;
                        if (codeEditor.currentSelectedCompletion >= codeEditor.currentList.length)
                            codeEditor.currentSelectedCompletion = 0;
                        CodeEditor.UpdateList(element);
                        $("#codeHelp_" + element + " .selectedInsertion").first().scrollIntoView();
                        return false;
                    }
                    return CodeMirror.Pass;
                },
                "Esc": function ()
                {
                    if (codeEditor.hideHelpTimer)
                    {
                        if (codeEditor.hideHelpTimer)
                        {
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

        editor.on("cursorActivity", () =>
        {
            codeEditor.currentList = null;
            codeEditor.currentSelectedCompletion = null;

            if (codeEditor.hideHelpTimer)
            {
                clearTimeout(codeEditor.hideHelpTimer);
                codeEditor.hideHelpTimer = null;
            }

            var line: number = (<any>editor).getCursor().line;
            var char: number = (<any>editor).getCursor().ch;

            var code = editor.getValue();
            var lines = code.split('\n');
            if (lines[line])
            {
                var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._";

                var overText = "";
                var toTheEnd = 0;

                char--;
                for (var i = char; i >= 0; i--)
                {
                    //var c = lines[line].charAt(i);
                    var c = CodeEditor.GetCharAt(line, i);
                    if (allowedChars.indexOf(c) == -1)
                        break;
                    overText = c + overText;
                }

                if (overText.length > 0) for (var i = char + 1; i < lines[line].length; i++)
                {
                    var c = CodeEditor.GetCharAt(line, i);
                    if (allowedChars.indexOf(c) == -1)
                        break;
                    overText += c;
                    toTheEnd++;
                }
                codeEditor.currentTextToTheEnd = toTheEnd;

                codeEditor.currentSelection = overText;

                var foundApi: string = GetApiDescription(overText);

                if (foundApi)
                {
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
                    codeEditor.hideHelpTimer = setTimeout(() => { CodeEditor.HideHelp(element); }, 5000);
                }
                else
                {
                    // We still have to choose an API
                    var list: string[] = [];
                    if (overText != "")
                    {
                        if (overText.indexOf(".") == -1)
                        {
                            var last = null;
                            for (var i = 0; i < apiFunctions.length; i++)
                            {
                                var f = apiFunctions[i].name.split('.')[0];
                                if (last == f)
                                    continue;
                                if (f.toLowerCase().indexOf(overText.toLowerCase()) == 0)
                                    list.push(f);
                                last = f;
                            }
                        }
                        else
                        {
                            for (var i = 0; i < apiFunctions.length; i++)
                                if (apiFunctions[i].name.toLowerCase().indexOf(overText.toLowerCase()) == 0)
                                    list.push(apiFunctions[i].name);
                        }
                        list.sort();
                    }

                    if (list && list.length > 0)
                    {
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

        editor.on('change', () =>
        {
            $("#codeError_" + element).hide();
            var nblines = editor.getDoc().lineCount();
            for (var i = 0; i < nblines; i++)
                editor.removeLineClass(i, 'background', "line-error");

            var code = editor.getValue();
            try
            {
                CodeParser.Parse(code.replace(/\@[a-z0-9_]+\@/gi,"1"));
            }
            catch (ex)
            {
                var m = ("" + ex).match(/ ([0-9]+):([0-9]+)/);
                if (m != null)
                    editor.addLineClass(parseInt(m[1]) - 1, 'background', "line-error");

                setTimeout(() => { $("#codeError_" + element).show().html(ex); }, 10);
            }
        });

        return editor;
    }

    static GetCharAt(line: number, col: number): string
    {
        return (<any>codeEditor.currentEditor).getRange({ line: line, ch: col }, { line: line, ch: col + 1 });
    }

    static UpdateList(element: string)
    {
        if (codeEditor.hideHelpTimer)
        {
            clearTimeout(codeEditor.hideHelpTimer);
            codeEditor.hideHelpTimer = null;
        }

        var html = "";
        for (var i = 0; i < codeEditor.currentList.length; i++)
        {
            html += "<div onclick='CodeEditor.Add(\"" + codeEditor.currentList[i] + "\");'" + (codeEditor.currentSelectedCompletion == i ? " class='selectedInsertion'" : "") + ">" + codeEditor.currentList[i] + "</div>";
        }
        $("#codeHelp_" + element).html(html);
        codeEditor.hideHelpTimer = setTimeout(() => { CodeEditor.HideHelp(element); }, 5000);
    }

    static Add(text: string)
    {
        if (codeEditor.hideHelpTimer)
        {
            clearTimeout(codeEditor.hideHelpTimer);
            codeEditor.hideHelpTimer = null;
        }

        if (text.indexOf('.') == -1)
            text += '.';
        else
        {
            var api = GetApiSignature(text).replace(/<.{0,1}span[^>]*>/gi, "").replace(";", "");
            text += api.substr(text.length);
        }

        var pos = (<any>codeEditor.currentEditor).getCursor();
        (<any>codeEditor.currentEditor).replaceRange(text.substr(codeEditor.currentSelection.length), { line: pos.line, ch: pos.ch + (codeEditor.currentTextToTheEnd > 0 ? codeEditor.currentTextToTheEnd + 1 : 0) });
    }

    static HideHelp(element: string)
    {
        $("#codeHelp_" + element).hide();
        codeEditor.hideHelpTimer = null;
        codeEditor.currentList = null;
        codeEditor.currentSelectedCompletion = null;
    }
}