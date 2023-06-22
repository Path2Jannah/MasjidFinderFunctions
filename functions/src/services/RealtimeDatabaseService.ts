/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import * as admin from "firebase-admin";

export class RealtimeDatabaseService {
  private database: admin.database.Database;

  constructor() {
    this.database = admin.database();
  }

  public async getValue(path: string): Promise<any> {
    try {
      const snapshot = await this.database.ref(path).once("value");
      return snapshot.val();
    } catch (error) {
      console.error("Error fetching value:", error);
      throw error;
    }
  }

  public async setValue(path: string, value: any): Promise<void> {
    try {
      await this.database.ref(path).set(value);
    } catch (error) {
      console.error("Error setting value:", error);
      throw error;
    }
  }

  public async updateValue(path: string, updates: any): Promise<void> {
    try {
      await this.database.ref(path).update(updates);
    } catch (error) {
      console.error("Error updating value:", error);
      throw error;
    }
  }

  public async deleteValue(path: string): Promise<void> {
    try {
      await this.database.ref(path).remove();
    } catch (error) {
      console.error("Error deleting value:", error);
      throw error;
    }
  }
}

export default RealtimeDatabaseService;
