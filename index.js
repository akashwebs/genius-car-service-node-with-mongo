const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app=express();
const port=process.env.PORT || 5000;

//use middileaware
app.use(cors());
app.use(express.json());

// middletear

function verifyJwt(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unatuhorized access'})
  }
  const token=authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECREATE,(err,decoded)=>{
    if(err){
      return res.status(403).send({message: 'forbiddan error'})
    }
    req.decoded=decoded;
    next();
  })
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvbrr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
      await client.connect();
      const serviceCollection=client.db('geniusCar').collection('service');
      const orderCollection=client.db('geniusCar').collection('order');
      
      // auth
      app.post('/login', async(req,res)=>{
        const user=req.body;
        const accessToken=jwt.sign(user, process.env.ACCESS_TOKEN_SECREATE,{
          expiresIn: '1d'
        });
        res.send({accessToken});
      })
      
// service api
      app.get('/services',async(req, res)=>{
        const query={};
        const cursor=serviceCollection.find(query);
        const result=await cursor.toArray();
        res.send(result);
      })
      app.get('/services/:id',async(req, res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await serviceCollection.findOne(query);
        res.send(result);

      })

    //   post
    app.post('/service',async(req, res)=>{
        const service=req.body;
        const result=await serviceCollection.insertOne(service);
        res.send(result);
    })
    // delete data
    app.delete('/service/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const result=await serviceCollection.deleteOne(query);
      res.send(result);
    })

    // order management api
    
    
    
    app.get('/order',verifyJwt,async(req,res)=>{
      
      const email=req.query.email;
      const decodedEmail=req.decoded.loginEmail;
      console.log(decodedEmail, email);
      
      if(decodedEmail===email){
        const query={email};
        const cursor=orderCollection.find(query)
        const result=await cursor.toArray()
        res.send(result);
      }else{
        res.status(403).send({message: 'forbiddan access'});
      }
      
    })

    app.post('/placeOrder', async(req,res)=>{
    
      const orderBody=req.body;
      const cursor= await orderCollection.insertOne(orderBody);
      res.send(cursor);
    })

  }
  finally{

  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('hello world');
})
app.listen(port, ()=>{
    console.log('succses fullly ', port);
})
