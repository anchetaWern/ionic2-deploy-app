import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';

import { AlertController, LoadingController } from 'ionic-angular';
import { Deploy } from '@ionic/cloud-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public deploy: Deploy, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
    platform.ready().then(() => {

      statusBar.styleDefault();
      splashScreen.hide();

      this.deploy.channel = 'dev';


      this.deploy.getSnapshots().then((snapshots) => {
        console.log('now getting snapshots...');
        console.log(snapshots);
        window.snaps = snapshots;
      });


      this.deploy.check().then((snapshotAvailable: boolean) => {
        if (snapshotAvailable) {

          this.deploy.getMetadata().then((metadata) => {
            console.log('now getting metadata2..');
            console.log(metadata);

            let alert = this.alertCtrl.create({
              title: 'Version ' + metadata.version + ' is available',
              message: 'Do you want to download this update?',
              buttons: [
                {
                  text: 'No',
                  role: 'cancel',
                  handler: () => {

                  }
                },
                {
                  text: 'Yes',
                  handler: () => {

                    this.deploy.download().then(() => {

                      console.log('download completed!');

                      let loading = this.loadingCtrl.create({
                        content: 'Now reloading the app...'
                      });

                      loading.present();

                      this.deploy.extract().then(() => {
                        console.log('extract completed!');
                        this.deploy.load();

                        console.log('reload completed!');
                        loading.dismiss();

                      });
                    });

                  }
                }
              ]
            });

            alert.present();

          });

        }
      });

    });
  }
}
