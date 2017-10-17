var gameStats = new (class
{
    currentDay: number;
    currentMonth: number;
    currentYear: number;
    currentStat: number = 1;
    currentView: string = "Month";
    currentData: GraphData;

    months = ["January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"];
    days = [31,
        28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31];
    weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

});

interface GraphData
{
    labels: string[];
    values: number[];
}

class GameStats
{
    public static Dispose()
    {
        $(window).unbind("resize", GameStats.Resize);
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

        var now = new Date();
        if (!gameStats.currentMonth)
        {
            gameStats.currentMonth = now.getMonth() + 1;
            gameStats.currentYear = now.getFullYear();
        }
        GameStats.LoadStat();

        $(window).bind("resize", GameStats.Resize);

        if (gameStats.weekDays[5] == "Fri")
        {
            var friday = (new Date(2016, 0, 1)).getDay();
            if (friday == 6)
            {
                gameStats.weekDays.unshift("Sun");
                gameStats.weekDays.pop();
            }
        }
    }

    public static LoadStat()
    {
        gameStats.currentStat = parseInt($("#statType").val());
        GameStats['Load' + gameStats.currentView]();
    }

    static IsBisextile(year): boolean
    {
        return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
    }

    static LoadYear()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetYearStat',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                year: gameStats.currentYear,
                stat: gameStats.currentStat
            },
            success: (msg) =>
            {
                var data = TryParse(msg);
                var html = "";
                html += "<h1><span class='button' onclick='GameStats.ChangeYear(-1)'>&lt;</span> " + gameStats.currentYear + " <span class='button' onclick='GameStats.ChangeYear(1)'>&gt;</span></h1>";

                html += "<table>";

                if (!data || data.length == 0)
                    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                var labels: string[] = [];
                for (var i = 0; i < 12; i++)
                {
                    labels.push(gameStats.months[i]);
                    html += "<tr><td><a href='#' onclick='GameStats.ShowMonth(" + (i + 1) + ");return false;'>" + gameStats.months[i] + "</a><td><td>" + data[i] + "</td></tr>";
                }
                html += "</table>";
                $("#statOverview").html(html);

                gameStats.currentData = { labels: labels, values: data };
                GameStats.Resize();
            },
            error: function (msg, textStatus)
            {
                if (msg.d && msg.d.error)
                    Framework.ShowMessage(msg.d.error);
                else
                    Framework.ShowMessage(msg);
            }
        });
    }

    static LoadMonth()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetMonthStat',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                year: gameStats.currentYear,
                month: gameStats.currentMonth,
                stat: gameStats.currentStat
            },
            success: (msg) =>
            {
                var data: number[] = TryParse(msg);
                var html = "";
                html += "<h1><span class='button' onclick='GameStats.ChangeMonth(-1)'>&lt;</span> " + gameStats.months[gameStats.currentMonth - 1] + " <a href='#' onclick='GameStats.ShowYear();return false;'>" + gameStats.currentYear + "</a> <span class='button' onclick='GameStats.ChangeMonth(1)'>&gt;</span></h1>";

                html += "<table>";

                if (!data || data.length == 0)
                    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                gameStats.days[1] = GameStats.IsBisextile(gameStats.currentYear) ? 29 : 28;
                var nbDays = gameStats.days[gameStats.currentMonth - 1];
                while (data.length > nbDays)
                    data.pop();

                var firstWeekDay = (new Date(gameStats.currentYear, gameStats.currentMonth, 1)).getDay();

                var labels: string[] = [];
                for (var i = 0; i < nbDays; i++)
                {
                    labels.push(gameStats.weekDays[(firstWeekDay + i) % 7] + "\n" + (i + 1));
                    if (gameStats.weekDays[(firstWeekDay + i) % 7] == "Sun" || gameStats.weekDays[(firstWeekDay + i) % 7] == "Sat")
                        html += "<tr class='weekendDays'>";
                    else
                        html += "<tr>";
                    html += "<td><a href='#' onclick='GameStats.ShowDay(" + (i + 1) + ");return false;'>" + gameStats.weekDays[(firstWeekDay + i) % 7] + "</a></td><td><a href='#' onclick='GameStats.ShowDay(" + i + ");return false;'>" + (i + 1) + "</a><td><td>" + data[i] + "</td ></tr>";
                }
                html += "</table>";
                $("#statOverview").html(html);

                gameStats.currentData = { labels: labels, values: data };
                GameStats.Resize();
            },
            error: function (msg, textStatus)
            {
                if (msg.d && msg.d.error)
                    Framework.ShowMessage(msg.d.error);
                else
                    Framework.ShowMessage(msg);
            }
        });
    }

    static LoadDay()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/GetDayStat',
            data: {
                game: world.Id,
                token: framework.Preferences['token'],
                year: gameStats.currentYear,
                month: gameStats.currentMonth,
                day: gameStats.currentDay,
                stat: gameStats.currentStat
            },
            success: (msg) =>
            {
                var data: number[] = TryParse(msg);
                var html = "";
                html += "<h1><span class='button' onclick='GameStats.ChangeDay(-1)'>&lt;</span>" + gameStats.currentDay + (gameStats.currentDay == 1 ? "st" : (gameStats.currentDay == 2 ? "nd" : (gameStats.currentDay == 3 ? "rd" : "th"))) + " <a href='#' onclick='GameStats.ShowMonth(" + gameStats.currentMonth + ");return false;'>" + gameStats.months[gameStats.currentMonth - 1] + "</a> <a href='#' onclick='GameStats.ShowYear();return false;'>" + gameStats.currentYear + "</a> <span class='button' onclick='GameStats.ChangeDay(1)'>&gt;</span></h1>";

                html += "<table>";

                gameStats.days[1] = GameStats.IsBisextile(gameStats.currentYear) ? 29 : 28;
                if (!data || data.length == 0)
                    data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                var labels: string[] = [];
                for (var i = 0; i < 24; i++)
                {
                    labels.push(("" + i).padLeft("0", 2) + ":00");
                    html += "<tr><td>" + ("" + i).padLeft("0", 2) + ":00<td><td>" + data[i] + "</td ></tr>";
                }
                html += "</table>";
                $("#statOverview").html(html);

                gameStats.currentData = { labels: labels, values: data };
                GameStats.Resize();
            },
            error: function (msg, textStatus)
            {
                if (msg.d && msg.d.error)
                    Framework.ShowMessage(msg.d.error);
                else
                    Framework.ShowMessage(msg);
            }
        });
    }

    static ChangeDay(toAdd: number)
    {
        gameStats.days[1] = GameStats.IsBisextile(gameStats.currentYear) ? 29 : 28;
        var nbDays = gameStats.days[gameStats.currentMonth - 1];

        gameStats.currentDay += toAdd;
        if (gameStats.currentDay < 1)
        {
            gameStats.currentMonth--;
            if (gameStats.currentMonth < 1)
            {
                gameStats.currentMonth = 12;
                gameStats.currentYear--;
            }
            gameStats.currentDay = gameStats.days[gameStats.currentMonth - 1];
        }
        if (gameStats.currentDay > nbDays)
        {
            gameStats.currentMonth++;
            if (gameStats.currentMonth > 12)
            {
                gameStats.currentMonth = 1;
                gameStats.currentYear++;
            }
            gameStats.currentDay = 1;
        }

        GameStats.LoadStat();
    }

    static ChangeMonth(toAdd: number)
    {
        gameStats.currentMonth += toAdd;
        if (gameStats.currentMonth < 1)
        {
            gameStats.currentMonth = 12;
            gameStats.currentYear--;
        }
        if (gameStats.currentMonth > 12)
        {
            gameStats.currentMonth = 1;
            gameStats.currentYear++;
        }
        GameStats.LoadStat();
    }

    static ChangeYear(toAdd: number)
    {
        gameStats.currentYear += toAdd;
        GameStats.LoadStat();
    }

    static ShowYear()
    {
        gameStats.currentView = "Year";
        GameStats.LoadStat();
    }

    static ShowMonth(month: number)
    {
        gameStats.currentView = "Month";
        gameStats.currentMonth = month;
        GameStats.LoadStat();
    }

    static ShowDay(day: number)
    {
        gameStats.currentView = "Day";
        gameStats.currentDay = day;
        GameStats.LoadStat();
    }

    static Resize()
    {
        var canvas = <HTMLCanvasElement>$("#statGraph").first();
        canvas.width = $("#statGraph").width();
        canvas.height = $("#statGraph").height();
        GameStats.Plot();
    }

    static Plot()
    {
        var canvas = <HTMLCanvasElement>$("#statGraph").first();
        var ctx = canvas.getContext("2d");

        var width = canvas.width;
        var height = canvas.height - 30;

        ctx.clearRect(0, 0, width, height);
        var max = 0;
        for (var i = 0; i < gameStats.currentData.values.length; i++)
            max = Math.max(max, gameStats.currentData.values[i]);

        var nbZero = Math.pow(10, Math.floor(Math.log(max) / Math.LN10));
        var scaleMax = Math.ceil(max / nbZero) * nbZero;
        var scaleWidth = 0;
        max = scaleMax;
        for (var i = 1; i <= 4; i++)
            scaleWidth = Math.max(scaleWidth, ctx.measureText("" + (Math.round(i * max / 4 * 10) / 10)).width);

        var fx = (width - (scaleWidth + 10)) / gameStats.currentData.values.length;

        for (var i = 0; i < gameStats.currentData.values.length; i++)
        {
            var h = Math.max(1, Math.round((height - 5) * gameStats.currentData.values[i] / max));

            var x = Math.round(fx * i) + scaleWidth + 10;
            ctx.fillStyle = "#A0A0A0";
            ctx.fillRect(x + 1.5, (height - 1) - h, Math.round(fx * 0.8), h);
            ctx.fillRect(x + 2.5, (height - 0) - h, Math.round(fx * 0.8), h);
            ctx.fillStyle = "#008000";
            ctx.fillRect(x + 0.5, (height - 2) - h, Math.round(fx * 0.8), h);

            ctx.fillStyle = "#000000";
            var p = gameStats.currentData.labels[i].split('\n');
            for (var j = 0; j < p.length; j++)
            {
                var x2 = Math.round(x + fx / 2) - ctx.measureText(p[j]).width / 2;
                ctx.fillText(p[j], x2, height + ((j + 1) * 13));
            }
        }

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        for (var i = 0; i <= 4; i++)
        {
            var y = Math.round(i * max / 4 * 10) / 10;
            var h = Math.max(1, Math.round((height - 5) * y / max));
            ctx.fillText("" + y, scaleWidth - ctx.measureText("" + y).width + 5, height - h + 3);
            ctx.moveTo(scaleWidth + 10, height - h - 1.5);
            ctx.lineTo(canvas.width, height - h - 1.5);
        }
        ctx.setLineDash([2, 2]);
        ctx.stroke();
    }
}