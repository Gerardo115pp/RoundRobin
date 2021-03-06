import React, { useRef, useEffect, useState } from 'react';
import Process from './clases/Process';
import CircularQueue from './clases/Queue';
import PQueue from './clases/PriorityQueue';
import MLQueue from './clases/MultiLevelQueue';
import { colors, processing_states, cpu_states, schualding_algorithms } from './enums';
import './App.css';

function App() {
  const isMouseOverTitle = useRef(false);
  const componentDidMount = useRef(false);
  const processes_list = useRef([]);
  const stopped = useRef(false);
  const component_data = useRef({
    start_processing_time: 0
  })
  // const waiter = useRef(new Worker('./workers/waiter.js'));
  // waiter.current.onmessage()
  const procsessing_queue = useRef(new CircularQueue());
  const procsessing_pqueue = useRef(new PQueue());
  const multi_level_queue = useRef(new MLQueue([{name: 'high', color: colors.HIGH}, {name: 'mid', color: colors.MID}, {name: 'low', color: colors.LOW}]));
  const [ fcount, useFcount ] = useState(0);
  const general_quantum = 20; //this number represents seconds
  const scheduling_algorithm = useRef(schualding_algorithms.MULTI_LEVEL_QUEUE);
  const [ cpu_state, useCpuState ] = useState(cpu_states.FREE);

  
  useEffect(() => {
    if(!componentDidMount.current)
    {
      // componentDidMount behavior
      const canvas = document.getElementById("graphic");
      componentDidMount.current = true;
      const increase_factor = 70,
            coords = { x: increase_factor, y: 130};
      processes_list.current = [];
      for(let h=0; h < 20; h++)
      {
        processes_list.current.push(new Process(coords));
        coords.x +=  increase_factor;
      }
      // console.log(processes_list.current);
      canvas.width = processes_list.current.length * increase_factor + (increase_factor * 2);
      const canvas_context = canvas.getContext('2d');
      canvas_context.clearRect(0, 0, canvas.width, canvas.height);
      drawProcesses(canvas);
    }
    if(cpu_state === cpu_states.BUSY)
    {
      getCurrentAlgorithm()();
    }
  })

  const getProcessColor = process => {
    switch(process.status){
      case processing_states.CREATED:
        return colors.LIGHT_BACKGROUND;
      case processing_states.ADDED:
        return colors.CYAN;
      case processing_states.PROCESSING:
        return colors.ROSE;
      case processing_states.FINISHED:
        return colors.GREEN;
      default:
        return colors.MAIN_COLOR;
    }
  }

  const getRangedRandom = constant => {
    return Math.ceil(Math.random()*constant);
  }

  const dequeueProcessSafly = pqueue => {
    let process = null;
    do{
      if(!pqueue.isEmpty())
      {
        if(pqueue.peek().status !== processing_states.FINISHED)
        {
          process = pqueue.circularDequeue();
        }
        else
        {
          process = pqueue.dequeue();
        }
      }
      else{
        return false;
      } 
    }while( process.status === processing_states.FINISHED)
    return process;
  }

  const updateInformation = data => {
    const { start_processing_time } = component_data.current;
    const time_element = document.getElementById('time-il'),
          process_element = document.getElementById("proceso-il"),
          progress_element  = document.getElementById("progress-il");
    time_element.innerText = `  Tiempo: ${Math.floor((Date.now()-start_processing_time)/1000)}s`;
    process_element.innerText = ` Proceso: ${data.process_name}`;
    progress_element.innerText = `  Progreso: ${(data.progress/data.total*100).toFixed(1)}%`;
  }

  const getAssigneTitle = algorithm_code => {
    let new_title = "";
    switch(algorithm_code)
    {
      case schualding_algorithms.ROUND_ROBIN:
        new_title = "ACTIVIDAD 2 ROUND ROBIN";
        break;
      case schualding_algorithms.SHORTEST_FIRST:
        new_title = "ACTIVIDAD 3 SHORTEST FIRST";
        break;
      case schualding_algorithms.SHORTEST_REMAING_FIRST:
        new_title = "ACTIVIDAD 4 SHORTEST REMAING FIRST";
        break;
      case schualding_algorithms.MULTI_LEVEL_QUEUE:
        new_title = "ACTIVIDAD 5 MULTI LEVEL QUEUE";
        break;
      default:
        new_title = "TAREA RANDOM";
        break;
    }
    return new_title;
  }

  const startShortestFirst = async () => {
    const { current:p_list } = processes_list;
    if(stopped.current)
    {
      stopped.current = false;
      return;
    }
    if(procsessing_queue.current.length < p_list.length)
    {
      // Adds new process to the processing queue

      let processes_to_add = getRangedRandom(2);

      while(processes_to_add > 0 && procsessing_queue.current.length !== p_list.length)
      {
        p_list[procsessing_queue.current.length].status = processing_states.ADDED;
        procsessing_queue.current.enqueue(p_list[procsessing_queue.current.length]);
        processes_to_add--;
      }
    }
    let current_process = dequeueProcessSafly(procsessing_queue.current);
    if (current_process === false)
    {
      procsessing_queue.current.clear();
      componentDidMount.current = false;
      return HandelStartClick(false);
    }
    current_process.status = processing_states.PROCESSING;
    while(current_process.status !== processing_states.FINISHED)
    {
      updateInformation({
        total: current_process.speed,
        progress: current_process.progress,
        process_name: current_process.name

      })
      current_process.updateProgress();
      drawProcesses();
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    current_process.status = current_process.status !== processing_states.FINISHED ? processing_states.ADDED : current_process.status;
    return startShortestFirst();
  }

  const startShortestRemaingFirst = async (processes_added=0) => {
    const { current:p_list } = processes_list;

    if(stopped.current)
    {
      stopped.current = false;

      return;
    }

    if(procsessing_pqueue.current.length < p_list.length)
    {
      // Adds new process to the processing queue

      let processes_to_add = getRangedRandom(2);

      while(processes_to_add > 0 && processes_added !== p_list.length)
      {
        p_list[processes_added].status = processing_states.ADDED;
        procsessing_pqueue.current.enqueue(p_list[processes_added], p_list[processes_added].speed - p_list[processes_added].progress);
        processes_to_add--;
        processes_added++;
      }
    }
    if (procsessing_pqueue.current._length === 0)
    {
      componentDidMount.current = false;
      return HandelStartClick(false);
    }
    let current_process = procsessing_pqueue.current.dequeue().content;
    current_process.status = processing_states.PROCESSING;
    let cicles_elapsed = 15;
    while(cicles_elapsed > 0 && current_process.status !== processing_states.FINISHED)
    {
      updateInformation({
        total: current_process.speed,
        progress: current_process.progress,
        process_name: current_process.name

      })
      current_process.updateProgress();
      drawProcesses();
      cicles_elapsed--;
      console.log(cicles_elapsed);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    if (current_process.status !== processing_states.FINISHED)
    {
      current_process.status = processing_states.ADDED;
      procsessing_pqueue.current.enqueue(current_process, current_process.speed - current_process.progress)
    }
    return startShortestRemaingFirst(processes_added);
  }

  const startMultiLevelQueue = async (processes_added=0) => {
    const { current:p_list } = processes_list;

    if(stopped.current)
    {
      stopped.current = false;

      return;
    }

    if(multi_level_queue.current.length < p_list.length)
    {
      // Adds new process to the processing queue

      let processes_to_add = getRangedRandom(2);

      while(processes_to_add > 0 && processes_added !== p_list.length)
      {
        p_list[processes_added].status = processing_states.ADDED;
        multi_level_queue.current.enqueue(p_list[processes_added], p_list[processes_added].speed - p_list[processes_added].progress);
        processes_to_add--;
        processes_added++;
      }
    }
    if (multi_level_queue.current.length === 0)
    {
      componentDidMount.current = false;
      return HandelStartClick(false);
    }
    let current_process_info = multi_level_queue.current.dequeue();
    const current_process = current_process_info.value,
          process_label = current_process_info.label;
    current_process.status = processing_states.PROCESSING;
    let cicles_elapsed = 15;
    while(cicles_elapsed > 0 && current_process.status !== processing_states.FINISHED)
    {
      updateInformation({
        total: current_process.speed,
        progress: current_process.progress,
        process_name: current_process.name

      })
      current_process.updateProgress();
      drawProcesses(undefined, multi_level_queue.current.levels[process_label].color);
      cicles_elapsed--;
      console.log(cicles_elapsed);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    if (current_process.status !== processing_states.FINISHED)
    {
      current_process.status = processing_states.ADDED;
      multi_level_queue.current.enqueue(current_process, current_process.speed - current_process.progress, process_label)
    }
    return startMultiLevelQueue(processes_added);
  }


  const getCurrentAlgorithm = () => {
    const { current:algorithm_code } = scheduling_algorithm;
    let func;
    switch(algorithm_code)
    {
      case schualding_algorithms.ROUND_ROBIN:
        func = startRoundRobin;
        break;
      case schualding_algorithms.SHORTEST_FIRST:
        func = startShortestFirst;
        break;
      case schualding_algorithms.SHORTEST_REMAING_FIRST:
        func = startShortestRemaingFirst;
        break;
      case schualding_algorithms.MULTI_LEVEL_QUEUE:
        func = startMultiLevelQueue;
        break;
      default:
        func = () => alert("puto el que lo lea");
        break;
    } 
    return func;
  }

  const HandelAlgorithmOptionClick = e => {
    const element = e.target;
    const algorithm_code = parseInt(element.getAttribute('algorithmvalue'));
    scheduling_algorithm.current = algorithm_code;
    document.querySelector("#title h3").innerText = getAssigneTitle(algorithm_code);
    useFcount(fcount+1)
  }

  const HandelStartClick = (stop=true) => {
    const new_state = cpu_state === cpu_states.FREE ? cpu_states.BUSY : cpu_states.FREE;
    procsessing_pqueue.current.clear();
    if(procsessing_queue.current.length !== 0)
    {
      procsessing_queue.current.clear();
      componentDidMount.current = false;
    }
    if(scheduling_algorithm.current === schualding_algorithms.SHORTEST_FIRST)
    {
      processes_list.current.sort((a,b) =>  a.speed - b.speed);
    }

    if(new_state === cpu_states.BUSY)
    {
      component_data.current.start_processing_time = Date.now();
    }
    else if(stop) {
      stopped.current = true;
    }
    useCpuState(new_state);
  }

  const startRoundRobin = async () => {
    const { current:p_list } = processes_list;
    if(stopped.current)
    {
      stopped.current = false;
      return;
    }
    if(procsessing_queue.current.length < p_list.length)
    {
      // Adds new process to the processing queue

      let processes_to_add = getRangedRandom(2);

      while(processes_to_add > 0 && procsessing_queue.current.length !== p_list.length)
      {
        p_list[procsessing_queue.current.length].status = processing_states.ADDED;
        procsessing_queue.current.enqueue(p_list[procsessing_queue.current.length]);
        processes_to_add--;
      }
    }
    let current_process = dequeueProcessSafly(procsessing_queue.current);
    if (current_process === false)
    {
      procsessing_queue.current.clear();
      componentDidMount.current = false;
      return HandelStartClick(false);
    }
    current_process.status = processing_states.PROCESSING;
    let elapsed_counts = 0;
    while(elapsed_counts < general_quantum)
    {
      updateInformation({
        total: current_process.speed,
        progress: current_process.progress,
        process_name: current_process.name

      })
      if(current_process.status !== processing_states.FINISHED)
      {
        current_process.updateProgress();
      }
      elapsed_counts++;
      drawProcesses();
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    current_process.status = current_process.status !== processing_states.FINISHED ? processing_states.ADDED : current_process.status;
    return startRoundRobin();
  }

  const drawProcesses = ( canvas, active_color) => {
    active_color = undefined === active_color ? colors.ROSE : active_color;
    canvas = canvas === undefined ? document.getElementById("graphic") : canvas;
    const canvas_context = canvas.getContext('2d');
    processes_list.current.forEach(p => {
      canvas_context.strokeStyle = p.status !== processing_states.PROCESSING ?  getProcessColor(p) : active_color;
      canvas_context.beginPath();
      canvas_context.rect(p.coords.X, (p.coords.Y - p.speed), 30, p.speed);
      canvas_context.stroke();
      if(p.progress > 0)
      {
        canvas_context.fillStyle = canvas_context.strokeStyle;
        canvas_context.fillRect(p.coords.X, (p.coords.Y - p.speed), 30, p.progress);
      }
    })
  }

  const handleTitleHover = e => {
    const subtitule = document.getElementById('subtitule');
    subtitule.style.display = isMouseOverTitle.current ? "none" : "block";
    isMouseOverTitle.current = !isMouseOverTitle.current 
  }

  const getColorInfo = () =>  scheduling_algorithm.current !== schualding_algorithms.MULTI_LEVEL_QUEUE ? undefined : (
    <div className="infoblock">
      <span className="infoblock-title">Color Legend</span>
      <div className="infoblock-labels">
        <span style={{color:colors.HIGH}} id='high-priority' className="infoblock-label">High priority</span>
        <span style={{color:colors.MID}} id='mid-priority' className="infoblock-label">Mid priority</span>
        <span style={{color:colors.LOW}} id='low-priority' className="infoblock-label">Low priority</span>
      </div>
    </div>
  ) 

  return (
    <div id="main-container">
      <div onMouseEnter={handleTitleHover} onMouseLeave={handleTitleHover} id="title">
        <h3>{getAssigneTitle(scheduling_algorithm.current)}</h3>
        <span id="subtitule">por: <br/>&emsp;-&ensp;Gerardo Rodriguez Sanchez<br/><br/>&emsp;-&ensp;Luis Antonio Jimenez Mendoza<br/><br/>&emsp;-&ensp;Luis Elogio (aka el foris)</span>
      </div>
      <div id="graphic-container">
        <div id="colors-legend"></div>
        <canvas id="graphic"></canvas>
      </div>
      <div id="info-container">
        <div className="infoblock">
          <span className="infoblock-title">Information</span>
          <div className="infoblock-labels">
            <span id="time-il" className="infoblock-label">Tiempo:</span>
            <span id="quantum-il" className="infoblock-label">Quantum: {general_quantum}</span>
            <span id="proceso-il" className="infoblock-label">Proceso:</span>
            <span id="progress-il" className="infoblock-label">Progreso:</span>
          </div>
        </div>
        <div className="infoblock" id="algorithms-selector">
          <span className="infoblock-title">Algoritmos</span>
          <div className="infoblock-labels">
            <div onClick={HandelAlgorithmOptionClick} algorithmValue={schualding_algorithms.ROUND_ROBIN} className="infoblock-label algorithm-option">round robin</div>
            <div onClick={HandelAlgorithmOptionClick} algorithmValue={schualding_algorithms.SHORTEST_FIRST} className="infoblock-label algorithm-option">shortest first</div>
            <div onClick={HandelAlgorithmOptionClick} algorithmValue={schualding_algorithms.SHORTEST_REMAING_FIRST} className="infoblock-label algorithm-option">shortest remaing first</div>
            <div onClick={HandelAlgorithmOptionClick} algorithmValue={schualding_algorithms.MULTI_LEVEL_QUEUE} className="infoblock-label algorithm-option">multi level queue</div>
          </div>
        </div>
        {getColorInfo()}
      </div>
      <div id="controls-container">
        <i onClick={HandelStartClick} id="play-control" className={`fas fa-${cpu_state === cpu_states.FREE ? 'play' : 'pause'}`}></i>
      </div>
    </div>
  );
}

export default App;
