const express  = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const authRoutes = require('./routes/authRoutes');
const dockerRoutes = require('./routes/dockerRoutes');
const serverRoutes = require('./routes/serverRoutes');
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(rwq,res)=>{
    res.json({message:'devpilot api running'});
});

app.use('/api/auth',authRoutes);
app.use('/api/docker',dockerRoutes);
app.use('/api/server',serverRoutes);


app.use((err,next,req,res)=>{
    console.log(err.stack);
    res.status(500).json({message:'server error'}); 
})

const PORT  =process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`aserver is running on ${PORT}`);
});
