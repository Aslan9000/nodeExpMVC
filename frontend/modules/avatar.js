import axios from 'axios';
import formData from 'form-data';


export default class Avatar {
    constructor(){
        this.avatarForm = document.querySelector("#uploadAvForm");
        this.uploadBtn = document.querySelector("#uploadFormBtn");
        this.clickBtn = document.querySelector("#clickBtn");
        this.events();

    }

    events(){
        this.avatarForm.addEventListener('submit', (e)=>{
            let bodyFormData = new FormData();
            console.log(bodyFormData);
            // axios.post('/createAvatar', bodyFormData, {headers: {"Content-Type": "multipart/form-data"}});
        });

    }



}