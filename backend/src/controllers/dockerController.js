const Docker = require('dockerode');
const { TokenExpiredError } = require('jsonwebtoken');
const docker =new Docker({socketPath:'/var/run/docker.sock'});

const listContainers = async(req,res)=>{
    try{
        const contianers = await docker.listContainers({all:true});
        const fromatted = contianers.map(c=>({
            id: c.Id.substring(0,12),
            name: c.Names[0].replace('/',''),
            image: c.Image,
            status: c.Status,
            ports: c.Ports
        }));
        res.json(formatted);
    }  catch(error){
        res.status(500).json({message:error.message});
    }
};

const startContainer = async(req,res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        await container.start();
        res.json({message:`Container ${req.params.id}started`});
    } catch(error){
        res.status(500).json({message:error.message});

    }

};
const stopContainer = async(req,res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        await container.stop();
        res.json({message:`Container ${req.params.id} stopped`});
    } catch(error){
        res.status(500).json({message:error.message});
    }
};

const getContainerLogs  =async(req,res)=>{
    try{
        const container = docker.getContainer(req.params.id);
        const logs = await container.logs({
            stdout:true,
            stderr:true,
            tail:100
        });
        res.json({ logs: logs.toString('utf8') });
    } catch(error){
        res.status(500).json({message:error.message});
    }
};

const getContainerStats = async(req,res)=>{
    try{
        const container = docker.getContainer(res.params.id);
        const stats = await contianer.stats({stream:false});
        res.json(stats);
    } catch(error){
        res.status(500).json({message:error.message});
    }
};


module.exports = {
    listContainers,
    startContainer,
    stopContainer,
    getContainerLogs,
    getContainerStats
};