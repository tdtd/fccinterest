/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          name: 'Test User',
          email: 'test@example.com',
          password: 'test'
        },{
          provider: 'local',
          name: 'BooTooMyth',
          email: 'BooTooMyth@example.com',
          password: 'test'
        },{
          provider: 'local',
          name: 'BooThreeMyth',
          email: 'BooThreeMyth@example.com',
          password: 'test'
        },{
          provider: 'local',
          name: 'BooFourMyth',
          email: 'BooFourMyth@example.com',
          password: 'test'
        },{
          provider: 'local',
          name: 'DigDug',
          email: 'DigDug@example.com',
          password: 'test'
        },{
          provider: 'local',
          name: 'DigDugger',
          email: 'DigDugger@example.com',
          password: 'test'
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          password: 'admin'
        })
        .then(() => console.log('finished populating users'))
        .catch(err => console.log('error populating users', err));
      });
  }
}
