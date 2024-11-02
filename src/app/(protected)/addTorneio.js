import { Text, View, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { z } from "zod";
import { useTorneioDatabase } from "../../database/useTorneioDatabase";
import { router } from "expo-router";
import Constants from 'expo-constants';
import TopBar from "../../components/TopBar";
import { Ionicons } from "@expo/vector-icons";
import { requestNotificationPermission, scheduleNotification } from "../../components/Notifications";
import { useNotificationListener } from "../../components/Notifications";

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AddTorneio() {
    useNotificationListener();
    const torneioSchema = z.object({
        nome: z.string().nonempty("Por favor, insira um nome para o torneio."),
        data_torneio: z.string(),
        local: z.string().nonempty("O local do torneio é necessário."),
        foto: z.string().url("URL da foto inválida"),
        descricao: z.string().optional(),
    });

    const { createTorneio } = useTorneioDatabase();

    const [nome, setNome] = useState("");
    const [local, setLocal] = useState("");
    const [foto, setFoto] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataTorneio, setDataTorneio] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dataTorneio;
        setShowDatePicker(false);
        setDataTorneio(currentDate);
    };

    const handleSubmit = async () => {
        const torneio = {
            nome,
            data_torneio: formatDate(dataTorneio),
            local,
            foto,
            descricao,
        };

        try {
            await torneioSchema.parseAsync(torneio);
            await createTorneio(torneio);
            Alert.alert("Sucesso", "Torneio criado! Relogue para atualizar a lista de torneios.");
            
            await scheduleNotification(
                "Torneio Criado!",
                `O torneio ${nome} foi criado com sucesso para ${dataTorneio.toLocaleDateString()}.`
            );

            router.back();
        } catch (error) {
            Alert.alert("Erro", error.errors?.[0]?.message || "Erro: Não foi possível criar o torneio. Por favor, verifique os detalhes e tente novamente");
        }
    };

    return (
        <View style={styles.container}>
            <TopBar />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Crie um torneio</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Nome"
                        style={styles.inputWithIcon}
                        onChangeText={setNome}
                        value={nome}
                    />
                    <Ionicons name="trophy" size={24} color="#FFA500" style={styles.iconInsideInput} />
                </View>

                <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>Data do Torneio: {dataTorneio.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={dataTorneio}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="Local"
                        onChangeText={setLocal}
                        value={local}
                    />
                    <Ionicons name="location" size={24} color="#FFA500" style={styles.iconInsideInput} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="Foto (URL do torneio, ex: https://...)"
                        onChangeText={setFoto}
                        value={foto}
                    />
                    <Ionicons name="image" size={24} color="#FFA500" style={styles.iconInsideInput} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="Descreva brevemente o torneio."
                        onChangeText={setDescricao}
                        value={descricao}
                    />
                    <Ionicons name="document-text" size={24} color="#FFA500" style={styles.iconInsideInput} />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Criar Torneio</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffa',
        paddingTop: Constants.statusBarHeight,
    },
    scrollContainer: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontFamily: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#ffa500',
    },
    inputWithIcon: {
        fontFamily: 'regular',
        height: 50,
        flex: 1,
        borderColor: '#ffa500',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingRight: 40,
        fontSize: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative',
    },
    iconInsideInput: {
        position: 'absolute',
        right: 15,
    },
    datePicker: {
        width: '100%',
        padding: 15,
        backgroundColor: '#ffa500',
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'bold',
    },
    button: {
        width: '100%',
        backgroundColor: '#ffa500',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'bold',
    },
});
