import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Alert  } from "react-native";
import { useLocation } from "react-router-native";
import { useNavigate } from "react-router-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import firebase from "../../database/firebase.js";
import { getDocs, collection, query, where, getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from "../../database/firebase.js";
const db = getFirestore();

const Recipe = ({ route }) => {
  const tableSupplies = 'supplies';
  const tableRecipes = 'recipes';
  // Obtener los parámetros de la URL, que incluirán el ID de la receta
  const navigate = useNavigate();
  const location = useLocation();
  const recipe = location.state.recipe;
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [finalPrice, setFinalPrice] = useState(0);
  let totalPrice = 0;

  useEffect(() => {
    const fetchIngredientPrices = async () => {
      const newIngredientPrices = {};
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name;
        try {
          const querySnapshot = await getDocs(query(collection(db, tableSupplies), where('name', '==', ingredientName)));
          const ingredientPrice = Math.ceil((querySnapshot.docs[0].data().price * ingredient.quantity) / querySnapshot.docs[0].data().quantity);
          newIngredientPrices[ingredientName] = ingredientPrice;
          totalPrice += ingredientPrice;
        } catch (error) {
          console.error('Error al obtener el precio del ingrediente:', error);
          newIngredientPrices[ingredientName] = 'Agregar a la lista';
        }
      }
      setIngredientPrices(newIngredientPrices);
      setFinalPrice(totalPrice);
    };

    fetchIngredientPrices();
  }, [recipe]);

  const handleAddToList = (ingredientName) => {
    navigate('/supplies', { state: { ingredientName } });
  };

  const deleteElement = async (id) => {
    try {
      await deleteDoc(doc(db, tableRecipes, id));
      console.log('Documento eliminado correctamente');
      const recipeName = recipe.name.trim().replace(/\s+/g, "_").toLowerCase();
      const imageName = `${recipeName}.jpg`;
      const storageRef = ref(storage, `images/${imageName}`);
      await deleteObject(storageRef);
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      const result = window.confirm('¿Estás seguro de que deseas eliminar la receta?');
      if (result) {
        // Lógica para eliminar el elemento
        deleteElement(id);
        console.log('Receta eliminada: ' + id);
      } else {
        console.log('Eliminación cancelada');
      }
    } else {
      Alert.alert(
        'Confirmación',
        '¿Estás seguro de que deseas eliminar la receta?',
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
              console.log('Receta eliminada: ' + id);
            }
          }
        ]
      )
    }
  }; 

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{recipe.name}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigate('/recipe/add', { state: { recipeToEdit: recipe } })}>
            <Icon style={styles.icon} name="pencil" size={32} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(recipe.id)}>
            <Icon style={styles.icon} name="trash-o" size={32} color="#d00" />
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView style={styles.scroll} scrollEventThrottle={16}>
        <View  style={styles.content}>
          <Image source={{uri:`${recipe.image}`}} style={styles.postImage} />
          <View style={styles.headerContainer}>
            <View style={styles.item1}><Text style={styles.item}>Ingredientes</Text></View>
            <View style={styles.item2}><Text style={styles.item}>(gr/ml)</Text></View>
            <View style={styles.item2}><Text style={styles.item}>precio</Text></View>
          </View>
          {recipe.ingredients.map((ingredient, index) => (
            <View style={styles.ingredientContainer} key={index}>
              <View style={[styles.column, styles.ingredientName]}>
                <Text style={styles.ingredientText}>{ingredient.name}</Text>
              </View>
              <View style={[styles.column, styles.ingredientQuantity]}>
                <Text style={styles.ingredientText}>{ingredient.quantity}</Text>
              </View>
              <View style={[styles.column, styles.priceContainer]}>
                {ingredientPrices[ingredient.name] === 'Agregar a la lista' ? (
                  <TouchableOpacity onPress={() => handleAddToList(ingredient.name)} style={styles.touchableOpacity}>
                    <Text style={styles.addToList}>Añadir</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.price}>$ {ingredientPrices[ingredient.name]}</Text>
                )}
              </View>
            </View>
          ))}
          <View style={styles.ingredientContainer}>
            <View style={styles.item1}/>
            <View style={styles.item2}/>
            <View style={[styles.item2, styles.finalPrice]}>
              <Text style={styles.textPrice}>$ {finalPrice} </Text>
              <Text style={styles.detail}>precio final</Text>
            </View>
          </View>
          {recipe.desc != '' ?(
            <View style={styles.endRecipe}>
              <Text style={styles.titleDesc}>Información adicional:</Text>
              <Text>{recipe.desc}</Text>
            </View>
            ):(
              <View style={styles.endRecipe}>
                
              </View>
            )
          }
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '70%',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 10,
  },
  deleteButton: {
    padding: 10,
    marginRight: 10,
  },
  
  scroll: {
    flex: 1,
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
  },
  item: {
    fontWeight: 'bold',
  },
  item1: {
    flex: 2,
  },
  item2: {
    flex: 1,
    alignItems: 'center'
  },
  postImage: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 4,
    marginBottom: 20
  },
  ingredientContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    // borderBottomWidth: 1,
    borderColor: '#999'
  },
  column: {
    flex: 1,
    justifyContent: 'center',
  },
  ingredientName: {
    flex: 2,
  },
  ingredientQuantity: {
    flex: 1,
    alignItems: 'center',

  },
  priceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  ingredientText: {
    fontSize: 16,
  },
  price: {
    fontSize: 14,
    color: 'gray',
  },
  finalPrice: {
    borderTopWidth: 1,
    borderColor: '#333',
    fontSize: 17,
    // marginBottom: 70,

  },
  textPrice: {
    fontSize: 22,
  },
  detail: {
    fontSize: 13,
    color: '#999'
  },
  touchableOpacity: {
    padding: 5,
    backgroundColor: 'lightblue',
    borderRadius: 5,
    alignItems: 'center',
  },
  addToList: {
    fontSize: 14,
    color: 'blue',
  },
  titleDesc: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  endRecipe: {
    marginBottom: 50,
  },
});

export default Recipe;
