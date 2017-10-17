enum StatType
{
    Player_Join = 1,
    Player_Login = 2,
    Monster_Kill = 100,
    Level_Up = 101,
    Player_Kill = 102
}

function GameIncreaseStat(gameId: number, statId: StatType): void
{
    var connection = getConnection();
    if (!connection)
    {
        return;
    }

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();

    connection.connect(function (err)
    {
        if (err != null)
            return;

        connection.query("insert into game_stat_year(game_id, stat_id, year) values(?,?,?)", [gameId, <number>statId, year], function (err1, r1)
        {
            connection.query("update game_stat_year set m" + month + "=m" + month + "+1 where game_id = ? and stat_id = ? and year = ?", [gameId, <number>statId, year], function (err2, r2)
            {
                connection.query("insert into game_stat_month(game_id, stat_id, year, month) values(?,?,?,?)", [gameId, <number>statId, year, month], function (err3, r3)
                {
                    connection.query("update game_stat_month set d" + day + "=d" + day + "+1 where game_id = ? and stat_id = ? and year = ? and month = ?", [gameId, <number>statId, year, month], function (err4, r4)
                    {
                        connection.query("insert into game_stat_day(game_id, stat_id, year, month, day) values(?,?,?,?,?)", [gameId, <number>statId, year, month, day], function (err5, r5)
                        {
                            connection.query("update game_stat_day set h" + hour + "=h" + hour + "+1 where game_id = ? and stat_id = ? and year = ? and month = ? and day = ?", [gameId, <number>statId, year, month, day], function (err6, r6)
                            {
                                connection.end();
                                return;
                            });
                        });
                    });
                });
            });
        });
    });
}

app.post('/backend/AddStat', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.stat)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }

    if (isNaN(parseInt(req.body.stat)) || parseInt(req.body.stat) < 100)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is wrong." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    GameIncreaseStat(req.body.game, req.body.stat);
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify(true));
    res.end();
});

app.post('/backend/GetYearStat', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.stat)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }

    if (!req.body.year)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }

            connection.query('select m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12 from game_stat_year where game_id = ? and stat_id = ? and year = ?', [req.body.game, req.body.stat, req.body.year], function (err2, result)
            {
                connection.end();
                if (err2 != null)
                {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0)
                {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }

                var resValue: number[] = [];
                for (var i = 1; i <= 12; i++)
                    resValue.push(result[0]['m' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});

app.post('/backend/GetMonthStat', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.stat)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }

    if (!req.body.year)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }

    if (!req.body.month)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'month' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database 2." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }

            connection.query('select d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31 from game_stat_month where game_id = ? and stat_id = ? and year = ? and month = ?', [req.body.game, req.body.stat, req.body.year, req.body.month], function (err2, result)
            {
                connection.end();
                if (err2 != null)
                {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0)
                {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                var resValue: number[] = [];
                for (var i = 1; i <= 31; i++)
                    resValue.push(result[0]['d' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});

app.post('/backend/GetDayStat', function (req, res, next)
{
    if (!req.body.game)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'game' is missing." }));
        res.end();
        return;
    }

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.stat)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'stat' is missing." }));
        res.end();
        return;
    }

    if (!req.body.year)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'year' is missing." }));
        res.end();
        return;
    }

    if (!req.body.month)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'month' is missing." }));
        res.end();
        return;
    }

    if (!req.body.day)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'day' is missing." }));
        res.end();
        return;
    }

    var tokenInfo = GetTokenInformation(req.body.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (!tokenInfo)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "token not valid." }));
        res.end();
        return;
    }

    var connection = getConnection();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ error: "error with database." }));
            res.end();
            return;
        }
        connection.query('select access_right_id from game_access_rights where (game_id = ? and user_id = ?) or (user_id = ? and access_right_id=1000)', [req.body.game, tokenInfo.id, tokenInfo.id,], function (err1, r1)
        {
            if (err1 != null)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database 2." }));
                res.end();
                return;
            }
            if (!r1 || !r1.length)
            {
                connection.end();
                console.log(err1);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no access." }));
                res.end();
                return;
            }

            connection.query('select h0,h1,h2,h3,h4,h5,h6,h7,h8,h9,h10,h11,h12,h13,h14,h15,h16,h17,h18,h19,h20,h21,h22,h23 from game_stat_day where game_id = ? and stat_id = ? and year = ? and month = ? and day = ?', [req.body.game, req.body.stat, req.body.year, req.body.month, req.body.day], function (err2, result)
            {
                connection.end();
                if (err2 != null)
                {
                    console.log(err2);
                    res.writeHead(500, { 'Content-Type': 'text/json' });
                    res.write(JSON.stringify({ error: "error with database." }));
                    res.end();
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'text/json' });
                if (!result || result.length == 0)
                {
                    res.write(JSON.stringify(null));
                    res.end();
                    return;
                }
                var resValue: number[] = [];
                for (var i = 0; i <= 23; i++)
                    resValue.push(result[0]['h' + i]);
                res.write(JSON.stringify(resValue));
                res.end();
            });
        });
    });
});
