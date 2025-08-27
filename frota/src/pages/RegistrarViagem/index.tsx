import React, { useContext, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Animated,
    Dimensions,
    ScrollView,
    TextInput,
    Platform,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import ProcurarVeiculo from "../../components/ProcurarVeiculo";
import { api } from "../../services/api";
import { getLocalizacao } from "../../services/ViagemServices/useLocationService";
import axios from "axios";
import QRCodeScannerExpo from "../../components/QrCodeScanner";
import { ModalPicker } from "../../components/ModalPicker";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface Combustivel {
    nome: string;
}

const combustivelOptions = [
    { id: 1, nome: "1/4" },
    { id: 2, nome: "2/4" },
    { id: 3, nome: "3/4" },
    { id: 4, nome: "Cheio" },
];

const RegistrarViagem = () => {
    const { profissional, motorista } = useContext(AuthContext);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const isFocused = useIsFocused();

    const [showScannerGlobal, setShowScannerGlobal] = useState<boolean>(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showViagem, setShowViagem] = useState<boolean>(false);

    const [modalCombustivel, setModalCombustivel] = useState(false);
    const [combustivelSelected, setCombustivelSelected] = useState<Combustivel | undefined>();
    const [combustivel, setCombustivel] = useState(combustivelOptions);

    const [formData, setFormData] = useState({
        km_inicial: "",
        local_saida: "",
        destino: "",
        objetivo_viagem: "",
        nivel_combustivel: "",
        nota: "",
        status: "Aberto",
    });
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
    }, []);

    useEffect(() => {
        if (isFocused && veiculo) {
            checkViagemEmAberto();
        }
    }, [isFocused, veiculo]);

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleVeiculoSelect = (selectedVeiculo: Veiculo) => {
        setVeiculo(selectedVeiculo);
        checkViagemEmAberto();
    };

    async function checkViagemEmAberto() {
        try {
            const response = await api.get("/viagem", {
                params: {
                    motorista_id: motorista.id,
                },
            });

            if (response.data.length === 0) {
                setShowForm(true);
            } else {
                setShowForm(false);
                Toast.show({
                    type: "error",
                    text1: "Viagem pendente",
                    text2: "Você ja tem uma viagem em aberto.",
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Não foi possível verificar viagens em aberto.",
            });
        }
    }

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

    async function registrarViagem() {
        if (!veiculo || !motorista) {
            Toast.show({
                type: "error",
                text1: "Escolha um veículo e um motorista",
            });
            return;
        }
 
        if (!formData.km_inicial || !formData.local_saida || !formData.destino) {
            Toast.show({
                type: "error",
                text1: "Preencha todos os campos obrigatórios",
            });
            return;
        }

        try {
            setSubmitting(true);
            const viagemData = {
                ...formData,
                veiculo_id: veiculo.id,
                motorista_id: motorista.id,
            };

            console.log(viagemData);

            const response = await api.post("viagem", viagemData);
            const viagem_id = response.data.id;

            const enderecoCompleto = await getLocalizacao();

            if (enderecoCompleto) {
                const enderecoData = {
                    viagem_id: viagem_id,
                    cep: enderecoCompleto.cep,
                    numero: enderecoCompleto.numero,
                    bairro: enderecoCompleto.bairro,
                    rua: enderecoCompleto.endereco,
                };

                const saidaResponse = await api.post("viagem/local_saida", enderecoData);
            } else {
                console.warn("Não foi possível obter a localização de saída.");
                Toast.show({
                    type: "info",
                    text1: "Viagem registrada, mas não foi possível obter a localização de saída.",
                });
            }

            setVeiculo(null);
            setShowViagem(true);

            Toast.show({    
                type: "success",
                text1: "Viagem registrada com sucesso",
            });

            navigation.navigate("ViagensEmAndamento");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log("Erro da API:", error.response.data);
            }
            console.error(error);
            Toast.show({
                type: "error",
                text1: "Erro ao registrar viagem",
            });
        } finally {
            setSubmitting(false);
            setFormData({
                km_inicial: "",
                local_saida: "",
                destino: "",
                objetivo_viagem: "",
                nivel_combustivel: "",
                nota: "",
                status: "",
            });
        }
    }

    function handleChangeCombustivel(item: any) {
        setCombustivelSelected(item);
        setFormData((prev) => ({ ...prev, nivel_combustivel: item.nome }));
        setModalCombustivel(false);
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
            <SafeAreaView style={styles.container}>
                <Modal transparent={true} visible={modalCombustivel} animationType="fade">
                    <ModalPicker
                        handleCloseModal={() => setModalCombustivel(false)}
                        options={combustivel}
                        selectedItem={handleChangeCombustivel}
                        title="Selecione o nível de combustível"
                        labelKey="nome"
                    />
                </Modal>
                <StatusBar backgroundColor="#1B1B1B" barStyle="light-content" />

                <LinearGradient 
                    colors={["#1B1B1B", "#2A2A2A", "#1A365D"]} 
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
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => {
                                navigation.navigate("Menu");
                            }}
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

                {showScannerGlobal ? (
                    <View style={styles.qrCodeScannerContainer}>
                        <QRCodeScannerExpo
                            onQRCodeRead={handleQRCodeReadGlobal}
                            onCancel={() => {
                                setShowScannerGlobal(false);
                            }}
                        />
                    </View>
                ) : (
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
                                <Text style={styles.welcomeText}>Registro de Viagem</Text>
                            </View>

                            {showForm ? (
                                <View>
                                    {(motorista || veiculo) && (
                                        <View style={styles.infoContainer}>
                                            {motorista && (
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>Motorista: </Text>
                                                    {profissional.nome}
                                                </Text>
                                            )}
                                            {veiculo && (
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>Veículo: </Text>
                                                    {veiculo.nome} - Placa: {veiculo.placa}
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Local de saída *</Text>
                                        <TextInput
                                            placeholder="Local de saída"
                                            style={styles.input}
                                            placeholderTextColor="#A0AEC0"
                                            value={formData.local_saida}
                                            onChangeText={(text) => updateFormData("local_saida", text)}
                                        />
                                    </View>

                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Destino *</Text>
                                        <TextInput
                                            placeholder="Destino"
                                            style={styles.input}
                                            placeholderTextColor="#A0AEC0"
                                            value={formData.destino}
                                            onChangeText={(text) => updateFormData("destino", text)}
                                        />
                                    </View>

                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Objetivo da Viagem</Text>
                                        <TextInput
                                            placeholder="Objetivo da viagem"
                                            style={styles.input}
                                            placeholderTextColor="#A0AEC0"
                                            value={formData.objetivo_viagem}
                                            onChangeText={(text) => updateFormData("objetivo_viagem", text)}
                                        />
                                    </View>

                                    <View style={styles.rowContainer}>
                                        <View style={[styles.fieldContainer, { width: "48%" }]}>
                                            <Text style={styles.label}>Nível do Combustível</Text>
                                            <TouchableOpacity style={styles.pickerInput} onPress={() => setModalCombustivel(true)}>
                                                <Text style={combustivelSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{combustivelSelected?.nome || "Selecione "}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.fieldContainer, { width: "48%" }]}>
                                            <Text style={styles.label}>Km inicial *</Text>
                                            <TextInput
                                                placeholder="Quilometragem inicial"
                                                style={styles.input}
                                                placeholderTextColor="#A0AEC0"
                                                value={formData.km_inicial}
                                                onChangeText={(text) => updateFormData("km_inicial", text)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity style={[styles.button, styles.submitButton, submitting && { opacity: 0.6 }]} onPress={registrarViagem} disabled={submitting}>
                                        {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={styles.buttonText}>Registrar Viagem</Text>}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <ProcurarVeiculo onVeiculoSelect={handleVeiculoSelect} currentVehicle={veiculo} onOpenScanner={() => setShowScannerGlobal(true)} />
                                </View>
                            )}
                        </Animated.View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F2F6",
    },
    header: {
        paddingTop: 40,
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
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#FF8C00",
    },
    logoImage: {
        width: 35,
        height: 35,
    },
    logoText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        letterSpacing: 2,
        marginBottom: 4,
    },
    logoSubtext: {
        fontSize: 11,
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
    fieldContainer: {
        width: "100%",
        marginBottom: 20,
    },
    infoContainer: {
        backgroundColor: "#FFF5E6",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#FF8C00",
    },
    homeButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 25,
        padding: 8,
        position: "absolute",
        left: 10,
        top: 5,
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: 45,
        height: 45,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#1A365D",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1A365D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 20,
    },
    infoLabel: {
        fontWeight: "bold",
        color: "#E65100",
    },
    infoText: {
        fontSize: 14,
        color: "#2D3748",
        marginBottom: 5,
    },
    qrCodeScannerContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 0,
    },
    submitButton: {
        backgroundColor: "#FF8C00",
        marginTop: 10,
        marginBottom: 30,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        color: "#2D3748",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pickerInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 50,
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pickerText: {
        fontSize: 16,
        color: "#2D3748",
    },
    pickerPlaceholderText: {
        fontSize: 16,
        color: "#A0AEC0",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        textTransform: "uppercase",
        letterSpacing: 0.5,
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
        textAlign: "center",
    },
});

export default RegistrarViagem;