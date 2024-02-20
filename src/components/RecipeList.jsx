import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigate } from "react-router-native";
import SearchBar from "./SearchBar.jsx";


import firebase from "../../database/firebase.js";
import {getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, setDoct, onSnapshot, QuerySnapshot } from 'firebase/firestore';
const db = getFirestore();

const RecipeList = () => {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setSaving(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes-v2'));
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
  console.log(recipes)
  
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
              <TouchableOpacity style={styles.editButton}  onPress={() => toggleFavorite(recipe)}>
                {recipe.fav ? <Icon name="pencil" size={24} color="#333" /> : <Icon name="pencil" size={24} color='#333' />}
              </TouchableOpacity>
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
    height: 200,
    alignItems: 'center',
    backgroundColor: "#ededed"
  },
  postImage: {
    width: "40%",
    height: "90%",
    borderRadius: 4,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
    height: "80%",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
});
    

export default RecipeList
