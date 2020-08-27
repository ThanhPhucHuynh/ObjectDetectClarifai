import { StatusBar } from 'expo-status-bar';
import React,{useState, useEffect} from 'react';
import { StyleSheet, Text, View,TouchableOpacity,FlatList } from 'react-native';


import * as ImageManipulator from 'expo-image-manipulator'
import * as Permissions from 'expo-permissions'
import { Camera } from 'expo-camera'

const Clarifai = require('clarifai');

const clarifai = new Clarifai.App({
  apiKey: '72b9e8b3d45a411b8d5f1557d6d1b7db',
});

interface State{
  hasPermission: boolean;
  type: any;
  camera: any;
  currImgSrc: string | null;
  predictions: any;
}



export default function App() {

  const [state, setState] = useState({
    hasPermission: false,
    type: Camera.Constants.Type.back,
    camera: null,
    currImgSrc: "",
    // predictions: []
  } as State);
  let camera: any = null;
  
  useEffect(()=>{
    (async ()=>{
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      const hasPermission = status === "granted" ? true : false;
      setState({ ...state, hasPermission });
    })();
  },[])
  
  async function capturePhoto(){
    if (camera) {
      let photo = await camera.takePictureAsync();
      return photo.uri;
    }
  };
  async function resize (photo:any) {
    let manipulatedImage = await ImageManipulator.manipulateAsync(
      photo,
      [{ resize: { height: 300, width: 300 } }],
      { base64: true }
    );
    return manipulatedImage.base64;
  };
  async function predict(image:any) {
    let predictions = await clarifai.models.predict(
      Clarifai.GENERAL_MODEL,
      image
    );
    return predictions;
  };
  const objectDetection = async () => {
    let photo = await capturePhoto();
    let resized = await resize(photo);
    let predictions = await predict(resized);
    setState({...state, predictions: predictions.outputs[0].data.concepts });
  };


  return (
    <View style={{ flex: 1 }}>
    <Camera
      ref={ref => {
        camera = ref;
      }}
      autoFocus={true}
      zoom={0}
      ratio="16:9"
      style={{ flex: 2 }}
      type={state.type}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}
      >
        <View
          style={{
            flex: 1,
            alignSelf: 'flex-start',
            alignItems: 'center',
          }}
        >
          <FlatList
            data={(state.predictions)?state.predictions.map((prediction:any) => ({
              key: `${prediction.name} ${prediction.value}`,
            })):[]}
            renderItem={({ item }) => (
              <Text style={{ paddingLeft: 15, color: 'white', fontSize: 20 }}>{item.key}</Text>
            )}
          />
        </View>
        <View style={{
          flex:0.1,
          justifyContent:"center",
          alignItems: "center"
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
           
            backgroundColor: 'white',
            height: 40,
            width: 80,
            borderRadius: 40,
          }}
          onPress={objectDetection}
        >
          
          <Text style={{ fontSize: 20, color: 'black', padding: 15 }}>
            {' '}
            click{' '}
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    </Camera>
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
  boder:{
    flex: 0.1,
    alignItems: 'center',
    backgroundColor: 'white',
    height: 20,
    width: 20,
    borderRadius: 10,
  }
});
