import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { EuricomOfficeControl } from './app.component';
import { HomePage } from '../pages/home/home';
import { LogPage } from '../pages/log/log';

@NgModule({
  declarations: [
    EuricomOfficeControl,
    HomePage,
    LogPage
  ],
  imports: [
    IonicModule.forRoot(EuricomOfficeControl)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    EuricomOfficeControl,
    HomePage,
    LogPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
