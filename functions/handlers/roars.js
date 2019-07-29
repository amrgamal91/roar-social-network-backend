const { db } = require("../util/admin");

/**
 * gets all roars from the db
 */
exports.getAllRoars = (req, res) => {
  db.collection("roars")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let roars = [];
      data.forEach(doc => {
        roars.push({
          roarId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });
      return res.json(roars);
    })
    .catch(err => console.error(err));
};

/**
 * post one roar : add one roar record in db
 */
exports.postOneRoar = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }
  const newRoar = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("roars")
    .add(newRoar)
    .then(doc => {
      const resRoar = newRoar;
      resRoar.roarId = doc.id;
      res.json(resRoar);
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

/**
 * retrieve a roar from db
 */
exports.getRoar = (req, res) => {
  let roarData = {};
  db.doc(`/roars/${req.params.roarId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Roar not found " });
      }
      roarData = doc.data();
      roarData.roarId = doc.id;
      return (
        db
          .collection("comments")
          // .orderBy("createdAt", "desc")
          .where("roarId", "==", req.params.roarId)
          .get()
      );
    })
    .then(data => {
      roarData.comments = [];
      data.forEach(doc => {
        // console.log("here are the data:" + doc.data());
        roarData.comments.push(doc.data());
      });
      return res.json(roarData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

/**
 * add a comment to roar:
 * a- update comment counter in roars table
 * b- add comment to comments table
 */
exports.commentOnRoar = (req, res) => {
  if (req.body.body.trim() == "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    roarId: req.params.roarId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/roars/${req.params.roarId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Roar not found " });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

/**
 * likes a roar :
 * a- get like document from likes collection (to check later if roar is already liked)
 * b- get roar document from roars collection (to increment the likes counter & get roar details)
 * c- if like document is empty then add a new doc in likes collection
 * d- then increment the likes counter in roar document
 */
exports.likeRoar = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("roarId", "==", req.params.roarId)
    .limit(1);

  const roarDocument = db.doc(`/roars/${req.params.roarId}`);

  let roarData = {};
  roarDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        roarData = doc.data();
        roarData.roarId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "roar not found " });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            roarId: req.params.roarId,
            userHandle: req.user.handle
          })
          .then(() => {
            roarData.likeCount++;
            return roarDocument.update({ likeCount: roarData.likeCount });
          })
          .then(() => {
            return res.json(roarData);
          });
      } else {
        return res.status(400).json({ error: "Roar is already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

/**
 * unlikes a roar :
 * a- get like document from likes collection (to check later if roar is already liked)
 * b- get roar document from roars collection (to increment the likes counter & get roar details)
 * c- if like document is empty then it is not liked
 * d- else , delete its record from likes collection and decrement likes counter in roars
 */
exports.unlikeRoar = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("roarId", "==", req.params.roarId)
    .limit(1);

  const roarDocument = db.doc(`/roars/${req.params.roarId}`);

  let roarData;

  roarDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        roarData = doc.data();
        roarData.roarId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Roar not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Roar not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            roarData.likeCount--;
            return roarDocument.update({ likeCount: roarData.likeCount });
          })
          .then(() => {
            res.json(roarData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

/**
 * deletes a roar from roars collection
 * a- gets the roar from roars collection from db
 * b- check if user is authorized to delete (owner of roar)
 * c- delete the doc
 */
exports.deleteRoar = (req, res) => {
  const document = db.doc(`/roars/${req.params.roarId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Roar not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Roar deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
