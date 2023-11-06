/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Appearance,
  useWindowDimensions,
  Pressable,
  PermissionsAndroid,
  StatusBar
} from "react-native";
import SignInScreen from "./src/screens/SignInScreen";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import LinearGradient from "react-native-linear-gradient";
import Logo from "./assets/images/scaler_logo.svg";
import SignInWithGoogle from "./src/components/SignInWithGoogle/SignInWithGoogle";
import SignInWithMicrosoft from "./src/components/SignInWithMicrosoft";
import HavingTrouble from "./src/components/HavingTrouble";
import GoogleLogo from "./assets/images/google_logo.svg";
import MicrosoftLogo from "./assets/images/microsoft_logo.svg";
import DeviceInfo from "react-native-device-info";
import GetLocation from 'react-native-get-location';

export default function App(): JSX.Element {

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('Anonymous');
  const [did, setdid] = useState("");
  const [userLat, setUserLat] = useState(0);
  const [userLong, setUserLong] = useState(0);
  const [userCord, setUserCord] = useState([]);



  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const {height} = useWindowDimensions();

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      if(userLoggedIn) {
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

   function markAttendance() {
    const UserToBeMarked = {
      uid: did
    };

    console.log('Marking Attendance for :  ', UserToBeMarked);

     GetLocation.getCurrentPosition({
       enableHighAccuracy: true,
       timeout: 30000,
       rationale: {
         title: 'Location permission',
         message: 'The app needs the permission to request your location.',
         buttonPositive: 'Ok',
       },
     })
       .then(newLocation => {
         // setUserLat(newLocation.latitude);
         // setUserLong(newLocation.longitude);
         setUserCord([...userCord, newLocation.latitude+","+newLocation.longitude+"\n"]);
       })
       .catch(ex => {
         console.log(ex);
       });



  }



  if (userLoggedIn) {

    return (
    <View>
      <StatusBar animated={true} backgroundColor="#1a1a1a" />

      <LinearGradient colors={['#5B5ABE', '#6D73FB', '#85A0FF']} style={{height: '100%'}} >

        <Text>
          Hello {userEmail},
        </Text>

        <Button title='Mark Attendance' onPress={markAttendance} />

        <Text>
          {userCord}
        </Text>


      </LinearGradient>
    </View>
    );
  } else {

    DeviceInfo.getUniqueId().then((uniqueId) => {
      setdid(uniqueId);
    });


    async function LoginWithGoogleNow() {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const userEmail = userInfo.user.email;
        const domain_name_provider = userEmail?.split('@')[1];
        if(domain_name_provider == "sst.scaler.com") {
          const UserToLogin = {
            email: userEmail,
            uid: did,
          };

          console.log(userEmail);
          console.log(did);

          let statCode = 400;

          fetch('http://10.104.124.95:8000/attendance/register/', {
            method: 'POST',
            body: JSON.stringify(UserToLogin),
          })
            .then(response => {
              // Handle the response
              if (response.status == 200) {
                statCode = 200;
              } else {
                throw new Error('Network response was not ok.');
              }
            })
            .then(data => {
              // User allowed login
              statCode = 200;

              if(statCode == 200) {
                setUserLoggedIn(true);
                setUserEmail(userEmail);
              } else {
                console.log("Some error at backend");
                signOut();
              }
            })
            .catch(error => {
              statCode = 400;
            });
        }
        else {
          console.log('User Not authorised to signin');
          signOut();
        }


      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('SIGN IN CANCELLED');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log('SIGNING IN');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('PLAY SERVICES NOT AVAILABLE');
        } else {
          console.log(error);
        }
      }
    }

    // @ts-ignore
    return (
      <View>

        <StatusBar animated={true} backgroundColor="#5B5ABE" />

        <LinearGradient colors={['#5B5ABE', '#6D73FB', '#85A0FF']} style={{height: '100%'}} >



          <View style={styles.root}>
            <Logo size={height * 0.4} style={styles.logo} />
          </View>

          <View style={[styles.atBottom]}>

            {/*<Text>*/}
            {/*  {did}*/}
            {/*</Text>*/}

            <Pressable style={googlestyles.container} onPress={LoginWithGoogleNow}>
              <GoogleLogo
              />

              <Text style={googlestyles.data}>
                Login with Google
              </Text>
            </Pressable>

            <Pressable style={msstyles.container}>
              <MicrosoftLogo
              />

              <Text style={msstyles.data}>
                Login with Microsoft
              </Text>
            </Pressable>

            <HavingTrouble />

          </View>

        </LinearGradient>
      </View>
    );

  }
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    maxWidth: 300,
    maxHeight: 100,
    marginVertical: '25%',
  },
  atBottom: {
    padding: 15,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: '3%',
  }
});

const googlestyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: '90%',
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  data: {
    color: '#333333',
    fontSize: 18,
    paddingLeft: 25,
    fontFamily: 'Alata Regular',
  },

});

const msstyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    width: '90%',
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  data: {
    color: '#cacaca',
    fontSize: 18,
    paddingLeft: 25,
    fontFamily: 'Alata Regular',
  },
});
