import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, StatusBar } from "react-native";
import { api } from "../../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamsList } from "../../routes/app.routes";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { styles } from "./styles";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

interface Item {
    id: number;
    nome: string;
    descricao: string;
    ordem: number;
}

interface VistoriaItemType {
    vistoria_id: number;
    item_id: number;
    nota: string;
}

type RouteDetailParams = {
    VistoriaItem: {
        vistoria_id: number;
    };
};

type VistoriaItemRouteProps = RouteProp<RouteDetailParams, "VistoriaItem">;

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 5;
const CHECKBOX_WIDTH = 170;

export default function VistoriaItem() {
    const navigation = useNavigation<NativeStackNavigationProp<StackParamsList>>();
    const route = useRoute<VistoriaItemRouteProps>();
    const vistoria_id = route.params?.vistoria_id;

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function getItens() {
            setLoading(true);
            try {
                const response = await api.get("item");
                setItems(response.data);
            } catch (error) {
                console.error("Error fetching items:", error);
                Toast.show({
                    type: "error",
                    text1: "Erro ao carregar itens",
                    text2: "Verifique sua conexão e tente novamente.",
                });
            } finally {
                setLoading(false);
            }
        }

        getItens();
    }, []);

    const handleCheckboxChange = (itemId: number, isChecked: boolean) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: isChecked,
        }));
    };

    async function handleSubmit() {
        if (!vistoria_id) {
            Toast.show({
                type: "error",
                text1: "ID da vistoria não fornecido",
                text2: "Não foi possível registrar os itens.",
            });
            return;
        }

        setSubmitting(true);
        try {
            const itemsToSave: VistoriaItemType[] = Object.keys(selectedItems)
                .filter((itemId) => selectedItems[parseInt(itemId)])
                .map((itemId) => ({
                    vistoria_id: vistoria_id,
                    item_id: parseInt(itemId),
                    nota: "",
                }));

            if (itemsToSave.length === 0) {
                Toast.show({
                    type: "info",
                    text1: "Nenhum item selecionado",
                    text2: "Selecione ao menos um item para registrar.",
                });
                setSubmitting(false);
                return;
            }

            for (const itemData of itemsToSave) {
                await api.post("/vistoria_item", itemData);
            }

            Toast.show({
                type: "success",
                text1: "Vistoria registrada com sucesso!",
            });
            navigation.navigate("Menu");
        } catch (error) {
            console.error("Error submitting vistoria items:", error);
            Toast.show({
                type: "error",
                text1: "Erro ao registrar itens da vistoria",
                text2: "Tente novamente mais tarde.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const chunkArray = (arr: Item[], chunkSize: number) => {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    };

    const itemsPerRow = Math.floor(width / (CHECKBOX_WIDTH + ITEM_MARGIN * 2));

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
                        onPress={() => navigation.navigate("Menu")}
                    >
                        <Feather name="home" size={20} color="#1A365D" />
                    </TouchableOpacity>
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
            </LinearGradient>
            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.formTitle}>Assinale os itens que precisam de manutenção</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0B7EC8" />
                ) : items.length > 0 ? (
                    chunkArray(items, itemsPerRow).map((rowItems, rowIndex) => (
                        <View key={rowIndex} style={styles.rowContainer}>
                            {rowItems.map((item) => (
                                <View key={item.id} style={styles.itemWrapper}>
                                    <View style={styles.itemContainer}>
                                        <Checkbox
                                            style={styles.checkbox}
                                            value={selectedItems[item.id] || false}
                                            onValueChange={(isChecked) => handleCheckboxChange(item.id, isChecked)}
                                            color={selectedItems[item.id] ? "#0B7EC8" : undefined}
                                        />
                                        <Text style={styles.itemTitle}>{item.nome}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noItemsText}>Nenhum item encontrado.</Text>
                )}

                <TouchableOpacity style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={styles.buttonText}>Salvar Itens da Vistoria</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}


