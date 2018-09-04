import {Component} from '@angular/core';
// import {NavController} from 'ionic-angular';
import {OAuthService} from 'angular-oauth2-oidc';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Events} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {Slides} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('slides') slides: Slides;

  commandToken = undefined;
  _accessToken = 'DnR8TdVOO0eu8J9H9BsS2g==';

  // door
  doorLocked = false;
  unlockRequested = false;
  lockRequested = false;

  //camera
  cameraOn = false;
  cameraImages = [];
  cameraImagesTotal = 0;
  fromDateTime = undefined;
  takePictureRequested = false;

  // light
  lightOn = false;
  lightOnRequested = false;
  lightOffRequested = false;

  // dimmer
  lightDimmable = false;
  lightIntensity = 0;

  constructor(private oauthService: OAuthService, public http: HttpClient, private events: Events) {
  }

  ionViewDidLoad() {
    if (!this.hasLoggedIn) this.setupAuthentication();
    else this.refreshStatus();
  }

  refreshStatus() {
    return Promise.all([
      this.getCameraImages(),
      this.getCameraStatus(),
      this.getDoorStatus(),
      this.getLightStatus(),
      this.getCommandToken()]
    )
  }

  setupAuthentication() {
    // see also:
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-openid-connect-code

    // Without discovery
    this.oauthService.loginUrl = "https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/authorize";
    this.oauthService.userinfoEndpoint = "https://login.windows.net/0b53d2c1-bc55-4ab3-a161-927d289257f2/openid/userinfo";
    this.oauthService.tokenEndpoint = "https://login.windows.net/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/token";
    this.oauthService.logoutUrl = "https://login.windows.net/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/logout";

    // URL of the SPA to redirect the user to after login
    this.oauthService.redirectUri = window.location.origin + "/";

    // The SPA's id. Register SPA with this id at the auth-server
    this.oauthService.clientId = "ccec472c-b31d-4c65-b54a-92ea80751629";

    // set the scope for the permissions the client should request
    this.oauthService.scope = "openid profile email";

    // required for password flow
    // add following to oauth-service.js
    //   line 120: search.set('resource', this.resource)
    this.oauthService.resource = "https://eurismartoffice.azurewebsites.net";

    // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
    // OAuth2-based access_token
    this.oauthService.oidc = true;

    // The name of the auth-server that has to be mentioned within the token
    this.oauthService.issuer = "https://sts.windows.net/0b53d2c1-bc55-4ab3-a161-927d289257f2/";

    // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
    // instead of localStorage
    this.oauthService.setStorage(sessionStorage);

    // Load Discovery Document and then try to login the user
    // Remark: Need cors setup on server!!!
    //
    // let url = 'https://login.windows.net/0b53d2c1-bc55-4ab3-a161-927d289257f2/.well-known/openid-configuration';
    // this.oauthService.loadDiscoveryDocument(url).then(() => {
    //     // Do what ever you want here
    // });

    // This method just tries to parse the token(s) within the url when
    // the auth-server redirects the user back to the web-app
    // It doesn't send the user the the login page
    this.oauthService.tryLogin({
      onTokenReceived: context => {

        // Output just for purpose of demonstration
        // Don't try this at home ... ;-)

        console.debug("logged in");
        // console.debug(context);

        this.refreshStatus();
      },
    });
  }

  // publish the error response event
  private publishError(location, error) {
    error.location = location;
    this.events.publish('RESPONSE:ERROR', error);
  }

  login() {
    console.debug('logging in');
    this.oauthService.initImplicitFlow();
  }

  logout() {
    console.debug('logging out');
    this.oauthService.logOut();
  }

  getCameraStatus() {
    console.log(`getCameraStatus call sent`);
    let headers = this.createAccessTokenHeader();

    return this.http
      .get(`https://eurismartoffice.azurewebsites.net/api/Camera?resource=1428c5bf-37c4-41be-8ec0-bd72791f91b5`, {headers: headers})
      .subscribe(data => {
        console.log(`getCameraStatus response:`, data);

        this.cameraOn = data[0]['status'];
      }, error => {
        this.publishError('getCameraStatus', error);
      });
  }

  getCameraImages() {
    console.log(`getCameraImages call sent`);
    let headers = this.createAccessTokenHeader();

    // Dit zijn de redenen voor een 400:
    // Tijdsinterval > 7dagen
    // untilDateTime < fromDateTime
    //
    // Indien fromDateTime == null => fromDateTime = Today
    // Indien untilDateTime == null => untilDateTime = fromDateTime + 24h
    // Indien untilDateTime > now => untilDateTime = now
    //
    // Formaat DateTime = ‘yyyy-MM-dd’ of ‘yyyy-MM-ddTHH:mm:ss.nnnZ’

    let date = new Date();
    date.setDate(date.getDate() - 6);
    this.fromDateTime = date.toISOString().split('T')[0]; // "yyyy-dd-mm"

    date = new Date();
    date.setDate(date.getDate() + 1);
    let tomorrow = date.toISOString().split('T')[0]; // "yyyy-dd-mm"

    return this.http
      .get(`https://eurismartoffice.azurewebsites.net/api/Camera/camera/images?fromDateTime=${this.fromDateTime}&untilDateTime=${tomorrow}&resource=1428c5bf-37c4-41be-8ec0-bd72791f91b5`, {headers: headers})
      .subscribe(data => {
        console.log(`getCameraImages response:`, data);

        let images = data['images'];

        // order newest first
        this.cameraImages = images.sort((a, b) => b.createdDateTime.localeCompare(a.createdDateTime));
        this.cameraImagesTotal = data['total'];

      }, error => {
        this.publishError('getCameraImages', error);
      });
  }

  getDoorStatus() {
    console.log(`getDoorStatus call sent`);
    let headers = this.createAccessTokenHeader();

    return this.http
      .get(`https://eurismartoffice.azurewebsites.net/api/Door/status?resource=1428c5bf-37c4-41be-8ec0-bd72791f91b5`, {headers: headers})
      .subscribe(data => {
        console.log(`getDoorStatus response:`, data);

        this.doorLocked = data[0]['status'];

        if (this.lockRequested && this.doorLocked) {
          this.lockRequested = false;
        }

        if (this.unlockRequested && !this.doorLocked) {
          this.unlockRequested = false;
        }

        setTimeout(() => {
          this.getDoorStatus();
        }, 5000);
      }, error => {
        this.publishError('getDoorStatus', error);
      });
  }

  getLightStatus() {
    console.log(`getLightStatus call sent`);
    let headers = this.createAccessTokenHeader();

    return this.http
      .get(`https://eurismartoffice.azurewebsites.net/api/Light/status?resource=1428c5bf-37c4-41be-8ec0-bd72791f91b5`, {headers: headers})
      .subscribe(data => {
        console.log(`getLightStatus response:`, data);

        this.lightOn = data[0]['status'];
        this.lightDimmable = data[0]['dimmable'];

        if (this.lightOnRequested && this.lightOn) {
          this.lightOnRequested = false;
        }

        if (this.lightOffRequested && !this.lightOn) {
          this.lightOffRequested = false;
        }

        setTimeout(() => {
          this.getLightStatus();
        }, 5000);
      }, error => {
        this.publishError('getLightStatus', error);
      });
  }

  getCommandToken() {
    console.log(`getCommandToken call sent`);
    console.log('this._accessToken', this._accessToken);

    let headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    let postParams = {"AccessToken": this._accessToken};

    this.http.post("http://thijscrombeen.asuscomm.com:8800/api/security/command-token", postParams, {headers: headers})
      .subscribe(data => {
        console.log('getCommandToken response:', data);

        // this.commandToken = data['_body'].split('"')[1];

        this.commandToken = data;
        console.log('this.commandToken', this.commandToken);
      }, error => {

        this.publishError('getCommandToken', error);
      });
  }

  // BELOW ONLY WITH COMMAND TOKEN

  requestUnlockDoor() {
    this.unlockRequested = true;
    this.sendDoorCommand('unlock', 'danalock');
  }

  requestLockDoor() {
    this.lockRequested = true;
    this.sendDoorCommand('lock', 'danalock');
  }

  requestLightOn() {
    this.lightOnRequested = true;
    this.sendLightCommand('on', 'wallmount');
  }

  requestLightOff() {
    this.lightOffRequested = true;
    this.sendLightCommand('off', 'wallmount');
  }

  takePicture() {
    this.takePictureRequested = true;
    console.log(`takePicture call sent`);

    let headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken())
      .set('CommandToken', this.commandToken);

    let postParams = { // none required
    };

    this.http.post(`https://eurismartoffice.azurewebsites.net/api/Camera/camera/takePicture`, postParams, {headers: headers})
      .subscribe(data => {
        console.log(`takePicture response:`, data);

        this.getCameraImages();
      }, error => {
        this.publishError('takePicture', error);
      });
  }

  dimLight() {
    console.log('dimlight', this.lightIntensity);
  }

  sendDoorCommand(action, name) {
    console.log(`sendDoorCommand ${action} ${name} call sent`);

    let headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken())
      .set('CommandToken', this.commandToken);

    let postParams = { // none required
    };

    this.http.post(`https://eurismartoffice.azurewebsites.net/api/Door/${action}/${name}`, postParams, {headers: headers})
      .subscribe(data => {
        console.log(`sendLightCommand ${action} ${name} response:`, data);
      }, error => {
        this.publishError('sendDoorCommand', error);
      });
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  sendLightCommand(action, name) {
    console.log(`sendLightCommand ${action} ${name} call sent`);

    let headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken())
      .set('CommandToken', this.commandToken);

    let postParams = { // none required
    };

    this.http.post(`https://eurismartoffice.azurewebsites.net/api/Light/${name}/${action}`, postParams, {headers: headers})
      .subscribe(data => {
        console.log(`sendLightCommand ${action} ${name} response:`, data);
      }, error => {
        this.publishError('sendLightCommand', error);
      });
  }

  private createAccessTokenHeader() {
    return new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
  }

  public get name() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims['given_name'];
  }

  public get hasLoggedIn() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims;
  }

  public getImageIndex() {
    let imageIndex = 1;

    if (this.cameraImages.length > 0 && this.slides) {
      imageIndex = this.slides.getActiveIndex();
      if (!imageIndex) imageIndex = 1;
      else imageIndex += 1;
    }
    return imageIndex;
  }
}

