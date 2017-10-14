import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {OAuthService} from 'angular-oauth2-oidc';
import {Http, Headers, RequestOptions} from '@angular/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  commandToken = undefined;

  constructor(public navCtrl: NavController, private oauthService: OAuthService, public http: Http) {
    this.setupAuthentication();
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
        console.debug(context);
      },
     });
  }

  login() {
    console.debug('login');
    this.oauthService.initImplicitFlow();
  }

  logoff() {
    console.debug('logoff');
    this.oauthService.logOut();
  }

  getDeviceStatus(name) {
    console.log(`getDeviceStatus ${name} call sent`);

    const accessToken = this.oauthService.getAccessToken();
    // console.log('accessToken', accessToken);

    let headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + accessToken);
    let options = new RequestOptions({headers: headers});

    this.http.get(`https://eurismartoffice.azurewebsites.net/api/${name}/status?resource=1428c5bf-37c4-41be-8ec0-bd72791f91b5`, options)
      .subscribe(data => {
        console.log(`getDeviceStatus ${name} response:`, data);
      }, error => {
        console.log('Error:', error);
      });
  }

  getCommandToken() {
    this.commandToken = 'somefakecommandtoken';

    // const accessToken = this.oauthService.getAccessToken();
    // console.log('accessToken', accessToken);
    //
    // let headers = new Headers();
    // headers.append("Accept", 'application/json');
    // headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', `Bearer ${accessToken}`);
    // let options = new RequestOptions({headers: headers});
    //
    // let postParams = {};
    //
    // this.http.post("http://10.0.1.101:8800/api/security/requestcommandtoken", postParams, options)
    //   .subscribe(data => {
    //     console.log('commandToken', data['_body']);
    //
    //     this.commandToken = data['_body']['AccesToken'];
    //   }, error => {
    //
    //     console.log('Error:', error);
    //   });
  }

  sendDoorCommand(action, name) {
    console.log(`sendDoorCommand ${action} ${name} call sent`);

    const accessToken = this.oauthService.getAccessToken();
    //console.log('accessToken', accessToken);

    let headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + accessToken);
    headers.append('CommandToken', this.commandToken);
    let options = new RequestOptions({headers: headers});

    let postParams = { // none required
    };

    this.http.post(`https://eurismartoffice.azurewebsites.net/api/Door/${action}/${name}`, postParams, options)
      .subscribe(data => {
        console.log(`sendDoorCommand ${action} ${name} response:`, data);
      }, error => {
        console.log('Error:', error);
      });
  }

  public get name() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims['given_name'];
  }

  public get claims() {
    let claims = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims;
  }

}
