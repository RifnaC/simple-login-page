const { check, sanitizeBody } = require('express-validator');
module.exports.form = [
    check('name').trim().notEmpty().withMessage('Name required').matches(/^[a-zA-Z]*$/).withMessage('Only characters with white space are allowed'),

    check('email').notEmpty().withMessage('Email required').normalizeEmail().isEmail().withMessage('Enter a valid email'),

    check('phoneNum').notEmpty().withMessage('Phone number is required').isMobilePhone(),isLength({min:10,max:10}),

    check('password').trim().notEmpty().withMessage('Password required').isLength({min: 6}).withMessage('Password must contain atleast 6 characters').matches(/(?=.*?[A-Z])/).withMessage('Password must contain atleast one UpperCase characters').matches(/(?=.*?[a-z])/).withMessage('Password must contain atleast one LowerCase characters').matches(/(?=.*?[0-9])/).withMessage('Password must contain atleast one Number').matches(/(?=.*?[#?!@$%^&*-])/).withMessage('Password must contain atleast one special character').not().matches(/^$|\s+/).withMessage('White space not allowed'),
  // confirm password validation
  check('confirmPswd').custom((value, { req }) => {
       if (value !== req.body.password) {
             throw new Error('Password Confirmation does not match password');
        }
        return true;
   }),
]