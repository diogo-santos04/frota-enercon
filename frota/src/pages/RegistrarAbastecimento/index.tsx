import React, { useState, useContext, useRef, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal, StatusBar, Image, Animated } from "react-native";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import QRCodeScannerExpo from "../../components/QrCodeScanner";
import { styles } from "./styles";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ModalPicker } from "../../components/ModalPicker";
import { LinearGradient } from "expo-linear-gradient";
import ProcurarVeiculo from "../../components/ProcurarVeiculo";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

const combustivelOptions = [
    { id: 1, nome: "Alcool" },
    { id: 2, nome: "Gasolina" },
    { id: 3, nome: "Etanol" },
    { id: 4, nome: "Eletrico" },
];

interface Combustivel {
    nome: string;
}

export default function RegistrarAbastecimento() {
    const { motorista, profissional } = useContext(AuthContext);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const [placaVeiculo, setPlacaVeiculo] = useState("");
    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [showScannerGlobal, setShowScannerGlobal] = useState<boolean>(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    const [showDatePicker, setShowDatePicker] = useState<"data_abastecimento" | null>(null);

    const [modalCombustivel, setModalCombustivel] = useState(false);
    const [combustivelSelected, setCombustivelSelected] = useState<Combustivel | undefined>();
    const [combustivel, setCombustivel] = useState(combustivelOptions);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

    const hoje = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState(() => {
        return {
            veiculo_id: "",
            motorista_id: "",
            data_abastecimento: hoje,
            km: "",
            litros: "",
            tipo: "",
        };
    });

    async function registrarAbastecimento() {
        if (!veiculo || !motorista) {
            Toast.show({
                type: "error",
                text1: "Escolha um veículo primeiro",
            });
            return;
        }

        if (!formData.data_abastecimento) {
            Toast.show({
                type: "error",
                text1: "Preencha todos os campos obrigatórios",
            });
            return;
        }

        if (formData.tipo === "") {
            Toast.show({
                type: "error",
                text1: "Selecione o tipo de abastecimento",
            });
            return;
        }

        console.log("DATA DO ABASTECIMENTO: ", formData.data_abastecimento);

        const litroAsNumber = parseFloat(formData.litros);

        if (litroAsNumber >= 80) {
            Toast.show({
                text1: "Valor inválido para litros.",
                text2: "Valor muito alto.",
                type: "error",
            });
            return;
        }

        try {
            setSubmitting(true);
            const abastecimentoData = {
                ...formData,
                veiculo_id: veiculo.id,
                motorista_id: motorista.id,
            };

            const response = await api.post("abastecimento", abastecimentoData);
            Toast.show({
                type: "success",
                text1: "Abastecimento registrado com sucesso",
            });

            setFormData({
                veiculo_id: "",
                motorista_id: "",
                data_abastecimento: hoje,
                km: "",
                litros: "",
                tipo: "",
            });
            setVeiculo(null);
            setPlacaVeiculo("");
            navigation.navigate("Menu");
        } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Erro ao registrar abastecimento",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    function handleChangeCombustivel(item: any) {
        setCombustivelSelected(item);
        setFormData((prev) => ({ ...prev, tipo: item.nome }));
        setModalCombustivel(false);
    }

    const handleVeiculoSelect = (selectedVeiculo: Veiculo) => {
        setVeiculo(selectedVeiculo);
        setShowForm(true);
    };

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
            <Modal transparent={true} visible={modalCombustivel} animationType="fade">
                <ModalPicker handleCloseModal={() => setModalCombustivel(false)} options={combustivel} selectedItem={handleChangeCombustivel} title="Selecione o tipo de combustível" labelKey="nome" />
            </Modal>

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
                    <View style={{ alignItems: "center"}}>
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
                <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Animated.View
                        style={[
                            styles.cardsContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <View style={{ marginBottom: 25}}>
                            <Text style={styles.welcomeText}>Registro de Abastecimento</Text>
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
                                    <Text style={styles.label}>Quilometragem *</Text>
                                    <TextInput
                                        placeholder="Ex: 10520"
                                        style={styles.input}
                                        placeholderTextColor="grey"
                                        value={formData.km}
                                        onChangeText={(text) => updateFormData("km", text)}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.fieldContainer}>
                                    <Text style={styles.label}>Litros *</Text>
                                    <TextInput
                                        placeholder="Litros"
                                        keyboardType="numeric"
                                        style={styles.input}
                                        placeholderTextColor="grey"
                                        value={formData.litros}
                                        onChangeText={(text) => updateFormData("litros", text)}
                                    />
                                </View>

                                <View style={styles.fieldContainer}>
                                    <View style={[styles.fieldContainer, { width: "100%" }]}>
                                        <Text style={styles.label}>Tipo do Abastecimento</Text>
                                        <TouchableOpacity style={styles.pickerInput} onPress={() => setModalCombustivel(true)}>
                                            <Text style={combustivelSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{combustivelSelected?.nome || "Selecione "}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} onPress={registrarAbastecimento} disabled={submitting}>
                                    {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={styles.buttonText}>Registrar Abastecimento</Text>}
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
    );
}
