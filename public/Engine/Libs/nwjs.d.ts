declare namespace NwJs
{

    interface MenuItem
    {
        //
    }

    interface MenuItemConstructor
    {
        new (options: any): MenuItem;
    }

    interface Menu
    {
        append(item: any): void;
        popup(x: number, y: number): void;
    }

    interface MenuConstructor
    {
        new (options?: any): Menu;
    }

    interface NW
    {
        Menu: MenuConstructor;
        MenuItem: MenuItemConstructor;
        Window: any;
    }
}

declare module 'nw.gui' {
    const nw: NwJs.NW;
    export = nw;
}

declare var nw: NwJs.NW;

interface NodeRequireFunction
{
    (id: string): any;
}

declare var require: NodeRequireFunction;

declare var process: any;