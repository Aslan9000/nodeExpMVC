import axios from 'axios'

export default class Registration {
  constructor(){
    this._csrf = document.querySelector('[name="_csrf"]').value
    this.allLabels = document.querySelectorAll('#registrationform label');
    this.form = document.querySelector('#registrationform');
    this.insertValidationElements();
    this.username = document.querySelector('#register-username');
    this.username.previousValue = "";
    this.email = document.querySelector('#register-email');
    this.email.previousValue = "";
    this.username.isUnique = false;
    this.email.isUnique = false;
    this.password = document.querySelector('#register-password');
    this.password.previousValue = "";
    this.events();
  }

  // Events
  events(){

    this.form.addEventListener('submit', (e)=>{
      e.preventDefault();
      this.formSubmitHandler();
    })
    
    this.username.addEventListener('keyup', ()=>{
      this.isDifferent(this.username, this.usernameHandler)
    })
    this.email.addEventListener('keyup', ()=>{
      this.isDifferent(this.email, this.emailHandler)
    })
    this.password.addEventListener('keyup', ()=>{
      this.isDifferent(this.password, this.passwordHandler)
    })
  }

  // Methods

  formSubmitHandler(){
    this.usernameImmediately();
    this.usernameAfterDelay();
    this.emailAfterDelay();
    this.passwordImmediately();
    this.passwordAfterDelay();
    console.log(this.email.isUnique);
    if(
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.email.errors &&
      !this.password.errors
    ){
      this.form.submit();
    }
  }

  insertValidationElements(){
    this.allLabels.forEach(function(label){
      label.insertAdjacentHTML('beforebegin', '<div id="userRegError" class="alert alert-danger small invalid-feedback"></div>')
    })
  }

  isDifferent(field, fieldHandler){
    if(field.previousValue != field.value){
      fieldHandler.call(this);
    }
    field.previousValue = field.value;
  }

  usernameHandler(){
    this.username.errors = false;
    this.usernameImmediately();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(()=> this.usernameAfterDelay(), 800);

  }

  usernameImmediately(){
    // username is not alphanumeric
    if(this.username.value != "" & !/^([a-zA-Z0-9]+)$/.test(this.username.value)){
      this.showValidationError(this.username, "Username can only contain letters and numbers.");
    }
    // username can't exceed 30 characters maximum
    if(this.username.value.length > 30){
      this.showValidationError(this.username, "Username cannot exceed 30 characters.");
    }
    // if error corrected, hide error message
    if(!this.username.errors){
      this.hideValidationError(this.username);
    }
  }

  async usernameAfterDelay(){
    // username must be 3 characters minimum
    if(this.username.value.length < 3){
      this.showValidationError(this.username, "Username must be at least 3 characters long.");
    }
    // check if username is already taken
    if(!this.username.errors){
      try{
        let exist = await axios.post('/doesUsernameExist', {username: this.username.value, _csrf: this._csrf});
        if(!exist){
          this.showValidationError(this.username, "That username is already taken.");
          this.username.isUnique = false;
        }else{
          this.username.isUnique = true;
        }
      }catch(error){
        throw "registration.js usernameAfterDelay: " +  error;
      }
    }
  }

  emailHandler(){
    this.email.errors = false;
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(()=> this.emailAfterDelay(), 1000);
  }

  async emailAfterDelay(){
    // check for valid email
    if(!/^\S+@\S+$/.test(this.email.value)){
      this.showValidationError(this.email, "You must provide a valid email.")
    }
    // check if email is already taken
    if(!this.email.errors){
      try{
        let exist = await axios.post('doesEmailExist', {email: this.email.value, _csrf: this._csrf});
        console.log("emailAfterDelay: " + exist);
        if(!exist){
          this.showValidationError(this.email, "Email already belongs to a registered user.");
          this.email.isUnique = false;
        }else{
          this.email.isUnique = true;
          this.hideValidationError(this.email);
        }
      }catch(err){
        throw "registration.js emailAfterDelay: " + err;
      }
    }else{
      console.log("emailAfterDelay, email errors prob");
    }
  }

  passwordHandler(){
    this.password.errors = false;
    this.passwordImmediately();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(()=> this.passwordAfterDelay(), 800);
  }

  passwordImmediately(){
    // check if password is over 30 characters
    if(this.password.value.length > 30){
      this.showValidationError(this.password, "Password must not exceed 30 characters.")
    }
    // if error corrected, hide error message
    if(!this.password.errors){
      this.hideValidationError(this.password)
    }
  }

  passwordAfterDelay(){
    // check if password is less than 9 characters
    if(this.password.value.length < 9){
      this.showValidationError(this.password, "Password must be at least 9 characters.");
    }
  }


  showValidationError(field, message){
    let validationElement = field.previousElementSibling.previousElementSibling; 
    validationElement.innerHTML = message;
    validationElement.classList.add('invalid-feedback--visible');
    validationElement.classList.remove('invalid-feedback');
    field.errors = true;
  }

  hideValidationError(field){
    let validationElement = field.previousElementSibling.previousElementSibling; 
    validationElement.classList.remove('invalid-feedback--visible');
    validationElement.classList.add('invalid-feedback');
  }
 
}