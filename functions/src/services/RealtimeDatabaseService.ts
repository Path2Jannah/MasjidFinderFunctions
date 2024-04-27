/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import * as admin from "firebase-admin";

export class RealtimeDatabaseService {
  private database: admin.database.Database;

  constructor(database: admin.database.Database) {
    this.database = database;
  }

  /**
   * This method adds data to the specified path.
   * Depending if the data is already populated at the specified path,
   *  it will either add the data or update it.
   * @param path {string} The specified path in the dB.
   * @param data {any} The data that needs to be added to the dB
   */
  async addData(path: string, data: any) {
    if (await this.isPathPopulated(path)) {
      this.updateValue(path, data);
    } else {
      this.addData(path, data);
    }
  }

  async getValue(path: string): Promise<any> {
    try {
      const snapshot = await this.database.ref(path).once("value");
      return snapshot.val();
    } catch (error) {
      console.error("Error fetching value:", error);
      throw error;
    }
  }

  async setValue(path: string, value: any): Promise<void> {
    try {
      await this.database.ref(path).set(value);
    } catch (error) {
      console.error("Error setting value:", error);
      throw error;
    }
  }

  async updateValue(path: string, updates: any): Promise<void> {
    try {
      await this.database.ref(path).update(updates);
    } catch (error) {
      console.error("Error updating value:", error);
      throw error;
    }
  }

  async deleteValue(path: string): Promise<void> {
    try {
      await this.database.ref(path).remove();
    } catch (error) {
      console.error("Error deleting value:", error);
      throw error;
    }
  }

  async isPathPopulated(path: string): Promise<boolean> {
    const snapshot = await this.database.ref(path).once("value");
    return snapshot.exists() && (snapshot.val() != null);
  }
}

export default RealtimeDatabaseService;
