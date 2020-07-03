
document.getElementById('sign-up').addEventListener('click', () => { handleSignUp() })
// document.getElementById('back').addEventListener('click',()=>window.location.href = "index.html")

var errorCode = ''
/**
 *
 *
 */
function handleSignUp () {
  var email = document.getElementById('email').value
  var password = document.getElementById('password').value
  if (email.length < 4) {
    alert('Please enter an email address.')
    return
  }
  const regExpDNI = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  if (!regExpDNI.test(password)) {
    alert('Please enter a password with at least eight characters, one letter and one number.')
    return
  }
  // Create user with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
    // Handle Errors here.
    errorCode = error.code
    var errorMessage = error.message
    // [START_EXCLUDE]
    if (errorCode === 'auth/weak-password') {
      alert('The password is too weak.')
    } else {
      alert(errorMessage)
    }
    console.log(error)
    // [END_EXCLUDE]
  })
  // [END createwithemail]
}
