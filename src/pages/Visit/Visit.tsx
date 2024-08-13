import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { addOutline, listOutline } from "ionicons/icons";
import { Redirect, Route } from "react-router";
import AddVisit from "./AddVisit";
import VisitHistory from "./VisitHistory";


export const Visit: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/visit" to="/visit/add" />
        <Route path={"/visit/add"} render={() => <AddVisit />} exact />
        <Route path={"/visit/list"} render={() => <VisitHistory />} exact />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="add" href="/visit/add">
          <IonIcon icon={addOutline} />
        </IonTabButton>
        <IonTabButton tab="list" href="/visit/list">
          <IonIcon icon={listOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
