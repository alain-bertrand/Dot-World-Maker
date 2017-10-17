interface PathStep extends PathPoint
{
    steps: number;
    path: PathStep[];
    distance?: number;
    operations: number;
}

interface PathPoint
{
    x: number;
    y: number;
}

class PathSolver
{
    private visitedStep: PathStep[] = [];
    private todoStep: PathStep[] = [];
    private width: number;
    private height: number;
    private goalX: number;
    private goalY: number;
    private operations: number = 0;
    private canWalkOn: (x: number, y: number) => boolean;
    private maxDistance: number;

    public static Solve(startX: number, startY: number, goalX: number, goalY: number, maxDistance: number, canWalkOn: (x: number, y: number) => boolean): PathPoint[]
    {
        var solver = new PathSolver(startX, startY, goalX, goalY, maxDistance, canWalkOn);
        var path = solver.solve();
        if (!path)
            return null;

        var result: PathPoint[] = [];
        for (var i = 0; i < path.path.length; i++)
        {
            result.push({
                x: path.path[i].x, y: path.path[i].y
            });
        }
        // Add the goal too
        if (result.length > 0)
            result.push({ x: goalX, y: goalY });
        return result;
    }

    constructor(startX: number, startY: number, goalX: number, goalY: number, maxDistance: number, canWalkOn: (x: number, y: number) => boolean)
    {
        this.visitedStep = [];
        this.todoStep = [];

        this.goalX = goalX;
        this.goalY = goalY;
        this.operations = 0;
        this.canWalkOn = canWalkOn;
        this.maxDistance = maxDistance;

        var a = startX - this.goalX;
        var b = startY - this.goalY;

        this.todoStep = [
            { x: startX, y: startY, steps: 0, path: [], operations: 0, distance: Math.sqrt(a * a + b * b) }
        ];
        this.visit(this.todoStep[0]);
    }

    private solve(): PathStep
    {
        while (this.todoStep.length > 0 && this.operations < 500)
        {
            this.operations++;
            var res = this.calcStep();
            if (res != null)
                return res;
        }
        return null;
    }

    private addCoordinate(coord: PathStep, x: number, y: number): PathStep
    {
        var x = coord.x + x;
        var y = coord.y + y;

        var path = coord.path.concat();
        path[path.length] = coord;

        var a = x - this.goalX;
        var b = y - this.goalY;

        return { x: x, y: y, steps: coord.steps + 1, path: path, distance: Math.sqrt(a * a + b * b), operations: this.operations };
    }

    private isVisited(coord: PathStep): boolean
    {
        for (var i = 0; i < this.visitedStep.length; i++)
            if (this.visitedStep[i].x == coord.x && this.visitedStep[i].y == coord.y)
                return true;
        return false;
    }

    private visit(coord: PathStep): void
    {
        this.visitedStep[this.visitedStep.length] = coord;
    }

    private static SortDistance(sa: PathStep, sb: PathStep): number
    {
        if (sa.steps == sb.steps)
            return sa.distance - sb.distance;
        else
            return sa.steps - sb.steps;
            //return (sa.steps + sa.distance * 2) - (sb.steps + sb.distance * 2);
    }

    private calcStep(): PathStep
    {
        this.todoStep.sort(PathSolver.SortDistance);
        var s = this.todoStep.shift();

        //if (Math.abs(s.x-this.goalX) <= this.speed && Math.abs(s.y-this.goalY) <= this.speed)
        //if (s.distance < this.speed)
        if (s.distance == 0)
        {
            s.operations = this.operations;
            return s;
        }

        if (this.todoStep.length > 5000)
        {
            this.todoStep = [];
            return null;
        }

        if (s.steps > 500)
            return null;

        var newCoords = [
            this.addCoordinate(s, -1, 0),
            this.addCoordinate(s, 0, -1),
            this.addCoordinate(s, 1, 0),
            this.addCoordinate(s, 0, 1),

            this.addCoordinate(s, -1, -1),
            this.addCoordinate(s, -1, 1),
            this.addCoordinate(s, 1, -1),
            this.addCoordinate(s, 1, 1),
        ];
        for (var i = 0; i < newCoords.length; i++)
        {
            var c = newCoords[i];
            if (c == null)
                continue;
            if (!this.isVisited(c) && c.distance < this.maxDistance)
            {
                this.visit(c);
                if (this.canWalkOn(c.x, c.y))
                    this.todoStep[this.todoStep.length] = c;
            }
        }
        return null;
    }
}