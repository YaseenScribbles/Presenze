import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonModal,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonToast,
} from "@ionic/react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Geolocation, Position } from "@capacitor/geolocation";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraResultType,
  Photo,
  CameraSource,
  CameraDirection,
} from "@capacitor/camera";
import axios from "axios";
import Compressor from "compressorjs";
import {
  LOCAL_URL,
  LOCAL_URL_FILE,
  STATIC_URL,
  STATIC_URL_FILE,
  formatDate,
} from "../common/common";
import {
  cameraOutline,
  caretBack,
  closeOutline,
  locationOutline,
} from "ionicons/icons";
import { useUserContext } from "../context/UserContext";
import { Redirect } from "react-router";
import "./CheckIn.css";

const CheckIn: React.FC = () => {
  const [position, setPosition] = useState<Position>();
  const [location, setLocation] = useState("");
  const [city , setCity] = useState<string>("");
  const [image, setImage] = useState<Photo>();
  const [loading, setLoading] = useState<boolean>(false);
  const [present] = useIonToast();
  const { user } = useUserContext();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  interface CheckIn {
    user_id: number;
    location: string;
    image_path: string;
    created_at: string;
  }
  const modalRef = useRef<HTMLIonModalElement>(null);

  if (!user) {
    return <Redirect to={"/login"} />;
  }

  const getCheckIns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${LOCAL_URL}checkin?user_id=${user.id}`
      );
      if (response.status === 200) {
        const [data] = response.data;
        setCheckIns(data || []);
      } else {
        setCheckIns([]);
      }
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentPosition();
    getCheckIns();
  }, []);

  const getCurrentPosition = async () => {
    setLoading(true);
    try {
      let position = await Geolocation.getCurrentPosition({
        maximumAge: 5000,
      });

      if (
        !position ||
        !position.coords ||
        position.coords.latitude === 0 ||
        position.coords.longitude === 0
      ) {
        // Handle case where position is undefined or incomplete
        present({
          message: "Can't fetch current coordinates",
          duration: 3000,
        });
        // Use fallback mechanism here if needed
      } else {
        const { coords } = position;
        setPosition(position);
        await loadMap(coords.latitude, coords.longitude);
      }
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMap = async (lat: number, long: number) => {
    try {
      const result = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
      );
      const data = await result.json();      
      const { display_name, address } = data;  
      setCity(address.city || address.state_district);    
      setLocation(display_name || "");
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 3000,
      });
    }
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
          user_id: user.id,
          location: city,
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
        await getCheckIns();
      }
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 3000,
      });
    }
  };

  const dismiss = () => {
    modalRef.current?.dismiss();
  };

  const handleRefresh = async (e : CustomEvent<RefresherEventDetail>) => {
    await getCheckIns();
    e.detail.complete();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonTitle>CHECK IN</IonTitle>
          <IonButtons slot="start">
            <IonBackButton text={"Menu"} icon={caretBack} />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton id="open-modal">
              <IonIcon icon={locationOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot={"fixed"} onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonModal trigger="open-modal" ref={modalRef} id="location-modal">
          <IonContent>
            <IonToolbar>
              <IonTitle>Current Location</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => dismiss()}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonNote class="text-center">
                    <IonIcon icon={locationOutline} /> {location}
                  </IonNote>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>
        <IonLoading isOpen={loading} message="Please wait..." />
        <IonList>
          <IonListHeader>
            <IonLabel>Previous Checkins</IonLabel>
          </IonListHeader>
          {checkIns.map((c, index) => {
            return (
              <IonItem key={index} className="mb-3">
                <div className="checkin-grid">
                  <div className="time">
                    <div>Time</div>
                    <strong>{formatDate(c.created_at)}</strong>
                  </div>
                  <div className="place">
                    <div>Place</div>
                    <strong>{c.location}</strong>
                  </div>
                  <div className="selfie">
                    <img
                      alt="user_selfie"
                      src={`${LOCAL_URL_FILE}/${c.image_path}`}
                    />
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={loadCamera} color={"primary"}>
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default CheckIn;
