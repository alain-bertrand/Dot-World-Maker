app.post('/backend/ChangePassword', function(req, res, next) {

    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
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
    connection.connect(function (err) {
        if (err != null) {
            connection.end();
            console.log(err);
            res.writeHead(500, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({error: "error with database."}));
            res.end();
            return;
        }
        var userId = tokenInfo.id;
        var currentPWHash = HashPassword(tokenInfo.user, req.body.currentPass);
        var newPWHash = HashPassword(tokenInfo.user, req.body.newPass);
        connection.query('select id from users where (id = ? and password = ?)', [userId, currentPWHash], function(err, result) {
            if(err) {
                connection.end();
                console.log(err);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "error with database." }));
                res.end();
                return;
            }
            else if (!result || !result.length)
            {
                connection.end();
                console.log(err);
                res.writeHead(500, { 'Content-Type': 'text/json' });
                res.write(JSON.stringify({ error: "no write access." }));
                res.end();
                return;
            }
            else {
                connection.query('update users set password = ? where id = ?', [newPWHash, userId], function(err2, result2) {
                    if(err) {
                        connection.end();
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "error with database." }));
                        res.end();
                        return;
                    }
                    else if(!result2.affectedRows) {
                        connection.end();
                        console.log(err2);
                        res.writeHead(500, { 'Content-Type': 'text/json' });
                        res.write(JSON.stringify({ error: "no write access." }));
                        res.end();
                        return;
                    }
                    else {
                        connection.end();
                        res.writeHead(200, {'Content-Type': 'text/json'});
                        res.write(JSON.stringify({success: 'Your password has been updated'}));
                        res.end();
                        return ;
                    }
                });
            }
        })
    });
});
