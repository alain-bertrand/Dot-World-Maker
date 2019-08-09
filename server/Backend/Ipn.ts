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

app.post('/backend/GetTotalCredits', async function (req, res, next)
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

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var results = await connection.query("select credits from users where id = ? limit 1", [tokenInfo.id]);

        connection.end();

        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write("" + results[0].credits);
        res.end();
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});


app.post('/backend/GetIpnLicenseButton', async function (req, res, next)
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

    var connection = getDb();
    if (!connection)
    {
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "connection failed." }));
        res.end();
        return;
    }

    try
    {
        await connection.connect();
        var results = await connection.query("select editor_version from users where id = ? limit 1", [tokenInfo.id]);

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
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify({ error: "error with database." }));
        res.end();
        return;
    }
});

async function UpgradeToStandardLicense(userId: number)
{
    var connection = getDb();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return;
    }

    try
    {
        await connection.connect();
        await connection.query("update users set editor_version = 's' where id = ?", [userId]);
        connection.end();
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        return;
    }
}

async function AddCredits(userId: number, credits: number)
{
    var connection = getDb();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return;
    }

    try
    {
        await connection.connect();
        await connection.query("update users set credits = credits + ? where id = ?", [credits, userId]);
        await connection.query("insert into credits_log(from_user, to_user, quantity, reason) values(null, ?, ?, 'Purchase credits.')", [userId, credits]);
        connection.end();
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        return;
    }
}

async function CheckTransaction(trx: string, email: string, data: string, gross: number, fee: number): Promise<boolean>
{
    var connection = getDb();
    if (!connection)
    {
        console.log("Error while connecting to the db");
        return false;
    }

    try
    {
        await connection.connect();
        var r1 = await connection.query("select count(id) \"nb\" from paypal_transactions where id = ?", [trx]);
        if (r1 && r1.length && r1[0].nb == 0)
        {
            await connection.query("insert into paypal_transactions(id, data, payer_email, mc_gross, mc_fee) values(?,?,?,?,?)", [trx, data, email, gross, fee]);
            return true;
        }
        return false;
    }
    catch (ex)
    {
        connection.end();
        console.log(ex);
        return false;
    }
}

app.post('/backend/IpnVerify', function (req, res, next)
{
    var ipn = require('paypal-ipn');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("Ok");

    var ipnSandbox = false;

    var callback = async function(err, msg)
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
                    var isOk = await CheckTransaction(req.body.txn_id, req.body.payer_email, req.body.custom, req.body.mc_gross, req.body.mc_fee);
                    if (!isOk)
                        return;
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