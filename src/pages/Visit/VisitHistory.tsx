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
  useIonToast,
} from "@ionic/react";
import axios from "axios";
import { caretBack } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { URL } from "../../common/common";
import { useUserContext } from "../../context/UserContext";
import "./visit-history.css";
import useDebounce from "../../hooks/useDebounce";

type Visit = {
  id: number;
  shopId: number;
  shopName: string;
  location: string;
  purpose: string;
  active: string;
  user: string;
};

const VisitHistory: React.FC = () => {
  const router = useHistory();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const { user } = useUserContext();
  const [pageNo, setPageNo] = useState(1);
  const [isListCompleted, setIsListCompleted] = useState(false);
  const [searchTerm, setSearchterm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null)
  const [dataLoaded, setDataLoaded] = useState(false);

  const getVisits = async (pageNo = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${URL}visits?user_id=${user?.id}&page=${pageNo}&search_term=${searchTerm}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const {
        data: { visits },
      } = response;
      setVisits(visits);
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

  const loadMore = async (pageNo: number, searchTerm = "") => {
    try {
      const response = await axios.get(
        `${URL}visits?user_id=${user?.id}&page=${pageNo}&search_term=${searchTerm}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const {
        data: { visits },
      } = response;
      if (visits.length === 0) {
        setIsListCompleted(true);
      } else {
        setVisits((prev) => [...prev, ...visits]);
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
    }
  };

  useEffect(() => {
    getVisits();
    setDataLoaded(true)
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setPageNo(1);
      setIsListCompleted(false);
      setVisits([]);
      getVisits(1, debouncedSearchTerm);
      infiniteScrollRef.current?.complete();
      requestAnimationFrame(() => {
        searchRef.current?.setFocus();
        if (searchRef.current) {
          const searchInput = searchRef.current.querySelector("input");
          searchInput?.focus();
        }
      });
    } else if (dataLoaded) {
      setPageNo(1)
      setIsListCompleted(false)
      setVisits([])
      getVisits()
    }
  }, [debouncedSearchTerm]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={"secondary"}>
          <IonButtons slot={"start"}>
            <IonButton onClick={() => router.push("/home")}>
              <IonIcon icon={caretBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Visits</IonTitle>
        </IonToolbar>
        <IonToolbar color={"secondary"}>
          <IonSearchbar
            ref={searchRef}
            value={searchTerm}
            onIonClear={() => {
              setPageNo(1);
              setIsListCompleted(false);
              setVisits([]);
              getVisits();
            }}
            onIonInput={(e) => {
              setSearchterm(e.detail.value!);
            }}
            autocapitalize={"on"}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} />
        <IonList inset>
          <IonListHeader id="visits-heading" color={"medium"}>
            <IonLabel>VISITS</IonLabel>
          </IonListHeader>
          <IonItemDivider />
          <IonItemGroup>
            {visits &&
              visits.map((visit) => {
                return (
                  <IonItem key={visit.id}>
                    <div className="visit">
                      <div className="shop-name">
                        <h6>{visit.shopName.toUpperCase()}</h6>
                      </div>
                      <div className="place">
                        <p>{visit.location && visit.location}</p>
                      </div>
                      <div className="purpose">
                        <p>{visit.purpose && visit.purpose}</p>
                      </div>
                      <div className="person">
                        <p>{visit.user}</p>
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
            onIonInfinite={async (e) => {
              const nextPageNo = pageNo + 1;
              setPageNo(nextPageNo);
              await loadMore(nextPageNo, debouncedSearchTerm);
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

export default VisitHistory;
