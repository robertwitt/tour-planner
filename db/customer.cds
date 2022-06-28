namespace rwitt.tour.masterdata;

using {
  cuid,
  managed
} from '@sap/cds/common';
using {rwitt.tour.common.Country} from './common';

@title : '{i18n>Customer}'
entity Customers : cuid, managed {
  name1           : String(40)            @title : '{i18n>Name1}';
  name2           : String(40)            @title : '{i18n>Name2}';
  isNaturalPerson : Boolean not null      @title : '{i18n>IsNaturalPerson}';
  mainAddress     : Address               @title : '{i18n>MainAddress}';
  billingAddress  : Address               @title : '{i18n>BillingAddress}';
  isArchived      : Boolean default false @title : '{i18n>IsArchived}';
}

type Address {
  country     : Country     @title : '{i18n>Country}';
  city        : String(40)  @title : '{i18n>City}';
  postalCode  : String(10)  @title : '{i18n>PostalCode}';
  addressLine : String(100) @title : '{i18n>AddressLine}';
}
