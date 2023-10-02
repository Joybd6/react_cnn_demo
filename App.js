import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as tfr from '@tensorflow/tfjs-react-native';

import React, { useEffect, useState } from 'react';

export default function App() {

  const [image, setImage] = useState(null);
  //const [model, setModel] = useState(null);
  //const [modelResult, setModelResult] = useState(null);


  const loadModel = async () => {
    modelJson = require('./assets/model.json');
    modelWeights = require('assets/group1shard1of1.bin');
    //await tf.ready();
    //const bundleResource = tfr.bundleResourceIO(modelJson, modelWeights);
    //const model = await tf.loadLayersModel(bundleResource);
  }

/*   const predict = async () => {
    const response = await fetch(image, {}, { isBinary: true });
    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageData = new Uint8Array(imageDataArrayBuffer);
    const imageTensor = tfr.decodeJpeg(imageData);
    const imageTensorResized = tf.image.resizeBilinear(imageTensor, [128, 128]);
    const imageTensorResizedArray = await imageTensorResized.array();
    const finalImageTensor = tf.tensor4d(imageTensorResizedArray, [1, 224, 224, 3]);
    const prediction = await model.predict(finalImageTensor).data();
    console.log(prediction);
  } */

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
      <Text style={{marginBottom: 20, fontSize:40}}>CNN Loader MotherFucker</Text>
      <StatusBar style="auto" />
      <Button title="Pick Image" style={{marginBottom: 20}} onPress={pickedImage} />

      <Button title="Reset" onPress={()=>{setImage(null)}} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Image source={require('./assets/adaptive-icon.png')} style={{width:200, height: 200}} />
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
