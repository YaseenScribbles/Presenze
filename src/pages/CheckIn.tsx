import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonHeader,
  IonLoading,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Geolocation, Position } from "@capacitor/geolocation";
import { useState } from "react";
import {
  Camera,
  CameraResultType,
  Photo,
  CameraSource,
  CameraDirection,
} from "@capacitor/camera";
import axios from "axios";
import Compressor from "compressorjs";
import { LOCAL_URL, STATIC_URL } from "../common/common";
import { App } from "@capacitor/app";
import { caretBack } from "ionicons/icons";
import { useUserContext } from "../context/UserContext";
import { Redirect } from "react-router";

const CheckIn: React.FC = () => {
  const [position, setPosition] = useState<Position>();
  const [name, setName] = useState("");
  const [image, setImage] = useState<Photo>();
  const [loading, setLoading] = useState<boolean>(false);
  const [present] = useIonToast();
  const { user } = useUserContext();

  if (!user) {
    return <Redirect to={"/login"} />;
  }

  useIonViewDidEnter(() => {
    isPermissionEnabled();
    getCurrentPosition();
  });

  const isPermissionEnabled = async () => {
    const status = await Geolocation.checkPermissions();
    const { location } = status;

    if (location === "denied") {
      present({
        message: "Location permission is denied. Exiting the app.",
        duration: 3000,
      });
      App.exitApp();
    }
  };

  const getCurrentPosition = async () => {
    setLoading(true);
    const position = await Geolocation.getCurrentPosition();
    const { coords } = position;
    setPosition(position);
    await loadMap(coords.latitude, coords.longitude);
    setLoading(false);
  };

  const loadMap = async (lat: number, long: number) => {
    const result = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
    );
    const data = await result.json();
    console.log(data);
    const { address } = data;
    setName(address.city || "");
  };

  const loadCamera = async () => {
    try {
      const capturedImage = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        direction: CameraDirection.Front,
      });

      setImage(capturedImage);

      let image = await fetch(capturedImage.webPath!).then((res) => res.blob());
      new Compressor(image, {
        maxHeight: 600,
        maxWidth: 600,
        resize: "contain",
        quality: 0.8,
        success(file) {
          sendDataToApi(file);
        },
        error(error) {
          present({
            message: error.message,
            duration: 3000,
          });
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const sendDataToApi = async (compressedImage: Blob) => {
    try {
      if (compressedImage) {
        const body = {
          user_id: 1,
          location: name,
          image: compressedImage,
        };

        const resp = await axios.post(`${LOCAL_URL}checkin`, body, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        present({
          message: resp.data.message,
          duration: 3000,
        });
      }
    } catch (error) {
      present({
        message: "Network error",
        duration: 3000,
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonTitle>CHECK IN</IonTitle>
          <IonButtons slot="start">
            <IonBackButton text={"Menu"} icon={caretBack} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color={"dark"}>
        <IonLoading isOpen={loading} message="Please wait..." duration={0} />
        <IonRow>
          <IonCol size="6" offset="3">
            <IonButton
              color={"medium"}
              shape="round"
              expand="block"
              onClick={loadCamera}
            >
              Check In
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`Current Coordinates : ${position?.coords.latitude}, ${position?.coords.longitude} `}</IonCol>
        </IonRow>
        {name !== "" && (
          <>
            <IonRow>
              <IonCol>Current Location :</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{name.toUpperCase()}</IonCol>
            </IonRow>
          </>
        )}
        <IonRow>
          <IonCol></IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default CheckIn;
