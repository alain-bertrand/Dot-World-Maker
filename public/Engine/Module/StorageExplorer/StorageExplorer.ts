class StorageExplorer
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
        if (framework.CurrentUrl.table)
            StorageExplorer.ShowTableData(framework.CurrentUrl.table);
        else
            StorageExplorer.GetTableList();
    }

    static GetTableList()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/ListStorage',
            data: {
                game: world.Id,
                token: framework.Preferences['token']
            },
            success: (msg) =>
            {
                var list: TableInfo[] = TryParse(msg);
                var html = "";
                html += "<h2>Table list</h2>";
                for (var i = 0; i < list.length; i++)
                {
                    html += "<a href='#action=StorageExplorer&table=" + encodeURIComponent(list[i].name) + "' class='listItem'>" + list[i].name + "</a>";
                }
                $("#tableList").html(html);
            },
            error: function (msg, textStatus)
            {
                var data = TryParse(msg);
                $("#tableList").html("Error: " + data.error);
            }
        });
    }

    static ShowTableData(name: string)
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetGameStorage',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                table: name,
                headers: JSON.stringify([]),
                condition: "",
                orderBy: "rowId desc"
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                var headers: string[] = data.headers;
                var rows: string[][] = data.rows;
                var html = "";
                html += "<h2>Table "+name+"</h2>";
                html += "<table>";
                html += "<thead><tr>";
                for (var i = 0; i < headers.length; i++)
                {
                    html += "<td>" + headers[i] + "</td>";
                }
                html += "</tr></thead>";
                html += "<tbody>";
                for (var i = 0; i < rows.length; i++)
                {
                    html += "<tr>";
                    for (var j = 0; j < rows[i].length; j++)
                    {
                        html += "<td>" + rows[i][j] + "</td>";
                    }
                    html += "</tr>";
                }
                html += "</tbody></table><br>";
                html += "<center>";
                html += "<a href='#action=StorageExplorer' class='button'>List Tables</a>";
                html += "</center>";
                $("#tableList").html(html);
            },
            error: function (msg, textStatus)
            {
                $("#tableList").html("Error: " + msg);
            }
        });
    }
}