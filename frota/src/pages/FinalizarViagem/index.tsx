import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Image } from "react-native";
import { api } from "../../services/api";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import Toast from "react-native-toast-message";
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

interface ViagemDestino {
    viagem_id: number;
    data_saida: string | Date;
    km_saida: number;
    km_chegada: number;
    km_total: number;
    local_saida: string;
    local_destino: string;
    nota: string;
    status: string;
}

type RouteDetailParams = {
    FinalizarViagem: {
        viagem_id: number;
        formType: string;
    };
};

type OrderRouteProps = RouteProp<RouteDetailParams, "FinalizarViagem">;

export default function FinalizarViagem() {
    const route = useRoute<OrderRouteProps>();
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();

    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<ViagemDestino>({
        viagem_id: route.params.viagem_id,
        data_saida: "",
        km_saida: 0,
        km_chegada: 0,
        km_total: 0,
        local_saida: "",
        local_destino: "",
        nota: "",
        status: "Finalizado",
    });

    const updateFormData = (field: keyof ViagemDestino, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    async function finalizarViagem() {
        console.log(formData);
        setSubmitting(true);
        if (!formData.km_chegada) {
            Toast.show({
                type: "error",
                text1: "Preencha os campos obrigatórios",
            });
            setSubmitting(false);
            return;
        }

        if (formData.km_chegada < formData.km_saida) {
            Toast.show({
                type: "error",
                text1: "Valor para Km inválido",
                text2: "Chegada deve ser maior ou igual a saida !",
            });
            setSubmitting(false);
            return;
        }

        const kmSaida = formData.km_saida;
        const kmChegada = formData.km_chegada;

        const totalKm = kmChegada - kmSaida;

        const updatedFormData = {
            ...formData,
            km_total: totalKm,
        };
        try {
            const response = await api.post("viagem_destino", updatedFormData);
            console.log(response.data);
            Toast.show({
                type: "success",
                text1: "Viagem finalizada com sucesso",
            });
            navigation.navigate("ViagensEmAndamento");
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitting(false);
        }
    }

    async function cancelarViagem() {
        setSubmitting(true);

        if (!formData.nota) {
            Toast.show({
                type: "error",
                text1: "Explique o motivo do cancelamento",
            });
            setSubmitting(false);
            return;
        }
        try {
            const response = await api.post("viagem/cancelar", {
                viagem_id: route.params.viagem_id,
                nota: formData.nota,
            });
            console.log(response.data);
            Toast.show({
                type: "success",
                text1: "Viagem cancelada com sucesso",
            });
            navigation.navigate("ViagensEmAndamento");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log("Erro da API:", error.response.data);
            }
            console.log(error);
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        async function getViagem() {
            const response = await api.post("viagem/detalhes", {
                viagem_id: route.params.viagem_id,
            });

            setFormData((prev) => ({
                ...prev,
                data_saida: response.data.data_viagem,
                km_saida: parseFloat(response.data.km_inicial),
                local_saida: response.data.local_saida,
                local_destino: response.data.destino,
                nota: response.data.nota,
            }));
        }

        getViagem();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1B1B1B" />
            <LinearGradient 
                colors={["#1B1B1B", "#2A2A2A", "#1A365D"]} 
                style={styles.header} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => {
                            navigation.navigate("Menu");
                        }}
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

            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
                {route.params.formType === "cancelar" ? (
                    <View>
                        <Text style={styles.formTitle}>Cancelar Viagem</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Motivo do cancelamento</Text>
                            <TextInput
                                placeholder="Escreva o motivo do cancelamento"
                                style={[styles.input, styles.textArea]}
                                placeholderTextColor="grey"
                                multiline
                                numberOfLines={4}
                                value={formData.nota ? formData.nota : ""}
                                onChangeText={(text) => updateFormData("nota", text)}
                            />
                        </View>

                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelarViagem}>
                            {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>Cancelar Viagem</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.formTitle}>Finalizar viagem</Text>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoLabel}>Km de saida: </Text>
                                {formData.km_saida}
                            </Text>
                        </View>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Km chegada *</Text>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Km chegada"
                                style={styles.input}
                                placeholderTextColor="grey"
                                value={formData.km_chegada.toString()}
                                onChangeText={(text) => updateFormData("km_chegada", text === "" ? 0 : parseFloat(text))}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Observações (Nota)</Text>
                            <TextInput
                                placeholder="Adicione observações"
                                style={[styles.input, styles.textArea]}
                                placeholderTextColor="grey"
                                multiline
                                numberOfLines={4}
                                value={formData.nota ? formData.nota : ""}
                                onChangeText={(text) => updateFormData("nota", text)}
                            />
                        </View>

                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={finalizarViagem}>
                            {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>Finalizar Viagem</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F2F6",
    },
    header: {
        backgroundColor: "#1B1B1B",
        paddingBottom: 25,
        paddingTop: 20,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 25,
        paddingTop: 15,
        position: "relative",
    },
    homeButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 25,
        padding: 8,
        position: "absolute",
        left: 25,
        top: 15,
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
    logoContainer: {
        alignItems: "center",
        marginBottom: 25,
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
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        letterSpacing: 2,
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
    formTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A202C",
        marginBottom: 20,
        textAlign: "center",
    },
    mainContent: {
        flex: 1,
        padding: 25,
        backgroundColor: "#F1F2F6",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -15,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
        marginBottom: 8,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 16,
        color: "#1A202C",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButton: {
        backgroundColor: "#28a745",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#E53E3E",
        marginTop: 20,
    },
    infoContainer: {
        backgroundColor: "#E8F5E8",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#28a745",
    },
    infoText: {
        fontSize: 14,
        color: "#1A202C",
    },
    infoLabel: {
        fontWeight: "bold",
        color: "#28a745",
    }
});
