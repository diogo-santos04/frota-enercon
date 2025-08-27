import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Animated, Image } from "react-native";
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { AuthContext } from "../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

interface Profissional {
    user_id: number;
    nome: string;
    cpf: string;
    matricula: string;
    celular: string;
    codigo: string;
}

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface Motorista {
    id: number;
    profissional_id: number;
    user_id: number;
    cnh: string;
    validade: string;
    categoria: string;
    profissional?: Profissional;
}

interface Viagem {
    id: number;
    veiculo_id: number;
    motorista_id: number;
    data_viagem: string;
    km_inicial: string;
    local_saida: string;
    destino: string;
    objetivo_viagem: string;
    nivel_combustivel: string;
    nota: string;
    status: string;
    veiculo?: Veiculo;
    motorista?: Motorista;
}

export default function ViagensEmAndamento() {
    const { motorista } = useContext(AuthContext);
    const [viagens, setViagens] = useState<Viagem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    async function getViagens() {
        try {
            setLoading(true);
            const response = await api.get("/viagem", {
                params: {
                    motorista_id: motorista.id,
                },
            });
            setViagens(response.data.reverse());
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getViagens();
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatarDataHora = (dataISO: string): string => {
        const [datePart, timePart] = dataISO.split(" ");
        const [ano, mes, dia] = datePart.split("-");
        const [hora, minuto] = timePart ? timePart.split(":") : ["00", "00"];
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };

    const renderItem = ({ item }: { item: Viagem }) => {
        return (
            <View style={styles.viagemCard}>
                <View style={styles.cardGradient}>
                    <View style={styles.viagemHeader}>
                        <View style={styles.routeContainer}>
                            <FontAwesome5 name="route" size={16} color="#FFFFF" style={styles.icon} />
                            <Text style={styles.routeText}>
                                {item.local_saida} → {item.destino}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge]}>
                            <Text style={[styles.statusText]}>{item.status}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <FontAwesome5 name="car" color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Veículo:</Text>
                            <Text style={styles.detailValue}>{item.veiculo?.nome}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="car-info" color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Placa:</Text>
                            <Text style={styles.detailValue}>{item.veiculo?.placa}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <FontAwesome5 name="user" color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Motorista:</Text>
                            <Text style={styles.detailValue}>{item.motorista?.profissional?.nome}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Feather name="calendar" size={16} color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Data:</Text>
                            <Text style={styles.detailValue}>{formatarDataHora(item.data_viagem)} </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialIcons name="speed" color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>KM Inicial:</Text>
                            <Text style={styles.detailValue}>{item.km_inicial}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Feather name="droplet" size={16} color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Combustível:</Text>
                            <Text style={styles.detailValue}>{item.nivel_combustivel}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <FontAwesome5 name="bullseye" size={16} color="#1A365D" style={{ marginRight: 8, width: 16 }} />
                            <Text style={styles.detailLabel}>Objetivo:</Text>
                            <Text style={styles.detailValue}>{item.objetivo_viagem}</Text>
                        </View>
                        {item.nota && (
                            <View style={styles.detailRow}>
                                <Feather name="file-text" size={16} color="#1A365D" style={styles.icon} />
                                <Text style={styles.detailLabel}>Nota:</Text>
                                <Text style={styles.detailValue}>{item.nota}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate("FinalizarViagem", { viagem_id: item.id, formType: "finalizar" })}>
                            <Feather name="check-circle" size={16} color="#28a745" />
                            <Text style={[styles.cardActionText, { color: "#28a745" }]}>Finalizar Viagem</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate("FinalizarViagem", { viagem_id: item.id, formType: "cancelar" })}>
                            <MaterialCommunityIcons name="cancel" size={16} color={"#E53E3E"} />
                            <Text style={[styles.cardActionText, { color: "#E53E3E" }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome5 name="route" size={60} color="#3f3f5f" />
            <Text style={styles.emptyText}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptySubText}>As viagens aparecerão aqui quando disponíveis</Text>
        </View>
    );

    const LoadingComponent = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3fffa3" />
            <Text style={styles.loadingText}>Carregando viagens...</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
            <View style={styles.container}>
                <LinearGradient colors={["#1B1B1B", "#2A2A2A", "#1A365D"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Animated.View
                        style={[
                            styles.headerContent,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => {
                                navigation.navigate("Menu");
                            }}
                        >
                            <Feather name="home" size={20} color="#1A365D" />
                        </TouchableOpacity>
                        <View style={{ alignItems: "center" }}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoImageContainer}>
                                    <Image source={require("../../../assets/enercon-icon.png")} style={styles.logoImage} resizeMode="contain" />
                                </View>
                                <Text style={styles.logoText}>FROTA</Text>
                                <Text style={styles.logoSubtext}>Enercon - Energia e Assessoria</Text>
                                <View style={styles.logoUnderline} />
                            </View>
                        </View>
                    </Animated.View>
                </LinearGradient>

                <View style={styles.mainContent}>
                    <View style={styles.welcomeSection}>
                        <Text style={styles.sectionTitle}>Viagem ativa</Text>
                        <Text style={styles.sectionSubtitle}>Acompanhe o status da viagem ativa</Text>
                    </View>
                    {loading ? (
                        <LoadingComponent />
                    ) : (
                        <FlatList
                            data={viagens}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={EmptyListComponent}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
