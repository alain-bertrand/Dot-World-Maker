interface DirectoryInfo
{
    userDirectory: string;
    totalSize: number;
    usableSize: number;
    tillWhen: Date;
    baseSize: number;
    files: FileInfo[];
}

interface FileInfo
{
    name: string;
    size: number;
}

class FileExplorer
{
    public static Dispose()
    {
    }

    public static IsAccessible()
    {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover()
    {
        if (Main.CheckNW())
            $("#helpLink").first().onclick = () =>
            {
                StandaloneMaker.Help($("#helpLink").prop("href"));
                return false;
            };

        FileExplorer.ReadDir();
    }

    static ReadDir()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/DirectoryList',
            data: {
                game: world.Id,
                token: framework.Preferences['token']
            },
            success: function (msg)
            {
                var data: DirectoryInfo = TryParse(msg);
                if (!data)
                {
                    $("#fileList").html();
                    return;
                }

                var html = "";
                if (selfHosted)
                {
                    html += "Used space: " + FileExplorer.FormatSize(data.totalSize);
                }
                else
                {
                    html = "Available space: " + FileExplorer.FormatSize(data.usableSize) + ", Used space: " + FileExplorer.FormatSize(data.totalSize) + ", Free space: " + FileExplorer.FormatSize(data.usableSize - data.totalSize) + " (" + Math.max(0, (Math.round((data.usableSize - data.totalSize) * 1000 / data.usableSize) / 10)) + "%)";
                    if (data.tillWhen)
                        html += "<br>Space rented till " + Main.FormatDate(data.tillWhen) + " then will have " + FileExplorer.FormatSize(data.baseSize);
                    else
                        html += "<br>Further space can be rented if needed.";
                }

                $("#fileUsage").html(html);

                var html = "<table>";
                html += "<thead><tr><td>Name</td><td>Size</td><td>Used on</td><td style='width: 1px;'>&nbsp;</td><td style='width: 1px;'>&nbsp;</td></tr></thead>";
                html += "<tbody>";
                for (var i = 0; i < data.files.length; i++)
                {
                    html += "<tr><td>" + data.files[i].name.htmlEntities() + "</td>";
                    html += "<td>" + FileExplorer.FormatSize(data.files[i].size) + "</td>";
                    var usedOn = FileExplorer.UsedOn(data.userDirectory + "/" + data.files[i].name);
                    if (usedOn == "Pixel Art Work file")
                        usedOn = usedOn + "</td><td><a href='#action=PixelEditor&file=" + data.files[i].name.replace(/.work$/, "").htmlEntities() + "' class='button'>Edit</a></td><td><span class='button' onclick='FileExplorer.Delete(\"" + data.files[i].name.htmlEntities() + "\");'>Delete</span>";
                    else if (!usedOn)
                        usedOn = "Not used</td><td>&nbsp;</td><td><span class='button' onclick='FileExplorer.Delete(\"" + data.files[i].name.htmlEntities() + "\");'>Delete</span>";
                    html += "<td>" + usedOn + "</td></tr>";
                }
                html += "<tbody></table>";
                $("#fileList").html(html);
            },
            error: function (msg)
            {
                var data = TryParse(msg);
                if (data && data.error)
                    $("#fileList").html(data.error);
                else
                    $("#fileList").html(("" + msg).htmlEntities());
            }
        });
    }

    static Delete(filename: string)
    {
        Framework.Confirm("Are you sure you want to delete this file?", () =>
        {
            $.ajax({
                type: 'POST',
                url: '/backend/DeleteFile',
                data: {
                    game: world.Id,
                    token: framework.Preferences['token'],
                    filename: filename
                },
                success: function (msg)
                {
                    FileExplorer.ReadDir();
                    Framework.ShowMessage("File deleted");
                },
                error: function (msg)
                {
                    var data = TryParse(msg);
                    if (data && data.error)
                        $("#fileList").html(data.error);
                    else
                        $("#fileList").html(("" + msg).htmlEntities());
                }
            });
        });
    }

    static FormatSize(size: number): string
    {
        if (size > 1024 * 1024)
            return "" + (Math.round(size / (1024 * 1024 / 100)) / 100) + " Mb";
        else if (size > 1024)
            return "" + (Math.round(size / (1024 / 100)) / 100) + " Kb";
        else
            return "" + size + " bytes";
    }

    static UsedOn(filename: string): string
    {
        if (filename.indexOf(".work") == filename.length - 5)
            return "Pixel Art Work file";
        if (world.art.background.file.indexOf(filename) == 0)
            return "Background tiles";
        if (world.art.splashImage && world.art.splashImage.indexOf(filename) == 0)
            return "Splash image";
        if (world.art.panelStyle.file.indexOf(filename) == 0)
            return "Panel style";
        if (world.art.statBarStyle.file.indexOf(filename) == 0)
            return "Stat bars";
        if (world.art.quickslotStyle.file.indexOf(filename) == 0)
            return "Quickslots";
        for (var item in world.art.characters)
        {
            if (world.art.characters[item].file.indexOf(filename) == 0)
                return "Character " + item;
        }
        for (var item in world.art.objects)
        {
            if (world.art.objects[item].file.indexOf(filename) == 0)
                return "Map object " + item;
        }
        for (var item in world.art.house_parts)
        {
            if (world.art.house_parts[item].file.indexOf(filename) == 0)
                return "House part " + item;
        }
        for (var item in world.art.sounds)
        {
            if (world.art.sounds[item].mp3.indexOf(filename) == 0)
                return "Sound " + item;
        }
        for (var i = 0; i < world.Skills.length; i++)
        {
            var iconFile = world.Skills[i].CodeVariable("icon");
            if (iconFile && iconFile.indexOf(filename) == 0)
                return "Skill icon " + world.Skills[i].Name;
        }
        return null;
    }
}