import React, { useState, useContext, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, FlatList, KeyboardAvoidingView, Platform, Image } from "react-native";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import ProcurarVeiculo from "../../components/ProcurarVeiculo";
import VistoriaForm from "./VistoriaForm";
import QRCodeScannerExpo from "../../components/QrCodeScanner";
import { styles } from "./styles";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface Vistoria {
    id: number;
    data_vistoria: string;
    km_vistoria: string;
    km_troca_oleo: string;
    data_troca_oleo: string;
    documento: boolean;
    cartao_abastecimento: boolean;
    combustivel: string;
    pneu_dianteiro: string;
    pneu_traseiro: string;
    pneu_estepe: string;
    nota: string;
    status: string;
    veiculo_id: number;
    motorista_id: number;
}

interface FormData {
    data_vistoria: string;
    km_vistoria: string;
    km_troca_oleo: string;
    data_troca_oleo: string;
    documento: boolean;
    cartao_abastecimento: boolean;
    combustivel: string;
    pneu_dianteiro: string;
    pneu_traseiro: string;
    pneu_estepe: string;
    nota: string;
    status: string;
}

export default function RegistrarVistoria() {
    const { user, motorista, profissional } = useContext(AuthContext);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showScannerGlobal, setShowScannerGlobal] = useState<boolean>(false);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [lastVistorias, setLastVistorias] = useState<Vistoria[]>([]);

    const [showVistoriaForm, setShowVistoriaForm] = useState(false);

    const handleVeiculoSelect = (selectedVeiculo: Veiculo) => {
        setVeiculo(selectedVeiculo);
        setShowVistoriaForm(false);
    };

    const handleQRCodeReadGlobal = (data: string) => {
        try {
            const scannedVehicle: Veiculo = JSON.parse(data);
            handleVeiculoSelect(scannedVehicle);
            setShowScannerGlobal(false);
            setScannedData(null);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Erro ao ler QR Code",
                text2: "Dados inválidos do veículo.",
            });
            setShowScannerGlobal(false);
            setScannedData(null);
        }
    };

    async function handleRegistrarVistoria(formData: FormData) {
        if (!veiculo || !motorista) {
            Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Dados do veículo ou motorista ausentes.",
            });
            return;
        }

        try {
            setSubmitting(true);
            const vistoriaData = {
                ...formData,
                veiculo_id: veiculo.id,
                motorista_id: motorista.id,
            };

            const response = await api.post("vistoria", vistoriaData);

            const vistoria_id = response.data.id;

            navigation.navigate("VistoriaItem", { vistoria_id: vistoria_id });
            setVeiculo(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.log("Detalhes do erro:", error.response.data);
                }
            }
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Erro ao registrar vistoria",
                text2: "Ocorreu um erro desconhecido.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (veiculo) {
            getVeiculoVistorias();
        }
    }, [veiculo]);

    async function getVeiculoVistorias() {
        if (!veiculo?.id) {
            console.log("veiculo_id is not available yet.");
            return;
        }

        try {
            const response = await api.post("vistoria/veiculo", {
                veiculo_id: veiculo.id,
            });
            setLastVistorias(response.data.slice(-2).reverse());
        } catch (error) {
            console.log("erro ao pegar ultimas vistorias: ", error);
        }
    }

    const formatarDataHora = (dataISO: string): string => {
        const [datePart, timePart] = dataISO.split(" ");
        const [ano, mes, dia] = datePart.split("-");
        const [hora, minuto] = timePart ? timePart.split(":") : ["00", "00"];
        return `${dia}/${mes}/${ano}`;
    };

    const renderVistoriaItem = ({ item }: { item: Vistoria }) => (
        <View style={styles.viagemCard}>
            <View style={styles.cardGradient}>
                <View style={styles.viagemHeader}>
                    <View style={[styles.statusBadge]}>
                        <Text style={[styles.statusText]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <FontAwesome5 name="calendar" color="#1A365D" style={styles.icon} />
                        <Text style={styles.detailLabel}>Data da Vistoria:</Text>
                        <Text style={styles.detailValue}>{formatarDataHora(item.data_vistoria)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="car-arrow-left" size={17} color="#1A365D" style={styles.icon} />
                        <Text style={styles.detailLabel}>Data da troca do oleo:</Text>
                        <Text style={styles.detailValue}>{formatarDataHora(item.data_troca_oleo)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="tire" size={17} color="#1A365D" style={styles.icon} />
                        <Text style={styles.detailLabel}>Pneu dianteiro:</Text>
                        <Text style={styles.detailValue}>{item.pneu_dianteiro}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="tire" size={17} color="#1A365D" style={styles.icon} />
                        <Text style={styles.detailLabel}>Pneu traseiro:</Text>
                        <Text style={styles.detailValue}>{item.pneu_traseiro}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="tire" size={17} color="#1A365D" style={styles.icon} />
                        <Text style={styles.detailLabel}>Pneu estepe:</Text>
                        <Text style={styles.detailValue}>{item.pneu_estepe}</Text>
                    </View>

                    {item.nota && (
                        <View style={styles.detailRow}>
                            <Feather name="file-text" size={16} color="#1A365D" style={styles.icon} />
                            <Text style={styles.detailLabel}>Nota:</Text>
                            <Text style={styles.detailValue}>{item.nota}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    const renderMainContent = () => {
        if (!veiculo) {
            return (
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={true}>
                    <ProcurarVeiculo onVeiculoSelect={handleVeiculoSelect} currentVehicle={veiculo} onOpenScanner={() => setShowScannerGlobal(true)} />
                </ScrollView>
            );
        }

        if (showVistoriaForm) {
            return (
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={true}>
                    <VistoriaForm veiculo={veiculo} motorista={motorista} profissional={profissional} onSubmit={handleRegistrarVistoria} submitting={submitting} />
                </ScrollView>
            );
        }

        return (
            <View style={styles.contentContainer}>
                <View style={styles.topScrollContainer}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            <Text style={styles.infoLabel}>Veículo: </Text>
                            {veiculo.nome} - Placa: {veiculo.placa}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => setShowVistoriaForm(true)}>
                        <Text style={styles.buttonText}>Realizar vistoria neste veículo</Text>
                    </TouchableOpacity>

                    <Text style={styles.subtitle}>Últimas vistorias</Text>
                </View>

                <FlatList
                    style={styles.flatListContainer}
                    data={lastVistorias}
                    renderItem={renderVistoriaItem}
                    keyExtractor={(item) => String(item.id)} 
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={() => <Text style={styles.noDataText}>Nenhuma vistoria encontrada para este veículo.</Text>}
                />
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <SafeAreaView style={styles.container}>
                {showScannerGlobal ? (
                    <View style={styles.qrCodeScannerContainer}>
                        <QRCodeScannerExpo 
                            onQRCodeRead={handleQRCodeReadGlobal} 
                            onCancel={() => setShowScannerGlobal(false)} 
                        />
                    </View>
                ) : (
                    <>
                        <LinearGradient 
                            colors={["#1B1B1B", "#2A2A2A", "#1A365D"]} 
                            style={styles.header} 
                            start={{ x: 0, y: 0 }} 
                            end={{ x: 1, y: 1 }}
                        >
                            <Animated.View style={styles.headerContent}>
                                <TouchableOpacity
                                    style={styles.homeButton}
                                    onPress={() => navigation.navigate("Menu")}
                                >
                                    <Feather name="home" size={20} color="#1A365D" />
                                </TouchableOpacity>
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
                            </Animated.View>
                        </LinearGradient>

                        <View style={styles.mainContent}>
                            <Text style={styles.formTitle}>Realizar Vistoria</Text>
                            {renderMainContent()}
                        </View>
                    </>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
