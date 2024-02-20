import React , { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";
import { useNavigate } from "react-router-native";

import firebase from "../../database/firebase.js";
import {getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, setDoct } from 'firebase/firestore';
const db = getFirestore();

const AddRecipe = () => {
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false);
    const [recipe, setRecipe] = useState({
        name: '',
        ingredients: [{name:'', quantity: ''}],
        image: 'https://us.123rf.com/450wm/rastudio/rastudio1508/rastudio150800021/42978054-icono-de-boceto-palomitas-para-web-y-m%C3%B3vil-mano-vector-dibujado-icono-gris-oscuro-sobre-fondo-gris.jpg?ver=6',
        desc: '',
        fav: false
    }); 
    
    const handleChangeRecipe = (field, value, index) => {
      setRecipe(prevState => {
        if (index !== undefined) {
          return {
            ...prevState,
            ingredients: prevState.ingredients.map((ingredient, i) => {
              if (i === index) {
                return { ...ingredient, [field]: value };
              }
              return ingredient;
            })
          };
        } else {
          return {
            ...prevState,
            [field]: value
          };
        }
      });
    };

    
    
    const handleAddIngredient = () => {
      setRecipe(prevState => ({
        ...prevState,
        ingredients: [{ name: '', quantity: '' }, ...prevState.ingredients],
      }));
    };
  

        
    const saveRecipe = async () => {
      if (recipe.name == ''){
        alert("El nombre no es valido")
      }
      else {
        const updatedRecipe = { ...recipe };
        updatedRecipe.ingredients.reverse();
        setRecipe(updatedRecipe);

        const ingredientsData = recipe.ingredients
          .filter(({ name }) => name.trim() !== '')
          .map(({ name, quantity }) => ({ name, quantity }));
        const recipeData = { ...recipe, ingredients: ingredientsData };
        try {
          setSaving(true);
          await addDoc(collection(db, 'recipes-v2'), recipeData);
          navigate('/');
        } catch (error) {
          console.error("Error al guardar la receta:", error);
          alert("Error al guardar la receta");
        } finally {
          setSaving(false);
        }
      }
      
    };
    

    

   
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Agregar Receta</Text>
        <ScrollView scrollEventThrottle={16}>

            <TextInput
                style={styles.input}
                placeholder="Nombre de la receta"
                onChangeText={(value) => handleChangeRecipe('name', value)}
            />
            <View style={styles.ingredientsContainer}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View style={styles.inputIngredientContainer}>
                    <TextInput
                        key={index}
                        style={[styles.input, styles.itemIngredient]}
                        placeholder="Ingrediente"
                        value={ingredient.name}
                        onChangeText={(value) => handleChangeRecipe('name', value, index)}
                    />
                    <TextInput
                      style={[styles.input, styles.itemQuantity]}
                      placeholder="(gr)"
                      inputMode= "numeric"
                      value={ingredient.quantity}
                      onChangeText={(value) => handleChangeRecipe('quantity', value, index)}
                    />
                    </View>
                ))}
                <TouchableOpacity onPress={handleAddIngredient} style={styles.addButton}>
                    <Text>+</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Imagen"
                  onChangeText={(value) => handleChangeRecipe('image', value)}
                />
                <TextInput 
                    style={[styles.input, styles.description]}
                    placeholder="Preparación"
                    onChangeText={(value) => handleChangeRecipe('desc', value)}
                />
            </View>
        </ScrollView>
        {saving ? (
            // Muestra el mensaje "Guardando..." mientras se está realizando la operación de guardado
            <ActivityIndicator size="large" color="lightblue" style={styles.load} />
        ) : (
            // Botón para iniciar el guardado de la receta
            <TouchableOpacity onPress={saveRecipe} style={styles.saveButton}>
                <Text>Guardar</Text>
            </TouchableOpacity>
        )}
        
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
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  description: {
    paddingBottom: 70,
  },
  ingredientsContainer: {
    position: 'relative',
  },
  inputIngredientContainer: {
    flexDirection: 'row'
  },
  itemIngredient: {
    width: '70%',
  },
  itemQuantity: {
    width: '30%',
    
  },
  addButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'lightblue',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    padding: 10,
  },
  saveButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'lightblue',
    borderRadius: 50,
    padding: 10,
  },
  load:
  {
    position: 'absolute',
    right: 25,
    top: 10,
  },
});

export default AddRecipe;
