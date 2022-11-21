const bcrypt = require("bcryptjs");
const validator = require('validator');
const usersCollection = require('../db').db('test').collection('users');
const fs = require('fs');
const { ObjectId } = require("mongodb");

let User = function(data){
    this.data = data;
    this.errors = [];
    this.avatar = false;
};

// frontend
User.findByUsername = async function(username) {
  if(typeof(username) != "string"){
    try{
      let userDoc = await usersCollection.findOne({username: username});
      if(userDoc){
        userDoc = new User(userDoc, true)
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username,
          avatar: userDoc.avatar
        }
      }
    }catch(err){
      throw "User.findByUsername: " + err;
    }
  }
}

User.doesEmailExist = async function(email) {
  if(typeof(email) != "string"){
    return false;
  }
  try{
    let user = await usersCollection.findOne({email: email})
    if(user){
      return true;
    }else{
      return false;
    }
  }catch(err){
    throw "User.doesEmailExist: " + err;
  }
}

// backend

User.uploadAvatar = async function(file, user){
  // let img = fs.readFileSync(file.myAvatar);
  // let encode_image = img.toString('base64');

  let finalImg = {
    contentType: file.myAvatar.mimetype,
    image: file.myAvatar.data
  }
  // update database document with avatar
  let filter = {_id: new ObjectId(user._id)};
  let updateDoc = {
    $set: {
      avatar: finalImg
    }
  };
  let options = {upsert: false};
  try{
    await usersCollection.updateOne(filter, updateDoc, options);
  }catch(err){
    throw "User.uploadAvatar: " + err;
  }
  
}

User.renderAvatar = async function(user){
  try{
    // find document containing binData img
    let userRec = await usersCollection.findOne({_id: ObjectId(user)});
    if(userRec.avatar){
    //return contentType and base64 image string for EJS template
    return {contentType: userRec.avatar.contentType, image: userRec.avatar.image.toString('base64')};
    }
  }catch(err){
    throw "User.renderAvatar: " + err;
  }
}

User.prototype.cleanup = function(){
  try{
    //user, email, pass must be a string
    if(typeof this.data.username != "string"){ this.data.username=""; console.log("Not a string")};
    if(typeof this.data.email != "string"){ this.data.email=""; console.log("Not a string")};
    if(typeof this.data.password != "string"){ this.data.password=""; console.log("Not a string")};

    //user and email shouldn't have extra space, should be lowercase
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      email: this.data.email.trim().toLowerCase(),
      password: this.data.password
    }
  }catch(err){
    throw "model function error: " + err;
  }
};

User.prototype.validate = async function(){

  switch(true){

    // Username validation
    case (this.data.username === ""):
      this.errors.push("You must provide a username.");
      break;
    case (this.data.username != "" && !validator.isAlphanumeric(this.data.username)):
      this.errors.push("Username can only contain letters or numbers.");
      break;
    case (this.data.username.length > 0 && this.data.username.length < 3):
      this.errors.push("Username must be at least 3 characters.");
      break;
    case (this.data.username.length > 20):
      this.errors.push("Username cannot exceed 20 characters.")
      break;
    case (this.data.username.length > 2 && this.data.username.length < 21 && validator.isAlphanumeric(this.data.username)):
      let usernameExists = await usersCollection.findOne({username: this.data.username});
      if(usernameExists){this.errors.push("Username is already taken.")};
      break;
  }

  // Password validation
  switch(true){
    case (this.data.password === ""):
      this.errors.push("You must provide a password.");
      console.log(this.errors);
      break;
    case (this.data.password.length > 0 && this.data.password.length < 8):
      this.errors.push("Password must be at least 9 characters.");
      console.log(this.errors);
      break;
    case (this.data.password.length > 30):
      this.errors.push("Password cannot exceed 30 characters.");
      console.log(this.errors);
      break;
  } 

  // Email Validation
  switch(true){
    case (!validator.isEmail(this.data.email)):
      this.errors.push("You must provide a valid email address.");
      console.log(this.errors);
      break;
    case (validator.isEmail(this.data.email)):
      let emailExists = await usersCollection.findOne({email: this.data.email});
      if(emailExists){
        this.errors.push("Email already in use.");
        console.log(this.errors);
      };
      break;
  }
};

User.prototype.register = async function() {
  try{
    //1. validate user input
    await this.cleanup();
    await this.validate();
    //2. only if there are no validation errors, insert to db
    if(!this.errors.length){
      // hash our password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
    }
  }catch(err){
    throw "User.prototype.register: " + err;
  }
};

User.prototype.login = async function(){
  try{
    let userRecord = await usersCollection.findOne({username: this.data.loginuser}); 
    if(userRecord && bcrypt.compareSync(this.data.loginpassword, userRecord.password)){
      this.data = userRecord;
    }else{
      throw "Invalid Login/Password.";
    }

    if(userRecord.avatar){
      return true;
      console.log(userRecord.avatar);
    }else{
      return false;
      console.log(userRecord.avatar);
    }

  }catch(err){
    throw err + "." + " Please try again later.";
  }
  
};


module.exports = User;