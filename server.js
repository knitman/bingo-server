const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let numbers = [];
let index = 0;
let called = [];
let tickets = {};
let stats = {};

function shuffle(){
  numbers = Array.from({length:90},(_,i)=>i+1)
    .sort(()=>Math.random()-0.5);
  index = 0;
  called = [];
}

shuffle();

io.on("connection", socket => {

  socket.emit("called", called);

  socket.on("start", speed => {
    shuffle();
    setInterval(()=>{
      if(index < numbers.length){
        const n = numbers[index++];
        called.push(n);
        io.emit("number", n);
        checkWinner();
      }
    }, speed);
  });

  socket.on("newTicket", data => {
    tickets[data.id] = data;
  });

});

function checkWinner(){
  for(const id in tickets){
    const t = tickets[id];
    if(t.nums.every(n=>called.includes(n))){
      stats[id] = (stats[id]||0)+1;
      io.emit("winner", {
        name: t.name,
        photo: t.photo,
        wins: stats[id]
      });
      shuffle();
      break;
    }
  }
}

http.listen(process.env.PORT || 3000);
