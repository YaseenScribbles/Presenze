import {
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonIcon,
  IonLoading,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast, 
} from "@ionic/react";
import { FloatingLabel, Form } from "react-bootstrap";
import { logInOutline } from "ionicons/icons";
import { useState } from "react";
import { URL } from "../common/common";
import { useUserContext } from "../context/UserContext";
import { Redirect } from "react-router";

export default function LogIn() {
  interface UserCredentails {
    email: string;
    password: string;
  }

  const [credentials, setCredentials] = useState<UserCredentails>({
    email: "",
    password: "",
  });

  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const { user, setUser } = useUserContext();
  const [ loading, setLoading ] = useState<boolean>(false)
  
  if (user) {    
    return <Redirect to={"/home"} />;    
  }

  const logInUser = async () => {
    setLoading(true)
    try {
      const resp = await fetch(`${URL}login`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const response = await resp.json();

      presentToast({
        message: response.message,
        duration: 3000,
      });

      setLoading(false)
      if (resp.status !== 200) return;
      setUser(response.user);
      router.push("/home");
    } catch (error: any) {    
      setLoading(false)  
      presentToast({
        message: error.toString(),
        duration: 3000
      })
    }
  };

  return (
    <IonPage>
      <IonContent color={"dark"}>
        <IonLoading isOpen={loading} />
        <IonRow>
          <IonCol sizeLg="6">
            <h2 className="text-center">Welcome Back!</h2>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeLg="6">
            <FloatingLabel
              controlId="email"
              label="✉️ Email Address"
              className="mb-3 text-secondary"
            >
              <Form.Control
                type="email"
                placeholder="name@example.com"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </FloatingLabel>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeLg="6">
            <FloatingLabel
              controlId="password"
              label="🔑 Password"
              className="mb-3 text-secondary"
            >
              <Form.Control
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </FloatingLabel>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeLg="6">
            <IonButton
              color={"secondary"}
              className="d-block"
              onClick={logInUser}
            >
              Login
              <div className="ms-2">
                <IonIcon icon={logInOutline} size="large" />
              </div>
            </IonButton>
          </IonCol>
        </IonRow>
      </IonContent>
      <IonFooter>
        <IonToolbar color={"dark"}>
          <IonTitle size="small" className="ion-text-center text-secondary">
            ESSA GARMENTS PVT LTD ©️ 2024
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}
