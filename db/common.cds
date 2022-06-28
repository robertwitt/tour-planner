namespace rwitt.tour.common;

using {sap.common as cds} from '@sap/cds/common';

entity Countries as projection on cds.Countries excluding {
  descr
};

type Country : Association to one Countries;
