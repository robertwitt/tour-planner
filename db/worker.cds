namespace rwitt.tour.masterdata;

using {managed} from '@sap/cds/common';

@title : '{i18n>Worker}'
entity Workers {
  key ID        : String(3)  @title : '{i18n>WorkerID}';
      lastName  : String(40) @title : '{i18n>WorkerLastName}';
      firstName : String(40) @title : '{i18n>WorkerFirstName}';
      startDate : Date       @title : '{i18n>WorkerStartDate}';
      endDate   : Date       @title : '{i18n>WorkerEndDate}';
}
