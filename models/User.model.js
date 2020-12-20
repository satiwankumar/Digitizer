const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');


const UserSchema = new mongoose.Schema({
    image:
    {
        type: String
    },
    firstname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    lastname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
 
    // resetCode: {type: Number, default: ""},
    status: {type: Number, default: 1},
    
    role: {
        type: String,
        required: true
    }
    
});

UserSchema.set('timestamps', true)








 
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id, isAdmin: this.isAdmin ,status:this.status
     },config.get('jwtSecret'),{expiresIn :  '24h' });
    return token;
}




module.exports = User = mongoose.model('user', UserSchema)