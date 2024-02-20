import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useParams } from "react-router-native";
import recipes from "../data/recipes.js";
import { useLocation } from "react-router-native";
import { useNavigate } from "react-router-native";

import { getDocs, collection, query, where, getFirestore } from 'firebase/firestore';
const db = getFirestore();

const Recipe = ({ route }) => {
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
          const querySnapshot = await getDocs(query(collection(db, 'supplies-v2'), where('name', '==', ingredientName)));
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>

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
                    <Text style={styles.addToList}>Add to list</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20
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
    marginBottom: 70,

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
});

export default Recipe;
