import { getRepository, getManager, Entity } from 'typeorm';
import {
	format,
	differenceInDays,
	addWeeks,
	addMonths,
	addDays,
	subDays,
	compareAsc,
	isBefore,
} from 'date-fns';

import { UserNotifications } from '../entity/UserNotifications';
import { NotificationSet } from '../entity/NotificationSet';
type EntityConstructor = typeof UserNotifications | typeof NotificationSet;

export const getById = async <T extends EntityConstructor>(
	EntityObject: T,
	id: number,
): Promise<InstanceType<EntityConstructor>> => {
	const entityData = await getRepository(EntityObject)
		.createQueryBuilder('up')
		.where('up.id = :id', { id: id })
		.getOne();

	return entityData;
};

export const deleteById = async <T extends EntityConstructor>(
	EntityObject: T,
	id: number,
): Promise<boolean> => {
	const entityData = await getById(EntityObject, id);
	let deleted = await getRepository(EntityObject).remove(entityData);
	if (!deleted.id) {
		return true;
	}
	return false;
};
interface ColumnValue {
	column: string;
	value: string | number | boolean;
}
export const deleteByColumn = async <T extends EntityConstructor>(
	EntityObject: T,
	columnObject: ColumnValue,
): Promise<boolean> => {
	let deleted = await getRepository(EntityObject)
		.createQueryBuilder()
		.delete()
		.from(EntityObject)
		.where(`${columnObject.column} = :value`, { value: columnObject.value })
		.execute();

	if (deleted.affected) {
		return true;
	}
	return false;
};

export const whereByColumns = async <T extends EntityConstructor>(
	EntityObject: T,
	columnObjects: ColumnValue[],
): Promise<InstanceType<EntityConstructor>[]> => {
	const entityObject = await getRepository(EntityObject).createQueryBuilder('up');
	if (columnObjects.length > 0) {
		columnObjects.map((columnObject, key) => {
			let isFirstWhere = key === 0;
			let parameter = {
				value: columnObjects[key]['value'],
			};
			if (isFirstWhere) {
				entityObject.where(`up.${columnObject.column} = :value`, parameter);
			}
			if (!isFirstWhere) {
				entityObject.andWhere(`up.${columnObject.column} = :value`, parameter);
			}
		});
	}
	//console.log(entityObject.getQueryAndParameters());
	const entityData = await entityObject.getMany();

	return entityData;
};
export interface ResponseColumn {
	data: any[];
	total: number;
}
export const whereByColumnWithCount = async <T extends EntityConstructor>(
	EntityObject: T,
	columnObjects: ColumnValue[],
): Promise<ResponseColumn> => {
	const entityObject = await getRepository(EntityObject).createQueryBuilder('up');
	if (columnObjects.length > 0) {
		columnObjects.map((columnObject, key) => {
			let isFirstWhere = key === 0;
			let parameter = {
				value: columnObjects[key]['value'],
			};
			if (isFirstWhere) {
				entityObject.where(`up.${columnObject.column} = :value`, parameter);
			}
			if (!isFirstWhere) {
				entityObject.andWhere(`up.${columnObject.column} = :value`, parameter);
			}
		});
	}
	const entityData = await entityObject.getMany();
	const { total } = await entityObject.select('count(up.*)', 'total').getRawOne();

	return {
		data: entityData ? entityData : [],
		total: parseInt(total),
	};
};
