const session = require('express-session');
const User = require('../models/User');
const axios = require('axios');
let renderAv = {};


// frontend axios requests
exports.doesUsernameExist = function(req, res) {
  User.findByUsername(req.body.username).then(function() {
    res.json(true)
  }).catch(function() {
    res.json(false)
  })
}

exports.doesEmailExist = async function(req, res) {
  User.doesEmailExist(req.body.email).then(function(){
    res.json(true)
  }).catch(function(){
    res.json(false)
  })
}

// backend
exports.register = async function (req, res){
  let user = new User(req.body);
  try{
    await user.cleanup();
    await user.validate();
    if(!user.errors.length){
      try{
        await user.register();
        req.session.user= {username: user.data.username, _id: user.data._id, avatar: user.avatar};
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
    throw "userController register: "+ err;
  }
    
}

exports.login = async function (req, res){
  let user = new User(req.body);
  try{
    let hasAv = await user.login();
    if(user.data._id){
      req.session.user = {username: user.data.username, _id: user.data._id, avatar: hasAv};
    }
    req.session.save(function(){
      res.redirect('/');
    })
  }catch(e){
    console.log("userController login: " + e);
    req.flash('errors', e);
    req.session.save(function(){
      res.redirect('/');
    })
  }
  
}                                                                                                                                   
exports.home = async function (req, res){
  if(req.session.user && req.session.user.avatar){
    try{
      renderAv = await User.renderAvatar(req.session.user._id);
      res.render('home_dashboard', renderAv);
    }catch(err){
      throw "UserController home: " + err;
    }
  }else if(req.session.user){
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

exports.createAvatar = async function(req, res){
  if(!req.files || Object.keys(req.files) === 0){
    return res.status(400).send('No files uploaded.');
  }
  try{
    await User.uploadAvatar(req.files, req.session.user);
    req.session.user.avatar = true;
    await User.renderAvatar(req.session.user._id);
    req.session.save(function(){
      res.redirect('/');
    })
  }catch(err){
    throw "userController createAvatar:  " + err;
  }
  
}