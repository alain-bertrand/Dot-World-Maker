class ImportExport
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
        if (selfHosted)
        {
            $("#html5export").hide();
            $("#apkexport").hide();
        }
    }

    static ExportJSON()
    {
        $("#importExportFrame").prop("src", "/backend/ExportJson?game=" + world.Id + "&token=" + framework.Preferences['token']);
    }

    static ExportGame()
    {
        $("#importExportFrame").prop("src", "/backend/ExportGame?game=" + world.Id + "&token=" + framework.Preferences['token']);
    }

    static AndroidAPK()
    {
        $("#importExportFrame").prop("src", "/backend/ExportAndroidApp?game=" + world.Id + "&token=" + framework.Preferences['token']);
    }

    static ImportJSON()
    {        
        $("#uploadImportData").show();
        $("#uploadGameId").val("" + world.Id);
        $("#uploadToken").val(framework.Preferences['token']);
        $("#fileUpload").prop("accept", ".json");
        $("#uploadFormData").prop("action", "/upload/ImportJson");
    }

    static Upload()
    {
        $("#uploadImportData").hide();
        $("#uploadFormData").submit();
    }

    static CloseUpload()
    {
        $("#uploadImportData").hide();
    }

    static Result(data)
    {
        data = JSON.parse(data);
        if (data.error)
            Framework.Alert(data.error);
        else
        {
            Framework.Alert("Import done, press ok to reload the page.", () =>
            {
                document.location.reload(true);
            });
        }
    }

    static Html5()
    {
        $("#importExportFrame").prop("src", "/backend/ExportHtml5?game=" + world.Id + "&token=" + framework.Preferences['token']);
    }
}