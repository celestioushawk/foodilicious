const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: 'Incorrect Email', password: 'Incorrect Password' };
  
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
      return errors;
    }
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    }
  
    return errors;
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
        const errors = handleErrors(err);
      res.status(400).json({ errors });
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
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    })     
}


module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge : 1 });
    res.redirect('/');
}