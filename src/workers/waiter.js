onmessage = async e => {
    const { data:params } = e;
    await sleep(50);
    
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
