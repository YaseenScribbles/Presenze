import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonSelect, IonSelectOption, IonItem, IonModal } from '@ionic/react';

type Option = {
    value: string;
    label: string;
};

type SearchSelectProps = {
    options: Option[];
    isVisible: boolean;
}

const SearchSelect: React.FC<SearchSelectProps> = ({ options,isVisible }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | undefined>();

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonModal isOpen={isVisible}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search and Select</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonSearchbar
            autocapitalize='on'
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            debounce={500}
          ></IonSearchbar>
        </IonItem>
        <IonItem>
          <IonSelect
            value={selectedOption}
            placeholder="Select an option"
            onIonChange={e => setSelectedOption(e.detail.value)}
          >
            {filteredOptions.map((option, index) => (
              <IonSelectOption key={index} value={option.value}>
                {option.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </IonContent>
    </IonModal>
  );
};

export default SearchSelect;
