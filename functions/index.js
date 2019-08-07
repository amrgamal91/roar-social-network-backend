const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

/**
 * package for providing a Connect/Express middleware
 * that can be used to enable CORS with various options
 */
const cors = require("cors");
app.use(cors());

const {
  getAllRoars,
  postOneRoar,
  getRoar,
  commentOnRoar,
  unlikeRoar,
  likeRoar,
  deleteRoar
} = require("./handlers/roars");

const {
  signup,
  handleSocialUser,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require("./handlers/users");

//roar routes
app.get("/roars", getAllRoars);
app.post("/roar", FBAuth, postOneRoar);
app.get("/roar/:roarId", getRoar);
app.delete("/roar/:roarId", FBAuth, deleteRoar);
app.get("/roar/:roarId/unlike", FBAuth, unlikeRoar);
app.get("/roar/:roarId/like", FBAuth, likeRoar);
app.post("/roar/:roarId/comment", FBAuth, commentOnRoar);

//users routes
app.post("/signup", signup);
app.post("/handleSocialUser", handleSocialUser);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

//events
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/roars/${snapshot.data().roarId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            roarId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.deleteNotificationOnUnLike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/roars/${snapshot.data().roarId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            roarId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("roars")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const roar = db.doc(`/roars/${doc.id}`);
            batch.update(roar, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

/**
 * when delete roar :
 * get all comments on this roar
 * get all likes of this roar
 * get all notifications of this roar
 * gather all the above in one batch
 * delete every record on the batch
 */
exports.onRoarDelete = functions.firestore
  .document("/roars/{roarId}")
  .onDelete((snapshot, context) => {
    const roarId = context.params.roarId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("roarId", "==", roarId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("roarId", "==", roarId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("roarId", "==", roarId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
