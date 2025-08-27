import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { api } from "../../services/api";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface VehicleSelectorProps {
    onVeiculoSelect: (vehicle: Veiculo) => void;
    currentVehicle: Veiculo | null;
    onOpenScanner: () => void;
}


export default function ProcurarVeiculo({ onVeiculoSelect, currentVehicle, onOpenScanner }: VehicleSelectorProps) {
    // const [showScanner, setShowScanner] = useState<boolean>(false);
    const [placaVeiculo, setPlacaVeiculo] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);


    async function procurarVeiculo() {
        if (!placaVeiculo.trim()) {
            Toast.show({
                type: "error",
                text1: "Por favor, digite o código do veículo",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.post<Veiculo>("veiculo/placa", {
                placa: placaVeiculo,
            });

            onVeiculoSelect(response.data);
        } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Veículo não encontrado",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Digite a placa do veículo</Text>
                <TextInput
                    placeholder="EX: ABC-1234"
                    style={styles.input}
                    placeholderTextColor="#A0AEC0"
                    value={placaVeiculo}
                    onChangeText={setPlacaVeiculo}
                    editable={!loading}
                    autoCapitalize="characters"
                />
            </View>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={procurarVeiculo} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size={25} color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>
                        Procurar <Feather size={15} name="search" />{" "}
                    </Text>
                )}
            </TouchableOpacity>
            <Text style={{ justifyContent: "center", textAlign: "center", marginBottom: 15, fontSize: 15, fontWeight: "bold", color: "#4A5568" }}>OU</Text>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={onOpenScanner} 
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    Procurar por código QR <MaterialCommunityIcons size={15} name="qrcode" />
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    qrCodeScannerContainer: { 
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    fieldContainer: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 8,
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
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#FF8C00",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FF8C00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});