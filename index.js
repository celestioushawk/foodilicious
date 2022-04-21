const express = require('express');
const db = require('mongoose');
const multer = require("multer");
const app = express();
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const Recipe = require('./models/Recipe')
const User = require('./models/User');
const Token = require('./models/Token');
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const bcrypt = require('bcrypt')
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({extended:false}))

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

//middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

const dbURI = `mongodb+srv://foodieadmin:${process.env.DB_PASS}@cluster0.o2x6n.mongodb.net/foodies?retryWrites=true&w=majority`;
db.connect(dbURI)
.then(() => console.log("connected to DB"))
.catch((err) => console.log("failed to connect: " + err))



const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    },
    });
  
  const upload = multer({ storage: fileStorageEngine });
  




app.get('/', checkUser, (req, res) => {
    const recipes = Recipe.find()
    .then((result) => {
      res.render("index", { recipes : result } );
    })

})



/* app.post('/passwordReset/:token/:userid', async (req, res) => {
  const newpass = req.body.newpassword;
  const userdd = req.params.userid;
  const token = req.params.token;
  console.log("new pass recieved " + newpass);
  console.log("userid recieved " + req.params.userid);
  console.log("token recieved " + req.params.token);


  let passwordResetToken = await Token.findById(userdd);
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
  //const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await User.updateOne(
    { userId: userdd },
    { $set: { password: newpass } },
    { new: true }
  );
})


app.get('/passwordReset/:token/:userid', (req, res) => {
  res.render('changepassword');
})
 */



app.get('/recipe/:id', checkUser, requireAuth, (req, res) => {
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
    const userId = decoded.id;
    let array;
    const user = User.findById({ _id : userId })
    .then((result) => {
      array = result;
    })
    .catch((err) => {
      console.log(err);
    })
    
    const recipe = Recipe.findOne({_id : req.params.id})
    .then((result) => {
      res.render('viewRecipe', { recipe : result });
    })
    .catch((err) => {
      res.send("no recipe found");
    })
     //res.render('viewRecipe', {recipeid: req.params.id});
})


app.get("/addRecipe", checkUser, requireAuth, (req, res) => {
    res.render("submitRecipe");
});

app.post("/addRecipe", upload.single("image"), checkUser, requireAuth, (req, res) => {
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const userId = decoded.id;
  let firstName, lastName, fullName;
  const name = User.findOne( { _id : userId }).then((result) => {
      firstName = result.firstName;
      lastName = result.lastName;
      console.log(result.firstName);
      fullName = result.firstName + " " + result.lastName;
      console.log(fullName);
      const aid = result._id;


      const recipe = new Recipe({
        name: req.body.name,
        ingredients: req.body.ingredients,
        category: req.body.category,
        instructions: req.body.instructions,
        image: req.file.filename,
        author: fullName,
        authorId: aid
      });
      recipe.save().then((result) => {
        res.render('recipeAdded');
      });
      console.log(recipe);
  })
    //
});

app.get('/saveRecipe/:recipeId', checkUser, requireAuth, (req, res) => {
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const userId = decoded.id;
  const recipeID = req.params.recipeId;
  const user = User.findByIdAndUpdate({ _id : userId}, {$push: { savedRecipes : recipeID }})
  .then((result) => {
    console.log(result);
    res.redirect('/')
  })
  .catch((err) => {
    console.log(err);
  })
  console.log(userId);
})
  

app.get('/savedRecipes', checkUser, requireAuth, (req, res) => {
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const userId = decoded.id;
  const user = User.findOne({_id : userId})
  .then((result) => {
   const recipeArray = result.savedRecipes;
    /* result.savedRecipes.forEach((recipe) => {
      console.log(recipe);
    }) */
    const recipe = Recipe.find({_id : {$in: recipeArray }})
    .then((result) => {
      console.log(result);
      res.render('savedRecipes', {saved : result});
    })
    //res.render('savedRecipes', { userData : result })
  })
  .catch((err) => {
    res.redirect('/login');
  })
})



/* app.get('/forgotPassword', (req, res) => {
  res.render('forgotpassword');
})


const sendVerificationMail = ({_id, email, uniqueToken}, res) => {
    
  const currentUrl = "http://localhost:4000/";
  

  const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your Email",
      html: `<p> Click <a href=${currentUrl + "user/verify" + "/" + uniqueToken}>here</a> to verify your mail </p>`
  }

  transporter.sendMail(mailOptions)
  .then(() => {
      res.json("Mail Sent!")
  })
  .catch((err) => {
      res.json(err);
  });

}
 */

/* app.post('/sendResetPasswordEmail', async(req, res) => {
  const email = req.body.email;
  console.log("email recieved: " + email)
  const user = await User.findOne({ email });

  if (!user) {
      console.log("User does not exist");
  }
  token = await Token.findOne({ userId: user._id });
  if (token) { 
        await token.deleteOne()
  };

  if (!user) throw new Error("User does not exist");
  token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, 10);

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `http://localhost:3000/passwordReset/${resetToken}/${user._id}`;
  //sendEmail(user.email,"Password Reset Request",{name: user.name,link: link,},"./template/requestResetPassword.handlebars");
  //return link;
  console.log(link);
});
 */

/* app.post('/passwordReset/:token/:userid', async (req, res) => {
  const newpass = req.body.newpass;
  const userdd = req.params.userid;
  const token = req.params.token;
  console.log("new pass recieved " + newpass);
  console.log("userid recieved " + req.params.userid);
  console.log("token recieved " + req.params.token);


  let passwordResetToken = await Token.findById(userdd);
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }
  //const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await User.updateOne(
    { userId: userdd },
    { $set: { password: newpass } },
    { new: true }
  );
}) */


/* app.get('/passwordReset/:token/:userid', (req, res) => {
  res.render('changepassword');
}) */



app.get('/profile/:id', checkUser, requireAuth, (req, res) => {
  const recipeid = req.params.recipeid;
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const tokenuserid = decoded.id;
  const userid = req.params.id;
  const userData = User.findOne({ _id : userid })
  .then((result) => {
    const userRecipes = Recipe.find({ authorId : result._id })
    .then((result1) => {
      res.render('profile', { recipes: result1, userdata: result, tokenid : tokenuserid })
    })
    .catch((err) => {
      res.json(err);
    })
  })
  .catch((err) => {
    res.json(err);
  })
})


app.get('/delete-recipe/:recipeid', requireAuth, checkUser, (req, res) => {
  const recipeid = req.params.recipeid;
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const userId = decoded.id;
  const recipe = Recipe.findOne({ _id : recipeid })
  .then((result) => {
    if(userId == result.authorId)
    {
      Recipe.deleteOne({ _id : recipeid })
      .then((result1) => {
        res.render('recipeDeleted')
      })
      .catch((err) => {
        res.json("could not delete recipe")
      })
    }
  })
  .catch((err) => {
    res.json("could not find recipe")
  })
  


})


app.delete('/delete-recipe/:id', checkUser, requireAuth, (req, res) => {
  const recipeid = req.params.id;
  const decoded = jwt.verify(req.cookies.jwt, "foodies secret");
  const userId = decoded.id;
  const recipe = Recipe.findOne({ _id : recipeid })
  .then((result) => {
    if(result.authorId == userId)
    {
      const deleterecipe = Recipe.deleteOne({ _id : recipeid })
      .then((result1) => {
        res.render('deleteRecipe')
      })
      .catch((err) => {
        res.send("could not delete recipe")
      })
    }
  })
  .catch((err) => {
    res.send("could not find recipe")
  })
})


app.get('/random', checkUser, requireAuth, (req, res) => {
  res.render('deleteRecipe')
})

app.use(authRoutes);

app.listen(port, () => console.log("server listening at port 3000"));