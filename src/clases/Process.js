import Point from './Point';
import { processing_states } from '../enums';

class Process
{
    static procesess = 0;

    static random_generator = (constant=100) => {
        let random_number = Math.random() * constant;
        return random_number >= 10 ?  Math.floor(random_number) : 10;
    }

    constructor( coords, process_name=null)
    {
        this.progress = 0;
        this.status = processing_states.CREATED;
        this.name = process_name !== null ? process_name : `Proceso ${Process.procesess++}`;
        this.speed = Process.random_generator();
        this.coords = new Point(coords.x, coords.y);
    }

    updateProgress = () => {
        this.progress++;
        if(this.progress === this.speed)
        {
            this.status = processing_states.FINISHED;
        }
    }
}

export default Process;