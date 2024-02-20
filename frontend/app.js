const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/newtest', { useNewUrlParser: true, useUnifiedTopology: true });
    
    const Post = mongoose.model('Post', {
        text: String,
        image: {
            data: Buffer,
            contentType: String,
        },
        like:{
          type:Number,
          default:0
        }
    });


    const storage = multer.memoryStorage();
    const upload = multer({ storage });


app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());


app.get('/',(req,res)=>{
    res.render("cover");
});

app.get('/postpage',async(req,res)=>{
  let response = await Post.find({}).sort({_id:-1});
  console.log(response);
  res.render("postpage",{posts:response});
});


app.post('/search',async(req,res)=>{
  let startupname = req.body.searchele;
  console.log(startupname);
  const result = await fetch("http://localhost:5000/search", {
      method: "post",
      body: JSON.stringify({startupname}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        res.render("startupHome",{articals:data.data});
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});


app.post('/searchmentor',async(req,res)=>{
  let programname = req.body.searchele;
  console.log(programname);
  const result = await fetch("http://localhost:5000/searchmentor", {
      method: "post",
      body: JSON.stringify({programname}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        res.render("mentorshipHome",{mentorprograms:data.data});
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});

app.post('/upload', upload.single('myImage'), async (req, res) => {
  try {
      const { text } = req.body;
      const image = req.file;

      const newPost = new Post({
          text,
          image: image
              ? {
                  data: image.buffer,
                  contentType: image.mimetype,
              }
              : undefined,
      });
      await newPost.save();
      res.redirect('/postpage');
  } catch (error) {
      console.error('Error uploading post:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


app.get('/images/:id', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);

      if (!post || !post.image) {
          return res.status(404).send('Image not found');
      }

      res.set('Content-Type', post.image.contentType);
      res.send(post.image.data);
  } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});



app.get('/login',(req,res)=>{
  res.render("login");
});

app.post('/authuser',async(req,res)=>{
  let email = req.body.email;
  let password = req.body.password;
  const result = await fetch("http://localhost:5000/authuser", {
      method: "post",
      body: JSON.stringify({email,password}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(data.status == "user Authenticated Successfully"){
          res.redirect('postpage');
        }else{
          res.render("login");
        }
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});

app.get('/signup',async(req,res)=>{
    res.render("signup");
});

app.post('/registeruser',async(req,res)=>{
    console.log("request arrived");
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let username = req.body.username;
    let password = req.body.password;
    let result = await fetch("http://localhost:5000/registeruser", {
      method: "post",
      body: JSON.stringify({name,email,phone,username,password}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(()=>{
        console.log("request done");
        res.render("login");
    });
});

app.get('/startuphome',async(req,res)=>{
  const result = await fetch("http://localhost:5000/displayBlogs", {
    method: "post",
    body: JSON.stringify(),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.render("startupHome",{articals:data.data});
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      res.render('index');
    });
});


app.get('/addstartup',(req,res)=>{
  res.render("addstartup");
});


app.post('/addstartup',async(req,res)=>{
  console.log("request arrived");
    let startupname = req.body.startupname;
    let ownername = req.body.ownername;
    let discription = req.body.discription;
    let domain = req.body.domain;
    let email = req.body.email;
    let phone = req.body.phone;
    let keypoints = req.body.keypoints;
    let joiningyear = req.body.joiningyear;
    console.log(startupname,ownername,discription,domain,email,phone,keypoints,joiningyear);
    let image = "";
    let result = await fetch("http://localhost:5000/registerstartup", {
      method: "post",
      body: JSON.stringify({startupname,ownername,discription,domain,email,phone,keypoints,joiningyear}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(()=>{
        res.redirect('/startuphome');
    });
});

app.get('/startup/:id',async(req,res)=>{
  let result = await fetch("http://localhost:5000/startup", {
    method: "post",
    body: JSON.stringify({id:req.params.id}),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data.data);
    res.render("startupprofile",{startup:data.data});
  })
  .catch((error) => {
    console.error('Error submitting form:', error);
    res.render('index');
  });
});


app.get('/mentorship',async(req,res)=>{
  const result = await fetch("http://localhost:5000/displaymentorprograms", {
    method: "post",
    body: JSON.stringify(),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.render("mentorshipHome",{mentorprograms:data.data});
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      res.render('index');
    });
});

app.get('/addmentorprogram',(req,res)=>{
  res.render("addMProgram");
});

app.post('/addmentorprogram',async(req,res)=>{
  let programname = req.body.programname;
  let  qualification = req.body.qualification;
  let topic = req.body.topic;
  let phone = req.body.phone;
  let mode = req.body.mode;
  let pricing = req.body.pricing;
  let discription = req.body.discription;
  let keypoints =  req.body.keypoints;
  let date = req.body.date;
  let time = req.body.time;
  let result = await fetch("http://localhost:5000/registerprogram", {
    method: "post",
    body: JSON.stringify({programname,keypoints,discription,pricing,qualification,topic,phone,mode,time,date}),
    headers: {
      "Content-Type": "application/json",
    },
  }) 
  .then(()=>{
    res.redirect('/mentorship');
});
});


app.get('/likepost/:id',async(req,res)=>{
  try{
  let post = await Post.findById(req.params.id);
  post.like = post.like + 1;
  let response = await post.save();
  console.log(response);
  res.redirect('/postpage');
  }
  catch(err){
    console.log(err);
    res.redirect('/postpage');
  }
});


app.get('/comments/:id',async(req,res)=>{
  const result = await fetch(`http://localhost:5000/comments/${req.params.id}`, {
    method: "post",
    body: JSON.stringify(),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data.data);
    res.render("comments",{comments:data.data,pid:req.params.id});
  })
  .catch((error) => {
    console.error('Error submitting form:', error);
    res.redirect('/postpage');
  });
});

app.post('/postcomments/:id',async(req,res)=>{
  const comment = req.body.comment;
  let result = await fetch(`http://localhost:5000/postcomments/${req.params.id}`,{
    method: "post",
    body: JSON.stringify({comment}),
    headers: {
      "Content-Type": "application/json",
    },
  }) 
  .then((response)=>{
    res.redirect(`/comments/${req.params.id}`);
});
});

app.listen(port,(req,res)=>{
    console.log(`server is live on port ${port}`);
});