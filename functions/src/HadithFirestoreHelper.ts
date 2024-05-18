import { Storage, Bucket } from "@google-cloud/storage";
import FirestoreService from "./services/FirestoreService";
import * as admin from "firebase-admin";

export class HadithFirestoreHelper {
    private firestoreDatabase: admin.firestore.Firestore;
    public storage: Bucket = new Storage().bucket("gs://masjidfinder-bb912.appspot.com");
    public hadithCollectionsdB: FirestoreService;

    constructor(firestore: admin.firestore.Firestore) {
        this.firestoreDatabase = firestore;
        this.hadithCollectionsdB = new FirestoreService(this.firestoreDatabase, "/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers");
    }

    async saveHadithCollections(res: any) {
        const fileName = "hadith_collections.json";
        console.log(`Looking for ${fileName}`);
        const file = this.storage.file(fileName);

        try {
            const [fileData] = await file.download();
            const jsonData = JSON.parse(fileData.toString());

            jsonData.data.forEach(async (hadith: Collections) => {
                const documentObject = {
                    name: hadith.name,
                    short_intro: hadith.shortIntro,
                    title: hadith.title,
                    total_hadith: hadith.totalHadith,
                };

                const collectionId = hadith.id.toString();

                await this.hadithCollectionsdB.addDocumentWithID(collectionId, documentObject);
            });

            console.log(jsonData);
            res.send("Success").status(200);
        } catch (err: any) {
            console.error("Error parsing JSON:", err);
            res.send(err.toString()).status(401);
        }
    }
}

export default HadithFirestoreHelper;