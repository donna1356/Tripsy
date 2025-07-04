const User = require("../models/user.js");

module.exports.renderSignUp = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res)=>{
    try{
        let{username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err) { 
                return next(err);
            }
             req.flash("success", "Welcome to Tripsy");
             res.redirect("/listings");
        })
    } catch(e)
    {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req, res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || '/listings';
        res.redirect(redirectUrl); //but passport gives a problem here
        //as soon as passport.authenticate gives success message
        //it restarts the req.session and if our middleware stored some extra info
        //it will clear that, undefined value, save in locals
};

module.exports.logout = (req, res) =>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
};

