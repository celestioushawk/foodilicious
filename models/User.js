const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : [true, "Please provide first name."]
    },
    lastName : {
        type : String,
        required : [true, "Please provide last name."]
    },
    email : {
        type : String,
        required: [true, "Please provide an email."],
        lowercase : true,
        unique : true,
        validate : [isEmail, "Please enter a valid email."]
    },
    password : {
        type : String,
        required : true,
        lowercase : true,
        minlength : [6, "Minimum length of password should be 6 characters long"]
    },
    savedRecipes: {
        type : Array,
    }
});

//fire a function before doc is saved into the db
/* userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
}) */


//static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
      if (password == user.password) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
};
const User = mongoose.model('newuser', userSchema);

module.exports = User;