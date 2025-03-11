const validate = (data) => {
  const errors = {};


  if (data?.firstName) {
    // Name validation (alphabets only, no spaces)
    const firstNameRegex = /^[A-Za-z\s]{3,}$/;
    const trimmedFirstName = data.firstName.trim();
    if (!trimmedFirstName ||!data.firstName || !firstNameRegex.test(data.firstName)) {
      errors.firstName =
        "Name should only contain alphabets and at least three alphabets";
    }
  }
  if (data?.lastName) {
    const lastNameRegex = /^[A-Za-z\s]{3,}$/;
    const trimmedLastName = data.lastName.trim();
    if (!trimmedLastName || !data.lastName || !lastNameRegex.test(data.lastName)) {
      errors.lastName =
        "Name should only contain alphabets and at least three alphabets";
    }
  }

  //   Phone number validation
  if (data?.phoneNumber) {
    // Phone number should be 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits.";
    }
  }

  // Email validation
  if (data?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = "Please provide a valid email address.";
    }
  }

  //   Password validation
  if (data?.password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!data.password || !passwordRegex.test(data.password)) {
      errors.password =
        "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.";
    }
  }

  return errors;
};

export default validate;
