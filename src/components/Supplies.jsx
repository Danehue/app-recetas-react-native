import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform, Alert } from "react-native";
import { ScrollView } from "react-native";
import { useLocation, useNavigate } from "react-router-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import firebase from "../../database/firebase.js";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
const db = getFirestore();

const Supplies = () => {
    const tableSupplies = 'supplies';
    const navigate = useNavigate();
    const location = useLocation();
    let ingredientName = location.state?.ingredientName;
    const [saving, setSaving] = useState(false);
    const [edit, setEdit] = useState(false);
    const [name, setName] = useState(location.state?.ingredientName);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [supplies, setSupplies] = useState([]);
    const [editingSupplyId, setEditingSupplyId] = useState(null);

    const saveSupply = async () => {
        // Convertir las cadenas de quantity y price a enteros
        const trimmedName = name.trim();
        const quantityInt = parseInt(quantity);
        const priceInt = parseInt(price);

        if (trimmedName === '' || isNaN(quantityInt) || isNaN(priceInt)) {
            alert("Todos los campos deben estar llenos y la cantidad y el precio deben ser números enteros");
            return;
        }
        setSaving(true);
        try {
            const docRef = await addDoc(collection(db, tableSupplies), { name: trimmedName, quantity: quantityInt, price: priceInt });
            const newSupply = { id: docRef.id, name: trimmedName, quantity: quantityInt, price: priceInt };
            setSupplies(prevSupplies => [...prevSupplies, newSupply]);
            setName('');
            setQuantity('');
            setPrice('');
            // ingredientName= '';
        } catch (error) {
            console.error("Error al guardar el insumo:", error);
            alert("Error al guardar el insumo");
        } finally {
            setSaving(false); // Detiene el indicador de guardado
        }
    }

    const compareByName = (a, b) => {
      // Convertir los nombres a minúsculas para realizar una comparación insensible a mayúsculas
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
    
      if (nameA < nameB) {
        return -1; // 'a' viene antes que 'b'
      }
      if (nameA > nameB) {
        return 1; // 'b' viene antes que 'a'
      }
      return 0; // Los nombres son iguales
    };

    useEffect(() => {
        const fetchSupplies = async () => {
            setSaving(true);
            try {
                const querySnapshot = await getDocs(collection(db, tableSupplies));
                const supplyArray = [];
                querySnapshot.forEach((doc) => {
                    const { name, quantity, price } = doc.data();
                    supplyArray.push({ id: doc.id, name, quantity, price });
                  });
                  setSupplies(supplyArray.sort(compareByName));
            } catch (error) {
                console.error("Error al obtener insumos:", error);
                alert("Error al obtener insumos");
            } finally {
                setSaving(false); // Detiene el indicador de guardado
            }
        };

        fetchSupplies();
    }, []);

    const deleteElement = async (id) => {
      try {
        await deleteDoc(doc(db, tableSupplies, id));
        console.log('Documento eliminado correctamente');
        setSupplies(prevSupplies => prevSupplies.filter(supply => supply.id !== id));
      } catch (error) {
        console.error('Error al eliminar el documento:', error);
      }
    };

    const handleDelete = (id) => {
      if (Platform.OS === 'web') {
        const result = window.confirm('¿Estás seguro de que deseas eliminar el elemento?');
        if (result) {
          // Lógica para eliminar el elemento
          deleteElement(id);
          console.log('Elemento eliminado: ' + id);
        } else {
          console.log('Eliminación cancelada');
        }
      } else {
        Alert.alert(
          'Confirmación',
          '¿Estás seguro de que deseas eliminar el elemento?',
          [
            {
              text: 'Cancelar',
              onPress: () => console.log('Cancelado'),
              style: 'cancel'
            },
            { 
              text: 'Eliminar', 
              onPress: () => {
                // Aquí colocarías la lógica para eliminar el elemento
                deleteElement(id);
                console.log('Elemento eliminado: ' + id);
              }
            }
          ]
        )
      }
    }; 

    const handleEdit = (supply) => {
      setEdit(true);
      setName(supply.name)
      setQuantity(supply.quantity)
      setPrice(supply.price)
      setEditingSupplyId(supply.id)
    }

    const handleSaveEdit = async () => {
      setSaving(true);
      try {
        await updateDoc(doc(db, tableSupplies, editingSupplyId), {
          name,
          quantity: parseInt(quantity),
          price: parseInt(price)
        });
        console.log('Suministro actualizado correctamente');
        setSupplies(prevSupplies =>
          prevSupplies.map(supply =>
            supply.id === editingSupplyId
              ? { ...supply, name, quantity: parseInt(quantity), price: parseInt(price) }
              : supply
          )
        );
      } catch (error) {
        console.error('Error al actualizar el suministro:', error);
        alert("Ocurrio un error");
      } finally {
        setEdit(false);
        setName('');
        setQuantity('');
        setPrice('');
        setEditingSupplyId(null);
        setSaving(false);
      }
    };

    return (
        <View style={styles.container}>
            <View style={styles.supplyInputContainer}>
                <TextInput
                    style={[styles.input]}
                    value={name}
                    placeholder="Agregar a la lista"
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, styles.inputNumber]}
                    placeholder="(gr)"
                    inputMode="numeric"
                    value={quantity.toString()}
                    onChangeText={setQuantity}
                />
                <TextInput
                    style={[styles.input, styles.inputNumber]}
                    placeholder="$"
                    inputMode="numeric"
                    value={price.toString()}
                    onChangeText={setPrice}
                />
                
                {saving ? (
                    <ActivityIndicator size="large" color="lightblue" style={styles.load} />
                  ) : edit ? (
                    <TouchableOpacity onPress={() => handleSaveEdit()} style={[styles.button, styles.editButton]}>
                      <Text>Editar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={saveSupply} style={styles.button}>
                      <Text>Guardar</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.title}>Lista de precios:</Text>
            <ScrollView scrollEventThrottle={16}>
              <View style={styles.scrollContainer}>
                    <View style={styles.suppliesContainer}>
                      <Text style={[styles.item, styles.item1, styles.header]}>Insumo</Text>
                      <Text style={[styles.item, styles.itemNumeric, styles.header]}>(gr/ml)</Text>
                      <Text style={[styles.item, styles.itemNumeric, styles.header]}>Precio</Text>
                      <Text style={[styles.item]}></Text>
                    </View>
                {supplies.map((supply) => (
                    <View key={supply.id} style={styles.suppliesContainer}>
                        <Text style={[styles.item, styles.item1]}>{supply.name}</Text>
                        <Text style={[styles.item, styles.itemNumeric]}>{supply.quantity} gr</Text>
                        <Text style={[styles.item, styles.itemNumeric]}>$ {supply.price}</Text>
                        <TouchableOpacity onPress={() => handleEdit(supply)}>
                          <Icon style={styles.icon} name="pencil" size={32} color="#444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(supply.id)}>  
                          <Icon style={styles.icon} name="trash-o" size={32} color="#d00" />
                        </TouchableOpacity>
                    </View>
                ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 20,
  },
  input: {
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: "45%"
  },
  inputNumber: {
    textAlign: 'center', 
    width: "17%"
  },
  description: {
    paddingBottom: 70,
  },
  ingredientsContainer: {
    position: 'relative',
  },
  button: {
    position: 'absolute',
    right: 10,
    top: 20, 
    backgroundColor: 'lightblue',
    borderRadius: 50,
    padding: 10,
  },
  editButton: {
    paddingHorizontal: 17,
  },
  load: {
    position: 'absolute',
    right: 25,
    top: 20,
  },
  scrollContainer: {
    padding: 20,
  },
  header:{
    fontWeight: 'bold',
  },
  supplyInputContainer: {
    flexDirection: 'row',
    padding: 20,

  },
  suppliesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item1: {
    flex: 1.5,
  },
  itemNumeric: {
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    paddingLeft: 10,
  },
});

export default Supplies;