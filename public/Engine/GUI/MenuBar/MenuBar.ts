/// <reference path="../../../Common/Libs/MiniQuery.ts"/>
/// <reference path="../../../Common/Libs/Framework.ts"/>

class MenuItem
{
    Label: string;
    Link: any;

    constructor(label: string, link: string)
    {
        this.Label = label;
        this.Link = link;
    }
}

var menubarStatic = new (class
{
    public previousItem = null;
    public KnownItems: MenuItem[] = [];
    public hoverHideTimer: number = null;
});

class Menubar
{
    static InitFunction()
    {
        var menu = document.getElementById("menubar");
        if (!menu)
            return;
        /*var pos = 5;
        for (var i = 0; i < menu.children.length; i++)
        {
            var item: HTMLElement = <HTMLElement>menu.children[i];
            item.style.left = pos + "px";
            pos += $(item).width();
        }*/

        $("#menubar a").bind("dragstart", () => { return false; }).bind("drop", () => { return false; });

        $("#hideMenu").mouseover(Menubar.HoverHideMenus).mouseout(Menubar.StopHoverHideMenus);
        $("#searchPanel").mouseover(Menubar.HoverHideMenus);

        for (var i = 0; i < menu.children.length; i++)
        {
            var item: HTMLElement = <HTMLElement>menu.children[i];
            if (item.children.length > 0)
            {
                item.onmouseover = function ()
                {
                    var currentSubmenu: HTMLElement = <HTMLElement>item.children[0];
                    return function ()
                    {
                        if (menubarStatic.previousItem == currentSubmenu.textContent)
                            return;
                        Menubar.HideMenus();
                        menubarStatic.previousItem = currentSubmenu.textContent;
                        $("#hideMenu").show();
                        $(currentSubmenu).show();
                    }
                } ();
                Menubar.HookSubmenu(<HTMLElement>item.children[0]);
            }
            else
                item.onmouseover = Menubar.HideMenus;
        }

        Menubar.ExtractItems();
    }

    private static ExtractItems(menuItem: HTMLElement = null)
    {
        if (!menuItem)
        {
            menubarStatic.KnownItems = [];
            menuItem = document.getElementById("menubar");
        }
        for (var i = 0; i < menuItem.children.length; i++)
        {
            var item = <HTMLElement>menuItem.children[i];

            if (item.children.length > 0)
            {
                //if($(item).is(":visible"))
                if (item.style.display !== "none")
                    Menubar.ExtractItems(<HTMLElement>item.children[0])
            }
            else if (item.style.display !== "none")
            {
                var n = new MenuItem((item.attributes["label"] ? item.attributes["label"].textContent : item.textContent), (item.attributes["href"] ? item.attributes["href"].textContent : ""));
                if (item.onclick && (!n.Link || n.Link == "" || n.Link == "#"))
                    n.Link = item.onclick;
                menubarStatic.KnownItems.push(n);
            }

            if (item.tagName.toLowerCase() == "a")
            {
                $(item).bind("click", () =>
                {
                    $("#hideMenu").hide();
                    Menubar.HideMenus();
                });
            }
        }
    }

    private static HookSubmenu(menuItem: HTMLElement)
    {
        for (var i = 0; i < menuItem.children.length; i++)
        {
            var item: HTMLElement = <HTMLElement>menuItem.children[i];
            if (item.children.length > 0)
            {
                item.onmouseover = function ()
                {
                    var child = item.children[0];
                    $(child).addClass("childMenuBar");
                    return function (e)
                    {
                        $("#menubar .childMenuBar").hide();
                        $(child).show();
                        e.stopPropagation();
                    }
                } ();
            }
            else
                item.onmouseover = function ()
                {
                    $("#menubar .childMenuBar").hide();
                }
        }
    }

    private static HideMenus()
    {
        menubarStatic.previousItem = null;
        menubarStatic.hoverHideTimer = null;
        $("#hideMenu").hide();
        $("#menubar > div > div").hide();
        $("#menubar .childMenuBar").hide();
    }

    private static HoverHideMenus()
    {
        if (menubarStatic.hoverHideTimer)
            clearTimeout(menubarStatic.hoverHideTimer);
        menubarStatic.hoverHideTimer = setTimeout(Menubar.HideMenus, 500);
    }

    private static StopHoverHideMenus()
    {
        if (menubarStatic.hoverHideTimer)
            clearTimeout(menubarStatic.hoverHideTimer);
        menubarStatic.hoverHideTimer = null;
    }

    /**
     * Allows to disable a menu entry
     * @param menuPath searched path in the form Main>Child>SubChild
     */
    static DisableMenu(menuPath: string, menuSection: HTMLElement = null, currentPath: string = ""): boolean
    {
        if (!menuSection)
            menuSection = document.getElementById("menubar");
        for (var i = 0; i < menuSection.children.length; i++)
        {
            var t = (<HTMLElement>menuSection.children[i]).textContent.trim();
            var p = currentPath + t.split('\n')[0];
            if (p == menuPath)
            {
                $(menuSection.children[i]).hide();
                Menubar.ExtractItems();
                return true;
            }
            else if ((<HTMLElement>menuSection.children[i]).children.length > 0)
            {
                var r = Menubar.DisableMenu(menuPath, <HTMLElement>(<HTMLElement>menuSection.children[i]).children[0], p + ">");
                if (r == true)
                    return true;
            }
        }
        return false;
    }

    /**
     * Allows to enable a menu entry
     * @param menuPath searched path in the form Main>Child>SubChild
     */
    static EnableMenu(menuPath: string, menuSection: HTMLElement = null, currentPath: string = ""): boolean
    {
        if (!menuSection)
            menuSection = document.getElementById("menubar");
        for (var i = 0; i < menuSection.children.length; i++)
        {
            var t = (<HTMLElement>menuSection.children[i]).textContent.trim();
            var p = currentPath + t.split('\n')[0];
            if (p == menuPath)
            {
                $(menuSection.children[i]).show();
                Menubar.ExtractItems();
                return true;
            }
            else if ((<HTMLElement>menuSection.children[i]).children.length > 0)
            {
                var r = Menubar.EnableMenu(menuPath, <HTMLElement>(<HTMLElement>menuSection.children[i]).children[0], p + ">");
                if (r == true)
                    return true;
            }
        }
        return false;
    }
} 