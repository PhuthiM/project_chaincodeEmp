/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public EmployeeId: string;

    @Property()
    public Name: string;

    @Property()
    public Time_in: string;

    @Property()
    public Time_out: string;


}
