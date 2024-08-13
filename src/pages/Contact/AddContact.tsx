import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import axios from "axios";
import { caretBack } from "ionicons/icons";
import { useState } from "react";
import { URL } from "../../common/common";
import { useUserContext } from "../../context/UserContext";
import "./AddContact.css";
import { useHistory } from "react-router";

type Contact = {
  shop_name: string;
  contact_name: string;
  city: string;
  zipcode: string;
  state: string;
  district: string;
  phone: string;
  email: string;
  user_id: number;
};

export const AddContact: React.FC = () => {
  const { user } = useUserContext();
  const [contact, setContact] = useState<Contact>({
    shop_name: "",
    contact_name: "",
    city: "",
    zipcode: "",
    state: "",
    district: "",
    phone: "",
    email: "",
    user_id: user!.id,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [present] = useIonToast();
  const router = useHistory();

  const saveContact = async () => {
    setLoading(true);

    try {
      const resp = await axios.post(
        `${URL}contacts`,
        {
          ...contact,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const { data, status } = resp;

      present({
        message: data.message,
        duration: 3000,
      });

      if (status === 200) {
        setContact({
          shop_name: "",
          contact_name: "",
          city: "",
          zipcode: "",
          state: "",
          district: "",
          phone: "",
          email: "",
          user_id: user!.id,
        });
      }
    } catch (error: any) {
      const { response } = error;
      present({
        message: response.data.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContactsList = async () => {
    setLoading(true);
  };

  return (
    <IonPage id="contact">
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonTitle>Add Contact</IonTitle>
          <IonButtons slot={"start"}>
            <IonButton onClick={() => router.push('/home')}>
              <IonIcon icon={caretBack} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading spinner={"circular"} isOpen={loading} />
        <IonList>
          <IonItem>
            <IonInput
              placeholder="Shop Name"
              value={contact.shop_name}
              onIonInput={(e) =>
                setContact({
                  ...contact,
                  shop_name: e.target.value!.toString(),
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Contact Person"
              value={contact.contact_name}
              onIonInput={(e) =>
                setContact({
                  ...contact,
                  contact_name: e.target.value!.toString(),
                })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Email"
              type="email"
              value={contact.email}
              onIonInput={(e) =>
                setContact({ ...contact, email: e.target.value!.toString() })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Phone"
              value={contact.phone}
              onIonInput={(e) =>
                setContact({ ...contact, phone: e.target.value!.toString() })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="City"
              value={contact.city}
              onIonInput={(e) =>
                setContact({ ...contact, city: e.target.value!.toString() })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="District"
              value={contact.district}
              onIonInput={(e) =>
                setContact({ ...contact, district: e.target.value!.toString() })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Pincode"
              value={contact.zipcode}
              onIonInput={(e) =>
                setContact({ ...contact, zipcode: e.target.value!.toString() })
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="State"
              value={contact.state}
              onIonInput={(e) =>
                setContact({ ...contact, state: e.target.value!.toString() })
              }
            />
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={saveContact}>
          ADD
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
