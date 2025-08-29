import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import { AuthContext } from "../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

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

interface ViagemDestino {
    id: number;
    viagem_id: number;
    data_saida: string;
    data_chegada: string;
    km_saida: number;
    km_chegada: number;
    km_total: number;
    local_saida: string;
    local_destino: string;
    nota: string;
    status: string;
    viagem?: Viagem;
}

export default function Historico() {
    const { motorista } = useContext(AuthContext)
    const [viagemDestinos, setViagemDestinos] = useState<ViagemDestino[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    async function getViagemDestinos() {
        try {
            setLoading(true);
            const response = await api.get("/viagem_destino", {
                params:{
                    motorista_id: motorista.id
                }
            });
            setViagemDestinos(response.data.reverse());
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getViagemDestinos();
    }, []);

    const formatarDataHora = (dataISO: string): string => {
        const [datePart, timePart] = dataISO.split(" ");
        const [ano, mes, dia] = datePart.split("-");
        const [hora, minuto] = timePart ? timePart.split(":") : ["00", "00"];
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Finalizado':
                return '#28a745';
            case 'Aberto':
                return '#ffc107';
            case 'Cancelado':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const renderItem = ({ item }: { item: ViagemDestino }) => {
        return (
            <View style={styles.viagemCard}>
                <View style={styles.cardGradient}>
                    <View style={styles.viagemHeader}>
                        <View style={styles.routeContainer}>
                            <FontAwesome5 name="route" size={16} color="#FFFFFF"  />
                            <Text style={styles.routeText}>
                                {item.local_saida} → {item.local_destino}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{item.status}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <FontAwesome5 name="car" color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>Veículo:</Text>
                            <Text style={styles.detailValue}>{item.viagem?.veiculo?.nome}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <FontAwesome5 name="user" color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>Motorista:</Text>
                            <Text style={styles.detailValue}>{item.viagem?.motorista?.profissional?.nome}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="car-arrow-left" size={18} color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>Saída:</Text>
                            <Text style={styles.detailValue}>{formatarDataHora(item.data_saida)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="car-arrow-right" size={18} color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>Chegada:</Text>
                            <Text style={styles.detailValue}>{formatarDataHora(item.data_chegada)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="speed" size={18} color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>KM Saída:</Text>
                            <Text style={styles.detailValue}>{item.km_saida}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialIcons name="speed" size={18} color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>KM Chegada:</Text>
                            <Text style={styles.detailValue}>{item.km_chegada}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="map-marker-distance" size={18} color="#1976D2" style={styles.icon} />
                            <Text style={styles.detailLabel}>KM Total:</Text>
                            <Text style={styles.detailValue}>{item.km_total} km</Text>
                        </View>

                        {item.nota && (
                            <View style={styles.detailRow}>
                                <Feather name="file-text" size={16} color="#1976D2" style={styles.icon} />
                                <Text style={styles.detailLabel}>Nota:</Text>
                                <Text style={styles.detailValue}>{item.nota}</Text>
                            </View>
                        )}
                    </View>

                    {/* <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.cardAction}>
                            <Feather name="eye" size={16} color="#0B7EC8" />
                            <Text style={[styles.cardActionText, { color: "#0B7EC8" }]}>Ver Detalhes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cardAction}>
                            <Feather name="download" size={16} color="#6c757d" />
                            <Text style={[styles.cardActionText, { color: "#6c757d" }]}>Relatório</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
            </View>
        );
    };

    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={60} color="#3f3f5f" />
            <Text style={styles.emptyText}>Nenhum histórico encontrado</Text>
            <Text style={styles.emptySubText}>O histórico de viagens aparecerá aqui quando disponível</Text>
        </View>
    );

    const LoadingComponent = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3fffa3" />
            <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
            <View style={styles.container}>
                <LinearGradient 
                    colors={["#1B1B1B", "#2A2A2A", "#1A365D"]} 
                    style={styles.header} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => navigation.navigate("Menu")}
                        >
                            <Feather name="home" size={20} color="#1A365D" />
                        </TouchableOpacity>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoImageContainer}>
                                <Image 
                                    source={require("../../../assets/enercon-icon.png")} 
                                    style={styles.logoImage} 
                                    resizeMode="contain" 
                                />
                            </View>
                            <Text style={styles.logoText}>FROTA</Text>
                            <Text style={styles.logoSubtext}>Enercon - Energia e Assessoria</Text>
                            <View style={styles.logoUnderline} />
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.mainContent}>
                    <View style={styles.welcomeSection}>
                        <Text style={styles.sectionTitle}>Histórico de Viagens</Text>
                        <Text style={styles.sectionSubtitle}>
                            Visualize o histórico completo das viagens realizadas
                        </Text>
                    </View>
                    {loading ? (
                        <LoadingComponent />
                    ) : (
                        <FlatList
                            data={viagemDestinos}
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

