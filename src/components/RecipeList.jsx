import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigate } from "react-router-native";
import SearchBar from "./SearchBar.jsx";

import firebase from "../../database/firebase.js";
import {getFirestore, collection, getDocs } from 'firebase/firestore';
const db = getFirestore();

const RecipeList = () => {
  const tableRecipes = 'recipes';
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setSaving(true);
      try {
        const querySnapshot = await getDocs(collection(db, tableRecipes));
        const recipeArray = []
        querySnapshot.docs.forEach((doc) => {
          const {name, ingredients, image, desc, fav} = doc.data()
          recipeArray.push({
            id: doc.id,
            name,
            ingredients,
            image,
            desc,
            fav, 
          })
          
        });
        setRecipes(recipeArray);
      } catch (error) {
        console.error("Error al obtener recetas:", error);
      } finally {
        setSaving(false); // Detiene el indicador de guardado
      }
    };

    fetchRecipes();
  }, []);
  
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFavorite = (recipe) => {
    recipe.fav = !recipe.fav;
      
  };
  
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())  
  );
 
  return (
    <View style={styles.container}>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ScrollView style={styles.item} scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Mis Recetas:</Text>
        </View>
          {saving && (<ActivityIndicator size="large" color="lightblue" style={styles.load} />)}
        {filteredRecipes.map(recipe => (
          <TouchableOpacity key={recipe.id} onPress={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })}>
            <View style={styles.postContainer}>
              <Image source={{uri:`${recipe.image}`}} style={styles.postImage} />
              <View style={styles.postContent}>
                <Text style={styles.postTitle}>{recipe.name}</Text>
                {recipe.ingredients.slice(0, 4).map((ingredient, index, array) => (
                  <Text key={index}>
                    - {index === array.length - 1 && index == 3 ? ingredient.name + '\n   ...' : ingredient.name}
                  </Text>
                ))}
                
              </View>
              
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

    
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  item: {
    flex: 1,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: 'center',
    backgroundColor: "#ededed",
    minHeight: 190,
  },
  postImage: {
    width: "40%",
    height: "90%",
    borderRadius: 4,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
    // height: "90%",
    alignSelf: 'flex-start',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
});

export default RecipeList
