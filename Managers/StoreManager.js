(function () {
  'use strict';
}());

import { AsyncStorage } from 'react-native';

export default class StoreManager {

  constructor() {

  }

  async retrieveItem(key) {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      throw Error(error);
    }
  }

  async storeItem(key, item) {
    try {
        var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        return jsonOfItem;
    } catch (error) {
      throw Error(error);
    }
  }
}
