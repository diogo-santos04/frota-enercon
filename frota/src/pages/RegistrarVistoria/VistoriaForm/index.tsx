import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal } from "react-native";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { styles } from "./styles";
import MaskInput from "react-native-mask-input";
import { ModalPicker } from "../../../components/ModalPicker";
import { LinearGradient } from "expo-linear-gradient";

interface Veiculo {
    id: number;
    nome: string;
    marca: string;
    placa: string;
}

interface Motorista {
    id: string;
    profissional_id: string;
    cnh: string | null;
    validade: Date;
    categoria: string[];
}

interface Profissional {
    id: string;
    user_id: string;
    nome: string;
    cpf: string;
    matricula: string;
    celular: string;
    codigo: string;
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

interface VistoriaFormProps {
    veiculo: Veiculo | null;
    motorista: Motorista | null;
    profissional: Profissional;
    onSubmit: (formData: FormData) => void;
    submitting: boolean;
}

interface Option {
    id: number | string;
    nome: string;
}

const combustivelOptions: Option[] = [
    { id: 1, nome: "1/4" },
    { id: 2, nome: "2/4" },
    { id: 3, nome: "3/4" },
    { id: 4, nome: "Cheio" },
];

const pneuOptions: Option[] = [
    { id: "Ruim", nome: "Ruim" },
    { id: "Regular", nome: "Regular" },
    { id: "Bom", nome: "Bom" },
    { id: "Otimo", nome: "Ótimo" },
];

export default function VistoriaForm({ veiculo, motorista, profissional, onSubmit, submitting }: VistoriaFormProps) {
    const [showForm2, setShowForm2] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState<"data_vistoria" | "data_troca_oleo" | null>(null);

    const [modalCombustivel, setModalCombustivel] = useState(false);
    const [combustivelSelected, setCombustivelSelected] = useState<Option | undefined>();
    const [modalPneuDianteiro, setModalPneuDianteiro] = useState(false);
    const [pneuDianteiroSelected, setPneuDianteiroSelected] = useState<Option | undefined>();
    const [modalPneuTraseiro, setModalPneuTraseiro] = useState(false);
    const [pneuTraseiroSelected, setPneuTraseiroSelected] = useState<Option | undefined>();
    const [modalPneuEstepe, setModalPneuEstepe] = useState(false);
    const [pneuEstepeSelected, setPneuEstepeSelected] = useState<Option | undefined>();

    const hoje = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState<FormData>({
        data_vistoria: hoje,
        km_vistoria: "",
        km_troca_oleo: "",
        data_troca_oleo: "",
        documento: false,
        cartao_abastecimento: false,
        combustivel: "",
        pneu_dianteiro: "",
        pneu_traseiro: "",
        pneu_estepe: "",
        nota: "",
        status: "Finalizado",
    });

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(null);
        if (selectedDate) {
            updateFormData(showDatePicker!, format(selectedDate, "dd/MM/yyyy"));
        }
    };

    const handleSubmit = () => {
        if (!formData.data_vistoria || !formData.km_vistoria || !formData.km_troca_oleo || !formData.data_troca_oleo) {
            Toast.show({
                type: "error",
                text1: "Preencha os campos obrigatórios da primeira etapa.",
            });
            return;
        }

        if (showForm2 && (!formData.combustivel || !formData.pneu_dianteiro || !formData.pneu_traseiro || !formData.pneu_estepe)) {
            Toast.show({
                type: "error",
                text1: "Preencha os campos obrigatórios da segunda etapa.",
            });
            return;
        }

        onSubmit(formData);
    };

    function handleChangeCombustivel(item: Option) {
        setCombustivelSelected(item);
        setFormData((prev) => ({ ...prev, combustivel: item.nome }));
        setModalCombustivel(false);
    }

    function handleChangePneuDianteiro(item: Option) {
        setPneuDianteiroSelected(item);
        setFormData((prev) => ({ ...prev, pneu_dianteiro: item.nome }));
        setModalPneuDianteiro(false);
    }

    function handleChangePneuTraseiro(item: Option) {
        setPneuTraseiroSelected(item);
        setFormData((prev) => ({ ...prev, pneu_traseiro: item.nome }));
        setModalPneuTraseiro(false);
    }

    function handleChangePneuEstepe(item: Option) {
        setPneuEstepeSelected(item);
        setFormData((prev) => ({ ...prev, pneu_estepe: item.nome }));
        setModalPneuEstepe(false);
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Modals para os Pickers */}
            <Modal transparent={true} visible={modalCombustivel} animationType="fade">
                <ModalPicker
                    handleCloseModal={() => setModalCombustivel(false)}
                    options={combustivelOptions}
                    selectedItem={handleChangeCombustivel}
                    title="Selecione o nível de combustível"
                    labelKey="nome"
                />
            </Modal>
            <Modal transparent={true} visible={modalPneuDianteiro} animationType="fade">
                <ModalPicker
                    handleCloseModal={() => setModalPneuDianteiro(false)}
                    options={pneuOptions}
                    selectedItem={handleChangePneuDianteiro}
                    title="Selecione a condição do pneu dianteiro"
                    labelKey="nome"
                />
            </Modal>
            <Modal transparent={true} visible={modalPneuTraseiro} animationType="fade">
                <ModalPicker
                    handleCloseModal={() => setModalPneuTraseiro(false)}
                    options={pneuOptions}
                    selectedItem={handleChangePneuTraseiro}
                    title="Selecione a condição do pneu traseiro"
                    labelKey="nome"
                />
            </Modal>
            <Modal transparent={true} visible={modalPneuEstepe} animationType="fade">
                <ModalPicker
                    handleCloseModal={() => setModalPneuEstepe(false)}
                    options={pneuOptions}
                    selectedItem={handleChangePneuEstepe}
                    title="Selecione a condição do pneu estepe"
                    labelKey="nome"
                />
            </Modal>
            {/* Fim dos Modals */}

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

            {veiculo && (
                <>
                    {!showForm2 ? (
                        <>
                            <View style={styles.rowContainer}>
                                <View style={[styles.fieldContainer, styles.halfWidth]}>
                                    <Text style={styles.label}>Km Vistoria *</Text>
                                    <TextInput
                                        placeholder="Km Vistoria"
                                        style={styles.input}
                                        placeholderTextColor="grey"
                                        value={formData.km_vistoria}
                                        onChangeText={(text) => updateFormData("km_vistoria", text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.fieldContainer, styles.halfWidth]}>
                                    <Text style={styles.label}>Km Troca do Óleo *</Text>
                                    <TextInput
                                        placeholder="Km Troca do Óleo"
                                        style={styles.input}
                                        placeholderTextColor="grey"
                                        value={formData.km_troca_oleo}
                                        onChangeText={(text) => updateFormData("km_troca_oleo", text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.rowContainer}>
                                <View style={[styles.fieldContainer]}>
                                    <Text style={styles.label}>Data Troca do Óleo *</Text>
                                    <MaskInput
                                        style={styles.input}
                                        value={formData.data_troca_oleo}
                                        onChangeText={(masked, unmasked) => {
                                            updateFormData("data_troca_oleo", masked);
                                        }}
                                        mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                                        placeholder="DD/MM/AAAA"
                                        keyboardType="numeric"
                                        placeholderTextColor="grey"
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Nível do Combustível</Text>
                                <TouchableOpacity style={styles.pickerInput} onPress={() => setModalCombustivel(true)}>
                                    <Text style={combustivelSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{combustivelSelected?.nome || "Selecione "}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rowContainer}>
                                <View style={[styles.fieldContainer, styles.checkboxContainer]}>
                                    <Text style={styles.label}>Documento</Text>
                                    <TouchableOpacity style={styles.checkbox} onPress={() => updateFormData("documento", !formData.documento)}>
                                        <Feather name={formData.documento ? "check-square" : "square"} size={24} color={formData.documento ? "#28a745" : "#333"} />
                                        <Text style={styles.checkboxLabel}>Em dia</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.fieldContainer, styles.checkboxContainer]}>
                                    <Text style={styles.label}>Cartão Abastecimento</Text>
                                    <TouchableOpacity style={styles.checkbox} onPress={() => updateFormData("cartao_abastecimento", !formData.cartao_abastecimento)}>
                                        <Feather name={formData.cartao_abastecimento ? "check-square" : "square"} size={24} color={formData.cartao_abastecimento ? "#28a745" : "#333"} />
                                        <Text style={styles.checkboxLabel}>Possuo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} onPress={() => setShowForm2(true)} disabled={submitting}>
                                <Text style={styles.buttonText}>Continuar Vistoria</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Pneu Dianteiro *</Text>
                                <TouchableOpacity style={styles.pickerInput} onPress={() => setModalPneuDianteiro(true)}>
                                    <Text style={pneuDianteiroSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{pneuDianteiroSelected?.nome || "Selecione a Condição"}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Pneu Traseiro *</Text>
                                <TouchableOpacity style={styles.pickerInput} onPress={() => setModalPneuTraseiro(true)}>
                                    <Text style={pneuTraseiroSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{pneuTraseiroSelected?.nome || "Selecione a Condição"}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Pneu Estepe *</Text>
                                <TouchableOpacity style={styles.pickerInput} onPress={() => setModalPneuEstepe(true)}>
                                    <Text style={pneuEstepeSelected?.nome ? styles.pickerText : styles.pickerPlaceholderText}>{pneuEstepeSelected?.nome || "Selecione a Condição"}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Observações</Text>
                                <TextInput
                                    placeholder="Alguma nota adicional?"
                                    style={[styles.input, styles.textArea]}
                                    placeholderTextColor="grey"
                                    value={formData.nota}
                                    onChangeText={(text) => updateFormData("nota", text)}
                                    multiline
                                />
                            </View>

                            <TouchableOpacity style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
                                {submitting ? <ActivityIndicator size={25} color="#FFF" /> : <Text style={styles.buttonText}>Finalizar Vistoria</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.backButton, submitting && styles.buttonDisabled]} onPress={() => setShowForm2(false)} disabled={submitting}>
                                <Text style={styles.buttonText}>Voltar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}

            {showDatePicker && <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />}
        </ScrollView>
    );
}