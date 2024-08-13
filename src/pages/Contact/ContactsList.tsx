import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonNote,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import axios from "axios";
import { caretBack } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { URL } from "../../common/common";
import "./ContactList.css";
import useDebounce from "../../hooks/useDebounce";

type Contact = {
  id: number;
  shopName: string;
  contactName: string;
  city: string;
  zipcode: string;
  state: string;
  district: string;
  phone: string;
  email: string;
  active: string;
  userId: string;
};

export const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [present] = useIonToast();
  const router = useIonRouter();
  const [pageNo, setPageNo] = useState(1);
  const [isListCompleted, setIsListCompleted] = useState(false);
  const [searchTerm, setSearchterm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const getContacts = async (pageNo = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${URL}contacts?page=${pageNo}&search_term=${searchTerm}`
      );
      const { data } = response;
      setContacts(data.data);
    } catch (error: any) {
      const { response } = error;
      present({
        message: response.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (pageNo: number, searchTerm = "") => {
    try {
      const response = await axios.get(
        `${URL}contacts?page=${pageNo}&search_term=${searchTerm}`
      );
      const {
        data: { data },
      } = response;
      if (data.length === 0) {
        setIsListCompleted(true);
      } else {
        setContacts((prev) => [...prev, ...data]);
      }
    } catch (error: any) {
      const { response } = error;
      present({
        message: response.message,
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    getContacts();
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setPageNo(1);
      setIsListCompleted(false);
      setContacts([]);
      getContacts(1, debouncedSearchTerm);
      infiniteScrollRef.current?.complete();
      // Attempt to set focus using requestAnimationFrame
      requestAnimationFrame(() => {
        searchRef.current?.setFocus();
        if (searchRef.current) {
          const searchInput = searchRef.current.querySelector("input");
          searchInput?.focus();
        }
      });
    } else if (dataLoaded) {
      setPageNo(1);
      setIsListCompleted(false);
      setContacts([]);
      getContacts();
    }
  }, [debouncedSearchTerm]);

  return (
    <IonPage id="contact-list">
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonButtons slot="start">
            <IonButton onClick={() => router.push("/home")}>
              <IonIcon icon={caretBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Contacts</IonTitle>
        </IonToolbar>
        <IonToolbar color={"secondary"}>
          <IonSearchbar
            autoFocus
            ref={searchRef}
            autocapitalize={"on"}
            value={searchTerm}
            onIonInput={(e) => setSearchterm(e.detail.value!)}
            onIonClear={() => {
              setPageNo(1);
              setIsListCompleted(false);
              setContacts([]);
              getContacts();
            }}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} />
        <IonList inset>
          <IonListHeader id="contacts-heading" color={"medium"}>
            <IonLabel>CONTACTS</IonLabel>
          </IonListHeader>
          <IonItemDivider />
          <IonItemGroup>
            {contacts &&
              contacts.map((contact, index) => {
                return (
                  <IonItem key={index}>
                    <div className="contact">
                      <div className="shop-name">
                        <h6>{contact.shopName.toUpperCase()}</h6>
                      </div>
                      <div className="place">
                        <p>
                          {contact.district ? contact.district + ", " : ""}
                          {contact.state || ""}
                        </p>
                      </div>
                      <div className="person">
                        <p>
                          {contact.contactName
                            ? contact.contactName + ", "
                            : ""}
                          {contact.phone || ""}
                        </p>
                      </div>
                    </div>
                  </IonItem>
                );
              })}
          </IonItemGroup>
        </IonList>
        {!isListCompleted && (
          <IonInfiniteScroll
            ref={infiniteScrollRef}
            onIonInfinite={(e) => {
              const nextPageNo = pageNo + 1;
              setPageNo(nextPageNo);
              loadMore(nextPageNo, debouncedSearchTerm);
              setTimeout(() => {
                e.target.complete();
              }, 500);
            }}
          >
            <IonInfiniteScrollContent
              loadingText={"Please wait..."}
              loadingSpinner={"bubbles"}
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        )}
        {isListCompleted && (
          <div className="ion-text-center">
            <IonNote>End of list</IonNote>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
