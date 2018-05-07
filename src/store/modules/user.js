import { Authorize } from "../../services";
import * as firebase from 'firebase';

const AUTHORIZE_REQ = "haprev/user/AUTHORIZE_REQ";
const AUTHORIZE_RES = "haprev/user/AUTHORIZE_RES";
const REGISTER_REQ = "haprev/user/REGISTER_REQ";
const REGISTER_RES = "haprev/user/REGISTER_RES";
const UPDATE_REQ = "haprev/user/UPDATE_REQ";
const UPDATE_RES = "haprev/user/UPDATE_RES";
const NO_USER_FOUND = "haprev/user/NO_USER_FOUND";
const SPLASH = "haprev/user/SPLASH";
const SET_MESSAGE_READ = "haprev/user/SET_MESSAGE_READ";

const initalState = {
  user: {},
  status: '',
  splashStatus:false,
  authStatus:''
};

export default (state = initalState, action = {}) => {
  switch (action.type) {
    case AUTHORIZE_REQ:
      return { ...state, authStatus: 'auth_request', user: {} };
    case AUTHORIZE_RES:
      return { ...state, authStatus: 'user', user: action.payload ,status:canProceed(state) }
    case REGISTER_REQ:
      return { ...state, authStatus: 'reg_request', user: {} };
    case REGISTER_RES:
      return { ...state, authStatus: 'user', user: action.payload ,status:canProceed(state) }
    case UPDATE_REQ:
      return { ...state, authStatus: 'update_request'};
    case UPDATE_RES:
      return { ...state, authStatus: 'user', user: action.payload ,status:canProceed(state) }
    case NO_USER_FOUND:
      return {...state,authStatus:'no_user',status:canProceed(state) }
    case SPLASH:
      return {...state, splashStatus: action.payload,status:canProceed(state)}
    case SET_MESSAGE_READ:
      return {...state,
              user: {
                ...state.user,
                messages: action.payload  
              } 
           };
    default:
      return state;
  }
};

const authReq = appId => ({
  type: AUTHORIZE_REQ,
  payload: appId
});

const authRes = data => {
  let tmpRes = {};
  if (data)
    tmpRes = {
      type: AUTHORIZE_RES,
      payload: data
    };
  return tmpRes;
};

const noUserFound = () =>({
  type: NO_USER_FOUND
})

export const authorize = appId =>  dispatch  => {
  console.log('user.js: Authorizing')
  dispatch(authReq(appId))
  // firebase.database().ref('users/'+appId).once('value' ,
  // Is there any user associated with this appId? 
  firebase.database().ref('users').orderByChild('appId').equalTo(appId).once('value' , 
    snapshot => {
      let dbResList = snapshot.val()
      if (dbResList) {
        // Get the 1st response
        console.log('Query by appId:', dbResList)
        let userId = Object.keys(dbResList)[0]
        let dbRes = dbResList[userId]
        // Keep the key for later updates!!
        dbRes.userId = userId
        console.log('authorize found user by appId:', dbRes)
        dispatch (authRes(dbRes))
      } else {
        dispatch (noUserFound())
        console.log('handle user not found')
      }
  })
}

const canProceed = state =>{
  return  (!state.user.splashStatus && state.user.authStatus!='auth_request')
}

const registerReq = user => ({
  type: REGISTER_REQ,
  payload: user
})

const registerRes = data => {
  let tmpRes = {};
  if (data)
    tmpRes = {
      type: REGISTER_RES,
      payload: data
    }
  return tmpRes;
}

export const register = user =>  dispatch  => {
  console.log('Registering @ user.js: ', user)
  user.appId = Expo.Constants.deviceId
  let ref = firebase.database().ref('users')
  // Query by phone first...
  ref.orderByChild('phone').equalTo(user.phone).once('value' , 
    snapshot => {
      let dbResList = snapshot.val()
      if (dbResList) {
        // Assume that the user changed the device & we need to update
        let userId = Object.keys(dbResList)[0]
        user.userId = userId
        console.log('updating existing user:', user)
        update(user)(dispatch)
      } else { // New user
        dispatch(registerReq(user))
        user.userId = ref.push(user).key
        console.log('Register new user:', user)
        dispatch (registerRes(user))
      }
  })
}

const updateReq = user => ({
  type: UPDATE_REQ,
  payload: user
})

const updateRes = data => {
  let tmpRes = {};
  if (data)
    tmpRes = {
      type: UPDATE_RES,
      payload: data
    }
  return tmpRes;
}

export const update = user =>  dispatch  => {
  console.log('Updating profile @ user.js')
  dispatch(registerReq(user))
  let ref = firebase.database().ref('users/'+user.userId)
  ref.once('value', 
    snapshot => {
      // console.log('Register response', snapshot)
      let dbRes = snapshot.val()
      if (dbRes) {
        console.log(dbRes)
        dispatch (registerRes(dbRes))
      } else {
        console.log('handle user not found')
        dispatch (noUserFound())
      }
  })
  ref.update(user) 
}

export const splash = (display) => ({type:SPLASH , payload:display})  

const setMessagesRead = msgId => {
  return {
    type: SET_MESSAGE_READ,
    payload: msgId
  }
};

export const readMessage = msgId => async (dispatch,state)  => {
  messagesObj = state().user.user.messages;
  messagesArray = Object.keys(messagesObj).map(key => { return messagesObj[key] });
  currentMessages = messagesArray.filter(msg => { return msg.id !== msgId })
  await dispatch(setMessagesRead(currentMessages));

  let res = firebase.database().ref('users/'+state().user.user.appId).update({messages: state().user.user.messages})
    .then(() => {
      return 'ok'
    })
    .catch(error => {
      console.log('Data could not be saved.' + error);
      return 'err'
    });
  return res;  
};

export const setMessage = (msg,appId) => {
  // format msg -> {id: 'ek67', message: 'ההתנדבות ב 9.1 בבית חולים בלינסון בוטלה'}
  firebase.database().ref('users/'+appId+'/messages').push().set(msg);
}