import { createMachine, assign, interpret } from 'xstate'

// * ACTIONS

const lessRetry = assign({ retries: (ctx) => --ctx.retries })

const setAuth = assign({
  auth: (_, e) =>
    new e.data({
      apiKey: 'AIzaSyD1He65L5JadgzFlgQ7aVGNpyPb5Yh6R38',
      redirectUri: 'http://localhost:3000',
    }),
})

const setUserId = assign({ userId: (_, e) => e.data.userId })

function onAuthorizationSuccess() {
  document.documentElement.classList.add('signed-in')
  // window.localStorage.setItem(LocalStorage.HAS_SIGNED_IN, "true");
  // window.___logUser(uid);
}

function onAuthorizationError() {
  // document.documentElement.classList.remove('signed-in')
  // window.localStorage.removeItem(LocalStorage.HAS_SIGNED_IN)
}

function redirect(_, e) {
  console.log('redirect', e.data.redirect)
  // window.location.assign("/");
}

function onSendSignInLinkSuccess() {}

const handleError = assign({
  message: (_, e) => e.data.message,
})

// * GUARDS

function isSignedIn(_, e) {
  return !!e.data.userId
}

function shouldRetry(ctx) {
  return ctx.retries > 0
}

function initializeAuth() {
  return import(
    /* webpackPreload: true, webpackChunkName: "firebase" */ 'firebase-auth-lite'
  ).then((module) => module.default)
}

// * SERVICES

function getUser({ auth }) {
  return new Promise((resolve) => {
    const unlisten = auth.listen((user) => {
      unlisten()
      resolve({ userId: user?.localId })
    })
  })
}

function senOobCode({ auth }, e) {
  // window.localStorage.setItem("redirect_to", "/");

  return auth.sendOobCode('EMAIL_SIGNIN', e.email)
}

function handleSignInRedirect({ auth }) {
  const redirect = window.localStorage.getItem('redirect_to') || '/'

  return new Promise((resolve, reject) => {
    const unlisten = auth.listen((user) => {
      unlisten()
      user
        ? resolve({ userId: user.localId, redirect })
        : reject(new Error('Authentication failed!'))
    })

    auth.handleSignInRedirect()

    setTimeout(() => reject(new Error('Time out!')), 5000)
  })
}

function signOut({ auth }) {
  // window.___log('sign out')
  // window.localStorage.removeItem(LocalStorage.HAS_SIGNED_IN)

  return auth.signOut()
}

const authenticationMachine = createMachine({
  id: 'authentication',
  initial: 'initial',
  context: {
    message: null,
    auth: null,
    userId: null,
  },
  states: {
    initial: {
      invoke: {
        src: initializeAuth,
        onDone: { actions: [setAuth], target: 'getUser' },
        onError: { target: 'unauthorized' },
      },
    },
    getUser: {
      // entry: [lessRetry],
      invoke: {
        src: getUser,
        onDone: [
          {
            cond: isSignedIn,
            actions: [setUserId],
            target: 'authorized',
          },
          { target: 'unauthorized' },
        ],
        onError: [
          {
            // cond: "shouldRetry",
            target: 'getUser',
          },
          { actions: [handleError], target: 'unauthorized' },
        ],
      },
    },
    authorized: {
      initial: 'idle',
      entry: [redirect, onAuthorizationSuccess],
      states: {
        idle: {
          on: {
            SIGN_OUT: { target: 'signOut' },
          },
        },
        signOut: {
          invoke: {
            src: signOut,
            onDone: { target: '#authentication.unauthorized' },
            onError: { target: '#authentication.unauthorized' },
          },
        },
      },
    },
    unauthorized: {
      initial: 'idle',
      entry: [onAuthorizationError],
      states: {
        idle: {
          on: {
            SEND_SIGNIN_LINK: { target: 'senOobCode' },
            HANDLE_SIGNIN_REDIRECT: { target: 'handleSignInRedirect' },
          },
        },
        senOobCode: {
          invoke: {
            src: senOobCode,
            onDone: { actions: [onSendSignInLinkSuccess], target: 'idle' },
            onError: { actions: [handleError], target: 'idle' },
          },
        },
        handleSignInRedirect: {
          invoke: {
            src: handleSignInRedirect,
            onDone: {
              actions: [setUserId],
              target: '#authentication.authorized',
            },
            onError: { actions: [handleError], target: 'idle' },
          },
        },
      },
    },
  },
})

export const authenticationService = interpret(authenticationMachine).start()
export default authenticationMachine

// if (typeof window === "object") {
//   authenticationService.onTransition((state) =>
//     console.log("state", state.value)
//   );
//   window.authSend = authenticationService.send;
// }
