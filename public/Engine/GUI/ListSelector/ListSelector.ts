/// <reference path="../../../Common/Libs/Framework.ts" />

interface ListSelectorContainer
{
    [s: string]: ListSelector;
}

var listSelector = new (class
{
    CurrentSelectors: ListSelectorContainer = {};
});

class ListSelector
{
    private data: any[];
    private sortedDirect: number[];
    private element: string;
    private displayColumn: string;
    private selectedRow: any;
    public Sort: boolean = true;

    public OnSelect: (rowId: any) => void;

    public Dispose()
    {
        $("#" + this.element).html("");
        delete listSelector[this.element];
    }

    /**
     * Creates a selection list (sorted) with search box.
     * @param HTML element id to put the list on (should be a div)
     * @param data source (an array or an object)
     * @param displayColumn (optional) the field name to display, valid only for an array source
     */
    constructor(element: string, data: any, displayColumn?: string)
    {
        listSelector[element] = this;

        this.element = element;
        this.data = data;
        this.displayColumn = displayColumn;

        if (displayColumn)
        {
            this.sortedDirect = [];
            for (var i = 0; i < data.length; i++)
                this.sortedDirect.push(i);
            this.sortedDirect.sort((a, b) =>
            {
                if (data[a][displayColumn] > data[b][displayColumn])
                    return 1;
                if (data[a][displayColumn] < data[b][displayColumn])
                    return -1;
                return 0;
            });
        }

        $("#" + this.element).addClass("listSelector");
        this.Render();
    }

    public Rebind()
    {
        $("#list_selector_" + this.element).bind("keyup", () =>
        {
            $("#display_list_selector_" + this.element).html(this.RenderList());
        });
    }

    public Render(): void
    {
        var html = "";
        html += "<input type='text' id='list_selector_" + this.element + "' placeholder='Search...'>";
        html += "<div id='display_list_selector_" + this.element + "'>";
        html += this.RenderList();
        html += "</div>";
        $("#" + this.element).html(html);
        $("#list_selector_" + this.element).bind("keyup", () =>
        {
            $("#display_list_selector_" + this.element).html(this.RenderList());
        });
    }

    public UpdateList(newData?: any)
    {
        if (newData)
            this.data = newData;
        else
            newData = this.data;

        if (this.displayColumn)
        {
            this.sortedDirect = [];
            for (var i = 0; i < this.data.length; i++)
                this.sortedDirect.push(i);
            var displayColumn = this.displayColumn;
            this.sortedDirect.sort((a, b) =>
            {
                if (newData[a][displayColumn] > newData[b][displayColumn])
                    return 1;
                if (newData[a][displayColumn] < newData[b][displayColumn])
                    return -1;
                return 0;
            });
        }

        $("#display_list_selector_" + this.element).html(this.RenderList());
    }

    public RenderList(): string
    {
        var html = "";
        html += "<table>";
        var searchTxt = $("#list_selector_" + this.element).val();
        var search = (searchTxt ? searchTxt : "").trim().toLowerCase();
        if (this.displayColumn)
        {
            for (var i = 0; i < this.data.length; i++)
            {
                var val = "" + this.data[this.sortedDirect[i]][this.displayColumn];
                if (search && search != "" && (!val || val.toLowerCase().indexOf(search) == -1))
                    continue;
                html += "<tr id='display_list_selector_" + this.element + "_" + this.sortedDirect[i] + "' onclick='ListSelector.Find(\"" + this.element + "\").Select(" + this.sortedDirect[i] + ");'" + (this.selectedRow == this.sortedDirect[i] ? " class='listSelectorSelectedRow'" : "") + "><td>" + val + "</td></tr>";
            }
        }
        else
        {
            var names: string[] = [];
            for (var item in this.data)
                names.push(item);
            if (this.Sort)
                names.sort();

            for (var i = 0; i < names.length; i++)
            {
                var val = names[i];
                if (search && search != "" && (!val || val.toLowerCase().indexOf(search) == -1))
                    continue;
                html += "<tr id='display_list_selector_" + this.element + "_" + val.id() + "' onclick='ListSelector.Find(\"" + this.element + "\").Select(\"" + val + "\");'" + (this.selectedRow == val ? " class='listSelectorSelectedRow'" : "") + "><td>" + val + "</td></tr>";
            }
        }
        html += "</table>";
        return html;
    }

    public static Find(name: string): ListSelector
    {
        return listSelector[name];
    }

    public Select(row: any): void
    {
        this.selectedRow = row;
        $("#display_list_selector_" + this.element + " tr").removeClass("listSelectorSelectedRow");
        if (this.displayColumn)
            $("#display_list_selector_" + this.element + "_" + row).addClass("listSelectorSelectedRow");
            //$("#display_list_selector_" + this.element + " tr:nth-child(" + (row + 1) + ")").addClass("listSelectorSelectedRow");
        else if (row !== null)
            $("#display_list_selector_" + this.element + "_" + row.id()).addClass("listSelectorSelectedRow");

        if (this.OnSelect)
            this.OnSelect(row);
    }
}