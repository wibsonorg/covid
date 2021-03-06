import AWS from 'aws-sdk';
import config from '../config';

const dynamodb = new AWS.DynamoDB({
  region: config.get('aws.region'),
  accessKeyId: config.get('aws.accessKeyID'),
  secretAccessKey: config.get('aws.secretAccessKey'),
  endpoint: config.get('aws.dynamoEndpoint')
});
const docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

const tableExists = async (TableName) => {
  try {
    await dynamodb.describeTable({ TableName }).promise();
    return true;
  } catch (err) {
    return false;
  }
};

const createTable = async (
  TableName,
  KeySchema = [{ AttributeName: 'id', KeyType: 'HASH' }],
  AttributeDefinitions = [{ AttributeName: 'id', AttributeType: 'S' }],
  LocalSecondaryIndexes = null
) => {
  const params = {
    TableName,
    KeySchema,
    AttributeDefinitions,
    LocalSecondaryIndexes,
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  };
  console.log('Creating table with schema:');
  console.dir(params, { depth: null });

  await dynamodb.createTable(params).promise();
}

/**
 * @typedef DynamoStore A store that uses DynamoDB
 * @property {() => Promise<void>} init Initiates the store.
 * @property {(id: K) => Promise<V>} fetch Retrieves the value
 * @property {(id: K) => Promise<V>} delete Removes data from the store.
 * @property {(id: K, obj: V) => Promise<V>} store Stores the value or replaces the previous one.
 * @property {(id: K, obj: V) => Promise<V>} upsert Updates or creates the value.
 * @property {(id: K, attr: String, value: Any) => Promise<V>} appendValue Appends the value to the selected attribute as long as it is an array
 * @template K
 * @template V
 */
export class Store {
  constructor(
    tableName,
    primaryKeySchema = [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions = [{ AttributeName: 'id', AttributeType: 'S' }],
    localSecondaryIndexes = null
  ) {
    this.tableName = tableName;
    this.primaryKeySchema = primaryKeySchema;
    this.attributeDefinitions = attributeDefinitions;
    this.localSecondaryIndexes = localSecondaryIndexes;
    this.primaryKey = primaryKeySchema[0].AttributeName;
  }

  init = async () => {
    if (!(await tableExists(this.tableName))) {
      await createTable(
        this.tableName, 
        this.primaryKeySchema, 
        this.attributeDefinitions,
        this.localSecondaryIndexes
      );
    }
  };

  _keyMethod = async (id, method) => {
    const params = {
      TableName: this.tableName,
      Key: { [this.primaryKey]: id }
    };
    return docClient[method](params).promise();
  };

  fetch = async (id) => this._keyMethod(id, 'get');
  delete = async (id) => this._keyMethod(id, 'delete');

  store = async (id, data) => {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.primaryKey]: id,
        ...data
      }
    };
    return docClient.put(params).promise();
  }

  batchStore = async (records) => { 
    const params = {
      RequestItems: {
        [this.tableName]: records.map((record) => ({
          PutRequest: { Item: record }
        }))
      }
    };
    console.dir(params, { depth: null });
    return docClient.batchWrite(params).promise();
  }

  query = async (params) => docClient.query({
    TableName: this.tableName,
    ...params
  }).promise();

  upsert = async (id, data) => {
    const filteredEntries = Object.entries(data).filter(
      ([key, value]) => key !== this.primaryKey && value !== null && value !== undefined
    );

    const updateExpression = filteredEntries.reduce(
      (expr, [key, value]) => `${expr}${expr !== 'set' ? ',' : ''} ${key} = :new${key}`,
      'set'
    );

    const expressionAttributeValues = filteredEntries.reduce(
      (values, [key, value]) => ({
        ...values,
        [`:new${key}`]: value
      }),
      {}
    );

    const params = {
      TableName: this.tableName,
      Key: { [this.primaryKey]: id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };
    return docClient.update(params).promise();
  }

  appendValue = async (id, attr, value) => {
    const obj = await this.fetch(id);
    const oldValues = obj.hasOwnProperty(attr) && Array.isArray(obj[attr]) ? obj[attr] : [];
    const newValues = [...oldValues, value];
    return this.upsert(id, { [attr]: newValues });
  }
}
