import React , { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";
import { useNavigate, useLocation } from "react-router-native";
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import firebase from "../../database/firebase.js";
import {getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
// Obtén una referencia al servicio de almacenamiento de Firebase
import 'firebase/storage';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from "../../database/firebase.js";
const db = getFirestore();


const AddRecipe = () => {
    const tableRecipes = 'recipes';
    const navigate = useNavigate();
    const location = useLocation();
    const editingRecipe = location.state ? location.state.recipeToEdit : null;
    const [ingredientsReversed, setIngredientsReversed] = useState(false);
    const [check, setChech] = useState(false);
    const [saving, setSaving] = useState(false);
    const [recipe, setRecipe] = useState({
      name: editingRecipe ? editingRecipe.name : '',
      ingredients: editingRecipe ? editingRecipe.ingredients : [{ name: '', quantity: '' }],
      image: editingRecipe ? editingRecipe.image : 'https://us.123rf.com/450wm/rastudio/rastudio1508/rastudio150800021/42978054-icono-de-boceto-palomitas-para-web-y-m%C3%B3vil-mano-vector-dibujado-icono-gris-oscuro-sobre-fondo-gris.jpg?ver=6',
      desc: editingRecipe ? editingRecipe.desc : '',
    });
    
    useEffect(() => {
      if (editingRecipe && !ingredientsReversed) {
          // Si existe una receta para editar y los ingredientes aún no se han invertido
          setRecipe(prevState => ({
              ...prevState,
              ingredients: prevState.ingredients.reverse(),
          }));
          setIngredientsReversed(true); // Marcamos que los ingredientes han sido invertidos
      }
  }, [editingRecipe, ingredientsReversed]);
    
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

        // Limpiar los espacios en blanco al principio o al final del nombre de los ingredientes
        const ingredientsData = recipe.ingredients.map(({ name, quantity }) => ({ name: name.trim(), quantity }));
        // Filtrar los ingredientes que tengan un nombre no vacío
        const nonEmptyIngredients = ingredientsData.filter(({ name }) => name !== '');
        const recipeData = { ...recipe, ingredients: nonEmptyIngredients };

        try {
          setSaving(true);
          if (editingRecipe && editingRecipe.id) {
            // Si la receta ya tiene un ID, entonces la estamos modificando
            await setDoc(doc(db, tableRecipes, editingRecipe.id), recipeData);
          } else {
            // Si la receta no tiene un ID, entonces la estamos agregando
            await addDoc(collection(db, tableRecipes), recipeData);
          }
          navigate('/');
        } catch (error) {
          console.error("Error al guardar la receta:", error);
          alert("Error al guardar la receta");
        } finally {
          setSaving(false);
        }
      }
      
    };

    const uploadImage = async (uri, imageName) => {
      setSaving(true);
      try {
        // Obtener el blob de la imagen desde la URI
        const response = await fetch(uri);
        const blob = await response.blob();
    
        // Crear la referencia en el almacenamiento de Firebase
        const storageRef = ref(storage, `images/${imageName}`);
    
        // Subir el blob al almacenamiento de Firebase
        const snapshot = await uploadBytes(storageRef, blob);
        console.log('Imagen subida exitosamente:', snapshot.metadata.fullPath);
        return storageRef
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
      }
    };

    const handleImageUpload = async () => {
      if (recipe.name == ''){
        alert("Antes debes ingresar un nombre")
      } else {
        try {
          // Solicita permiso para acceder a la galería de imágenes
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            alert('Se necesita permiso para acceder a la galería de imágenes.');
            return;
          }

          // Permite al usuario seleccionar una imagen de la galería
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1,
          });

          // Verifica si la selección de la imagen fue cancelada
          if (!result.canceled) {
            // Obtiene el nombre de la receta para usarlo como nombre de archivo en Firebase Storage
            const recipeName = recipe.name.trim().replace(/\s+/g, "_").toLowerCase();
            const imageName = `${recipeName}.jpg`;
            const imageUri = result.assets[0].uri;

            const refImage = await uploadImage(imageUri, imageName)

            const downloadURL = await getDownloadURL(refImage);

            setRecipe(prevState => ({ ...prevState, image: downloadURL }));
            setChech(true);
          }
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          alert('Error al subir la imagen');
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
                value={recipe.name}
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
                <View style={styles.uploadContainer}>
                  <TouchableOpacity onPress={handleImageUpload} >
                    <Text style={styles.uploadButton}>Subir Imagen</Text>
                  </TouchableOpacity>
                  {check && <Icon style={styles.icon} name="check" size={17}/> }
                </View>
                <TextInput 
                    style={[styles.input, styles.description]}
                    placeholder="Información adicional"
                    value={recipe.desc}
                    multiline={true}
                    numberOfLines={8}
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
                { editingRecipe ? ( <Text>  Editar  </Text> ) : ( <Text>Guardar</Text> ) }
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
  inputImage: {
    marginRight: 28,
  },
  description: {
    textAlignVertical:"top",
    paddingTop: 10,
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
    // borderRadius: 4,
    padding: 10,
  },
  uploadContainer: {
    flexDirection: 'row',
    // width: '80%',
  },
  uploadButton: {
    // width: '50%',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  icon: {
    padding: 10,
    color: 'green',
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