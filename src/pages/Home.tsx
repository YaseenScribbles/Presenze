import {
  IonCol,
  IonContent,
  IonIcon,
  IonLoading,
  IonPage,
  IonRow,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import "./Home.css";
import { logOutOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { LOCAL_URL, STATIC_URL } from "../common/common";
import { useUserContext } from "../context/UserContext";
import { Redirect } from "react-router";
import { Geolocation } from "@capacitor/geolocation";
import { App } from "@capacitor/app";

const Home: React.FC = () => {
  const [activeBtn, setActiveBtn] = useState("checkin");
  const router = useIonRouter();
  const [present] = useIonToast();
  const { user, removeUser } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);

  const isPermissionEnabled = async () => {
    const status = await Geolocation.checkPermissions();
    const { location } = status;

    if (location !== "granted") {
      const { location: locationPerm } = await Geolocation.requestPermissions();
      if (locationPerm === "denied") {
        setTimeout(() => {
          present({
            message: "Location permission is not granted. Exiting the app.",
            duration: 3000,
          });
        }, 3000);

        App.exitApp();
      }
    }
  };

  useEffect(() => {
    isPermissionEnabled();
  }, []);

  if (!user) {
    return <Redirect to={"/login"} />;
  }

  const renderPage = (menuName: string) => {
    setActiveBtn(menuName);
    router.push(`/${menuName}`);
  };

  const logout = async () => {
    setLoading(true);
    const response = await axios.post(`${LOCAL_URL}logout`);
    present({
      message: response.data.message,
      duration: 3000,
    });
    if (response.status !== 200) return;
    removeUser();
    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonLoading isOpen={loading} />
        <div className="background-image-container">
          <div className="content d-flex flex-column justify-content-center align-items-center h-100">
            <IonRow>
              <IonCol>
                <div
                  className={`menu-btn text-center ${
                    activeBtn === "checkin" && "active"
                  }`}
                  onClick={() => renderPage("checkin")}
                >
                  Check In
                </div>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div
                  className={`menu-btn text-center ${
                    activeBtn === "menu2" && "active"
                  }`}
                >
                  Check Out
                </div>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div
                  className={`menu-btn text-center ${
                    activeBtn === "menu3" && "active"
                  }`}
                >
                  Menu 3
                </div>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div
                  className={`menu-btn text-center ${
                    activeBtn === "menu4" && "active"
                  }`}
                >
                  Menu 4
                </div>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div
                  className={`menu-btn text-center ${
                    activeBtn === "menu5" && "active"
                  }`}
                >
                  Menu 5
                </div>
              </IonCol>
            </IonRow>
          </div>
          <div className="logout-button">
            <IonIcon icon={logOutOutline} onClick={logout} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
