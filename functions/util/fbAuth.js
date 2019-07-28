const { admin, db } = require("./admin");

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {calls the next route handler that matches the current route path} next
 * 1- check if the header in the request contains token or not
 *    a- if yes , get the token
 *    b- else , raise error & set forbidden status in the response
 * 2- verify that this token is ours
 *    a- call verifyIdToken method of auth() module of firebase
 *    b- get data of the user from db
 *    c- set some attributes to request user
 *    d- call the next method which calls the next route handler match the route path
 * 3- handle errors
 */

module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found ");
    return res.status(403).json({ error: "Unauthorized" });
  }

  //verify that this token is ours
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next(); //used to call the next route handler match the route path.
    })
    .catch(err => {
      console.error("Error while verifying token ", err);
      return res.status(400).json(err);
    });
};
