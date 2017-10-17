var zoneEditor = new (class
{
    selectedZone: WorldZone = null;
    selector: ListSelector = null;
    tempWorld: World = null;
    worldPreview: WorldRender = null;
    renderInterval: number = null;
    rebuildRender: number = null;
});