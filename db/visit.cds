namespace rwitt.tour.transaction;

using {
  cuid,
  managed
} from '@sap/cds/common';
using {rwitt.tour.common.ExecutionStatus} from './common';
using {rwitt.tour.masterdata.Customers} from './customer';

entity Visits : cuid, managed {
  customer  : Association to one Customers;
  visitDate : Date;
  startTime : Time;
  endTime   : Time;
  duration  : Decimal(4, 2);
  status    : ExecutionStatus default 'O';
}
