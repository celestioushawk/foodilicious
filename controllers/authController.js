const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const handleErrors = (error) => {
    console.log(error.message, error.code);
}

const createToken = (id) => {
    return jwt.sign({ id }, 'foodies secret');
}


module.exports.signup_get = (req, res) => {
    res.render('signup')
}


module.exports.login_get = (req, res) => {
    res.render('login')
}



module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
  
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly : true,  })
        res.status(200).json(user);

    } catch (err) {
        handleErrors(err);
      res.status(400).json({});
    }
  
  }


module.exports.signup_post = (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = User.create({ firstName, lastName, email, password })
    .then((success) => {
        console.log(success);
        //const token = createToken(user._id);
        //res.cookie('jwt', token, { httpOnly : true,  })
        res.status(201).json(success);
    })
    .catch((err) => {
        console.log(err);
        res.json(err);
    })     
}


module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge : 1 });
    res.redirect('/');
}