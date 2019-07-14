//checks if the string is empty
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

//check if the string matches the email pattern
const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

//validate all signup data
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

// validates the login data
exports.validateLoginData = data => {
  let errors = {};
  if (isEmpty(user.email)) errors.email = "Must not be empty ";
  if (isEmpty(user.password)) errors.password = "Must not be empty ";
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};
