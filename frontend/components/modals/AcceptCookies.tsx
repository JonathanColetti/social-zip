
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native'
import React from 'react'
import { shadowStyle } from '../../components/lib/Shadow';
import { Button } from 'react-native-paper';
import { UseTheStorage } from '../../components/lib/Storage';

const SCREEN_WIDTH: number = Dimensions.get('window').width;
const SCREEN_HEIGHT: number = Dimensions.get('window').height;

export default function AcceptCookies({setVisible}: {setVisible: any}): JSX.Element {
    const acceptedCookies = async () => {
        await UseTheStorage('cookies', 'true');
        setVisible(false);
    } 
    return (
        <View style={styles.container}>
            <View style={styles.headerStyle}>
                <Text style={styles.headerText}>Accept Cookies</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={{textAlign: 'center'}}>We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.</Text>
                <View style={styles.buttonView}>
                    <Button onPress={acceptedCookies} buttonColor='black' style={styles.submitButtonStyle} mode='contained'>Accept Cookies</Button>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: SCREEN_WIDTH / 36,
        marginTop: SCREEN_HEIGHT / 3,
        ...shadowStyle(),
    },

    contentContainer: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginHorizontal: '10%',
    },
    starContainerStyle: {
        marginTop: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        justifyContent: 'center',
        textAlignVertical: 'center',
        textAlign: 'center',
        
    },
    headerStyle: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
    },
    submitButtonStyle: {
        marginTop: 10,  
    },
    buttonView: {
        paddingBottom: 10,
    }
})