import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { Redirect, Route } from "react-router";
import { AddContact } from "./AddContact";
import { ContactList } from "./ContactsList";
import { addOutline, listOutline } from "ionicons/icons";

export const Contact: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/contact" to="/contact/add" />
        <Route path={"/contact/add"} render={() => <AddContact />} exact />
        <Route path={"/contact/list"} render={() => <ContactList />} exact />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="add" href="/contact/add">
          <IonIcon icon={addOutline} />
        </IonTabButton>
        <IonTabButton tab="list" href="/contact/list">
          <IonIcon icon={listOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
