const User = require('../models/User');
const Token = require('../models/Token');
const crypto = require("crypto");
const mail = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config();




let transporter = mail.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

transporter.verify((err, success) => {
    if(err)
    {
        console.log(err);
    }
    else{
        console.log('ready to send emails!');
        console.log(success);
    }
})


module.exports.reset_password_get = (req, res) => {
    //get new password here
    console.log(req.params.userid)
    console.log(req.params.token)
    res.render('changepassword', { token : req.params.token, userid : req.params.userid })
}
module.exports.reset_password_post = async (req, res) => {
    //update db with new password here
    const newpass = req.body.newpassword;
    console.log("token: " + req.params.token + " " + "userid: " + req.params.userid)
    console.log("new password recieved" + newpass)
    const token = await Token.findOne({ token : req.params.token })
    if(token)
    {
        const user = await User.findOne({ userId : req.params.userid })
        if(user)
        {
            const update = await User.updateOne({ _id : req.params.userid }, {password : newpass})
            if(update)
            {
                res.render('passwordchanged')
                
            }
        }
    }
    /* const token =  Token.findOne({ token : req.params.token })
    .then((result) => {
        //res.json(result)
        const user = User.findOne({ userId : req.params.userid })
        .then((result1) => {
            User.updateOne({ _id : req.params.userid }, {password : newpass})
            .then((result2) => {
                res.render("passwordchanged")
            })
            .catch((err) => {
                res.json("cannot change passsword")
            })
        })
        .catch((err) => {
            res.json("cannot find user")
        })
    })
    .catch((err) => {
        res.json("could not verify token")
    }) */
}
module.exports.forgot_password_post = async (req, res) => {
    //search in db with email and generate token here
    const email = req.body.email;
    console.log("email recieved: " + email)
    const user = await User.findOne({ email });

  if (!user) {
      console.log("User does not exist");
  }
  const token = await Token.findOne({ userId: user._id });
  if (token) { 
        await token.deleteOne()
  };

  let resetToken = crypto.randomBytes(32).toString("hex");

  await new Token({
    userId: user._id,
    token: resetToken,
    createdAt: Date.now(),
  }).save();

  const link = `https://foodilicious-web-app.herokuapp.com/reset-password/${resetToken}/${user._id}`;
  console.log(link)


  const currentUrl = "https://foodilicious-web-app.herokuapp.com/";
    

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Foodilicious - Change Password Request",
        html: `
        <body>
        <h1>Reset Password Request </h1>
        <hr>
        <h3>Important: This link will be valid for only 1 Hour! </h3>
        <p> Click <a href=${currentUrl + "reset-password" + "/" + resetToken + "/" + user._id}>here</a> to change your password. </p>
        <hr>
        <p>Regards,</p>
        <p>Team Foodilicious </p>
        </body>
        `
    }

    transporter.sendMail(mailOptions)
    .then(() => {
        res.json("Mail Sent!")
    })
    .catch((err) => {
        res.json(err);
    });



}
module.exports.forgot_password_get = (req, res) => {
    //render email form here
    res.render('forgotpassword')
}