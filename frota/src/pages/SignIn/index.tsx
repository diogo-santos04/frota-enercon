import React, { useState, useContext, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SignIn() {
    const { signIn, loadingAuth } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    async function handleLogin() {
        if (email === "" || password === "") return;

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        await signIn({ email, password });
    }

    return (
        <>
            <StatusBar backgroundColor="#1B1B1B" barStyle="light-content" />
            <LinearGradient 
                colors={["#1B1B1B", "#2A2A2A", "#1A365D", "#2D3748"]} 
                style={styles.container} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        
                        {/* Decorative Elements */}
                        <View style={[styles.decorativeCircle, { top: height * 0.1, right: width * 0.1 }]} />
                        <View style={[styles.decorativeCircle, { bottom: height * 0.2, left: width * 0.05, opacity: 0.3 }]} />
                        
                        <Animated.View
                            style={[
                                styles.inputContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                                },
                            ]}
                        >
                            <LinearGradient 
                                colors={["rgba(255, 255, 255, 0.98)", "rgba(248, 250, 252, 0.95)"]} 
                                style={styles.cardGradient}
                            >
                                <View style={styles.headerContainer}>
                                    <Animated.View
                                        style={[
                                            styles.logoContainer,
                                            {
                                                transform: [{ scale: logoScale }],
                                            },
                                        ]}
                                    >
                                        <View style={styles.logoBackground}>
                                            <Image 
                                                source={require('../../../assets/enercon-icon.png')} 
                                                style={styles.logoImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    </Animated.View>

                                    <Text style={styles.title}>FROTA</Text>
                                    <Text style={styles.subtitle}>Enercon - Energia e Assessoria</Text>
                                    <View style={styles.titleUnderline} />
                                </View>

                                <View style={styles.formContainer}>
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>
                                            <MaterialIcons name="email" size={16} color="#4A5568" /> Email
                                        </Text>
                                        <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                                            <View style={[
                                                styles.inputGradient,
                                                { backgroundColor: emailFocused ? '#FFF5E6' : '#F7FAFC' }
                                            ]}>
                                                <MaterialIcons 
                                                    name="email" 
                                                    size={20} 
                                                    color={emailFocused ? "#FF8C00" : "#718096"} 
                                                    style={styles.inputIcon} 
                                                />
                                                <TextInput
                                                    placeholder="Seu email registrado"
                                                    autoCapitalize="none"
                                                    style={[styles.input, emailFocused && styles.inputFocused]}
                                                    placeholderTextColor="#A0AEC0"
                                                    value={email}
                                                    onChangeText={setEmail}
                                                    onFocus={() => setEmailFocused(true)}
                                                    onBlur={() => setEmailFocused(false)}
                                                    keyboardType="email-address"
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>
                                            <MaterialIcons name="lock" size={16} color="#4A5568" /> Senha
                                        </Text>
                                        <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                                            <View style={[
                                                styles.inputGradient,
                                                { backgroundColor: passwordFocused ? '#FFF5E6' : '#F7FAFC' }
                                            ]}>
                                                <MaterialIcons 
                                                    name="lock" 
                                                    size={20} 
                                                    color={passwordFocused ? "#FF8C00" : "#718096"} 
                                                    style={styles.inputIcon} 
                                                />
                                                <TextInput
                                                    placeholder="Sua senha"
                                                    style={[styles.input, passwordFocused && styles.inputFocused]}
                                                    secureTextEntry={!showPassword}
                                                    placeholderTextColor="#A0AEC0"
                                                    value={password}
                                                    onChangeText={setPassword}
                                                    onFocus={() => setPasswordFocused(true)}
                                                    onBlur={() => setPasswordFocused(false)}
                                                />
                                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                                    <MaterialIcons 
                                                        name={showPassword ? "visibility" : "visibility-off"} 
                                                        size={20} 
                                                        color={passwordFocused ? "#FF8C00" : "#718096"} 
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loadingAuth}>
                                        <LinearGradient
                                            colors={loadingAuth ? ["#A0AEC0", "#718096"] : ["#FF8C00", "#FF7300", "#E65100"]}
                                            style={styles.buttonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            {loadingAuth ? (
                                                <ActivityIndicator size={25} color="#FFF" />
                                            ) : (
                                                <View style={styles.buttonContent}>
                                                    <MaterialIcons name="login" size={20} color="#FFF" />
                                                    <Text style={styles.buttonText}>Entrar</Text>
                                                </View>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.footerContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <View style={styles.footerContent}>
                                <View style={styles.footerDivider} />
                                <Text style={styles.footerText}>2025 ENERCON - Energia e Assessoria LTDA</Text>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
        minHeight: height,
    },
    decorativeCircle: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255, 140, 0, 0.1)",
        opacity: 0.6,
    },
    inputContainer: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    cardGradient: {
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: "rgba(255, 140, 0, 0.1)",
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 35,
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: "#FF8C00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FF8C00",
    },
    logoImage: {
        width: 60,
        height: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1A202C",
        marginBottom: 5,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: "#4A5568",
        textAlign: "center",
        marginBottom: 15,
        fontWeight: "500",
    },
    titleUnderline: {
        width: 50,
        height: 3,
        backgroundColor: "#FF8C00",
        borderRadius: 2,
    },
    formContainer: {
        width: "100%",
        gap: 20,
    },
    fieldContainer: {
        width: "100%",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    inputWrapper: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputWrapperFocused: {
        shadowColor: "#FF8C00",
        shadowOpacity: 0.25,
        elevation: 6,
    },
    inputGradient: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 15,
        minHeight: 52,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#2D3748",
        paddingVertical: 0,
    },
    inputFocused: {
        color: "#1A202C",
    },
    eyeIcon: {
        padding: 8,
        marginLeft: 5,
    },
    button: {
        width: "100%",
        borderRadius: 12,
        shadowColor: "#FF8C00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 10,
    },
    buttonGradient: {
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    footerContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    footerContent: {
        alignItems: "center",
        gap: 10,
    },
    footerDivider: {
        width: 60,
        height: 2,
        backgroundColor: "rgba(255, 140, 0, 0.5)",
        borderRadius: 1,
    },
    footerText: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        fontWeight: "500",
        letterSpacing: 0.5,
    },
});