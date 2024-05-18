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
  async addDocument(document: FirebaseFirestore.DocumentData): Promise<string> {
    const docRef = await this.collection.add(document);
    return docRef.id;
  }

  getNewDocumentRef(documentId?: string) {
    return documentId ? this.collection.doc(documentId) : this.collection.doc();
  }

  async addDocumentWithID(documentId: string, document: FirebaseFirestore.DocumentData): Promise<boolean> {
    const docRef = await this.collection.doc(documentId);
    docRef.set(document).finally(() => {
      return true;
    }).catch(() => {
      return false;
    });
    return false;
  }

  // Get a document by its ID
  async getDocumentById(documentId: string): Promise<FirebaseFirestore.DocumentData> {
    const documentSnapshot = await this.collection.doc(documentId).get();
    if (documentSnapshot.exists) {
      return documentSnapshot;
    } else {
      throw Error;
    }
  }

  async getCollection(): Promise<FirebaseFirestore.DocumentData[]> {
    const collectionSnapshot = await this.collection.get();
    const data = collectionSnapshot.docs.map((doc) => doc.data());
    return data;
  }

  async getCollectionWithId(): Promise<Hadith[]> {
    const collectionSnapshot = await this.collection.get();
    const data = collectionSnapshot.docs.map((doc) => {
      const docData = doc.data();
      console.log("Document:", docData);
      return {
        id: parseInt(doc.id),
        chapterId: docData.chapter_id,
        chapterTitle: docData.chapter_title,
        chapterNumber: docData.chapter_num,
        bookNumber: docData.book_number,
        hadithNumber: docData.hadithNumber,
        text: docData.text,
      } as Hadith;
    });
    return data;
  }

  async getHadithCollectionWithId(collectionId: number, bookNumber: number): Promise<Hadith[]> {
    const collectionSnapshot = await this.collection.get();
    const data = collectionSnapshot.docs.map((doc) => {
      const docData = doc.data();
      console.log("Document:", docData);
      return {
        id: collectionId,
        chapterId: docData.chapter_id,
        chapterTitle: docData.chapter_title,
        chapterNumber: docData.chapter_num,
        bookNumber: bookNumber,
        hadithNumber: doc.id,
        text: docData.text,
      } as Hadith;
    });
    return data;
  }

  async getBookNumbers(collectionId: number): Promise<number[]> {
    const collectionSnapshot = await this.collection.get();
    const data = collectionSnapshot.docs.map((doc) => parseInt(doc.id));
    return data;
  }

  getListOfDocuments() {
    return this.collection.listDocuments;
  }

  // Update a document by its ID
  async updateDocument(documentId: string, updateData: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>): Promise<void> {
    await this.collection.doc(documentId).update(updateData);
  }

  async addToNode(documentId: string, value: FirebaseFirestore.DocumentData) {
    await this.collection.doc(documentId).set(value, {merge: true});
  }

  // Delete a document by its ID
  async deleteDocument(documentId: string): Promise<void> {
    await this.collection.doc(documentId).delete();
  }
}

export default FirestoreService;
