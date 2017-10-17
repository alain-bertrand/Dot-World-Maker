var moduleManager = new (class
{
    selected: KnownCode;
    user: User;
    moduleLists: Module[];
    searchTimeout: number;
});

interface User
{
    nb: number;
    name: string;
    credits: number;
}

interface Module
{
    mid: number;
    name: string;
    description: string;
    version: string;
    creator: number;
    username: string;
    cost: number;
    module_description: string;
    code_text: string;
    is_owner: boolean;
    installed_version: string;
}

class ModuleManager
{
    public static Dispose()
    {
        moduleManager.moduleLists = null;
    }

    public static Recover()
    {
        if (!moduleManager.user)
        {
            ModuleManager.GetUserInfo();
            return;
        }
        ModuleManager.Search();
    }


    static ShowList()
    {
        var html = "";
        html += "<table>";
        html += "<thead>";
        html += "<tr><td>Name</td><td>Description</td><td>Version</td><td>Price</td><td>Author</td><td>Actions</td></tr>";
        html += "</thead>";
        html += "<tbody>";
        for (var i = 0; i < moduleManager.moduleLists.length; i++)
        {
            html += "<tr>";
            html += "<td>" + (moduleManager.moduleLists[i].name ? moduleManager.moduleLists[i].name.htmlEntities() : "") + "</td>";
            html += "<td>" + (moduleManager.moduleLists[i].module_description ? moduleManager.moduleLists[i].module_description.htmlEntities(false) : "") + "</td>";
            html += "<td>" + moduleManager.moduleLists[i].version + "</td>";
            html += "<td>" + moduleManager.moduleLists[i].cost + "</td>";
            html += "<td>" + moduleManager.moduleLists[i].username + "</td>";
            html += "<td>";
            if (moduleManager.moduleLists[i].installed_version != null && ModuleManager.versionCompare(moduleManager.moduleLists[i].version, moduleManager.moduleLists[i].installed_version, null))
                html += "<span class='button' onclick='ModuleManager.InstallModule(" + moduleManager.moduleLists[i].mid + ")'>Upgrage</span>";
            else if (moduleManager.user.credits >= moduleManager.moduleLists[i].cost && moduleManager.moduleLists[i].is_owner === false)
                html += "<span class='button' onclick='ModuleManager.InstallModule(" + moduleManager.moduleLists[i].mid + ")'>Install</span>";
            else
                html += "<span class='disabledButton'>Install</span>";
            if (moduleManager.moduleLists[i].is_owner === true)
                html += "<span class='button' onclick='ModuleManager.RemoveModule(" + moduleManager.moduleLists[i].mid + ")'>Remove</span>";
            html += "</td>";
            html += "</tr>";
        }
        html += "</tbody>";
        html += "</table>";
        $("#modulesList").html(html);
    }

    public static Search()
    {
        if (moduleManager.searchTimeout)
            clearTimeout(moduleManager.searchTimeout);
        moduleManager.searchTimeout = setTimeout(ModuleManager.DoSearch(), 500);
    }

    static DoSearch()
    {
        moduleManager.searchTimeout = null;
        $.ajax({
            method: 'POST',
            url: '/backend/GetModuleList',
            data: {
                token: framework.Preferences['token'],
                search: $('#searchModules').val().trim(),
                gameId: world.Id
            },
            success: function (msg)
            {
                var data = TryParse(msg);
                if (data === null)
                {
                    $("#modulesList").html("No module results");
                    return;
                }
                moduleManager.moduleLists = data.modules;
                ModuleManager.ShowList();
            },
            error: function (msg)
            {
                var data = TryParse(msg);
                $("#modulesList").html(data.error);
            }
        });
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    static RemoveModule(moduleId: number)
    {
        Framework.Confirm("Are you sure you want to remove this module from the market place?", () =>
        {
            $.ajax({
                method: "POST",
                url: "/backend/RemoveModuleFromMarket",
                data: {
                    token: framework.Preferences["token"],
                    gameId: world.Id,
                    id: moduleId
                },
                success: (msg) =>
                {
                    ModuleManager.Search();
                },
                error: (msg) =>
                {
                    var error = TryParse(msg);
                    Framework.Alert(error && error.error ? error.error : msg);
                }
            });
        });
    }

    static InstallModule(moduleId: number)
    {
        var module: Module = null;
        for (var i = 0; i < moduleManager.moduleLists.length; i++)
        {
            if (moduleManager.moduleLists[i].mid == moduleId)
            {
                module = moduleManager.moduleLists[i];
                break;
            }
        }
        if (!module)
            return;

        if (moduleManager.user.credits >= module.cost)
        {
            if (module.is_owner)
            {
                Framework.Alert("There is no need for you to purchase your own module");
                return;
            }
            else
            {
                var msg = "Are you sure you want to purchase and install this module?";
                if (module.cost == 0)
                    msg = "Are you sure you want to install this module?";
                Framework.Confirm(msg, () =>
                {
                    $.ajax({
                        method: "POST",
                        url: "/backend/GetModuleFromMarket/" + module.mid,
                        data: {
                            token: framework.Preferences["token"],
                            gameId: world.Id,
                            version: module.version
                        },
                        success: (msg) =>
                        {
                            var message = TryParse(msg);
                            var dbId = module.mid;

                            if (message.code)
                            {
                                var moduleCode = <KnownCode>Object.cast(JSON.parse(message.code), KnownCode);
                                var knownCode = world.GetCode(moduleCode.Name);
                                if (knownCode) // Module already installed, we recover the parameters (if any)
                                {
                                    for (var i = 0; i < world.Codes.length; i++)
                                    {
                                        if (world.Codes[i].Name.toLowerCase() == knownCode.Name.toLowerCase())
                                        {
                                            if (!moduleCode.Parameters)
                                                moduleCode.Parameters = {};
                                            if (knownCode.Parameters) for (var item in knownCode.Parameters)
                                                moduleCode.Parameters[item] = knownCode.Parameters[item];
                                            world.Codes.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                world.Codes.push(moduleCode);
                                world.Save();
                            }
                            Framework.Alert(message.msg);
                        },
                        error: (msg) =>
                        {
                            var error = TryParse(msg);
                            Framework.Alert(error.error);
                            return;
                        }
                    });
                });
            }
            ModuleManager.DoSearch();
        }
        else
        {
            Framework.Alert("You do not have enough credits");
            return;
        }
    }

    static SaveModule()
    {
        var code = moduleManager.selected;
        var currentVersion = '';
        var newVersion = null;
        var module = [];
        var moduleId = null;
        var cost = '';
        $.ajax({
            method: 'POST',
            url: '/backend/GetModule',
            data: {
                token: framework.Preferences['token'],
                search: code.Name,
                code: JSON.stringify(code)
            },
            success: function (result)
            {
                var data = TryParse(result);
                if (result.error)
                {
                    Framework.Alert(data.error);
                    return;
                }
                if (data.module)
                {
                    module = data.module;
                    moduleId = module['id'];
                    currentVersion = module['version'];
                    $.ajax({
                        method: 'POST',
                        url: '/backend/UploadModule',
                        data: {
                            token: framework.Preferences['token'],
                            code: JSON.stringify(code),
                            moduleId: moduleId,
                            version: code.Version,
                            cost: code.Price
                        },
                        success: function (msg)
                        {
                            var data = TryParse(msg);
                            Framework.ShowMessage(data.message);
                        },
                        error: function (error)
                        {
                            var data = TryParse(error);
                            Framework.Alert(data.error);
                        }
                    });
                }
                else
                {
                    $.ajax({
                        method: 'POST',
                        url: '/backend/UploadModule',
                        data: {
                            token: framework.Preferences['token'],
                            code: JSON.stringify(code),
                            version: code.Version,
                            cost: code.Price
                        },
                        success: function (msg)
                        {
                            var data = TryParse(msg);
                            Framework.ShowMessage(data.message);
                        },
                        error: function (error)
                        {
                            var data = TryParse(error);
                            Framework.Alert(data.error);
                        }
                    });
                }
            },
            error: function (error)
            {
                var data = TryParse(error);
                Framework.Alert(data.error);
            }
        });
    }

    static CreateModule(code: KnownCode)
    {
        if (code.Description == null || code.Description == "")
        {
            Framework.Alert("You must have a description if you plan to upload as a module.");
            return;
        }
        if (code.Author !== null && code.Author !== username)
        {
            Framework.Alert("Only the author can submit a module.");
            return;
        }
        if (code.Author === null)
            code.Author = username;
        if (code.Price === null)
        {
            code.Price = 0;
            Framework.Alert("You must set a price.");
            return;
        }
        if (code.Price < 0)
        {
            Framework.Alert("The price must be greater or equal to 0.");
            return;
        }
        if (!code.Version)
            code.Version = "1.0.0";
        moduleManager.selected = code;
        ModuleManager.SaveModule();
    }

    private static versionCompare(v1, v2, options)
    {
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x)
        {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart))
        {
            return NaN;
        }

        if (zeroExtend)
        {
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }

        if (!lexicographical)
        {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i)
        {
            if (v2parts.length == i)
            {
                return 1;
            }

            if (v1parts[i] == v2parts[i])
            {

            }
            else if (v1parts[i] > v2parts[i])
            {
                return 1;
            }
            else
            {
                return -1;
            }
        }

        if (v1parts.length != v2parts.length)
        {
            return -1;
        }

        return 0;
    }

    private static GetUserInfo()
    {
        $.ajax({
            method: 'POST',
            url: '/backend/UserInfo',
            data: {
                token: framework.Preferences['token']
            },
            success: function (msg)
            {
                moduleManager.user = TryParse(msg);
                ModuleManager.Search();
            },
            error: function (error)
            {
                $("#modulesList").html(JSON.stringify(error));
            }
        });
    }
}