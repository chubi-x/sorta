import firebase from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
dotenv.config();
const app = firebase.initializeApp({
  credential: firebase.credential.cert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS!,
  ),
  databaseURL: process.env.DATABASE_URL!,
});

const cloudStorage = getStorage(app);
let cloudStorageBucket;
try {
  cloudStorageBucket = cloudStorage.bucket(
    `${process.env.GOOGLE_CLOUD_BUCKET!}`,
  );
} catch (e) {
  console.error("Error initialising cloud storage: \n", e);
}
export const usersRef = firebase.database(app).ref("sorta/users");

export const bookmarksRef = firebase
  .database(app)
  .ref("sorta/users/all-bookmarks");
export { cloudStorageBucket };
