// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth())

ui.start('#firebaseui-auth-container', {
  signInSuccessUrl: 'index.html',
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
    },
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ]
  // Other config options...
})

// firebase.auth().languageCode = 'it';
// To apply the default browser preference instead of explicitly setting it.
firebase.auth().useDeviceLanguage()

window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
  size: 'invisible'

})
