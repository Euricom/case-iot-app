import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-log',
  templateUrl: 'log.html'
})

export class LogPage {
  selectedItem: any;
  icons: string[];
  actors: string[];
  lightIcons: string[];
  doorIcons: string[];
  items: Array<{title: string, icon: string}>;

  get randomBool(): Boolean {
    return ~~(Math.random()*2) ? true : false;
  }

  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  get randomTime(): String {
    let randomDate = this.randomDate(new Date(2012, 0, 1), new Date());
    return randomDate.getHours() + ":" + randomDate.getMinutes();
  }

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.lightIcons = ['moon', 'sunny'];
    this.doorIcons = ['log-out', 'log-in'];
    this.actors = ['Wim', 'Stijn S.', 'Stijn L.', 'Liesbeth', 'Sonja'];

    this.items = [];
    for(let i = 1; i < 11; i++) {

      let eventDirection = this.randomBool;
      let randomActor = this.actors[Math.floor(Math.random() * this.actors.length)]
      let randomEventSource = this.randomBool ? "door" : "light";

      let randomEvent = randomEventSource === "door" ? (`${eventDirection ? "closed" : "opened"}`) :(`${eventDirection ? "switched on" : " switched off"}`);

      this.items.push({
        title: `${randomActor} ${randomEvent} ${randomEventSource} @ ${this.randomTime}`,
        icon: randomEventSource === "door" ? (eventDirection?"log-out": "log-in") : (eventDirection? "sunny":"moon"),
      });
    }
  }

}
