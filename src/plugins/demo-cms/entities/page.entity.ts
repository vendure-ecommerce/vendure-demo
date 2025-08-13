import {
    DeepPartial,
    VendureEntity,
} from '@vendure/core';
import { Column, Entity } from 'typeorm';

@Entity()
export class Page extends VendureEntity {
    constructor(input?: DeepPartial<Page>) {
        super(input);
    }

    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column('text')
    content: string;
}
