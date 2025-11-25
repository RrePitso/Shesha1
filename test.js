
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore();

try {
  const docRef = await addDoc(collection(db, "mail"), {
    to: ['ofentsepitsopop@gmail.com', 'poppareallove@gmail.com', 'capt007hook@gmail.com'],
    message: {
      subject: `Order Update: -OeqvTu6hwOG3okYRm2e`,
      text: `The status of your order #-OeqvTu6hwOG3okYRm2e has been updated to: Testing`,
      html: `<p>The status of your order #-OeqvTu6hwOG3okYRm2e has been updated to: <strong>Testing</strong></p>`,
    },
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
