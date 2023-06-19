import * as admin from 'firebase-admin';

// Define a FirestoreService class
export class FirestoreService {
  private collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(firestore: admin.firestore.Firestore,collectionName: string) {
    this.collection = firestore.collection(collectionName);
  }

  // Add a document to the collection
  public async addDocument(document: FirebaseFirestore.DocumentData): Promise<string> {
    const docRef = await this.collection.add(document);
    return docRef.id;
  }

  // Get a document by its ID
  public async getDocumentById(documentId: string): Promise<FirebaseFirestore.DocumentData | null> {
    const documentSnapshot = await this.collection.doc(documentId).get();
    if (documentSnapshot.exists) {
      return documentSnapshot;
    } else {
      return null;
    }
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