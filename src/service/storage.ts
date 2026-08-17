import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/Task"

// Async Storage - Sistema de armanezamento (chave-valor) mantido localmente no dispositivo do usuario. Ele armazena apenas strings, entao para salvar objetos ou array TypeScripts, precisamos converte-los em string JSON

// CHAVE UNICA como identificador do nosso recurso
const TASKS_KEY = '@todo-app:tasks';

// Promise<void> -> Promise === Prometo que vou executar essa operação
// Promise<void> -> void === Não vai desenvolver nenhum valor, apenas avisar se deu certo ou nao
export const saveTasks = async(tasks: Task[]): Promise<void> => {
    // Json.stringify() -> Converte o valor/objeto em string JSON
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY,jsonValue)
}

export const loadTasks = async (): Promise<Task[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(TASKS_KEY);

        return jsonValue !== null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Erro ao carregar tarefas do AsyncStorage')
        return []
    }
}
