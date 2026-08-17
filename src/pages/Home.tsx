// Utiliza as informações do Provider e aplica um espaçamento automático
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, FlatList, Modal, Image } from "react-native";
import { useState, useEffect } from "react";
import { Task, FilterType } from "../types/Task";
import { saveTasks, loadTasks } from "../service/storage";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newQtd, setNewQtd] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('todas');

  // Estados para o Modal de Edição
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editQtd, setEditQtd] = useState<number | string>("");

  const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const pendingCount = totalCount - completedCount

  useEffect(() => {
    fetchTasks();
  }, [])

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const savedTasks = await loadTasks();
      setTasks(savedTasks);
    } catch (error) {
      console.error("Erro ao inicializar tarefas: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  const generateId = (tasks: Task[]) => {
    const nextId = tasks.length === 0 ? 1 : Math.max(...tasks.map(task => Number(task.id))) + 1;

    return String(nextId).padStart(3, "0");
  }

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Atenção", "Digite uma descrição para a tarefa.");
      return;
    }
    if (Number(newQtd) === 0 || !Number(newQtd)  ) {
        Alert.alert("Atenção", "A quantidade não pode ser 0!")
        window.alert("A quantidade não pode ser 0!")
        return;
    }

    const newTask: Task = {
      id: generateId(tasks),
      title: newTitle.trim(),
      qtd: Number(newQtd),
      completed: false,
      createdAt: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }

    setTasks([newTask, ...tasks]);
    await saveTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewQtd("")

  }

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditQtd(task.qtd)
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    if (!editTitle.trim()) {
      Alert.alert("Atenção", "O título não pode ser vazio!")
      window.alert("O título não pode ser vazio!")
      return;
    }
    if (Number(editQtd) === 0 || !Number(editQtd)  ) {
        Alert.alert("Atenção", "A quantidade não pode ser 0!")
        window.alert("A quantidade não pode ser 0!")
        return;
    }

    const updatedList = tasks.map((task) => task.id === editingTask.id ?
      { ...task, title: editTitle.trim(), qtd:Number(editQtd) } : task)

    setTasks(updatedList);
    setEditingTask(null);
    setEditTitle('');
    setEditQtd('')
    await saveTasks(updatedList);
  }

  const handleDeleteTask = (id: string) => {
    Alert.alert(
      'Remover Tarefa',
      'Tem certeza de que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const updatedList = tasks.filter((task) => task.id !== id);
            setTasks(updatedList);
            // Atualiza os dados persistidos no AsyncStorage
            await saveTasks(updatedList);
          },
        },
      ]
    );
  };
  const handleDeleteTaskWeb = async (id: string) => {
    const confirmed = window.confirm(
      'Tem certeza de que deseja excluir esta tarefa?'
    );

    if (confirmed) {
      const updatedList = tasks.filter((task) => task.id !== id);
      setTasks(updatedList);
      // Atualiza os dados persistidos no AsyncStorage
      await saveTasks(updatedList);
    }
  };


  const handleToggleTask = async (id: string) => {
    const updatedList = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    setTasks(updatedList);
  };

   const filteredTasks = tasks.filter((task) => {
    if (filter === 'pendentes') return !task.completed;
    if (filter === 'concluidas') return task.completed;
    return true;
  });

  return (
    <SafeAreaView >
      <View style={styles.header}>
        <View style={styles.headerTop}>
        <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Olá, Ana!</Text>
        <Text style={styles.headerSubtitle}>Aqui está sua lista de compras.</Text>
        </View>
        <View style={styles.backgroundImg} >
            <Image 
        source={require('../images/cesta.png')} 
        style={styles.imagemHeader} 
      />
      </View>
      </View>
      {/* Placar de Resumo */}
        <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Itens Na Lista</Text>
            </View>
            <View style={[styles.statBadge]}>
              <Text style={[styles.statNumber, styles.statNumberPending]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
            <View style={[styles.statBadge]}>
              <Text style={[styles.statNumber, styles.statNumberCompleted]}>
                {completedCount}
              </Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
          </View>
        
      
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Tarefa"
          placeholderTextColor="#94A3B8"
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TextInput
          style={styles.inputQtd}
          placeholder="qtd."
          placeholderTextColor="#94A3B8"
          value={String(newQtd)}
          onChangeText={(v) => {
            const valorConvertido = Number(v) || "";

            setNewQtd(valorConvertido)
          }}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask} activeOpacity={0.8}>
          <Text style={styles.textAddButton}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

        {/* Botões de Filtro */}
        <View style={styles.filterContainer}>
          {(['todas', 'pendentes', 'concluidas'] as FilterType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                filter === type && styles.filterTabActive,
              ]}
              onPress={() => setFilter(type)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === type && styles.filterTabTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
            
            {type === "todas" && ` (${totalCount})`}
            {type === 'pendentes' && ` (${pendingCount})`}
            {type === 'concluidas' && ` (${completedCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {
        isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Carregando tarefas...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.card, item.completed && styles.cardCompleted]}>

                {/* Botão de Checkbox / Toggle de Conclusão */}
                <TouchableOpacity
                  style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                  onPress={() => handleToggleTask(item.id)}
                  activeOpacity={0.7}
                >
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                {/* Conteúdo textual da tarefa */}
                <View style={styles.textContainer}>
                    <View style={styles.itensInline}>
                        <Text
                    style={[styles.qtd, item.completed && styles.qtdCompleted]}
                    numberOfLines={2}
                  >
                    {item.qtd}x |
                    </Text>
                  <Text
                    style={[styles.title, item.completed && styles.titleCompleted]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  </View>
                  <Text style={styles.dateText}>Criada em: {item.createdAt}</Text>
                </View>

                {/* Ações (Editar e Excluir) */}
                <View style={styles.actionsContainer}>
                  {/* Botão Editar */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    activeOpacity={0.7}
                    onPress={() => handleOpenEditModal(item)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>

                  {/* Botão Excluir */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    activeOpacity={0.7}
                    onPress={() => handleDeleteTask(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDeleteTaskWeb(item.id)}
                  >
                    <AntDesign name="delete" size={18} color="#FC558E" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            // Propriedade para aplicar estilos no container interno do FlatList.
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Nenhuma tarefa encontrada</Text>
              </View>
            }
          // Propriedade que define o que deve renderizar caso a lista esteja vazia.
          />
        )
      }

      {/* Modal de Edição de Tarefa */}
      <Modal
        visible={editingTask !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Tarefa</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Novo título..."
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={String(editQtd)}
              onChangeText={(v) => {
            const valorConvertido = Number(v) || "";

            setEditQtd(valorConvertido)
          }}
              placeholder="Nova quantidade..."
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setEditingTask(null)}
              >
                <Text style={styles.cancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveModalText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  header: {
    backgroundColor: "#FeFEFE",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
  },

  headerTop:{
    flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
    },

    headerText:{
  flex: 1,
  flexDirection: "column",
    },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1F24",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#4A4A4D",
    marginTop: 2,
  },

  imagemHeader:{
    height: 120,
    width: 140,
    marginTop: 10,
    resizeMode: "contain",
  },

  backgroundImg:{
    backgroundColor: "#fcdfe4ff",
    borderRadius: 35,
    height: 80,
    width: 150,
    alignItems: "center",
  },

statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: "#FEFEFE",
    borderRadius: 20,
    height: 75,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fce6ebff",

  shadowColor: "#FC558E",
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0.25,
  shadowRadius: 12,

  elevation: 4,
},
  statBadge: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1F24',
  },
  statNumberPending: {
    color: '#1E1F24',
  },
  statNumberCompleted: {
    color: '#1E1F24',
  },
  statLabel: {
    fontSize: 11,
    color: '#4A4A4D',
    marginTop: 2,
  },
  
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10
  },
  input: {
    flex: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    width: 30, 
    borderColor: "#E2E8F0"
  },
  inputQtd:{
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    width: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  addButton: {
    backgroundColor: "#FC558E",
    paddingHorizontal: 16,
    borderRadius: 22,
    justifyContent: "center",
    alignContent: "center"
  },
  textAddButton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14
  },

  
filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#FEFEFE',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E2E8F0"
    
  },
  filterTabActive: {
    backgroundColor: '#FDE5E9',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: "#FC558E",
  },



  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FC558E',
  },
  cardCompleted: {
    backgroundColor: '#F8FAFC',
    borderLeftColor: '#10B981',
    opacity: 0.85,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FC558E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  qtd:{
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  qtdCompleted:{
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itensInline:{
    gap: 10,
    flexDirection: "row"
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8'
  },
  listContent: {
    padding: 16
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569'
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  editButton: {
    backgroundColor: "#F2EEF9"
  },
  editButtonText: {
    color: '#7343DB',
    fontSize: 12,
    fontWeight: '600'
  },
  deleteButton: {
    backgroundColor: "#FDE5E9"
  },
  deleteButtonText: {
    color: "#FC558E",
    fontSize: 12,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelModalButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelModalText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#FC558E',
  },
  saveModalText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

});
