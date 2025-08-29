import React, { useState, useContext, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, FlatList, Modal, TextInput, StatusBar } from "react-native";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Feather, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import ProcurarVeiculo from "../../components/ProcurarVeiculo";
import QRCodeScannerExpo from "../../components/QrCodeScanner";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { styles } from "./styles";
import { ModalPicker } from "../../components/ModalPicker"; 
import { LinearGradient } from "expo-linear-gradient";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface Profissional {
    user_id: number;
    nome: string;
    cpf: string;
    matricula: string;
    celular: string;
    codigo: string;
}

interface FormData {
    veiculo_id: string;
    motorista_id: string;
    tipo_manutencao_id: string;
    data_solicitacao: string;
    nota: string;
    foto?: string;
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

interface TipoManutencao {
    id: number;
    nome: string;
}

interface Manutencao {
    id: number;
    veiculo_id: number;
    motorista_id: number;
    tipo_manutencao_id: number;
    data_solicitacao: string;
    nota: string;
    foto: string;
    status: string;
    veiculo?: Veiculo;
    motorista?: Motorista;
    tipo_manutencao?: TipoManutencao;
}

export default function RegistrarManutencao() {
    const { user, motorista, profissional } = useContext(AuthContext);
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const [tiposManutencao, setTiposManutencao] = useState<TipoManutencao[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState<"data_solicitacao" | null>(null);

    const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showScannerGlobal, setShowScannerGlobal] = useState<boolean>(false);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const [ultimasManutencoes, setUltimasManutencoes] = useState<Manutencao[]>([]);
    const hoje = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        tipo_manutencao_id: "",
        data_solicitacao: hoje,
        foto: "",
        nota: "",
    });

    const [modalTipoManutencao, setModalTipoManutencao] = useState(false);
    const [tipoManutencaoSelected, setTipoManutencaoSelected] = useState<TipoManutencao | undefined>();

    const handleVeiculoSelect = (selectedVeiculo: Veiculo) => {
        setVeiculo(selectedVeiculo);
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
        } finally {
            setShowForm(true);
        }
    };

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(null);
        if (selectedDate) {
            updateFormData(showDatePicker!, format(selectedDate, "yyyy-MM-dd"));
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            allowsEditing: false,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            updateFormData("foto", result.assets[0].uri);
        }
    };

    async function handleRegistrarManutencao() {
        setSubmitting(true);
        try {
            const formDataPayload = new FormData();

            formDataPayload.append("motorista_id", String(motorista?.id));
            formDataPayload.append("veiculo_id", String(veiculo?.id));
            formDataPayload.append("tipo_manutencao_id", formData.tipo_manutencao_id);
            formDataPayload.append("data_solicitacao", formData.data_solicitacao);
            formDataPayload.append("nota", formData.nota);

            if (image) {
                const localUri = image;
                const filename = localUri.split("/").pop() || "photo.jpg";
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formDataPayload.append("foto", {
                    uri: localUri,
                    name: filename,
                    type: type,
                } as any);
            }

            const response = await api.post("/solicitar_manutencao", formDataPayload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Toast.show({
                type: "success",
                text1: "Manutenção solicitada com sucesso!",
            });
            navigation.navigate("Menu");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.log("Detalhes do erro:", error.response.data);
                }
            }
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Algo deu errado",
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function getVeiculosManutencao() {
        if (!veiculo?.id) {
            console.log("veiculo_id is not available yet.");
            return;
        }

        try {
            const response = await api.post("manutencao/veiculo", {
                veiculo_id: veiculo.id,
            });

            setUltimasManutencoes(response.data.slice(-2).reverse());
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        async function getTiposManutencao() {
            try {
                const response = await api.get("/tipo_manutencao");
                const tipos_manutencao = response.data;
                setTiposManutencao(tipos_manutencao);
            } catch (error) {
                console.log(error);
            }
        }

        getTiposManutencao();
    }, []);

    useEffect(() => {
        if (veiculo) {
            getVeiculosManutencao();
        }
    }, [veiculo]);

    function handleChangeTipoManutencao(item: TipoManutencao) {
        setTipoManutencaoSelected(item);
        updateFormData("tipo_manutencao_id", String(item.id));
        setModalTipoManutencao(false);
    }

    const renderVistoriaItem = ({ item }: { item: Manutencao }) => (
        <View style={styles.viagemCard}>
            <View style={styles.cardGradient}>
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <FontAwesome5 name="calendar" color="#1976D2" style={styles.icon} />
                        <Text style={styles.detailLabel}>Feito pelo motorista:</Text>
                        <Text style={styles.detailValue}>{item.motorista?.profissional?.nome} - {item.status}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="car-arrow-left" size={18} color="#1976D2" style={styles.icon} />
                        <Text style={styles.detailLabel}>Tipo da manutencao:</Text>
                        <Text style={styles.detailValue}>{item.tipo_manutencao?.nome}</Text>
                    </View>

                    {item.nota && (
                        <View style={styles.detailRow}>
                            <Feather name="file-text" size={16} color="#1976D2" style={styles.icon} />
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
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={true}>
                    <ProcurarVeiculo onVeiculoSelect={handleVeiculoSelect} currentVehicle={veiculo} onOpenScanner={() => setShowScannerGlobal(true)} />
                </ScrollView>
            );
        }

        if (showForm) {
            return (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={true}>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Tipo da Manutenção</Text>
                        <TouchableOpacity
                            style={styles.pickerInput}
                            onPress={() => setModalTipoManutencao(true)}
                        >
                            <Text style={tipoManutencaoSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>
                                {tipoManutencaoSelected?.nome || "Selecione o Tipo da Manutenção"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Observações (Opcional)</Text>
                        <TextInput 
                            placeholder="Alguma nota adicional?"
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor="grey"
                            value={formData.nota}
                            onChangeText={(text) => updateFormData("nota", text)}
                            multiline
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Anexar Imagem (Opcional)</Text>
                        <TouchableOpacity style={styles.input} onPress={pickImage}>
                            <Text style={{ color: "#000", fontSize: 16, marginTop: 12 }}>{image ? "Imagem selecionada" : "Selecionar Imagem"}</Text>
                        </TouchableOpacity>
                        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
                    </View>

                    <TouchableOpacity style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} onPress={handleRegistrarManutencao} disabled={submitting}>
                        {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={styles.buttonText}>Registrar Manutenção</Text>}
                    </TouchableOpacity>
                </ScrollView>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Veículo: </Text>
                        {veiculo.nome} - Placa: {veiculo.placa}
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
                    <Text style={styles.buttonText}>Realizar manutenção neste veículo</Text>
                </TouchableOpacity>

                <FlatList
                    style={styles.flatListContainer}
                    data={ultimasManutencoes}
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
            <Modal transparent={true} visible={modalTipoManutencao} animationType="fade">
                <ModalPicker
                    handleCloseModal={() => setModalTipoManutencao(false)}
                    options={tiposManutencao}
                    selectedItem={handleChangeTipoManutencao}
                    title="Selecione o Tipo da Manutenção"
                    labelKey="nome"
                />
            </Modal>

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
                <View style={styles.mainContent} >
                    <Text style={styles.formTitle}>Solicitar Manutenção</Text>
                    {renderMainContent()}
                </View>
            )}
            {showDatePicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />}
        </SafeAreaView>
    );
}