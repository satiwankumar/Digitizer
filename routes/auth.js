const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')
const moment = require("moment");
const _ = require('lodash')

const { baseUrl } = require('../utils/url');


const auth = require('../middleware/auth')
const User = require('../models/User.model')
// const Token = require('../models/Token.model')
const Session = require('../models/session.model')
const { sendEmail } = require('../service/email')



moment().format();


//@route Get api/auth
//@desc Test route
//access Public


router.get('/', auth, async (req, res) => {
    try {
        console.log(req.user)
        let user = await User.findOne({ _id: req.user._id })


        if (!user) {
            return res
                .status(400)
                .json({ message: 'User doesnot exist' });
        }
        const url = baseUrl(req)
        user.image = `${url}${user.image}`
        res.status(200).json(user)
    } catch (error) {
        // console.error(error.message)
        res.status(500).json({ "error": error.message })
    }

})



//@route Post api/login
//@desc Test route
//access Public


router.post(
    '/login',
    [

        check('email', 'Email is required').isEmail(),
        check(
            'password',
            'password is required'
        ).exists(),
    ],
    async (req, res) => {
        let error = []

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            //see if user exists
            let user = await User.findOne({ email });

            if (!user) {
                error.push({ msg: "Invalid Credentials" })
                return res.status(400).json({ errors: error });
            }

            const validpassword = await bcrypt.compare(password, user.password)
            if (!validpassword) {
                error.push({ msg: "Invalid Credentials" })
                return res.status(400).json({ errors: error });

            }








            const token = user.generateAuthToken()
            // let session = await Session.findOne({ user: user.id });
            // // console.log(session)
            // if (session) {
            //     session.token = token,
            //         session.status = true,
            //         session.deviceId = req.body.deviceId
            // } else {

            session = new Session({
                token: token,
                user: user.id,
                status: true,
                deviceId: req.body.deviceId
            })
            // }

            await session.save()
            res.status(200).json({
                "message": "Log in Successfull",
                "userId": user.id,
                "token": token

            })

        } catch (err) {


            const errors = []
            errors.push({ msg: err.message })
            res.status(500).json({ errors: errors });
        }

        //return json webtoken
    }
);





router.post(
    '/login/admin',
    [

        check('email', 'Email is required').isEmail(),
        check(
            'password',
            'password is required'
        ).exists(),
    ],
    async (req, res) => {
        let error = []

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            //see if user exists
            let user = await User.findOne({ email: email, role:"admin" });



            if (!user) {
                error.push({ msg: "Invalid Credentials" })
                return res.status(400).json({ errors: error });
            }

            const validpassword = await bcrypt.compare(password, user.password)
            if (!validpassword) {
                error.push({ msg: "Invalid Credentials" })
                return res.status(400).json({ errors: error });

            }








            const token = user.generateAuthToken()
            let session = await Session.findOne({ user: user.id });
            // console.log(session)
            // if (session) {
            //     session.token = token,
            //         session.status = true,
            //         session.deviceId = req.body.deviceId
            // } else {

            session = new Session({
                token: token,
                user: user.id,
                status: true,
                deviceId: req.body.deviceId
            })
            // }

            await session.save()
            res.status(200).json({
                "message": "Log in Successfull",

                "token": token

            })

        } catch (err) {


            const errors = []
            errors.push({ msg: err.message })
            res.status(500).json({ errors: errors });
        }

        //return json webtoken
    }
);





//Post /api/users/login/forgot
//access public 

router.post("/forgot", check('email', 'Email is required').isEmail(), async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        User.findOne({ email: req.body.email }, async function (err, user) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (!user)
                return res.status(400).json({ message: "Invalid credentials." });




            let code = Math.floor(100000 + Math.random() * 900000);



            let token = await Token.findOne({ email: user.email });
            if (token) { token.remove(); }


            let newtoken = new Token({
                email: user.email,
                token: code
            });
            newtoken.save(function (err) {
                if (err) {
                    return res.status(500).json({ "error": err.message });
                }

                // user.passwordResetToken = token.token;
                // user.passwordResetExpires = moment().add(12, "hours");


                user.resetCode = code
                // user.passwordResetExpires = moment().add(1, "hours");



                user.save(async function (err) {
                    if (err) {
                        return res.status(500).json({ message: err.message });
                    }

                    let resp = await sendEmail(user.email, code)

                    return res.status(200).json({ message: 'password recovery code successfully sent to email.' });




                });

            });
        });




    } catch (err) {

        const errors = []
        errors.push({ msg: err.message })
        res.status(500).json({ errors: errors });
    }
})



//post    /api/auth/login/verifyCode/
//access private


router.post("/login/verifycode", check('resetCode', 'Code is Required'), (req, res) => {

    let error = []
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {


        // Find a matching token
        Token.findOne({ token: req.body.resetCode }, function (err, token) {
            // console.log(token)
            if (err) {
                error.push({ msg: err.message })
                return res.status(500).json({ errors: error });
            }
            if (!token) {
                error.push({ msg: "This code is not valid. OR Your code may have expired." })
                return res.status(400).json({ errors: error });
            }


            if (token) {

                return res.status(200).json({
                    message: "Code verified successfully, please set your new password "
                });
            }


        });
    } catch (err) {

        const errors = []
        errors.push({ msg: err.message })
        res.status(500).json({ errors: errors });
    }
    // Validate password Input

});

//post    /api/auth/login/reset/
//access private



router.post("/reset/:token", [
    check('newpassword', 'newpassword is required').not().isEmpty(),
    check('confirmpassword', 'confirmpassword is required').not().isEmpty()], (req, res) => {
        // Validate password Input
        const errors = validationResult(req);
        const { newpassword, confirmpassword } = req.body;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        // Find a matching token
        Token.findOne({ token: req.params.token }, async function (err, token) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            if (!token)
                return res.status(400).json({
                    message: "This code is not valid. OR Your code may have expired."
                });



            //see if user exists
            let user = await User.findOne({ email: token.email });
            if (!user) { return res.status(400).json({ "error": "Invalid Credentials" }); }

            //if currrent password and new password matches show  error
            const validpassword = await bcrypt.compare(newpassword, user.password)
            if (validpassword) return res.status(400).json({ "message": "please type new password which is not used earlier" })


            //if password and confirm password matches
            if (newpassword !== confirmpassword) {
                return res.status(400).json({ "message": "confirm password doesnot match" })
            }


            //hash password
            const salt = await bcrypt.genSalt(10)
            user.password = bcrypt.hashSync(newpassword, salt)

            token.remove()




            await user.save()
            res.status(200).json({
                "message": "password updated Successfully"
            })






        });
    });


//post    /api/auth/changepassword 
//access private
router.post(
    '/changepassword',
    [auth,
        [

            check('currentpassword', 'current Password is required').not().isEmpty(),
            check('newpassword', 'New Password is required').not().isEmpty(),
            check('confirmpassword', 'Confirm password is required').not().isEmpty()

        ]],
    async (req, res) => {
        let error = []

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let error = []
            // console.log(req.body);
            const { currentpassword, newpassword, confirmpassword } = req.body;

            // console.log(req.user)
            //see if user exists
            let user = await User.findOne({ _id: req.user._id });
            //   console.log(user)
            if (!user) { return res.status(400).json({ "error": "user doesnot exist" }); }

            //if password matches
            const validpassword = await bcrypt.compare(currentpassword, user.password)
            if (!validpassword) {
                error.push({ msg: "Invalid Credentials" })
                return res.status(400).json({ errors: error });

            }

            //if currrent password and new password matches
            if (currentpassword === newpassword) {
                error.push({ msg: "please type new password which is not used earlier" })
                return res.status(400).json({ errors: error });

            }

            //if password and confirm password matches
            if (newpassword !== confirmpassword) {
                error.push({ msg: "confirm password doesnot match" })
                return res.status(400).json({ errors: error });

            }



            //hash password
            const salt = await bcrypt.genSalt(10)
            user.password = bcrypt.hashSync(newpassword, salt)



            await user.save()
            res.status(200).json({
                "message": "password updated Successfully"
            })

        } catch (err) {

            res.status(500).json({ "error": err.message });
        }

        //return json webtoken
    }
);


router.get('/logout', auth, async (req, res) => {
    try {


        const sessions = await Session.findOne({ user: req.user._id })
        sessions.token = null,
            sessions.status = false,
            sessions.deviceId = null
        await sessions.save()
        return res.status(200).send({ "message": "User logout Successfullly" })
    } catch (error) {
        res.json({ "message": error.message })
    }


})

// if (moment().utcOffset(0) > user.passwordResetExpires) {
//           return res.status(400).send({
//             message: "Token has expired."
//           });
//         }
// If we found a token, find a matching user
//   User.findById(token._userId, function(err, user) {
//     if (err) {
//       return res.status(500).send({ message: err.message });
//     }
//     if (!user)
//       return res
//         .status(400)
//         .send({ message: `We were unable to find a user for this token.` });
//     if (user.passwordResetToken !== token.token)
//       return res.status(400).send({
//         message:
//           "User token and your token didn't match. You may have a more recent token in your mail list."
//       });
//     // Verify that the user token expires date has not been passed
//     if (moment().utcOffset(0) > user.passwordResetExpires) {
//       return res.status(400).send({
//         message: "Token has expired."
//       });
//     }
//     // Update user
//     user.password = req.body.password;
//     user.passwordResetToken = "nope";
//     user.passwordResetExpires = moment().utcOffset(0);
//     //Hash new password
//     user.hashPassword().then(() =>
//       // Save updated user to the database
//       user.save(function(err) {
//         if (err) {
//           return res.status(500).send({ message: err.message });
//         }
//         // Send mail confirming password change to the user
//         const mail = {
//           to: user.email,
//           from: `no-reply@mern-auth-server.herokuapp.com`,
//           subject: "Your password has been changed",
//           text: "Some useless text",
//           html: `<p>This is a confirmation that the password for your account ${
//             user.email
//           } has just been changed. </p>`
//         };
//         sgMail.send(mail).catch(error => {
//           return res.status(500).send({ message: error });
//         });
//         return res
//           .status(200)
//           .send({ message: "Password has been reset. Please log in." });
//       })
//     );

module.exports = router