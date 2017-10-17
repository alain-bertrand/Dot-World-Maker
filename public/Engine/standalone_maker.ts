/// <reference path="../Common/Libs/MiniQuery.ts" />
/// <reference path="Libs/nwjs.d.ts" />

var menuBar = {
    "File": {
        "New": () =>
        {
            StandaloneMaker.NewProject();
        },
        "&Open": () =>
        {
            StandaloneMaker.OpenProject();
        },
        "&Save": () =>
        {
            StandaloneMaker.SaveProject();
        },
        "Save As...": () =>
        {
            StandaloneMaker.SaveAsProject();
        },
        "Export As HTML...": () =>
        {
            StandaloneMaker.ExportHTML();
        },
        "Export As EXE...": () =>
        {
            StandaloneMaker.ExportEXE();
        },
        "Exit": () => { nw.Window.get().close(); }
    },
    "Game": {
        "&Play": "#action=Play",
        "&Quick Search": () =>
        {
            SearchPanel.ShowHide();
        },
        "Reset": "#action=GameReset"
    },
    "Art":
    {
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
    "Editors":
    {
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
    "Help":
    {
        "Help": () =>
        {
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

var standaloneMaker = new (class
{
    currentFile: string = null;
    helpWindow: any;
});

class StandaloneMaker
{
    static Init()
    {
        var menu = new nw.Menu({ type: 'menubar' });

        for (var menuSection in menuBar)
        {
            var submenu = new nw.Menu();
            for (var item in menuBar[menuSection])
            {
                var label = item.replace(/&/g, "");
                var key = null;
                var modifier = null;
                var m = item.match(/&(.)/);
                if (m)
                {
                    key = m[1];
                    modifier = "ctrl";
                }
                if (label == "Help")
                {
                    key = "F1";
                }
                /*else if (label == "Exit")
                {
                    key = "F4";
                    modifier = "alt";
                }*/

                if (typeof menuBar[menuSection][item] === "function")
                {
                    var a = function ()
                    {
                        var func = menuBar[menuSection][item]
                        submenu.append(new nw.MenuItem({
                            label: label,
                            click: func,
                            key: key,
                            modifiers: modifier
                        }))
                    };
                    a();
                }
                else
                {
                    var a = function ()
                    {
                        var url = menuBar[menuSection][item];
                        submenu.append(new nw.MenuItem({
                            label: label,
                            click: function ()
                            {
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
        nw.Window.get().on('close', () =>
        {
            if (standaloneMaker.helpWindow)
                standaloneMaker.helpWindow.close();
            nw.Window.get().close(true);
        });

        Framework.ReloadPreferences();
        if (framework.Preferences['lastProject'])
        {
            var fs = require('fs');
            if (fs.existsSync(framework.Preferences['lastProject']))
            {
                $("#loginBackground").hide();
                $("#loginForm").hide();
                $("#branding").hide();
                $("#gameNewsDisplay").hide();

                standaloneMaker.currentFile = framework.Preferences['lastProject'];
                StandaloneMaker.DoOpenFile();

                Framework.Init();
                Main.GenerateGameStyle();
            }
            else
            {
                delete framework.Preferences['lastProject'];
                Framework.SavePreferences();
            }
        }
        else
        {
            Main.InitGameMaker();
            world.Id = Math.round((new Date()).getTime() / 1000);
            world.Edition = EditorEdition.Standard;
        }
    }

    static Filename(source: string): string
    {
        return source.match(/[^\\\/]*$/)[0].split('?')[0];
    }


    public static Help(url: string)
    {
        nw.Window.open(url, { id: 'HelpWin', icon: "images/icon_help.png" }, (newWin) =>
        {
            standaloneMaker.helpWindow = newWin;
        });
    }

    public static NewProject()
    {
        Framework.Confirm("Are you sure you want to create a new project?", () =>
        {
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
    }

    public static OpenProject()
    {
        $("#fileOpenDialog").unbind("change");
        $("#fileSaveDialog").prop("accept", ".dwmproject");
        var chooser = $("#fileOpenDialog").bind("change", StandaloneMaker.OpenProjectFile).first().click();
    }

    public static OpenProjectFile()
    {
        standaloneMaker.currentFile = $("#fileOpenDialog").val();
        $("#fileOpenDialog").unbind("change", StandaloneMaker.OpenProjectFile);
        $("#fileOpenDialog").val("");
        StandaloneMaker.DoOpenFile();
        Framework.Rerun();
    }

    public static DoOpenFile()
    {
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
    }

    public static SaveProject()
    {
        if (standaloneMaker.currentFile)
        {
            if (!game)
                game = { maps: [], data: null };
            game.data = world.Stringify();

            var fs = require('fs');
            fs.writeFile(standaloneMaker.currentFile, JSON.stringify(window["game"]));
            return;
        }
        StandaloneMaker.SaveAsProject();
    }

    public static SaveAsProject()
    {
        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        $("#fileSaveDialog").prop("accept", ".dwmproject");
        $("#fileSaveDialog").prop("nwsaveas", "");
        game.data = world.Stringify();
        $("#fileSaveDialog").unbind("change");
        $("#fileSaveDialog").val("").bind("change", StandaloneMaker.SaveProjectFile).first().click();
    }

    public static SaveProjectFile()
    {
        standaloneMaker.currentFile = $("#fileSaveDialog").val();
        $("#fileSaveDialog").unbind("change", StandaloneMaker.SaveProjectFile);
        $("#fileSaveDialog").val("");
        var fs = require('fs');
        fs.writeFile(standaloneMaker.currentFile, JSON.stringify(game));
        document.title = "Dot World Maker - " + StandaloneMaker.Filename(standaloneMaker.currentFile).replace(".dwmproject", "");

        Framework.ReloadPreferences();
        framework.Preferences['lastProject'] = standaloneMaker.currentFile;
        Framework.SavePreferences();
    }

    public static ExportHTML()
    {
        $("#directoryDialog").unbind("change").val("").bind("change", StandaloneMaker.DoExportHTML).first().click();
    }

    public static DoExportHTML()
    {
        var directory = $("#directoryDialog").val();
        $("#directoryDialog").unbind("change", StandaloneMaker.DoExportHTML).val("");
        StandaloneMaker.ExportToDirectory(directory);
    }

    public static ExportEXE()
    {
        $("#directoryDialog").unbind("change").val("").bind("change", StandaloneMaker.DoExportEXE).first().click();
    }

    public static DoExportEXE()
    {
        var directory = $("#directoryDialog").val();
        $("#directoryDialog").unbind("change", StandaloneMaker.DoExportEXE).val("");

        var fs = require('fs');
        if (!fs.existsSync(directory + "/locales"))
            fs.mkdirSync(directory + "/locales");
        var path = require('path');
        var nwPath = process.execPath;
        var nwDir = path.dirname(nwPath);

        StandaloneMaker.copyFile(nwDir + "/Dot World Maker.exe", directory + '/game.exe');
        for (var i = 0; i < nwjsFiles.length; i++)
        {
            StandaloneMaker.copyFile(nwDir + "/" + nwjsFiles[i], directory + '/' + nwjsFiles[i]);
        }

        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        var data: SerializedWorld = JSON.parse(world.Stringify());

        var zip = new (<any>require('node-zip'))();

        zip.file("css/runtime.css", fs.readFileSync(process.cwd() + "/runtime.css"));
        zip.file("index.html", fs.readFileSync(process.cwd() + "/runtime.html"));
        zip.file("engine.js", fs.readFileSync(process.cwd() + "/maker.js"));
        zip.file("art/simple_small_logo.png", fs.readFileSync(process.cwd() + "/images/simple_small_logo.png"));
        zip.file("art/tileset2/emotes.png", fs.readFileSync(process.cwd() + "/art/tileset2/emotes.png"));
        zip.file("art/tileset2/inventory_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/inventory_icon.png"));
        zip.file("art/tileset2/journal_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/journal_icon.png"));
        zip.file("art/tileset2/profile_icon.png", fs.readFileSync(process.cwd() + "/art/tileset2/profile_icon.png"));
        StandaloneMaker.ChangeGameUrls(data, "art/", (origName: string, newName: string) =>
        {
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
    }

    static copyFile(source: string, target: string)
    {
        var fs = require('fs');
        var rd = fs.createReadStream(source);
        rd.on("error", function (err)
        {
            console.log("error while copy '" + source + "' to '" + target + "': " + err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err)
        {
            console.log("error while copy '" + source + "' to '" + target + "': " + err);
        });
        wr.on("close", function (ex)
        {
        });
        rd.pipe(wr);
    }

    public static ExportToDirectory(directory: string)
    {
        if (!game)
            game = { maps: [], data: null };
        world.NWMapChanges();
        var data: SerializedWorld = JSON.parse(world.Stringify());

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
        StandaloneMaker.ChangeGameUrls(data, "art/", (origName: string, newName: string) =>
        {
            try
            {
                if (fs.existsSync(directory + "/" + newName))
                    fs.unlinkSync(directory + "/" + newName);
                if (origName.indexOf("/art/") == 0 || origName.indexOf("/Sounds/") == 0)
                    origName = process.cwd() + origName;
                StandaloneMaker.copyFile(origName, directory + "/art/" + newName);
            }
            catch (ex)
            {
                console.log(ex);
            }
        });

        game.data = data;
        fs.writeFile(directory + "/" + "game.js", "var game=" + JSON.stringify(game) + ";");
    }

    static CleanupUrl(url: string, prefix, changeCallback: (origName: string, newName: string) => void): string
    {
        if (changeCallback)
            changeCallback(url.split("?")[0], url.replace(/\?.*$/, "").replace(/^(.*[\\\/])([a-z0-9_\-.]+)$/i, "$2"));
        return prefix + url.replace(/\?.*$/, "").replace(/^(.*[\\\/])([a-z0-9_\-.]+)$/i, "$2");

        /*if (changeCallback)
            changeCallback(url.split("?")[0], url.replace(/^\/Sounds\//, "").replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, ""));
        return prefix + url.replace(/^\/Sounds\//, "").replace(/^\/[^\/]*\/[^\/]*\//, "").replace(/\?.*$/, "");*/
    }

    static CleanupFileCodeVariable(code: string, prefix: string, changeCallback: (origName: string, newName: string) => void)
    {
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
    }

    static ChangeGameUrls(world: SerializedWorld, urlPrefix: string = "", changeCallback: (origName: string, newName: string) => void = null)
    {
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
    }
}
