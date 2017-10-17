class PublicViewPlayer
{
    public static Show(name: string)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/PublicViewPlayer',
            data: {
                game: world.Id,
                name: name
            },
            success: (msg) =>
            {
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
                var items: any[] = [];
                for (var item in data.equipedObjects)
                    items.push(data.equipedObjects[item]);
                items.sort();
                for (var i = 0; i < items.length; i++)
                    html += ("" + items[i].Name).htmlEntities() + "<br>";
                html += "<h3>Stats</h3>";
                html += "<table>";
                data.stats.sort((a, b) =>
                {
                    if (a.Name > b.Name)
                        return 1;
                    if (a.Name < b.Name)
                        return -1;
                    return 0;
                });
                for (var i = 0; i < data.stats.length; i++)
                {
                    var stat = world.GetStat(data.stats[i].Name);
                    if (!stat)
                        continue;
                    if (stat.CodeVariable("PlayerVisible") === "false")
                        continue;
                    html += "<tr><td>" + ("" + (stat.CodeVariable("DisplayName") ? stat.CodeVariable("DisplayName") : stat.Name)).htmlEntities() + "</td><td>" + ("" + data.stats[i].Value).htmlEntities() + "</td></tr>";
                }
                html += "<h3>Skills</h3>";
                data.skills.sort((a, b) =>
                {
                    if (a.Name > b.Name)
                        return 1;
                    if (a.Name < b.Name)
                        return -1;
                    return 0;
                });
                for (var i = 0; i < data.skills.length; i++)
                {
                    var skill = world.GetSkill(data.skills[i].Name);
                    if (!skill)
                        continue;
                    html += ("" + (skill.CodeVariable("DisplayName") ? skill.CodeVariable("DisplayName") : skill.Name)).htmlEntities() + "<br>";
                }
                $("#dialogSentence").html(html);
                play.onDialogPaint = [];

                $("#dialogAnswers").html("<div onclick='PublicViewPlayer.Close();' class='gameButton'>Close</div>");
            },
            error: function (msg, textStatus)
            {
            }
        });
    }

    public static Close()
    {
        $("#npcDialog").hide();
    }
}