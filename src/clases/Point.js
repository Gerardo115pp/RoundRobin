class Point
{
    constructor( x, y)
    {
        this.X = x;
        this.Y = y;
    }

    offset = ( dx, dy) => {
        this.X += dx;
        this.Y += dy;
    }
}

export default Point;