import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

type PlacesProps = {
  setBusiness: (position: google.maps.LatLngLiteral) => void;
  setName: (name: string) => void;
};

export default function Places({ setBusiness, setName }: PlacesProps) {
  const {ready, value, setValue, suggestions: {status, data}, clearSuggestions} = usePlacesAutocomplete();

  const handleSelect = async (val: String) => {
    setValue(val, false);
    clearSuggestions();   

    const results = await getGeocode({address: val});
    const {lat, lng} = await getLatLng(results[0]);
    console.log(results[0])
    setBusiness({lat, lng});
    setName(val.substr(0, val.indexOf(',')))
  }
  
  return <Combobox onSelect={handleSelect}>
    <ComboboxInput value={value} onChange={(e) => setValue(e.target.value)} disabled={!ready}
    className="combobox-input"
    placeholder="Search business address"/>
    <ComboboxPopover>
      <ComboboxList>
        {status === "OK" && data.map(({place_id, description}) => (
        <ComboboxOption
        key={place_id} value={description}/>
        ))}
      </ComboboxList>
    </ComboboxPopover>
  </Combobox>;
}
