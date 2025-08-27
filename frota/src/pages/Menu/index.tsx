import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Alert, Animated, Dimensions, ScrollView, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

interface Item {
    iconType: string;
    icon: string;
    gradientColors: string[];
    onPress: () => void;
    color: string;
    title: string;
}
const { width } = Dimensions.get("window");

const Menu = () => {
    const { user, signOut, profissional, motorista } = useContext(AuthContext);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        async function checkLocationStatus() {
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (!isEnabled) {
                Alert.alert("Localização Desativada", "Por favor, ative os serviços de localização do seu celular para registrar as viagens corretamente.", [{ text: "OK" }]);
                return;
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Permissão de localização negada",
                    text2: "Não será possível registrar a localização da saída da viagem.",
                });
                return;
            }
        }

        checkLocationStatus();
    }, []);

    const menuItems = [
        {
            id: 1,
            title: "Registrar\nViagem",
            icon: "add-road",
            iconType: "MaterialIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("RegistrarViagem"),
        },
        {
            id: 2,
            title: "Viagem em\nAndamento",
            icon: "directions-car",
            iconType: "MaterialIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("ViagensEmAndamento"),
        },
        {
            id: 3,
            title: "Registrar\nAbastecimento",
            icon: "local-gas-station",
            iconType: "MaterialIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("RegistrarAbastecimento"),
        },
        {
            id: 4,
            title: "Realizar\nVistoria",
            icon: "car-repair",
            iconType: "MaterialIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("RegistrarVistoria"),
        },
        {
            id: 5,
            title: "Histórico",
            icon: "history",
            iconType: "MaterialIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("Historico"),
        },
        {
            id: 6,
            title: "Solicitar Manutenção",
            icon: "car-wrench",
            iconType: "MaterialCommunityIcons",
            color: "#FF8C00",
            backgroundColor: "#2A2D3A",
            gradientColors: ["#2A2D3A", "#1F2937"],
            onPress: () => navigation.navigate("RegistrarManutencao"),
        },
    ];

    // @ts-expect-error
    const AnimatedCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(pressAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(pressAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        const IconComponent = item.iconType === "MaterialCommunityIcons" ? MaterialCommunityIcons : Icon;

        return (
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: cardAnim,
                        transform: [
                            { scale: pressAnim },
                            {
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity style={styles.card} onPress={item.onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
                    <LinearGradient colors={item.gradientColors} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <View style={styles.iconContainer}>
                            <LinearGradient 
                                colors={["#FF8C00", "#FFB347"]} 
                                style={styles.iconBackground}
                                start={{ x: 0, y: 0 }} 
                                end={{ x: 1, y: 1 }}
                            >
                                <IconComponent name={item.icon} size={24} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.cardText}>{item.title}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#1B1B1B" barStyle="light-content" />

            <LinearGradient 
                colors={["#1B1B1B", "#1B1B1B"]} 
                style={styles.header} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
            >
                <Animated.View
                    style={[
                        styles.headerContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoImageContainer}>
                                <Image 
                                    source={require('../../../assets/enercon-icon.png')} 
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.logoText}>FROTA</Text>
                            <Text style={styles.logoSubtext}>Enercon - Energia e Assessoria</Text>
                            <View style={styles.logoUnderline} />
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                            <LinearGradient colors={["#FFFFFF", "#F5F5F5"]} style={styles.avatarGradient}>
                                <Icon name="person" size={36} color="#1A365D" />
                            </LinearGradient>
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user.nome}</Text>
                            <View style={styles.userRoleContainer}>
                                <Icon name="local-shipping" size={16} color="#FFB347" />
                                <Text style={styles.userRole}>MOTORISTA</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                            <LinearGradient colors={["#FF6B35", "#E55100"]} style={styles.logoutGradient}>
                                <Icon name="logout" size={18} color="#FFFFFF" />
                                <Text style={styles.logoutText}>SAIR</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userIdContainer}>
                        <Icon name="badge" size={18} color="#FF8C00" />
                        <Text style={styles.userIdLabel}>MATRÍCULA</Text>
                        <Text style={styles.userId}>{profissional.matricula}</Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View
                    style={[
                        styles.cardsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
                        <Text style={styles.welcomeSubtext}>Escolha uma opção para continuar</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        {menuItems.map((item, index) => (
                            <AnimatedCard key={item.id} item={item} index={index} />
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F2F6",
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    headerContent: {
        gap: 20,
    },
    headerTop: {
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
    },
    logoImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        marginTop: 15,
        borderWidth: 2,
        borderColor: "#FF8C00",
    },
    logoImage: {
        width: 45,
        height: 45,
    },
    logoText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        letterSpacing: 2,
        marginBottom: 4,
    },
    logoSubtext: {
        fontSize: 12,
        color: "#E2E8F0",
        marginBottom: 8,
        fontWeight: "500",
    },
    logoUnderline: {
        width: 50,
        height: 3,
        backgroundColor: "#FF8C00",
        borderRadius: 2,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    userAvatar: {
        borderRadius: 25,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    userRoleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    userRole: {
        fontSize: 14,
        color: "#FFB347",
        fontWeight: "500",
    },
    logoutButton: {
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    userIdContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255, 140, 0, 0.15)",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 140, 0, 0.3)",
    },
    userIdLabel: {
        color: "#E2E8F0",
        fontSize: 12,
        fontWeight: "500",
    },
    userId: {
        color: "#FF8C00",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: "auto",
    },
    mainContent: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    cardsContainer: {
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    welcomeSection: {
        marginBottom: 25,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A202C",
        marginBottom: 5,
    },
    welcomeSubtext: {
        fontSize: 16,
        color: "#4A5568",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 15,
    },
    cardContainer: {
        width: (width - 55) / 2,
    },
    card: {
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardGradient: {
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
        gap: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 140, 0, 0.1)",
    },
    iconContainer: {
        marginBottom: 5,
    },
    iconBackground: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FF8C00",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cardText: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 16,
        color: "#E2E8F0",
    },
});

export default Menu;