import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
   apiUrl = 'http://localhost:5000/api';
   lock_FrontDoor =false;
   light_Main = false;

  constructor(public http: Http, public toastCtrl: ToastController) {
  }

   ionViewDidLoad() {
      this.getDoorStatus();
      this.getLightStatus();
  }

  getDoorStatus(){
     this.http.get(`${this.apiUrl}/door/status`).map(res => res.json()).subscribe(
        status => {
          this.lock_FrontDoor = status;
        },
        err => {
          this.showToastWithCloseButton('error while retrieving door status');
        }
      );
  }

  getLightStatus(){
    this.http.get(`${this.apiUrl}/light/status`).map(res => res.json()).subscribe(
        status => {
          this.light_Main = status;
        },
        err => {
           this.showToastWithCloseButton('error while retrieving light status');
        }
    );
  }

  lock_FrontDoorClicked(this){
    return this.http.post(`${this.apiUrl}/door/${this.lock_FrontDoor? "open":"close"}`)
  }

  light_MainClicked(this){
    return this.http.post(`${this.apiUrl}/light/${this.light_Main? "on":"off"}`);
  }

  showToastWithCloseButton(message) {
    const toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      closeButtonText: 'Ok'
    });
    toast.present();
  }
}
