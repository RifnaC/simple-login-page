const express = require('express');
const session = require('express-session')
const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const collection = require('./database');
const User = require('./userScheme')
const { check, validationResult } = require('express-validator');
const { error } = require('console');
const auth = require('../auth')

const app = express()

const port = process.env.PORT || 5000

app.use(cookieParser());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: '2001@Key',
    resave: false,
    saveUninitialized: true,
}));


app.get('/', (req, res) => {
    const isLoggedIn = req.cookies.session;
    if (isLoggedIn) {
        res.redirect('/home');
    } else {
        res.render("login");
    }

});

app.get('/signUp', (req, res) => {
    const isLoggedIn = req.cookies.session;
    if (isLoggedIn) {
        res.redirect('/home');
    } else {
        res.render("signUp");
    }

});

app.post('/signUp',
    [
        check('email')
            .normalizeEmail()
            .isEmail()
            .custom((value, { req }) => {
                if (value !== req.body.email) {
                    throw new Error('Enter a valid email');
                }
                return true;
            }),
        check('phoneNum')
            .isMobilePhone().
            isLength({ min: 10 }).custom((value, { req }) => {
                if (value !== req.body.phoneNum) {
                    throw new Error('Enter a valid phone Number')
                }
                return true
            }),
        check('password').isLength({ min: 6 }).withMessage('Password must contain atleast 6 characters').not().matches(/^$|\s+/).withMessage('White space not allowed'),
        check('confirmPswd').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password Confirmation does not match password');
            }
            return true;
        }),],
    async (req, res) => {
        const errors = validationResult(req);
        const errorMsgs = [];
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                errorMsgs.push(error.msg);
            });
            res.send(
                `<script>alert('${errorMsgs.join("\n")}');window.location.href='/signUp';</script>`
            )
        } else {
            const data = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phoneNum,
                password: req.body.password,
                confirmPswd: req.body.confirmPswd
            };
            try {

                const newUser = new User(data);
                await newUser.save();


                req.session.isLoggedIn = true;
                req.session.userData = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                };
                res.cookie('session', newUser._id.toString());

                res.redirect(`/home`);
            } catch (error) {
                console.error("Error:", error);
                res.send("Something went wrong");
            }

        }
    })

app.post('/login', async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email })
        if (check.password === req.body.password) {
            req.session.isLoggedIn = true;
            req.session.userData = {
                name: check.name,
                email: check.email,
                phone: check.phone,
            };
            res.cookie('session', check._id.toString())
            res.redirect(`/home`);
        } else {
            res.send("Wrong password");
        }
    } catch (error) {
        res.send("Something went wrong");
    }
});
app.get("/home", auth, (req, res) => {
    const userData = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
    };
    res.render('home', { userData });
});

app.put('/updateUser', async (req, res) => {
    const sessionId = req.cookies.session;

    if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await collection.findOne({ _id: sessionId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});

app.delete('/deleteUser', async (req, res) => {
    const sessionId = req.cookies.session;

    if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await collection.findOne({ _id: sessionId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await collection.deleteOne({ _id: sessionId });
        res.clearCookie('session');

        res.send();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to update user data' });
    }
})

app.get('/logout', (req, res) => {

    res.clearCookie('session');
    res.redirect('/');
})
app.listen(port, () => console.log('> Server is up and running on port : ' + port))





