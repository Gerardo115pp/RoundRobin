class PQNode{
    constructor(content, priority, previous=null)
    {
        this.content = content;
        this.priority = priority;
        this.previous = previous;
    }
}

class PQueue{
    constructor()
    {
        this._top = null;
        this._length = 0;
    }

    peek = () => {
        return this._top;
    }

    get length() {
        return this._length;
    }

    enqueue = (content, priority) => {
        const new_node = new PQNode(content, priority);
        if(this._length > 0)
        {
            let current_node = this._top;
            if ( current_node.priority > new_node.priority)
            {   
                this._top = new_node;
                new_node.previous = current_node;

            }
            else 
            {                
                while( true )
                {
                    if(current_node.previous === null || current_node.previous.priority > new_node.priority)
                    {
                        new_node.previous = current_node.previous;
                        current_node.previous = new_node;
                        break;
                    }
                    current_node = current_node.previous
                }
            }
        }
        else
        {
            this._top = new_node;
        }
        this._length++;
    }

    dequeue = () => {
        if(this._top !== null)
        {
            const top_node = this._top;
            this._top = this._top.previous;
            this._length--;
            return top_node;
        }
        throw {name: "PQError",message: "trying to dequeue from an empty queue"};
    }

    clear = () => {
        this._length = 0;
        this._top = null;
    }
}

export default PQueue;