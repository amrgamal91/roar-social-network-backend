/**
 * @param {string to check if it is empty or not} str
 * trim(): removes spaces from the string
 */
const isEmpty = str => {
  if (str.trim() === "") return true;
  else return false;
};

/**
 * @param {string to check if it matches email pattern} email
 */
const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

/**
 * @param {signupData to be validated} data
 * data to be validated :
 *  1- email : check if empty & valid email address
 *  2- password : check if empty or not
 *  3- confirmPassword : check if it matches the password
 *  4- handle : check if it is empty
 */
exports.validateSignupData = data => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Must not be Empty ";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match ";
  if (isEmpty(data.handle)) errors.handle = "Must not be empty";

  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};

/**
 * @param {loginData to be validated} data
 * 1- email : check if it is empty
 * 2- password : check if it is empty
 */
exports.validateLoginData = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = "Must not be empty ";
  if (isEmpty(data.password)) errors.password = "Must not be empty ";
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};

/**
 * @param {data in the request} data
 * set the user details object to be inserted in db
 */
exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    //https://website.com
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;
  return userDetails;
};
