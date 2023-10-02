import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as tfr from '@tensorflow/tfjs-react-native';
import asset from "./globalvar"

import React, { useEffect, useState } from 'react';

export default function App() {

  // Defining the necessary states for the application
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [dogColor, setDogColor] = useState("black");
  const [catColor, setCatColor] = useState("black");
  const [isPredicting, setIsPredicting] = useState(false);


  // Defining the necessary variables for the application
  
  // Defining the function to load the model from the assets folder for prediction
  const loadModel = async () => {

    // Defining the modelJson and modelWeights from the globalvar.js file
    modelJson = asset.modelJson
    modelWeights = asset.modelWeights
    await tf.ready();

    // Bundling the model json and weights to load the model
    const bundleResource = tfr.bundleResourceIO(modelJson, modelWeights);
    const model = await tf.loadLayersModel(bundleResource);

    // Setting the model to the state
    setModel(model);
  }


  // Using the useEffect hook to load the model when the application starts
  useEffect(() => {
    loadModel();
  }, [])


  // Defining the function to predict the image
  const predict = async () => {
    if(!image) return;
    console.log("Predicting...");

    // Setting the isPredicting state to true to show the user that the model is predicting
    setIsPredicting(true);
    setPrediction(null);

    // Fetching the image from the uri and converting it to an array buffer
    const response = await fetch(image, {}, { isBinary: true });
    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageDataArrayBuffer);

    // Decoding the image and resizing it to 128x128 as the model model was trained on 128x128 images
    const imageTensor = tfr.decodeJpeg(imageData);
    const imageTensorResized = tf.image.resizeBilinear(imageTensor, [128, 128]);

    // Normalizing the image and converting it to an array
    const imageTensorNormalized = tf.div(imageTensorResized, 255.0);
    const imageTensorResizedArray = await imageTensorResized.array();
    
    // Predicting the image
    const prediction = await model.predict(tf.expandDims(imageTensorNormalized, axis=0)).data();
    console.log("Prediction: ", prediction[0].toFixed(2));
    
    // Setting the color of the text to green if the prediction is greater than 0.6 else black
    if(prediction[0] >= 0.5) {
      setDogColor("green");
      setCatColor("red");
    }
    else {
      setDogColor("red");
      setCatColor("green");
    }

    // Setting the prediction and isPredicting state to false
    setIsPredicting(false);
    setPrediction(prediction[0].toFixed(2));
  }

  // Defining the useEffect hook to predict the image when the image state changes
  useEffect(() => {
    if (model) {
      predict();
    }
  }, [image])


  // Defining the function to pick the image from the gallery
  pickedImage = async () => {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }

    console.log(result.uri);
  }


  return (
    <View style={styles.container}>
      {model == null && <Text>Loading Model...</Text>}

      <Text style={{marginBottom: 20, fontSize:40}}>Cats and Dogs</Text>
      <StatusBar style="auto" />

      <Button title="Pick Image" onPress={pickedImage} />
      <Text style={{marginBottom: .5}}></Text>
      <Button title="Reset" color="red" onPress={()=>{setImage(null);setPrediction(null);}} />

      
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 , marginBottom: 20, marginTop: 20}} />}
      {isPredicting && <Text style={{fontSize:30, color: "red"}}>Predicting</Text>}
      {prediction && <Text style={{color: dogColor, fontSize: 30}}>Dog: {prediction}</Text>}
      {prediction && <Text style={{color: catColor, fontSize: 30}}>Cat: {(1 - prediction).toFixed(2)}</Text>}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
