
require("dotenv").config();

const mongoose = require('mongoose');

const Code = require('./Code');

const dbUrl= process.env.MONGODB_URL;

mongoose.connect(dbUrl);


const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

const defaultValue = {'html':'','css':'' , 'js':''};

io.on("connection", socket => {

  socket.on("get-code", async id=>{

    const code = await findOrCreateDocument(id);
    console.log('connected');
    
    socket.join(id);
    socket.emit("load-code" , code.data);
    socket.on("send-changes", info => {
      socket.broadcast.to(id).emit("receive-changes", info)
    })

    socket.on("save-code",async info=>{
      await Code.findByIdAndUpdate(id , {data: info});
    })

  })

})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Code.findById(id)
  if (document) return document
  return await Code.create({ _id: id, data: defaultValue })
}