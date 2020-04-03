class QNode{
    constructor(content, next=null, previous=null)
    {
        this.content = content;
        this.next = next;
        this.previous = previous;
    }
}

class CircularQueue
{
    constructor()
    {
        this.start = null;
        this.end = null;
        this.length = 0;
    }

    enqueue = content => {
        const new_node = new QNode(content);
        if(this.start === null)
        {
            this.start = new_node;
            this.end = new_node;
        }
        else
        {
            new_node.next = this.end;
            this.end.previous = new_node;
            this.end = new_node
        }
        this.length++;
    }

    peek = () => {
        return this.start.content;
    }

    circularDequeue = () => {
        if(this.start !== null && this.start.previous !== null)
        {
            const front = this.start;
            this.start = this.start.previous
            this.start.next = null;
            this.end.previous = front;
            front.next = this.end;
            front.previous = null;
            this.end = front;
            return front.content;
        }
        else if(this.start.previous === null)
        {
            return this.start.content;
        }
    }

    clear = () => {
        this.start = null;
        this.end = null;
        this.length = 0;
    }

    isEmpty = () => {
        return this.start === null;
    }

    dequeue = () => {
        const front = this.start;
        if(front.previous === null)
        {
            this.start = null;
            this.end = null;
            return front.content;
        }
        else if(this.start !== null)
        {
            this.start = this.start.previous
            this.start.next = null;
            return front.content;
        }
        this.length += this.length === 0 ? 0 : 1;
    }
}

export default CircularQueue;