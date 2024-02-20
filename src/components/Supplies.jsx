import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";
import { useLocation, useNavigate } from "react-router-native";

import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import firebase from "../../database/firebase.js";
const db = getFirestore();

const Supplies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let ingredientName = location.state?.ingredientName;
    console.log(ingredientName)
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(location.state?.ingredientName);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [supplies, setSupplies] = useState([]);

    const saveSupply = async () => {
        // Convertir las cadenas de quantity y price a enteros
        const quantityInt = parseInt(quantity);
        const priceInt = parseInt(price);

        if (name === '' || isNaN(quantityInt) || isNaN(priceInt)) {
            alert("Todos los campos deben estar llenos y la cantidad y el precio deben ser números enteros");
            return;
        }
        setSaving(true);
        try {
            const docRef = await addDoc(collection(db, 'supplies-v2'), { name, quantity: quantityInt, price: priceInt });
            const newSupply = { id: docRef.id, name, quantity: quantityInt, price: priceInt };
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
                const querySnapshot = await getDocs(collection(db, 'supplies-v2'));
                const supplyArray = [];
                querySnapshot.forEach((doc) => {
                    const { name, quantity, price } = doc.data();
                    supplyArray.push({ id: doc.id, name, quantity, price });
                  });
                  setSupplies(supplyArray.sort(compareByName));
                  console.log(supplyArray);
            } catch (error) {
                console.error("Error al obtener insumos:", error);
                alert("Error al obtener insumos");
            } finally {
                setSaving(false); // Detiene el indicador de guardado
            }
        };

        fetchSupplies();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.supplyInputContainer}>
                <TextInput
                    style={[styles.input]}
                    value={name}
                    placeholder="Agregar Insumo..."
                    onChangeText={setName}
                />
                <TextInput
                    style={[styles.input, styles.inputNumber]}
                    placeholder="(gr)"
                    inputMode="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                />
                <TextInput
                    style={[styles.input, styles.inputNumber]}
                    placeholder="$"
                    inputMode="numeric"
                    value={price}
                    onChangeText={setPrice}
                />
                
                {saving ? (
                   <ActivityIndicator size="large" color="lightblue" style={styles.load} />
                  ) : (
                    <TouchableOpacity onPress={saveSupply} style={styles.saveButton}>
                       <Text>Guardar</Text>
                    </TouchableOpacity>
                  )}
            </View>
            <Text style={styles.title}>Lista de precios:</Text>
            <ScrollView scrollEventThrottle={16}>
                {supplies.map((supply) => (
                    <View key={supply.id} style={styles.suppliesContainer}>
                        <Text style={[styles.item, styles.item1]}>{supply.name}</Text>
                        <Text style={[styles.item, styles.itemNumeric]}>{supply.quantity} gr</Text>
                        <Text style={[styles.item, styles.itemNumeric]}>$ {supply.price}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  saveButton: {
    position: 'absolute',
    right: -10,
    backgroundColor: 'lightblue',
    borderRadius: 50,
    padding: 10,
  },
  load: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  supplyInputContainer: {
    flexDirection: 'row',
  },
  suppliesContainer: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item1: {
    flex: 2,
  },
  itemNumeric: {
    flex: 1,
    textAlign: 'center',
  },
});

export default Supplies;
