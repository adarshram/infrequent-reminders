import { Subscription } from "@unimodules/core";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import React, { useEffect, useRef, useState, useContext } from "react";
import {
    Image,
    Platform,
    ScrollView,
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
    Pressable,
} from "react-native";
import useFbaseAuthUser from "../hooks/useFbaseAuthUser";
import { UserContext } from "../models/UserContext";
import { Button, TextInput, Card, Snackbar } from "react-native-paper";
export default function Login() {
    const userObject = useContext(UserContext);

    const { user, actions, authErrors } = userObject;
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const isLoading = false;
    const onGoogleSignin = async () => {
        await actions.googleSignin();
    };
    const onEmailSignin = async () => {
        await actions.signInWithEmailAndPassword(email, password);
        try {
            return true;
        } catch (e) {
            console.log(e.message);
            return false;
        }
        return false;
    };
    //Already Logged in
    if (user) {
        return "";
    }

    return (
        <View>
            {authErrors.length > 0 && (
                <>
                    {authErrors.map((error, key) => (
                        <Text key={key}>{error}</Text>
                    ))}
                </>
            )}
            {!user && (
                <>
                    <Text>Login Page</Text>
                    <Card>
                        <Card.Title title="Login With Email" subtitle="" />
                        <Card.Content>
                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                            />
                            <TextInput
                                label="Password"
                                value={password}
                                secureTextEntry={true}
                                onChangeText={(text) => setPassword(text)}
                            />
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                icon="login"
                                mode="contained"
                                onPress={onEmailSignin}
                            >
                                Login With Email
                            </Button>
                        </Card.Actions>
                    </Card>
                    <Card>
                        <Card.Title title="Login With Google" subtitle="" />
                        <Card.Content>
                            <Button
                                icon="google"
                                mode="contained"
                                onPress={onGoogleSignin}
                            >
                                Login With Google
                            </Button>
                        </Card.Content>
                    </Card>
                </>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        alignSelf: "center",
        fontSize: 24,
        marginTop: 8,
        marginBottom: 40,
    },
    textLabel: {
        fontSize: 16,
        color: "#444",
    },
    textInput: {
        fontSize: 20,
        padding: 8,
        marginVertical: 8,
        borderColor: "black",
        borderWidth: 1,
    },
    button: {
        backgroundColor: "#3256a8",
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        minHeight: 56,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "600",
        color: "white",
    },
    validator: {
        color: "red",
        fontSize: 18,
        marginTop: 8,
    },
});
