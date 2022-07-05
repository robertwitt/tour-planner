namespace rwitt.tour.transaction;

using {
  cuid,
  managed
} from '@sap/cds/common';
using {rwitt.tour.common.ExecutionStatus} from './common';
using {rwitt.tour.transaction.Visits} from './visit';
using {rwitt.tour.masterdata.Workers} from './worker';

entity Tours : cuid, managed {
  worker   : Association to one Workers;
  tourDate : Date;
  status   : ExecutionStatus default 'I';
  stops    : Composition of many TourStops
               on stops.tour = $self;
}

entity TourStops : cuid {
  tour  : Association to one Tours;
  visit : Association to one Visits;
}
