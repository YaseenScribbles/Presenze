import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { caretBack, caretDown } from "ionicons/icons";
import { useHistory } from "react-router";
import { useUserContext } from "../../context/UserContext";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { URL } from "../../common/common";
import AppTypeahead from "../../components/AppTypeahead";
import { Geolocation } from "@capacitor/geolocation";
import { App } from "@capacitor/app";
import './add-visit.css'

type Visit = {
  shop_id: number;
  location: string;
  purpose: string;
  user_id: number;
};

type Option = {
  value: string;
  label: string;
};

type Shop = {
  id: number;
  shopName: string;
};

const AddVisit: React.FC = () => {
  const router = useHistory();
  const { user } = useUserContext();
  const [visit, setVisit] = useState<Visit>({
    shop_id: 0,
    location: "",
    purpose: "",
    user_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const [shopOptions, setShopOptions] = useState<Option[]>([]);
  const modal = useRef<HTMLIonModalElement>(null);
  const [selectedShop, setSelectedShop] = useState<Option | null>(null);
  const [location, setLocation] = useState("");

  const getShops = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}contacts?all=true`);
      const {
        data: { data },
      } = response;
      const options: Option[] = data.map((e: Shop) => ({
        label: e.shopName,
        value: e.id,
      }));
      setShopOptions(options);
    } catch (error: any) {
      const {
        response: {
          data: { message },
        },
      } = error;
      present({
        message: message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVisit = async () => {
    if (!selectedShop) {
      present({
        message: "Please select shop",
        duration: 3000,
      });
      return;
    } else if (visit.purpose === "") {
      present({
        message: "Please fill the purpose",
        duration: 3000,
      });
      return;
    } else if (!location) {
      present({
        message: "Location is not fetched try reloading",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${URL}visits`,
        {
          ...visit,
          shop_id: selectedShop!.value,
          location: location,
          user_id: user!.id,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const { data, status } = response;
      present({
        message: data.message,
        duration: 3000,
      });

      if (status === 200) {
        setVisit({
          location: location,
          purpose: "",
          shop_id: 0,
          user_id: user!.id,
        });
        setSelectedShop(null)
      }
    } catch (error: any) {
      const {
        response: {
          data: { message },
        },
      } = error;
      present({
        message: message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const shopSelectionChanged = (shop: Option) => {
    setSelectedShop(shop);
  };

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
        await loadMap(coords.latitude, coords.longitude);
      }
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 0,
      });
      if (error.toString().toLowerCase().includes("disabled")) {
        setTimeout(() => {
          present({
            message: "Exiting the app",
            duration: 0,
          });
        }, 2000);
        App.exitApp();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMap = async (lat: number, long: number) => {
    try {
      const result = await fetch(`${URL}geocode?lat=${lat}&lng=${long}`, {
        headers: {
          Accept: "application/json",
        },
      });
      const data = await result.json();
      const { results } = data;
      setLocation(results[0].formatted_address);
    } catch (error: any) {
      present({
        message: error.toString(),
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    getShops();
    getCurrentPosition();
  }, []);

  return (
    <IonPage id="add-visit">
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonTitle>Add Visit</IonTitle>
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                router.push("/home");
              }}
            >
              <IonIcon icon={caretBack} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading spinner={"circles"} isOpen={loading} />
        <IonList>
          <IonItem>
            <IonInput
              placeholder="Purpose"
              value={visit.purpose}
              onIonInput={(e) =>
                setVisit((prev) => ({
                  ...prev,
                  purpose: e.target.value!.toString(),
                }))
              }
            />
          </IonItem>
          <IonItem button={true} detail={false} id="select-shop">
            <IonLabel color={"medium"}>Shop</IonLabel>
            <div slot="end" id="selected-shop">
              {selectedShop ? selectedShop.label : "None"}
            </div>
            <IonIcon icon={caretDown} slot="end"></IonIcon>
          </IonItem>
        </IonList>
        <IonButton onClick={saveVisit} expand="block">
          ADD
        </IonButton>
      </IonContent>
      <IonModal trigger="select-shop" ref={modal}>
        <AppTypeahead
          title="Select Shop"
          items={shopOptions}
          onSelectionCancel={() => modal.current?.dismiss()}
          onSelectionChange={shopSelectionChanged}
        />
      </IonModal>
    </IonPage>
  );
};

export default AddVisit;
