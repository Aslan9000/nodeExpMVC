const session = require('express-session');
const User = require('../models/User');

exports.doesUsernameExist = async function (req, res){
  try{
    await User.findByUsername(req.body.username);
    res.json(true)
  }catch(err){
    res.json(false)
  }
}

exports.doesEmailExist = async function(req, res){
  let foundEmail = await User.doesEmailExist(req.body.email);
  res.json(foundEmail);
}

exports.register = async function (req, res){
  let user = new User(req.body);
  try{
    await user.cleanup();
    await user.validate();
    if(!user.errors.length){
      try{
        await user.register();
        req.session.user= {username: user.data.username, _id: user.data._id};
        req.flash('success', "Registration success!");
        req.session.save(function(){
          res.redirect('/');
        })
      }catch(err){
        throw err;
      }
    }else{
      user.errors.forEach(error =>{
        req.flash('regErrors', error);
      })
      req.session.save(function(){
        res.redirect('/');
      })
    }
  }catch(err){
    throw "controller function error: "+ err;
  }
    
}

exports.login = async function (req, res){
  let user = new User(req.body);
  try{
    await user.login();
    if(user.data._id){
      req.session.user = {_id: user.data._id, username: user.data.useraname};
    }
    req.session.save(function(){
      res.redirect('/');
    })
  }catch(e){
    req.flash('errors', e);
    req.session.save(function(){
      res.redirect('/');
    })
  }
  
}                                                                                                                                   
exports.home = function (req, res){
  if(req.session.user){
    res.render('home_dashboard');
  }else{
    res.render('home', {regErrors: req.flash('regErrors')});
  }
}

exports.logout = function (req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
}