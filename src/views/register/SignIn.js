import React from 'react';
import { Text, View, ImageBackground,ScrollView, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import styles from './RegisterViewStyles';
import RegisterInput from './RegisterInputField';

const PHONE = 'phone';
const EMAIL = 'mail';
const PASSWORD = 'password';

class SignInView extends React.Component {
    constructor(props) {
      super(props);
  
      this.focusNextField = this.focusNextField.bind(this);

      this.inputs = {};
      this.state = {
          disabled: true,
          spinner: false,
          mail: null,
          phone: null,
          password: null,
          phoneValidate: false,
          passwordValidate: false,
          mailValidate: false
        };
    }
  
    focusNextField(id) {
      this.inputs[id].focus();
    }

    validField=(text,len) => { return text && text.length > len }

    validateMail = (value) => {
        disabled = !this.state.passwordValidate 
            this.setState({mail:value ,mailValidate:true, disabled:disabled})
        console.log(value);
    }

    validatePassword = (value) => {
        if (this.validField(value,3)){
            disabled = !this.state.mailValidate 
            this.setState({password:value, passwordValidate:true, disabled:disabled})
        }
        else
            this.setState({password:value, passwordValidate:false, disabled:true})
    }

    handlePress = async ()=>{
        this.setState({spinner: true})
        let user = {}
        user[EMAIL] = this.state.mail;
        user[PASSWORD] = this.state.password;
        //let login = await this.props.navigation.state.params.signInWithAnotherDevice(user);
        let login = await this.props.authorizeFirebase(user);
        if(!login)
            alert('מספר פלאפון או סיסמה לא נכונים')
        this.setState({spinner: false})

    }

    render() {
      return(
        <ImageBackground style={styles.background} source={require('../../images/backGround.jpg')}>
        <ScrollView horizontal={false} style={{flex:1}}>
        <KeyboardAvoidingView
        style={styles.topContainer}
        behavior="padding">
            <View style={{height:100}}/>
            <View style={styles.userView}>
                <Text style={styles.title}>התחברות</Text>
            </View>
        </KeyboardAvoidingView>
            <RegisterInput placeholder='מייל'
                value={''}
                keyboardType='email-address'
                ref={input => {this.inputs[EMAIL] = input;}}
                onChangeText={(value) => this.validateMail(value)}
                onSubmitEditing={() => {this.focusNextField(PASSWORD);}}
                //iconName='phone-square'
                />
            <RegisterInput placeholder='סיסמה (לפחות 4 תווים)'
                value={''}
                keyboardType='phone-pad'
                ref={input => {this.inputs[PASSWORD] = input;}}
                onChangeText={(value) => this.validatePassword(value)}
                onSubmitEditing={() => {this.focusNextField(EMAIL);}}
                iconName='shield'/>
            <View style={[styles.buttonsContainer,{marginTop:25}]}>
                <TouchableOpacity
                    rounded
                    disabled={this.state.disabled} 
                    style={[styles.registerButton, this.state.disabled ? { backgroundColor:'#c6c6c6'} : { }] }
                    onPress={ async() => {await this.handlePress()}}
                    >
                    {
                    !this.state.spinner ?
                    <Text style={[styles.registerButtonText,{padding:3,fontSize:26}]}>התחבר</Text>
                    :
                    <ActivityIndicator size='large' color='#fff'/> 
                    }
                </TouchableOpacity>
            </View>
        </ScrollView>
        </ImageBackground>
    );}
};

export default SignInView;