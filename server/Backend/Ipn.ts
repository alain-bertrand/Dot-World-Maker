var key = "ThisIsMyS3Cr3!K3Y";

function CreateLicensePayment(userId: number, price: number): string
{
    var data = { id: userId, price: price, buy: "license" };
    data['trx'] = sha256(JSON.stringify(data) + key, key);
    return JSON.stringify(data);
}

function CreateCreditPayment(userId: number, credits: number, price: number): string
{
    var data = { id: userId, price: price, buy: "credits", credits: credits };
    data['trx'] = sha256(JSON.stringify(data) + key, key);
    return JSON.stringify(data);
}

function VerifyPayment(source: string): boolean
{
    try
    {
        var data = JSON.parse(source);
    }
    catch (ex)
    {
        console.log("Not a correct JSON: " + source);
        return false;
    }
    var cert = data.trx;
    delete data.trx;
    return (sha256(JSON.stringify(data) + key, key) == cert && data.buy == "license")
}

app.post('/backend/GetCreditButton', function (req, res, next)
{
    if (!req.body.token)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'token' is missing." }));
        res.end();
        return;
    }

    if (!req.body.credits)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "parameter 'credits' is missing." }));
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

    var credits = parseInt(req.body.credits);

    if (isNaN(credits))
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid value" }));
        res.end();
        return;
    }

    var price = [];
    price[50] = 7;
    price[100] = 13;
    price[200] = 24;

    if (!price[credits])
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "Invalid value" }));
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(CreateCreditPayment(tokenInfo.id, credits, price[credits]));
    res.end();
    return;
});

app.post('/backend/GetTotalCredits', function (req, res, next)
{
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
        connection.query("select credits from users where id = ? limit 1", [tokenInfo.id], function (err1, results)
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

            connection.end();

            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write("" + results[0].credits);
            res.end();
        });
    });
    return;
});


app.post('/backend/GetIpnLicenseButton', function (req, res, next)
{
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
        connection.query("select editor_version from users where id = ? limit 1", [tokenInfo.id], function (err1, results)
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

            connection.end();
            if (results && results.length && results.length == 1 && results[0].editor_version == 'f')
            {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.write(CreateLicensePayment(tokenInfo.id, 30));
                //res.write(CreateLicensePayment(tokenInfo.id, 24));
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.write(JSON.stringify({ "license": results[0].editor_version }));
            res.end();
        });
    });
    return;
});

function UpgradeToStandardLicense(userId: number)
{
    var connection = getConnection();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("update users set editor_version = 's' where id = ?", [userId], function (err1, r1)
        {
            connection.end();
        });
    });
}

function AddCredits(userId: number, credits: number)
{
    var connection = getConnection();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("update users set credits = credits + ? where id = ?", [credits, userId], function (err1, r1)
        {
            connection.query("insert into credits_log(from_user, to_user, quantity, reason) values(null, ?, ?, 'Purchase credits.')", [userId, credits], function (err2, r2)
            {
                connection.end();
            });
        });
    });
}

function CheckTransaction(trx: string, email: string, data: string, gross: number, fee: number, callbackOk: () => void)
{
    var connection = getConnection();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return;
    }

    connection.connect(function (err)
    {
        if (err != null)
        {
            connection.end();
            console.log(err);
            return;
        }
        connection.query("select count(id) \"nb\" from paypal_transactions where id = ?", [trx], function (err1, r1)
        {
            if (err1)
            {
                connection.end();
                console.log("Error while checking transactions: " + err1);
            }
            else if (r1 && r1.length && r1[0].nb == 0)
            {
                connection.query("insert into paypal_transactions(id, data, payer_email, mc_gross, mc_fee) values(?,?,?,?,?)", [trx, data, email, gross, fee], function (err2, r2)
                {
                    connection.end();
                    if (err2)
                        console.log("Error while inserting transaction: " + err2);
                    else
                        callbackOk();
                    return;
                });
                return;
            }
            else
            {
                //console.log("Transaction already received.");
                connection.end();
            }
        });
    });
}

app.post('/backend/IpnVerify', function (req, res, next)
{
    var ipn = require('paypal-ipn');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("Ok");

    var ipnSandbox = false;

    var callback = function (err, msg)
    {
        if (err)
        {
            console.error(err);
        }
        else
        {
            //console.log(req.body.payment_status);
            // Do stuff with original params here

            //console.log(req.body);

            if (req.body.payment_status == 'Completed' && req.body.mc_currency == "USD" && ((req.body.receiver_email == "bertrand@nodalideas.com" && ipnSandbox == false) || (req.body.receiver_email == "hazard3d-facilitator@yahoo.com" && ipnSandbox == true)))
            {
                //console.log('Transaction received as completed');
                if (VerifyPayment(req.body.custom) && req.body.mc_gross == JSON.parse(req.body.custom).price)
                {
                    CheckTransaction(req.body.txn_id, req.body.payer_email, req.body.custom, req.body.mc_gross, req.body.mc_fee, () =>
                    {
                        //console.log("Got IPN verification");
                        // Payment has been confirmed as completed

                        switch (req.body.item_name)
                        {
                            case "license_standard":
                                console.log("Verification succeed");
                                var data = JSON.parse(req.body.custom);
                                UpgradeToStandardLicense(data.id);
                                break;
                            case "credits":
                                console.log("Verification succeed");
                                var data = JSON.parse(req.body.custom);
                                AddCredits(data.id, data.credits);
                                break;
                        }
                    });
                }
                else
                    console.log("Verification failed...");
            }
        }
    };

    // Sandbox one
    //You can also pass a settings object to the verify function:
    if (ipnSandbox)
        ipn.verify(req.body, { 'allow_sandbox': true }, callback);
    // Full one
    else
        ipn.verify(req.body, callback);
});