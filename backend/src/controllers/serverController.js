const {exec} = require('child_process');
const { time } = require('console');
const os = require('os');

const getServerHealth = async(req,res)=>{
    try{
        const healthData={
            hostname: os.hostname(),
            platform: os.platform(),
            uptime: os.uptime(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            loadAverage: os.loadavg(),
            timestamp: new Date(),
            cpus: os.cpus().length,
            usedMemory: os.totalmem() - os.freemem()
        };
        res.json(healthData);
    }catch(error){
        res.status(500).json({message: error.message});
    }

};

const pingServer  =async(req,res)=>{
    const {host} = req.params;
    exec(`ping -c 4 ${host}`,(error,stdout,stderr)=>{
        if(error){
            return res.status(500).json({
                host,
                status:'unreacheable',
                error:error.message
            });
        }
        res.json({
            host,
            status:'reacheable',
            output:stdout
        });
    });
};

const getSystemInfo = async(req,res)=>{
    try{
        const info={
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            hostname:os.hostname(),
            totalMemoryGB:(os.totalmem()/1024/1024.1024).toFixed(2),
            freeMemoryGB:(os.freemem()/1024/1024/1024).toFixed(2),
            cpuCount: os.cpus().length,
            uptime: os.uptime()
        };
        res.json(info);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

module.exports={
    getServerHealth,
    pingServer,
    getSystemInfo
};
    
