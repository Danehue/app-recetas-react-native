import React, {useEffect} from 'react';
import RecipeList from './RecipeList.jsx'
import Recipe from './Recipe.jsx'
import AddRecipe from './AddRecipe.jsx';
import Supplies from './Supplies.jsx';
import { StyleSheet, BackHandler} from 'react-native'
import { Routes, Route, useNavigate} from 'react-router-native';


const Main = () =>{
    const navigate = useNavigate();

    // Función para manejar la pulsación del botón de retroceso del dispositivo
    const handleBackPress = () => {
        navigate('/');
        return true; // Indica que hemos manejado la pulsación del botón de retroceso
    };

    useEffect(() => {
        // Agregar el listener para el evento de pulsación del botón de retroceso
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        // Limpiar el listener cuando el componente se desmonte
        return () => backHandler.remove();
    }, []);

    return(
        <Routes>
            <Route path='/' exact element={<RecipeList/>}/>
            <Route path='/recipe/:id' exact element={<Recipe/>}/>
            <Route path='/recipe/add' exact element={<AddRecipe/>}/>
            <Route path='/supplies' exact element={<Supplies/>}/>
        </Routes>
    )
}

const styles = StyleSheet.create({

})

export default Main