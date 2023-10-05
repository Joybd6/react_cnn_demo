# react_cnn_demo
A tensorflow custom model deployed in react native for demo

>[!WARNING]
>The dependencies in the `package.json` file should be maintained carefully.
>Android Sdk buildtools 33.0.0 and NDK 27.1.77796 must be installed

**How to:**
1. Install the dependancies using npm package manager : `npm install --legacy-peer-deps`
2. Run android emulator from device manager or plug in android phone using usb cable. Make sure developer mode and usb debugging is on
3. Run the application: `npm run android`
4. Scan the QR code from terminal where the app is started. Make sure both pc and mobile is in the same local network.

>[!NOTE]
>To generate standalone apk file follow the official guidelines: [Builds APK](https://docs.expo.dev/build-reference/apk/).


**How the model is loaded:**
1. Follow this [jupyter notebook](https://colab.research.google.com/drive/1npm_ibOYlPzfNP_BQ_iv8hz0wcT3SgE6?usp=sharing) to generate trained model file compatible for `tensorflowjs`
2. After downloading the model zip file from the notebook extract the files and copy only the files to assets folder in the react native project directory.
3. To load the model json and its binary file for the weights associated with the model. use a js file containing dictionary of these files. For example:
```javascript
// globalvar.js file
const asset = {
    "modelJson": require("./assets/model.json"),
    "modelWeights1": require("./assets/group1-shard1of2.bin"),
    "modelWeights2": require("./assets/group1-shard2of2.bin")
}
// There can be several .bin file for weights. In this case all the bin file should be in array in sequential order.

export default asset
```
4. And the the model can be loaded like this in a react state:
```javascript
const [model, setModel] = useState(null);
const loadModel = async () => {

    // Defining the modelJson and modelWeights from the globalvar.js file
    modelJson = asset.modelJson
    modelWeights1 = asset.modelWeights1
    modelWeights2 = asset.modelWeights2
    await tf.ready();

    // Bundling the model json and weights to load the model
    const bundleResource = tfr.bundleResourceIO(modelJson, [modelWeights1, modelWeights2]);
    const model = await tf.loadLayersModel(bundleResource);

    // Setting the model to the state
    setModel(model);
  }
```
>[!IMPORTANT]
> In the react native app, the metro bundler has to be configured to bundle the `.bin` file as asset. You can follow the this codebase's `metro.config.js` for the job.
> Or the [official guideline](https://facebook.github.io/metro/docs/configuration/) to customze the config file

5. Now the prediction can be made by this model like this:
```javascript
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
    

    // Setting the prediction and isPredicting state to false
    setIsPredicting(false);
    setPrediction(prediction[0].toFixed(2));
  }
```
