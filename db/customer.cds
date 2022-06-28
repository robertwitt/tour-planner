namespace rwitt.tour.masterdata;

using {
  cuid,
  managed
} from '@sap/cds/common';
using {rwitt.tour.common.Country} from './common';

entity Customers : cuid, managed {
  name1           : String(40);
  name2           : String(40);
  isNaturalPerson : Boolean not null;
  mainAddress     : Address;
  billingAddress  : Address;
  isArchived      : Boolean default false;
}

type Address {
  country     : Country;
  city        : String(40);
  postalCode  : String(10);
  addressLine : String(100);
}
