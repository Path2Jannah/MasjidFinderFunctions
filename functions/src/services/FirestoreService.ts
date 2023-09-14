/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import * as admin from "firebase-admin";

// Define a FirestoreService class
export class FirestoreService {
  private collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(firestore: admin.firestore.Firestore, collectionName: string) {
    this.collection = firestore.collection(collectionName);
  }

  // Add a document to the collection
  public async addDocument(document: FirebaseFirestore.DocumentData): Promise<string> {
    const docRef = await this.collection.add(document);
    return docRef.id;
  }

  public async addDocumentWithID(documentId: string, document: FirebaseFirestore.DocumentData) {
    const docRef = await this.collection.doc(documentId);
    docRef.set(document).then(() => {
      console.log("Success");
    }).catch(() => {
      console.error("Failed");
    });
  }

  // Get a document by its ID
  public async getDocumentById(documentId: string): Promise<FirebaseFirestore.DocumentData> {
    const documentSnapshot = await this.collection.doc(documentId).get();
    if (documentSnapshot.exists) {
      return documentSnapshot;
    } else {
      throw Error;
    }
  }

  public async getCollection(): Promise<FirebaseFirestore.DocumentData[]> {
    const collectionSnapshot = await this.collection.get();
    const data = collectionSnapshot.docs.map((doc) => doc.data());
    return data;
  }

  // Update a document by its ID
  public async updateDocument(documentId: string, updateData: FirebaseFirestore.UpdateData): Promise<void> {
    await this.collection.doc(documentId).update(updateData);
  }

  // Delete a document by its ID
  public async deleteDocument(documentId: string): Promise<void> {
    await this.collection.doc(documentId).delete();
  }
}

export default FirestoreService;
