export const mockResponse1 = {
  results: [
    {
      value:
        '<?xml version="1.0" encoding="UTF-8"?> \
          <org.openmrs.layout.address.AddressTemplate> \
            <nameMappings class="properties"> \
                <property name="postalCode" value="Postcode" /> \
                <property name="address1" value="Address line 1" /> \
                <property name="address2" value="Address line 2" /> \
                <property name="country" value="Country" /> \
                <property name="stateProvince" value="State" /> \
                <property name="cityVillage" value="City" /> \
            </nameMappings> \
            <sizeMappings class="properties"> \
                <property name="postalCode" value="10" /> \
                <property name="address2" value="40" /> \
                <property name="address1" value="40" /> \
                <property name="country" value="10" /> \
                <property name="stateProvince" value="10" /> \
                <property name="cityVillage" value="10" /> \
            </sizeMappings> \
            <lineByLineFormat> \
                <string> address1</string> \
                <string> address2</string> \
                <string> cityVillage stateProvince country postalCode</string> \
            </lineByLineFormat> \
            <requiredElements /> \
        </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

export const mockResponse2 = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate> \
          <nameMappings> \
            <entry> \
              <string>country</string> \
              <string>Country</string> \
            </entry> \
            <entry> \
              <string>postalCode</string> \
              <string>Postcode</string> \
            </entry> \
            <entry> \
              <string>address1</string> \
              <string>Address line 1</string> \
            </entry> \
            <entry> \
              <string>address2</string> \
              <string>Address line 2</string> \
            </entry> \
            <entry> \
              <string>stateProvince</string> \
              <string>State</string> \
            </entry> \
            <entry> \
              <string>cityVillage</string> \
              <string>City</string> \
            </entry> \
          </nameMappings> \
          <sizeMappings> \
            <entry> \
              <string>country</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>countyDistrict</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>address1</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>stateProvince</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>cityVillage</string> \
              <string>40</string> \
            </entry> \
          </sizeMappings> \
          <elementDefaults> \
            <entry> \
              <string>country</string> \
              <string>Cambodia</string> \
            </entry> \
          </elementDefaults> \
          <lineByLineFormat> \
            <string>cityVillage, address1</string> \
            <string>countyDistrict, stateProvince</string> \
            <string>country</string> \
          </lineByLineFormat> \
          <maxTokens>0</maxTokens> \
        </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

export const mockedOrderedFields = ['country', 'stateProvince', 'cityVillage', 'postalCode', 'address1', 'address2'];
