class Installer
{
    static dbCanBeUsed: boolean = false;
    static fsCanBeUsed: boolean = false;
    static checkDbTimer: number = null;

    public static Dispose()
    {
    }

    public static IsAccessible()
    {
        //return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
        return true;
    }

    public static Recover()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/MustInstall',
            data: {
            },
            success: (msg) =>
            {
                msg = TryParse(msg);
                if (msg == "must")
                {
                    $("#menubar").hide();
                    $("#loginBackground, #loginForm").hide();

                    Installer.DoCheckDb();
                    Installer.CheckFileRights();
                }
                else
                {
                    Framework.SetLocation({ action: "Play" }, false, true);
                }
            }
        });
    }

    public static CheckFileRights()
    {
        Installer.fsCanBeUsed = false;
        $.ajax({
            type: 'POST',
            url: '/backend/CheckConfigJson',
            data: {
            },
            success: (msg) =>
            {
                switch (TryParse(msg))
                {
                    case "allfine":
                        $("#installFileStatus").html("Ok").clearClass().addClass("statusOk");
                        Installer.fsCanBeUsed = true;
                        break;
                    case "norights":
                        $("#installFileStatus").html("No write permissions").clearClass().addClass("statusError");
                        break;
                    default:
                        Main.AddErrorMessage(msg);
                }
            }
        });
    }

    public static CheckDb()
    {
        Installer.dbCanBeUsed = false;
        if (Installer.checkDbTimer)
            clearTimeout(Installer.checkDbTimer);
        Installer.checkDbTimer = setTimeout(Installer.DoCheckDb, 500);
        $("#installDbStatus").html("Checking...").clearClass().addClass("statusError");
    }

    public static DoCheckDb()
    {
        Installer.dbCanBeUsed = false;
        Installer.checkDbTimer = null;

        $.ajax({
            type: 'POST',
            url: '/backend/CheckMysql',
            data: {
                host: $("#installDbHost").val(),
                port: $("#installDbPort").val(),
                user: $("#installDbAdmin").val(),
                password: $("#installDbAdminPass").val(),
                dbname: $("#installDbName").val()
            },
            success: (msg) =>
            {
                switch (TryParse(msg))
                {
                    case "allok":
                        $("#installDbStatus").html("Ok").clearClass().addClass("statusOk");
                        Installer.dbCanBeUsed = true;
                        break;
                    case "dbnotempty":
                        $("#installDbStatus").html("Ok, but database is not empty!").clearClass().addClass("statusWarning");
                        Installer.dbCanBeUsed = true;
                        break;
                    case "nodb":
                        $("#installDbStatus").html("No database found: download &amp; MySQL").clearClass().addClass("statusError");
                        break;
                    case "wrongpass":
                        $("#installDbStatus").html("Wrong admin username / password").clearClass().addClass("statusError");
                        break;
                    case "norights":
                        $("#installDbStatus").html("Provided admin user doesn't have admin rights").clearClass().addClass("statusError");
                        break;
                    default:
                        Main.AddErrorMessage(msg);
                }
            }
        });
    }

    public static SetupDb()
    {
        if (!Installer.dbCanBeUsed || !Installer.fsCanBeUsed)
        {
            Main.AddErrorMessage("Check the requirements...");
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/backend/SetupMysql',
            data: {
                host: $("#installDbHost").val(),
                port: $("#installDbPort").val(),
                user: $("#installDbAdmin").val(),
                password: $("#installDbAdminPass").val(),
                dbname: $("#installDbName").val(),
                dbuser: $("#installDbUser").val(),
                dbpassword: $("#installDbPass").val(),
            },
            success: (msg) =>
            {
                $("#installStep1").hide();
                $("#installStep2").show();
                $("#installStep3").hide();
            }
        });
    }

    public static Step2()
    {
        if (!Installer.dbCanBeUsed)
            return;

        $("#installStep1").hide();
        $("#installStep2").show();
        $("#installStep3").hide();
    }

    public static SetupJson()
    {
        $.ajax({
            type: 'POST',
            url: '/backend/SetupJson',
            data: {
                host: $("#installDbHost").val(),
                port: $("#installDbPort").val(),
                dbname: $("#installDbName").val(),
                dbuser: $("#installDbUser").val(),
                dbpassword: $("#installDbPass").val(),
                email_user: $("#installEmailUser").val(),
                email_pass: $("#installEmailPassword").val(),
                email_server: $("#installEmailServer").val(),
                admin_user: $("#installAdminUser").val(),
                admin_password: $("#installAdminPassword").val()
            },
            success: (msg) =>
            {
                $("#installStep1").hide();
                $("#installStep2").hide();
                $("#installStep3").show();
            }
        });
    }

    public static Finish()
    {
        Framework.SetLocation({ action: "Play" }, false, true);
        document.location.reload();
    }
}