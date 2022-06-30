namespace rwitt.tour.masterdata;

using {managed} from '@sap/cds/common';

entity Workers {
  key ID        : String(3);
      lastName  : String(40);
      firstName : String(40);
      startDate : Date;
      endDate   : Date;
}
