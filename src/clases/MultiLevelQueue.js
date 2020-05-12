import Pqueue from './PriorityQueue';

class MLQueue{
    constructor(levels)
    {
        this.levels = this.setLevels(levels);
        this.length = 0;
    }

    setLevels = levels_list => {
        const levels = {}
        levels_list.forEach(l => {
            levels[l.name] = {
                color: l.color,
                queue: new Pqueue()
            }
        })
        return levels;
    }

    enqueue = ( value, priority, label=null) => {
        const levels_labels = Object.keys(this.levels);
        label = label === null ?  levels_labels[Math.floor(Math.random() * (levels_labels.length - 0.1))] : label;
        this.levels[label].queue.enqueue(value, priority);
        this.length++;
    }

    dequeue = () => {
        for(let label of Object.keys(this.levels))
        {
            if(this.levels[label].queue.length > 0)
            {
                this.length--;
                return {
                    value: this.levels[label].queue.dequeue().content,
                    label: label
                }
            }
        }
        throw { name:"MLQueueError", message: "No level has any process left"};
    }

    peek = () => {
        for(let label of Object.keys(this.levels))
        {
            if(this.levels[label].queue.length > 0)
            {
                return {
                    value: this.levels[label].queue.peek(),
                    label: label
                }
            }
        }
        return null;
    }
}

export default MLQueue;