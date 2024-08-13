import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  useIonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import LogIn from "./pages/LogIn";
import Home from "./pages/Home";
import CheckIn from "./pages/CheckIn";
import { Network } from "@capacitor/network";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

/* Bootstrap imports */
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContextProvider } from "./context/UserContext";
import { Contact } from "./pages/Contact/Contact";
import { Visit } from "./pages/Visit/Visit";

setupIonicReact();

const App: React.FC = () => {
  const [present, dismiss] = useIonToast();

  Network.addListener("networkStatusChange", (status) => {
    if (!status.connected) {
      present({
        message: "Internet connection is required",
        duration: 0,
      });
    } else {
      dismiss();
    }
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <UserContextProvider>
            <Route exact path="/login">
              <LogIn />
            </Route>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/checkin">
              <CheckIn isCheckIn={true} />
            </Route>
            <Route exact path="/checkout">
              <CheckIn isCheckIn={false} />
            </Route>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/visit">
              <Visit />
            </Route>
          </UserContextProvider>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
